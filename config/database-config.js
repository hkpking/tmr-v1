/**
 * 远程数据库配置包
 * 用于生产环境和远程开发环境
 */

// 数据库类型枚举
const DATABASE_TYPES = {
    POSTGRESQL: 'postgresql'
};

// 当前使用的数据库类型
const CURRENT_DB_TYPE = DATABASE_TYPES.POSTGRESQL;

// 远程数据库配置
const DATABASE_CONFIGS = {
    [DATABASE_TYPES.POSTGRESQL]: {
        development: {
            host: process.env.DB_HOST || '101.32.59.153',
            port: parseInt(process.env.DB_PORT) || 5432,
            user: process.env.DB_USER || 'web_app',
            password: process.env.DB_PASSWORD || 'Dslr*2025#app',
            database: process.env.DB_NAME || 'lctmr_production',
            ssl: process.env.DB_SSL === 'true' || false,
            connectionLimit: 50,
            idleTimeout: 30000,
            connectionTimeout: 2000
        },
        production: {
            host: process.env.DB_HOST || '101.32.59.153',
            port: parseInt(process.env.DB_PORT) || 5432,
            user: process.env.DB_USER || 'web_app',
            password: process.env.DB_PASSWORD || 'Dslr*2025#app',
            database: process.env.DB_NAME || 'lctmr_production',
            ssl: process.env.DB_SSL === 'true' || false,
            connectionLimit: 50,
            idleTimeout: 30000,
            connectionTimeout: 2000
        }
    }
};

// 获取当前数据库配置
function getCurrentDatabaseConfig() {
    const environment = process.env.NODE_ENV || 'development';
    const config = DATABASE_CONFIGS[CURRENT_DB_TYPE];
    
    if (!config) {
        throw new Error(`不支持的数据库类型: ${CURRENT_DB_TYPE}`);
    }
    
    if (!config[environment]) {
        throw new Error(`数据库类型 ${CURRENT_DB_TYPE} 不支持环境 ${environment}`);
    }
    
    return {
        type: CURRENT_DB_TYPE,
        environment,
        ...config[environment]
    };
}

// 获取数据库连接字符串
function getConnectionString() {
    const config = getCurrentDatabaseConfig();
    return `postgresql://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`;
}

// 获取 API 配置
function getApiConfig() {
    return {
        useApiServer: true,
        apiBaseUrl: process.env.API_URL || 'http://localhost:3001/api',
        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5500'
    };
}

// 获取 JWT 配置
function getJwtConfig() {
    return {
        secret: process.env.JWT_SECRET || '7YtYAMJUa4LaqChbkV0iN5IMSHvaBCVtBmUktZX3E8JOG0i+4TShH5vXl2HhleUMNITi4thFiYv8UFbdiazkqA==',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    };
}

// 验证配置
function validateConfig() {
    const config = getCurrentDatabaseConfig();
    const requiredFields = ['host', 'port', 'user', 'password', 'database'];
    
    for (const field of requiredFields) {
        if (!config[field]) {
            throw new Error(`缺少必需的数据库配置字段: ${field}`);
        }
    }
    
    return true;
}

module.exports = {
    DATABASE_TYPES,
    CURRENT_DB_TYPE,
    getCurrentDatabaseConfig,
    getConnectionString,
    getApiConfig,
    getJwtConfig,
    validateConfig
};
