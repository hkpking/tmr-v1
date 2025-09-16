/**
 * 认证相关路由
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * 用户注册
 */
router.post('/signup', [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('fullName').notEmpty().trim()
], async (req, res) => {
    try {
        // 验证输入
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: '输入参数错误',
                details: errors.array()
            });
        }

        const { email, password, fullName } = req.body;

        // 检查用户是否已存在
        const existingUser = await query(
            'SELECT id FROM auth.users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                error: '用户已存在'
            });
        }

        // 加密密码
        const hashedPassword = await bcrypt.hash(password, 12);

        // 开始事务
        const client = await require('../config/database').getClient();
        await client.query('BEGIN');

        try {
            // 使用数据库生成UUID，确保唯一性
            let userIdResult = await client.query('SELECT gen_random_uuid() as id');
            let userId = userIdResult.rows[0].id;
            
            console.log('🔍 生成用户ID:', { userId, email });
            
            // 再次检查这个ID是否已存在
            const checkUser = await client.query('SELECT id FROM auth.users WHERE id = $1', [userId]);
            const checkProfile = await client.query('SELECT id FROM public.profiles WHERE id = $1', [userId]);
            
            if (checkUser.rows.length > 0 || checkProfile.rows.length > 0) {
                console.log('⚠️ 生成的UUID已存在，重新生成');
                userIdResult = await client.query('SELECT gen_random_uuid() as id');
                userId = userIdResult.rows[0].id;
                console.log('🔍 重新生成用户ID:', { userId, email });
            }

            // 先创建用户记录
            console.log('🔍 创建用户记录:', { userId, email });
            const userResult = await client.query(
                'INSERT INTO auth.users (id, email, encrypted_password) VALUES ($1, $2, $3) RETURNING id',
                [userId, email, hashedPassword]
            );
            console.log('✅ 用户记录创建成功:', userResult.rows[0]);

            // 等待触发器自动创建用户档案，然后更新
            console.log('🔍 等待触发器创建用户档案...');
            await new Promise(resolve => setTimeout(resolve, 100)); // 等待100ms让触发器执行
            
            // 更新用户档案信息
            console.log('🔍 更新用户档案:', { userId, fullName });
            const profileResult = await client.query(
                'UPDATE public.profiles SET full_name = $1, role = $2 WHERE id = $3 RETURNING id',
                [fullName, 'user', userId]
            );
            console.log('✅ 用户档案更新成功:', profileResult.rows[0]);

            // 创建用户积分记录 - 使用email作为username
            await client.query(
                'INSERT INTO public.scores (user_id, username, points) VALUES ($1, $2, $3)',
                [userId, email, 0]
            );

            // 创建用户进度记录 - 使用PostgreSQL数组类型
            await client.query(
                'INSERT INTO public.user_progress (user_id, completed_blocks, awarded_points_blocks) VALUES ($1, $2, $3)',
                [userId, [], []]
            );

            // 提交事务
            await client.query('COMMIT');

            // 生成JWT令牌
            const token = jwt.sign(
                { 
                    userId, 
                    email, 
                    fullName,
                    role: 'user' 
                },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES_IN }
            );

            res.status(201).json({
                data: {
                    user: {
                        id: userId,
                        email: email,
                        fullName: fullName,
                        role: 'user'
                    },
                    token: token
                }
            });

        } catch (error) {
            await client.query('ROLLBACK');
            console.log('注册错误详情:', {
                message: error.message,
                code: error.code,
                detail: error.detail,
                constraint: error.constraint,
                table: error.table
            });
            throw error;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({
            error: '注册失败',
            message: error.message
        });
    }
});

/**
 * 用户登录
 */
router.post('/signin', [
    body('email').notEmpty().trim(),
    body('password').notEmpty()
], async (req, res) => {
    try {
        // 验证输入
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: '输入参数错误',
                details: errors.array()
            });
        }

        const { email, password } = req.body;

        // 查找用户（包含密码哈希）
        // 支持多种登录方式：邮箱、用户名、真实姓名
        const userResult = await query(
            `SELECT u.id, u.email, u.encrypted_password as password_hash, p.role, p.full_name, p.faction, s.points, s.username
             FROM auth.users u
             LEFT JOIN public.profiles p ON u.id = p.id
             LEFT JOIN public.scores s ON u.id = s.user_id 
             WHERE u.email = $1 OR s.username = $1 OR p.full_name = $1`,
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({
                error: '用户名或密码错误'
            });
        }

        const user = userResult.rows[0];

        // 验证密码
        if (user.password_hash && user.password_hash !== 'dummy_hash') {
            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            if (!isValidPassword) {
                return res.status(401).json({
                    error: '用户名或密码错误'
                });
            }
        } else {
            // 对于导入的数据，暂时跳过密码验证
            console.log('⚠️ 跳过密码验证（导入数据）');
        }
        
        // 生成JWT令牌
        const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.full_name || user.username,
                fullName: user.full_name,
                role: user.role,
                faction: user.faction
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.json({
            data: {
                user: {
                    id: user.id,
                    email: user.full_name || user.username,
                    fullName: user.full_name,
                    role: user.role,
                    faction: user.faction,
                    points: user.points || 0
                },
                token: token
            }
        });

    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({
            error: '登录失败',
            message: error.message
        });
    }
});

/**
 * 获取当前用户信息
 */
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.user;

        const result = await query(
            `SELECT p.id, p.role, p.full_name, p.faction, s.username, s.points
             FROM profiles p 
             LEFT JOIN scores s ON p.id = s.user_id 
             WHERE p.id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: '用户不存在'
            });
        }

        const user = result.rows[0];
        res.json({
            data: {
                user: {
                    id: user.id,
                    email: user.full_name || user.username,
                    fullName: user.full_name,
                    role: user.role,
                    faction: user.faction,
                    points: user.points || 0
                }
            }
        });

    } catch (error) {
        console.error('获取用户信息错误:', error);
        res.status(500).json({
            error: '获取用户信息失败',
            message: error.message
        });
    }
});

/**
 * 用户退出（客户端处理，这里只是返回成功）
 */
router.post('/signout', (req, res) => {
    res.json({
        message: '退出成功'
    });
});

/**
 * 验证令牌
 */
router.post('/verify', authenticateToken, (req, res) => {
    res.json({
        valid: true,
        user: req.user
    });
});

module.exports = router;
