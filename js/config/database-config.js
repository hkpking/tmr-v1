/**
 * 前端数据库配置文件
 * 统一管理前端数据库相关配置
 */

// 数据库类型枚举
const DATABASE_TYPES = {
    POSTGRESQL: 'postgresql',
    SUPABASE: 'supabase',
    MYSQL: 'mysql'
};

// 当前使用的数据库类型
const CURRENT_DB_TYPE = DATABASE_TYPES.POSTGRESQL; // 可以在这里切换数据库类型

// API 配置
const API_CONFIG = {
    // 本地开发环境
    development: {
        useApiServer: true,
        apiBaseUrl: 'http://localhost:3001/api',
        frontendUrl: 'http://localhost:5500'
    },
    // 生产环境
    production: {
        useApiServer: true,
        apiBaseUrl: window.API_URL || 'http://localhost:3001/api',
        frontendUrl: window.FRONTEND_URL || 'http://localhost:5500'
    }
};

// Supabase 配置
const SUPABASE_CONFIG = {
    development: {
        url: 'https://your-project.supabase.co',
        anonKey: 'your-anon-key',
        serviceRoleKey: 'your-service-role-key'
    },
    production: {
        url: window.SUPABASE_URL || 'https://your-project.supabase.co',
        anonKey: window.SUPABASE_ANON_KEY || 'your-anon-key',
        serviceRoleKey: window.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'
    }
};

// 获取当前配置
function getCurrentConfig() {
    const environment = window.NODE_ENV || 'development';
    
    // 从环境变量或默认值获取数据库类型
    const dbType = window.DB_TYPE || CURRENT_DB_TYPE;
    
    return {
        databaseType: dbType,
        environment,
        api: API_CONFIG[environment],
        supabase: SUPABASE_CONFIG[environment]
    };
}

// 获取 API 配置
function getApiConfig() {
    const config = getCurrentConfig();
    return config.api;
}

// 获取 Supabase 配置
function getSupabaseConfig() {
    const config = getCurrentConfig();
    return config.supabase;
}

// 检查是否使用 API 服务器
function useApiServer() {
    const config = getCurrentConfig();
    return config.databaseType !== DATABASE_TYPES.SUPABASE && config.api.useApiServer;
}

// 数据库切换函数
function switchDatabaseType(newType) {
    if (!Object.values(DATABASE_TYPES).includes(newType)) {
        throw new Error(`不支持的数据库类型: ${newType}`);
    }
    
    console.log(`数据库类型已切换为: ${newType}`);
    return newType;
}

// 验证配置
function validateConfig() {
    const config = getCurrentConfig();
    
    if (config.databaseType === DATABASE_TYPES.SUPABASE) {
        const supabaseConfig = config.supabase;
        if (!supabaseConfig.url || !supabaseConfig.anonKey) {
            throw new Error('Supabase 配置不完整');
        }
    } else if (config.api.useApiServer) {
        if (!config.api.apiBaseUrl) {
            throw new Error('API 服务器配置不完整');
        }
    }
    
    return true;
}

// 导出配置
export {
    DATABASE_TYPES,
    CURRENT_DB_TYPE,
    getCurrentConfig,
    getApiConfig,
    getSupabaseConfig,
    useApiServer,
    switchDatabaseType,
    validateConfig
};
