/**
 * 流程天命人 - 后端API服务
 * 提供数据库连接和API接口
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
// 只在开发环境加载本地配置文件
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: '../env.local' });
}

const authRoutes = require('./routes/auth');
const learningRoutes = require('./routes/learning');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const { connectDatabase } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3001;

// 信任代理设置（用于K8s环境）
app.set('trust proxy', 1); // 只信任第一层代理

// 安全中间件
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
        },
    },
}));

// CORS配置
app.use(cors({
    origin: [
        'http://localhost:5500',
        'http://127.0.0.1:5500',
        'http://localhost:8080',
        'http://127.0.0.1:8080',
        'http://localhost',
        'http://127.0.0.1',
        process.env.FRONTEND_URL
    ].filter(Boolean), // 过滤掉 undefined 值
    credentials: true
}));

// 请求日志
app.use(morgan('combined'));

// 限流
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 1000, // 限制每个IP 15分钟内最多1000个请求（临时放宽）
    message: '请求过于频繁，请稍后再试'
});
app.use('/api/', limiter);

// 解析JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 健康检查
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// 根API路由
app.get('/api', (req, res) => {
    res.json({
        message: '流程天命人 API 服务',
        version: '2.0',
        status: 'running',
        endpoints: {
            auth: '/api/auth',
            learning: '/api/learning', 
            user: '/api/user',
            admin: '/api/admin'
        }
    });
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

// 静态文件服务（提供前端文件）
app.use(express.static('/app', {
    setHeaders: (res, path) => {
        // 设置正确的MIME类型
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        } else if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        } else if (path.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html');
        }
    }
}));

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('API错误:', err);
    
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: '请求参数错误',
            details: err.message
        });
    }
    
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            error: '未授权访问'
        });
    }
    
    res.status(500).json({
        error: '服务器内部错误',
        message: process.env.NODE_ENV === 'development' ? err.message : '请稍后重试'
    });
});

// 404处理
app.use('*', (req, res) => {
    res.status(404).json({
        error: '接口不存在',
        path: req.originalUrl
    });
});

// 启动服务器
async function startServer() {
    try {
        // 连接数据库
        await connectDatabase();
        console.log('✅ 数据库连接成功');
        
        // 启动HTTP服务器
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 API服务器启动成功`);
            console.log(`📍 端口: ${PORT}`);
            console.log(`🌍 环境: ${process.env.NODE_ENV || 'production'}`);
            console.log(`🔗 健康检查: http://localhost:${PORT}/health`);
        });
    } catch (error) {
        console.error('❌ 服务器启动失败:', error);
        process.exit(1);
    }
}

// 优雅关闭
process.on('SIGTERM', () => {
    console.log('🛑 收到SIGTERM信号，正在关闭服务器...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 收到SIGINT信号，正在关闭服务器...');
    process.exit(0);
});

startServer();
