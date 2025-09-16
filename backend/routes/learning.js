/**
 * 学习内容相关路由
 */

const express = require('express');
const { query } = require('../config/database');
const { optionalAuth, authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * 获取所有可用阵营（公开接口，用于注册时选择）
 */
router.get('/factions', async (req, res) => {
    try {
        const result = await query(`
            SELECT id, code, name, description, color, sort_order
            FROM public.factions
            WHERE is_active = true
            ORDER BY sort_order ASC, created_at ASC
        `);

        res.json({
            data: result.rows
        });

    } catch (error) {
        console.error('获取阵营列表错误:', error);
        res.status(500).json({
            error: '获取阵营列表失败',
            message: error.message
        });
    }
});

/**
 * 获取活跃挑战
 */
router.get('/challenges', optionalAuth, async (req, res) => {
    try {
        const result = await query(`
            SELECT c.*, 
                   cat.title as target_category_title
            FROM public.challenges c
            LEFT JOIN public.categories cat ON c.target_category_id = cat.id
            WHERE c.is_active = true
            ORDER BY c.created_at DESC
        `);

        res.json({
            data: result.rows
        });

    } catch (error) {
        console.error('获取挑战列表错误:', error);
        res.status(500).json({
            error: '获取挑战列表失败',
            message: error.message
        });
    }
});

/**
 * 获取阵营挑战进度
 */
router.post('/rpc/get_single_faction_challenge_progress', authenticateToken, async (req, res) => {
    try {
        const { challenge_id_param, faction_param } = req.body;
        
        // 计算阵营在指定挑战中的进度
        const result = await query(`
            WITH faction_progress AS (
                SELECT 
                    COUNT(DISTINCT up.user_id) as completed_users,
                    COUNT(DISTINCT p.id) as total_users
                FROM public.profiles p
                LEFT JOIN public.user_progress up ON p.id = up.user_id
                LEFT JOIN public.blocks b ON b.id = ANY(up.completed_blocks)
                LEFT JOIN public.sections s ON s.id = b.section_id
                LEFT JOIN public.chapters ch ON ch.id = s.chapter_id
                LEFT JOIN public.categories cat ON cat.id = ch.category_id
                WHERE p.faction = $2
                AND cat.id = (SELECT target_category_id FROM public.challenges WHERE id = $1)
            )
            SELECT 
                CASE 
                    WHEN total_users = 0 THEN 0
                    ELSE ROUND((completed_users::float / total_users::float) * 100, 2)
                END as progress_percentage
            FROM faction_progress
        `, [challenge_id_param, faction_param]);

        const progress = result.rows[0]?.progress_percentage || 0;
        res.json({ data: progress });

    } catch (error) {
        console.error('获取阵营挑战进度错误:', error);
        res.status(500).json({
            error: '获取阵营挑战进度失败',
            message: error.message
        });
    }
});

/**
 * 获取学习地图
 */
router.get('/map', optionalAuth, async (req, res) => {
    try {
        const result = await query(`
            SELECT 
                c.id, c.title, c.description, c."order", c.created_at,
                json_agg(
                    json_build_object(
                        'id', ch.id,
                        'title', ch.title,
                        'description', ch.description,
                        'image_url', ch.image_url,
                        'order', ch."order",
                        'created_at', ch.created_at,
                        'sections', COALESCE(sections_data.sections, '[]'::json)
                    ) ORDER BY ch."order"
                ) as chapters
            FROM categories c
            LEFT JOIN chapters ch ON c.id = ch.category_id
            LEFT JOIN LATERAL (
                SELECT json_agg(
                    json_build_object(
                        'id', s.id,
                        'title', s.title,
                        'order', s."order",
                        'created_at', s.created_at,
                        'blocks', COALESCE(blocks_data.blocks, '[]'::json)
                    ) ORDER BY s."order"
                ) as sections
                FROM sections s
                LEFT JOIN LATERAL (
                    SELECT json_agg(
                        json_build_object(
                            'id', b.id,
                            'title', b.title,
                            'content_markdown', b.content_markdown,
                            'video_url', b.video_url,
                            'quiz_question', b.quiz_question,
                            'quiz_options', b.quiz_options,
                            'correct_answer_index', b.correct_answer_index,
                            'pdf_url', b.pdf_url,
                            'document_url', b.document_url,
                            'ppt_url', b.ppt_url,
                            'order', b."order",
                            'created_at', b.created_at
                        ) ORDER BY b."order"
                    ) as blocks
                    FROM blocks b
                    WHERE b.section_id = s.id
                ) blocks_data ON true
                WHERE s.chapter_id = ch.id
            ) sections_data ON true
            GROUP BY c.id, c.title, c.description, c."order", c.created_at
            ORDER BY c."order"
        `);

        res.json({
            data: result.rows
        });

    } catch (error) {
        console.error('获取学习地图错误:', error);
        res.status(500).json({
            error: '获取学习地图失败',
            message: error.message
        });
    }
});

/**
 * 获取个人排行榜
 */
router.get('/leaderboard', optionalAuth, async (req, res) => {
    try {
        const result = await query(`
            SELECT 
                s.user_id,
                s.username,
                s.points,
                p.faction,
                p.full_name
            FROM public.scores s
            LEFT JOIN public.profiles p ON s.user_id = p.id
            ORDER BY s.points DESC
            LIMIT 10
        `);

        res.json({
            data: result.rows
        });

    } catch (error) {
        console.error('获取排行榜错误:', error);
        res.status(500).json({
            error: '获取排行榜失败',
            message: error.message
        });
    }
});

/**
 * 获取阵营排行榜
 */
router.get('/faction-leaderboard', optionalAuth, async (req, res) => {
    try {
        const result = await query(`
            SELECT 
                p.faction,
                COUNT(*) as total_members,
                AVG(s.points) as average_score,
                SUM(s.points) as total_points
            FROM public.profiles p
            LEFT JOIN public.scores s ON p.id = s.user_id
            WHERE p.faction IS NOT NULL AND p.faction != ''
            GROUP BY p.faction
            ORDER BY average_score DESC NULLS LAST
        `);

        res.json({
            data: result.rows
        });

    } catch (error) {
        console.error('获取阵营排行榜错误:', error);
        res.status(500).json({
            error: '获取阵营排行榜失败',
            message: error.message
        });
    }
});

/**
 * 获取用户进度
 */
router.get('/progress', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.user;

        const result = await query(
            'SELECT * FROM public.user_progress WHERE user_id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.json({
                data: {
                    completed: [],
                    awarded: []
                }
            });
        }

        const progress = result.rows[0];
        res.json({
            data: {
                completed: progress.completed_blocks || [],
                awarded: progress.awarded_points_blocks || []
            }
        });

    } catch (error) {
        console.error('获取用户进度错误:', error);
        res.status(500).json({
            error: '获取用户进度失败',
            message: error.message
        });
    }
});

