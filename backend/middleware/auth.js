/**
 * 认证中间件
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * JWT令牌验证中间件
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            error: '访问令牌缺失'
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('JWT验证失败:', err.message);
            return res.status(403).json({
                error: '访问令牌无效或已过期'
            });
        }

        req.user = user;
        next();
    });
}

/**
 * 管理员权限验证中间件
 */
function requireAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            error: '未认证'
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            error: '需要管理员权限'
        });
    }

    next();
}

/**
 * 可选认证中间件（不强制要求登录）
 */
function optionalAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        req.user = null;
        return next();
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            req.user = null;
        } else {
            req.user = user;
        }
        next();
    });
}

module.exports = {
    authenticateToken,
    requireAdmin,
    optionalAuth
};
