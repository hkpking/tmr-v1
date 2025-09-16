/**
 * 数据库配置和连接管理
 */

const { Pool } = require('pg');
const { getCurrentDatabaseConfig, validateConfig } = require('../config/database-config');

// 获取数据库配置的函数
function getDatabaseConfig() {
    try {
        const config = getCurrentDatabaseConfig();
        validateConfig();
        
        return {
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            database: config.database,
            ssl: config.ssl ? { rejectUnauthorized: false } : false,
            max: config.connectionLimit || 20,
            idleTimeoutMillis: config.idleTimeout || 30000,
            connectionTimeoutMillis: config.connectionTimeout || 2000,
        };
    } catch (error) {
        console.error('❌ 数据库配置错误:', error.message);
        throw error;
    }
}

let pool = null;

/**
 * 连接数据库
 */
async function connectDatabase() {
    try {
        // 每次连接时重新获取配置
        const dbConfig = getDatabaseConfig();
        const config = getCurrentDatabaseConfig();
        
        console.log(`📊 数据库配置: ${config.type} (${config.environment})`);
        console.log(`🔗 连接: ${config.user}@${config.host}:${config.port}/${config.database}`);
        
        pool = new Pool(dbConfig);
        
        // 测试连接
        const client = await pool.connect();
        const result = await client.query('SELECT version()');
        client.release();
        
        console.log('✅ 数据库连接成功');
        console.log(`📊 PostgreSQL版本: ${result.rows[0].version.split(' ')[0]}`);
        
        return pool;
    } catch (error) {
        console.error('❌ 数据库连接失败:', error.message);
        throw error;
    }
}

/**
 * 获取数据库连接池
 */
function getPool() {
    if (!pool) {
        throw new Error('数据库未连接，请先调用 connectDatabase()');
    }
    return pool;
}

/**
 * 执行查询
 */
async function query(text, params = []) {
    const pool = getPool();
    const start = Date.now();
    
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        
        if (process.env.NODE_ENV === 'development') {
            console.log(`🔍 SQL查询 (${duration}ms):`, text.substring(0, 100) + '...');
        }
        
        return result;
    } catch (error) {
        console.error('❌ 数据库查询错误:', error.message);
        throw error;
    }
}

/**
 * 获取客户端（用于事务）
 */
async function getClient() {
    const pool = getPool();
    return await pool.connect();
}

/**
 * 关闭数据库连接
 */
async function closeDatabase() {
    if (pool) {
        await pool.end();
        pool = null;
        console.log('🔌 数据库连接已关闭');
    }
}

module.exports = {
    connectDatabase,
    getPool,
    query,
    getClient,
    closeDatabase
};