/**
 * 获取用户进度 (兼容前端调用)
 */
router.get('/user_progress', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.user;

        const result = await query(
            'SELECT * FROM public.user_progress WHERE user_id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.json({
                data: {
                    completed: [],
                    awarded: []
                }
            });
        }

        const progress = result.rows[0];
        res.json({
            data: {
                completed: progress.completed_blocks || [],
                awarded: progress.awarded_points_blocks || []
            }
        });

    } catch (error) {
        console.error('获取用户进度错误:', error);
        res.status(500).json({
            error: '获取用户进度失败',
            message: error.message
        });
    }
});

/**
 * 保存用户进度
 */
router.post('/progress', async (req, res) => {
    try {
        const { userId } = req.user;
        const { completed, awarded } = req.body;

        await query(
            `INSERT INTO public.user_progress (user_id, completed_blocks, awarded_points_blocks, updated_at)
             VALUES ($1, $2, $3, NOW())
             ON CONFLICT (user_id) 
             DO UPDATE SET 
                 completed_blocks = EXCLUDED.completed_blocks,
                 awarded_points_blocks = EXCLUDED.awarded_points_blocks,
                 updated_at = NOW()`,
            [userId, completed || [], awarded || []]
        );

        res.json({
            message: '进度保存成功'
        });

    } catch (error) {
        console.error('保存用户进度错误:', error);
        res.status(500).json({
            error: '保存用户进度失败',
            message: error.message
        });
    }
});

/**
 * 保存用户进度 (兼容前端调用)
 */
