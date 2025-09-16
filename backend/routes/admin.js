/**
 * 管理员相关路由
 */

const express = require('express');
const { query } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// 所有管理员路由都需要认证和管理员权限
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * 获取所有篇章（管理员）
 */
router.get('/categories', async (req, res) => {
    try {
        const result = await query(`
            SELECT c.*, 
                   json_agg(
                       json_build_object(
                           'id', ch.id,
                           'title', ch.title,
                           'description', ch.description,
                           'order', ch."order",
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
                        'blocks', COALESCE(blocks_data.blocks, '[]'::json)
                    ) ORDER BY s."order"
                ) as sections
                FROM sections s
                LEFT JOIN LATERAL (
                    SELECT json_agg(
                        json_build_object(
                            'id', b.id,
                            'title', b.title,
                            'order', b."order"
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
        console.error('获取篇章列表错误:', error);
        res.status(500).json({
            error: '获取篇章列表失败',
            message: error.message
        });
    }
});

/**
 * 创建/更新篇章
 */
router.post('/categories', async (req, res) => {
    try {
        const { id, title, description, order } = req.body;

        const result = await query(
            `INSERT INTO categories (id, title, description, "order") 
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (id) 
             DO UPDATE SET 
                 title = EXCLUDED.title,
                 description = EXCLUDED.description,
                 "order" = EXCLUDED."order"
             RETURNING *`,
            [id || require('uuid').v4(), title, description, order || 0]
        );

        res.json({
            data: result.rows[0]
        });

    } catch (error) {
        console.error('保存篇章错误:', error);
        res.status(500).json({
            error: '保存篇章失败',
            message: error.message
        });
    }
});

/**
 * 删除篇章
 */
router.delete('/categories/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await query('DELETE FROM categories WHERE id = $1', [id]);

        res.json({
            message: '篇章删除成功'
        });

    } catch (error) {
        console.error('删除篇章错误:', error);
        res.status(500).json({
            error: '删除篇章失败',
            message: error.message
        });
    }
});

/**
 * 获取所有用户
 */
router.get('/users', async (req, res) => {
    try {
        const result = await query(`
            SELECT p.id, p.role, p.faction, p.full_name, p.updated_at,
                   s.username, s.points
            FROM profiles p
            LEFT JOIN scores s ON p.id = s.user_id
            ORDER BY s.points DESC NULLS LAST
        `);

        res.json({
            data: result.rows
        });

    } catch (error) {
        console.error('获取用户列表错误:', error);
        res.status(500).json({
            error: '获取用户列表失败',
            message: error.message
        });
    }
});

/**
 * 获取系统统计
 */
router.get('/stats', async (req, res) => {
    try {
        const stats = await Promise.all([
            query('SELECT COUNT(*) as count FROM categories'),
            query('SELECT COUNT(*) as count FROM chapters'),
            query('SELECT COUNT(*) as count FROM sections'),
            query('SELECT COUNT(*) as count FROM blocks'),
            query('SELECT COUNT(*) as count FROM profiles'),
            query('SELECT COUNT(*) as count FROM scores'),
            query('SELECT SUM(points) as total_points FROM scores')
        ]);

        res.json({
            data: {
                categories: parseInt(stats[0].rows[0].count),
                chapters: parseInt(stats[1].rows[0].count),
                sections: parseInt(stats[2].rows[0].count),
                blocks: parseInt(stats[3].rows[0].count),
                users: parseInt(stats[4].rows[0].count),
                scores: parseInt(stats[5].rows[0].count),
                totalPoints: parseInt(stats[6].rows[0].total_points) || 0
            }
        });

    } catch (error) {
        console.error('获取系统统计错误:', error);
        res.status(500).json({
            error: '获取系统统计失败',
            message: error.message
        });
    }
});

/**
 * 获取所有挑战（管理员）
 */
router.get('/challenges', async (req, res) => {
    try {
        const result = await query(`
            SELECT c.*, 
                   cat.title as target_category_title
            FROM challenges c
            LEFT JOIN categories cat ON c.target_category_id = cat.id
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
 * 创建/更新挑战
 */
router.post('/challenges', async (req, res) => {
    try {
        const { 
            id, 
            title, 
            description, 
            start_date, 
            end_date, 
            target_category_id, 
            reward_points, 
            is_active 
        } = req.body;

        const result = await query(
            `INSERT INTO challenges (
                id, title, description, start_date, end_date, 
                target_category_id, reward_points, is_active
            ) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             ON CONFLICT (id) 
             DO UPDATE SET 
                 title = EXCLUDED.title,
                 description = EXCLUDED.description,
                 start_date = EXCLUDED.start_date,
                 end_date = EXCLUDED.end_date,
                 target_category_id = EXCLUDED.target_category_id,
                 reward_points = EXCLUDED.reward_points,
                 is_active = EXCLUDED.is_active
             RETURNING *`,
            [
                id || require('uuid').v4(), 
                title, 
                description, 
                start_date, 
                end_date, 
                target_category_id, 
                reward_points || 0, 
                is_active !== false
            ]
        );

        res.json({
            data: result.rows[0]
        });

    } catch (error) {
        console.error('保存挑战错误:', error);
        res.status(500).json({
            error: '保存挑战失败',
            message: error.message
        });
    }
});

/**
 * 删除挑战
 */
router.delete('/challenges/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await query('DELETE FROM challenges WHERE id = $1', [id]);

        res.json({
            message: '挑战删除成功'
        });

    } catch (error) {
        console.error('删除挑战错误:', error);
        res.status(500).json({
            error: '删除挑战失败',
            message: error.message
        });
    }
});

/**
 * 获取所有阵营（管理员）
 */
router.get('/factions', async (req, res) => {
    try {
        const result = await query(`
            SELECT * FROM public.factions
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
 * 创建/更新阵营
 */
router.post('/factions', async (req, res) => {
    try {
        const { 
            id, 
            code, 
            name, 
            description, 
            color, 
            is_active, 
            sort_order 
        } = req.body;

        const result = await query(
            `INSERT INTO public.factions (
                id, code, name, description, color, is_active, sort_order
            ) 
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (id) 
             DO UPDATE SET 
                 code = EXCLUDED.code,
                 name = EXCLUDED.name,
                 description = EXCLUDED.description,
                 color = EXCLUDED.color,
                 is_active = EXCLUDED.is_active,
                 sort_order = EXCLUDED.sort_order,
                 updated_at = NOW()
             RETURNING *`,
            [
                id || require('uuid').v4(), 
                code, 
                name, 
                description, 
                color, 
                is_active !== false, 
                sort_order || 0
            ]
        );

        res.json({
            data: result.rows[0]
        });

    } catch (error) {
        console.error('保存阵营错误:', error);
        res.status(500).json({
            error: '保存阵营失败',
            message: error.message
        });
    }
});

/**
 * 删除阵营
 */
router.delete('/factions/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // 检查是否有用户使用此阵营
        const userCount = await query(
            'SELECT COUNT(*) as count FROM public.profiles WHERE faction = (SELECT code FROM public.factions WHERE id = $1)',
            [id]
        );

        if (parseInt(userCount.rows[0].count) > 0) {
            return res.status(400).json({
                error: '无法删除阵营',
                message: '该阵营下还有用户，请先转移用户到其他阵营'
            });
        }

        await query('DELETE FROM public.factions WHERE id = $1', [id]);

        res.json({
            message: '阵营删除成功'
        });

    } catch (error) {
        console.error('删除阵营错误:', error);
        res.status(500).json({
            error: '删除阵营失败',
            message: error.message
        });
    }
});

module.exports = router;
