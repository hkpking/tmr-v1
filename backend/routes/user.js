/**
 * 用户相关路由
 */

const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * 获取用户档案
 */
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.user;

        const result = await query(
            `SELECT p.id, p.role, p.faction, p.full_name, s.username, s.points
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
                id: user.id,
                role: user.role,
                faction: user.faction,
                fullName: user.full_name,
                username: user.username,
                points: user.points || 0
            }
        });

    } catch (error) {
        console.error('获取用户档案错误:', error);
        res.status(500).json({
            error: '获取用户档案失败',
            message: error.message
        });
    }
});

/**
 * 更新用户档案
 */
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.user;
        const { faction, fullName } = req.body;

        const updates = [];
        const values = [];
        let paramCount = 1;

        if (faction !== undefined) {
            updates.push(`faction = $${paramCount}`);
            values.push(faction);
            paramCount++;
        }

        if (fullName !== undefined) {
            updates.push(`full_name = $${paramCount}`);
            values.push(fullName);
            paramCount++;
        }

        if (updates.length === 0) {
            return res.status(400).json({
                error: '没有需要更新的字段'
            });
        }

        updates.push(`updated_at = NOW()`);
        values.push(userId);

        const result = await query(
            `UPDATE profiles SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            values
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: '用户不存在'
            });
        }

        res.json({
            data: result.rows[0]
        });

    } catch (error) {
        console.error('更新用户档案错误:', error);
        res.status(500).json({
            error: '更新用户档案失败',
            message: error.message
        });
    }
});

/**
 * 获取用户成就
 */
router.get('/achievements', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.user;

        const result = await query(
            `SELECT ua.earned_at, a.name, a.description, a.icon_url
             FROM user_achievements ua
             JOIN achievements a ON ua.achievement_id = a.id
             WHERE ua.user_id = $1
             ORDER BY ua.earned_at DESC`,
            [userId]
        );

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
 * 更新用户名
 */
router.put('/username', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.user;
        const { username } = req.body;

        if (!username || username.trim().length === 0) {
            return res.status(400).json({
                error: '用户名不能为空'
            });
        }

        // 检查用户名是否已存在
        const existingUser = await query(
            'SELECT user_id FROM scores WHERE username = $1 AND user_id != $2',
            [username, userId]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                error: '用户名已存在'
            });
        }

        const result = await query(
            `UPDATE scores SET username = $1 WHERE user_id = $2 RETURNING *`,
            [username, userId]
        );

        if (result.rows.length === 0) {
            // 如果用户没有积分记录，创建一个
            const newScore = await query(
                'INSERT INTO scores (user_id, username, points) VALUES ($1, $2, 0) RETURNING *',
                [userId, username]
            );
            return res.json({
                data: newScore.rows[0]
            });
        }

        res.json({
            data: result.rows[0]
        });

    } catch (error) {
        console.error('更新用户名错误:', error);
        res.status(500).json({
            error: '更新用户名失败',
            message: error.message
        });
    }
});

module.exports = router;
