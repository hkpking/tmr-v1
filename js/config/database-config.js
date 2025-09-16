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
const CURRENT_DB_TYPE = DATABASE_TYPES.POSTGRESQL;

// 获取 API 配置
function getApiConfig() {
    // 直接使用环境变量，让 Kubernetes 环境变量注入来处理
    const apiUrl = window.API_URL || 'http://localhost:3001/api';
    const frontendUrl = window.FRONTEND_URL || 'http://localhost:5500';
    const backendUrl = window.BACKEND_URL || 'http://localhost:3001';
    
    return {
        useApiServer: true,
        apiBaseUrl: apiUrl,
        frontendUrl: frontendUrl,
        backendUrl: backendUrl
    };
}

// 是否使用 API 服务器
function useApiServer() {
    return true;
}

// 验证配置
function validateConfig() {
    const apiConfig = getApiConfig();
    
    if (!apiConfig.apiBaseUrl) {
        throw new Error('缺少必需的 API 配置字段: apiBaseUrl');
    }
    
    if (!apiConfig.frontendUrl) {
        throw new Error('缺少必需的 API 配置字段: frontendUrl');
    }
    
    return true;
}

// 获取数据库连接字符串（前端不需要，但保持兼容性）
function getConnectionString() {
    return null;
}

// 获取 JWT 配置
function getJwtConfig() {
    return {
        secret: '7YtYAMJUa4LaqChbkV0iN5IMSHvaBCVtBmUktZX3E8JOG0i+4TShH5vXl2HhleUMNITi4thFiYv8UFbdiazkqA==',
        expiresIn: '24h'
    };
}

// 导出配置
export {
    DATABASE_TYPES,
    CURRENT_DB_TYPE,
    getApiConfig,
    useApiServer,
    validateConfig,
    getConnectionString,
    getJwtConfig
};
