/**
 * 数据库配置文件
 * 统一管理所有数据库相关配置
 * 支持多种数据库类型：PostgreSQL, Supabase, MySQL 等
 */

// 数据库类型枚举
const DATABASE_TYPES = {
    POSTGRESQL: 'postgresql',
    SUPABASE: 'supabase',
    MYSQL: 'mysql',
    SQLITE: 'sqlite'
};

// 当前使用的数据库类型
const CURRENT_DB_TYPE = DATABASE_TYPES.POSTGRESQL; // 可以在这里切换数据库类型

// 数据库配置
const DATABASE_CONFIGS = {
    // PostgreSQL 配置
    [DATABASE_TYPES.POSTGRESQL]: {
        // 本地开发环境
        development: {
            host: 'localhost',
            port: 5432,
            user: 'postgres',
            password: 'admin',
            database: 'lctmr_local',
            ssl: false,
            connectionLimit: 20,
            idleTimeout: 30000,
            connectionTimeout: 2000
        },
        // 生产环境
        production: {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'admin',
            database: process.env.DB_NAME || 'lctmr_prod',
            ssl: process.env.DB_SSL === 'true',
            connectionLimit: 50,
            idleTimeout: 30000,
            connectionTimeout: 2000
        }
    },

    // Supabase 配置
    [DATABASE_TYPES.SUPABASE]: {
        development: {
            url: 'https://your-project.supabase.co',
            anonKey: 'your-anon-key',
            serviceRoleKey: 'your-service-role-key'
        },
        production: {
            url: process.env.SUPABASE_URL || 'https://your-project.supabase.co',
            anonKey: process.env.SUPABASE_ANON_KEY || 'your-anon-key',
            serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'
        }
    },

    // MySQL 配置
    [DATABASE_TYPES.MYSQL]: {
        development: {
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: 'password',
            database: 'lctmr_local',
            connectionLimit: 20,
            acquireTimeout: 60000,
            timeout: 60000
        },
        production: {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'password',
            database: process.env.DB_NAME || 'lctmr_prod',
            connectionLimit: 50,
            acquireTimeout: 60000,
            timeout: 60000
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
    
    switch (config.type) {
        case DATABASE_TYPES.POSTGRESQL:
            return `postgresql://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`;
        
        case DATABASE_TYPES.MYSQL:
            return `mysql://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`;
        
        default:
            throw new Error(`不支持的数据库类型: ${config.type}`);
    }
}

// 获取 API 配置
function getApiConfig() {
    const config = getCurrentDatabaseConfig();
    
    return {
        useApiServer: config.type !== DATABASE_TYPES.SUPABASE,
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

// 数据库切换函数
function switchDatabaseType(newType) {
    if (!DATABASE_TYPES[newType]) {
        throw new Error(`不支持的数据库类型: ${newType}`);
    }
    
    // 这里可以添加切换逻辑
    console.log(`数据库类型已切换为: ${newType}`);
    return newType;
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
    switchDatabaseType,
    validateConfig
};