router.post('/user_progress', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.user;
        const { completed, awarded } = req.body;

        await query(
            `INSERT INTO public.user_progress (user_id, completed_blocks, awarded_points_blocks, updated_at)
             VALUES ($1, $2, $3, NOW())
             ON CONFLICT (user_id) 
             DO UPDATE SET 
                 completed_blocks = EXCLUDED.completed_blocks,
                 awarded_points_blocks = EXCLUDED.awarded_points_blocks,
                 updated_at = NOW()`,
            [userId, completed || [], awarded || []]
        );

        res.json({
            message: '进度保存成功'
        });

    } catch (error) {
        console.error('保存用户进度错误:', error);
        res.status(500).json({
            error: '保存用户进度失败',
            message: error.message
        });
    }
});

/**
 * 重置用户进度
 */
router.post('/rpc/reset_user_progress', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.user;

        await query(
            'UPDATE public.user_progress SET completed_blocks = $1, awarded_points_blocks = $2, updated_at = NOW() WHERE user_id = $3',
            [[], [], userId]
        );

        res.json({
            message: '用户进度已重置'
        });

    } catch (error) {
        console.error('重置用户进度错误:', error);
        res.status(500).json({
            error: '重置用户进度失败',
            message: error.message
        });
    }
});

/**
 * 奖励成就
 */
router.post('/rpc/award_achievement', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.user;
        const { achievement_key } = req.body;

        // 先查找成就ID
        const achievementResult = await query(
            'SELECT id FROM public.achievements WHERE trigger_key = $1',
            [achievement_key]
        );

        if (achievementResult.rows.length === 0) {
            return res.status(404).json({
                error: '成就不存在',
                message: `未找到成就: ${achievement_key}`
            });
        }

        const achievementId = achievementResult.rows[0].id;

        // 检查用户是否已经获得过这个成就
        const existingResult = await query(
            'SELECT id FROM public.user_achievements WHERE user_id = $1 AND achievement_id = $2',
            [userId, achievementId]
        );

        if (existingResult.rows.length > 0) {
            return res.json({
                message: '用户已获得此成就'
            });
        }

        // 插入用户成就记录
        await query(
            'INSERT INTO public.user_achievements (user_id, achievement_id) VALUES ($1, $2)',
            [userId, achievementId]
        );

        res.json({
            message: '成就奖励成功'
        });

    } catch (error) {
        console.error('奖励成就错误:', error);
        res.status(500).json({
            error: '奖励成就失败',
            message: error.message
        });
    }
});

/**
 * 获取用户成就
 */
router.get('/user_achievements', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.user;

        const result = await query(`
            SELECT a.id, a.name, a.description, a.trigger_key, ua.earned_at
            FROM public.achievements a
            LEFT JOIN public.user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = $1
            ORDER BY a.name
        `, [userId]);

        res.json({
            data: result.rows
        });

    } catch (error) {
        console.error('获取用户成就错误:', error);
        res.status(500).json({
            error: '获取用户成就失败',
            message: error.message
        });
    }
});

/**
 * 添加积分
 */
router.post('/add-points', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.user;
        const { points } = req.body;

        if (!points || points <= 0) {
            return res.status(400).json({
                error: '积分参数无效',
                message: '积分必须大于0'
            });
        }

        // 先获取用户信息
        const userResult = await query(
            `SELECT u.email, p.full_name, s.username
             FROM auth.users u
             LEFT JOIN public.profiles p ON u.id = p.id
             LEFT JOIN public.scores s ON u.id = s.user_id
             WHERE u.id = $1`,
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                error: '用户不存在',
                message: '未找到用户信息'
            });
        }

        const user = userResult.rows[0];
        const username = user.username || user.email || user.full_name || 'user';

        // 使用 UPSERT 确保用户有 scores 记录
        await query(
            `INSERT INTO public.scores (user_id, username, points) 
             VALUES ($1, $2, $3)
             ON CONFLICT (user_id) 
             DO UPDATE SET 
                 points = scores.points + $3,
                 username = EXCLUDED.username`,
            [userId, username, points]
        );

        // 获取更新后的积分
        const result = await query(
            'SELECT points FROM public.scores WHERE user_id = $1',
            [userId]
        );

        res.json({
            message: '积分添加成功',
            points: result.rows[0]?.points || 0
        });

    } catch (error) {
        console.error('添加积分错误:', error);
        res.status(500).json({
            error: '添加积分失败',
            message: error.message
        });
    }
});

module.exports = router;
