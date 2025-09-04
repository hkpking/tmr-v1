/**
 * @file constants.js
 * @description Provides constant values and utility functions for the application, such as faction information.
 * [v1.0.0] Corrected syntax to define and export faction data properly.
 * [v1.1.0] Updated to use dynamic faction data from database.
 */

// 缓存阵营信息，避免重复请求
let factionCache = null;

/**
 * 从数据库获取阵营信息并缓存
 * @returns {Promise<Object>} 阵营信息映射
 */
async function loadFactionMap() {
    if (factionCache) {
        return factionCache;
    }
    
    try {
        // 动态导入ApiService以避免循环依赖
        const { ApiService } = await import('./services/api.js');
        const factions = await ApiService.getPublicFactions();
        
        // 构建阵营映射
        factionCache = {};
        factions.forEach(faction => {
            factionCache[faction.code] = {
                name: faction.name,
                color: faction.color,
                description: faction.description
            };
        });
        
        // 添加默认值
        factionCache.default = { name: '未知部门', color: '#6B7280' };
        
        return factionCache;
    } catch (error) {
        console.error('加载阵营信息失败:', error);
        // 返回默认映射
        return {
            default: { name: '未知部门', color: '#6B7280' }
        };
    }
}

/**
 * 清除阵营缓存（当阵营信息更新时调用）
 */
export function clearFactionCache() {
    factionCache = null;
}

/**
 * Retrieves faction information based on its ID.
 * @param {string} factionId - The ID of the faction (e.g., 'it_dept').
 * @returns {Promise<{name: string, color: string, description?: string}>} The faction's name, color, and description.
 */
export async function getFactionInfo(factionId) {
    const factionMap = await loadFactionMap();
    return factionMap[factionId] || factionMap.default;
}

/**
 * 同步版本的getFactionInfo，用于向后兼容
 * 注意：这个函数可能返回过期的信息
 * @param {string} factionId - The ID of the faction (e.g., 'it_dept').
 * @returns {{name: string, color: string}} The faction's name and color theme.
 */
export function getFactionInfoSync(factionId) {
    if (!factionCache) {
        // 如果缓存为空，返回默认值
        return { name: '未知部门', color: '#6B7280' };
    }
    return factionCache[factionId] || factionCache.default;
}
