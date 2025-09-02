/**
 * @file api.js
 * @description Encapsulates all interactions with the Supabase backend.
 * [v2.6.0] Added function to fetch faction challenge progress.
 */

// Initialize the Supabase client immediately at the module level.
const { createClient } = supabase;
const { SUPABASE_URL, SUPABASE_KEY } = window.APP_CONFIG || {};

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Supabase URL or Key is missing from window.APP_CONFIG.");
    document.body.innerHTML = '<div style="color:red; text-align:center; padding: 2rem;">Supabase configuration is missing. The application cannot start.</div>';
    throw new Error("Supabase URL or Key is missing.");
}

// 根据请求类型设置不同的超时时间
const getTimeoutForRequest = (url, options = {}) => {
    // 从URL或options中判断请求类型
    if (url.includes('/auth/')) return 30000; // 认证请求30秒（进一步增加）
    if (options.timeoutType) {
        const timeoutMap = {
            'auth': 30000,      // 认证请求30秒
            'user_progress': 8000,  // 用户进度8秒
            'learning_map': 12000,  // 学习地图12秒
            'leaderboard': 6000,    // 排行榜6秒
            'challenges': 8000,     // 挑战数据8秒
            'profile': 6000,        // 用户档案6秒
            'default': 10000        // 默认10秒
        };
        return timeoutMap[options.timeoutType] || timeoutMap.default;
    }
    return 10000; // 默认10秒
};

const db = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    },
    global: {
        fetch: (url, options = {}) => {
            const timeout = getTimeoutForRequest(url, options);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                console.warn(`请求超时 (${timeout}ms):`, url);
                controller.abort();
            }, timeout);
            
            return fetch(url, {
                ...options,
                signal: controller.signal
            }).finally(() => {
                clearTimeout(timeoutId);
            });
        }
    }
});

// 重试机制工具函数
async function withRetry(fn, maxRetries = 3, delay = 1000, operationName = '操作') {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === maxRetries - 1) {
                console.error(`${operationName} 重试 ${maxRetries} 次后仍然失败:`, error);
                throw error;
            }
            
            console.warn(`${operationName} 失败，${delay}ms后重试 (${i + 1}/${maxRetries}):`, error.message);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; // 指数退避
        }
    }
}

// 简单的内存缓存
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

function getCachedData(key) {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log(`📦 使用缓存数据: ${key}`);
        return cached.data;
    }
    return null;
}

function setCachedData(key, data) {
    cache.set(key, {
        data,
        timestamp: Date.now()
    });
    console.log(`💾 缓存数据: ${key}`);
}

export const ApiService = {
    db: db,

    initialize() {
        console.log("ApiService initialized with Supabase client.");
        // 移除预检请求以提升性能
    },

    // 移除预检函数以提升性能

    async awardAchievement(achievementKey) {
        const { error } = await this.db.rpc('award_achievement', { achievement_key: achievementKey });
        if (error) { console.error(`Failed to award achievement [${achievementKey}]:`, error); }
    },

    async fetchUserAchievements(userId) {
        const { data, error } = await this.db.from('user_achievements').select(`earned_at, achievements (name, description, icon_url)`).eq('user_id', userId).order('earned_at', { ascending: false });
        if (error) { console.error('Error fetching user achievements:', error); throw new Error('获取用户成就失败。'); }
        return data.map(ua => ({ ...ua.achievements, earned_at: ua.earned_at }));
    },

    async signUp(email, password, fullName) {
        const { data: authData, error: authError } = await this.db.auth.signUp({ email, password, });
        if (authError) throw authError;
        if (!authData.user) throw new Error('用户注册失败，无法获取新用户信息。');
        const userId = authData.user.id;
        const { error: scoreError } = await this.db.from('scores').insert({ user_id: userId, username: fullName });
        if (scoreError) { console.error(`User and profile created, but failed to create score entry: ${scoreError.message}`); throw new Error('用户分数记录创建失败，请联系管理员。'); }
        return authData;
    },

    async updateUsername(userId, newUsername) {
        const { data, error } = await this.db.from('scores').update({ username: newUsername }).eq('user_id', userId).select().single();
        if (error) {
            if (error.code === 'PGRST116') {
                 const { data: insertData, error: insertError } = await this.db.from('scores').insert({ user_id: userId, username: newUsername }).select().single();
                if (insertError) throw new Error(`创建用户名失败: ${insertError.message}`);
                return insertData;
            }
            throw new Error(`更新用户名失败: ${error.message}`);
        }
        return data;
    },

    async fetchLearningMap() {
        const cacheKey = 'learning_map';
        const cached = getCachedData(cacheKey);
        if (cached) return cached;
        
        return withRetry(async () => {
            const startTime = Date.now();
            const { data, error } = await this.db.from("categories")
                .select("*, chapters(*, sections(*, blocks(*)))")
                .order("order")
                .order("order", { foreignTable: "chapters" })
                .order("order", { foreignTable: "chapters.sections" })
                .order("order", { foreignTable: "chapters.sections.blocks" });
            if (error) throw error;
            
            const duration = Date.now() - startTime;
            console.log(`⏱️ 获取学习地图耗时: ${duration}ms`);
            
            setCachedData(cacheKey, data);
            return data;
        }, 3, 1000, '获取学习地图');
    },
    async fetchAllCategoriesForAdmin() {
        const { data, error } = await this.db.from('categories').select('*, chapters(id, title, description, order, sections(id, title, order, blocks(*)))').order('order');
        if (error) throw error;
        return data;
    },
    async upsertCategory(d) { const { error } = await this.db.from('categories').upsert(d, { onConflict: 'id' }); if (error) throw error; },
    async deleteCategory(id) { const { error } = await this.db.from('categories').delete().eq('id', id); if (error) throw error; },
    async upsertChapter(d) { const { error } = await this.db.from('chapters').upsert(d, { onConflict: 'id' }); if (error) throw error; },
    async deleteChapter(id) { const { error } = await this.db.from('chapters').delete().eq('id', id); if (error) throw error; },
    async upsertSection(d) { const { error } = await this.db.from('sections').upsert(d, { onConflict: 'id' }); if (error) throw error; },
    async deleteSection(id) { const { error } = await this.db.from('sections').delete().eq('id', id); if (error) throw error; },
    async upsertBlock(d) { const { error } = await this.db.from('blocks').upsert(d, { onConflict: 'id' }); if (error) throw error; },
    async deleteBlock(id) { const { error } = await this.db.from('blocks').delete().eq('id', id); if (error) throw error; },
    
    async fetchLeaderboard() {
        const cacheKey = 'leaderboard';
        const cached = getCachedData(cacheKey);
        if (cached) return cached;
        
        return withRetry(async () => {
            const startTime = Date.now();
            const { data, error } = await this.db.rpc('get_leaderboard_with_names').limit(10);
            if (error) { console.error("Error fetching leaderboard:", error); throw new Error("获取排行榜失败。"); }
            
            const duration = Date.now() - startTime;
            console.log(`⏱️ 获取排行榜耗时: ${duration}ms`);
            
            setCachedData(cacheKey, data);
            return data;
        }, 2, 1000, '获取排行榜');
    },

    async getScoreInfo(userId) {
        const { data, error } = await this.db.from('scores').select('username, points').eq('user_id', userId).single();
        if (error && error.code !== 'PGRST116') { console.error("Error fetching score info:", error); throw new Error('获取用户分数信息时出错。'); }
        return data;
    },

    async fetchFactionLeaderboard() {
        const { data, error } = await this.db.rpc('get_faction_leaderboard');
        if (error) { console.error("Error fetching faction leaderboard:", error); throw new Error("获取阵营排名失败。"); }
        return data;
    },
    
    async fetchActiveChallenges() {
        const { data, error } = await this.db.from('challenges').select('*, target_category:categories(title)').eq('is_active', true);
        if (error) throw error;
        return data.map(c => ({...c, target_category_title: c.target_category?.title}));
    },
    
    // =================================================================
    // NEW CHALLENGE PROGRESS FUNCTION
    // =================================================================
    async fetchFactionChallengeProgress(challengeId, faction) {
        const { data, error } = await this.db.rpc('get_single_faction_challenge_progress', {
            challenge_id_param: challengeId,
            faction_param: faction
        });
        if (error) {
            console.error(`Error fetching challenge progress for faction ${faction}:`, error);
            return 0; // Return 0 as a fallback to prevent breaking the UI
        }
        return data;
    },
    // =================================================================

    async fetchChallengesForAdmin() {
        const { data, error } = await this.db.from('challenges').select('*, target_category:categories(title)').order('created_at', { ascending: false });
        if (error) throw error;
        return data.map(c => ({...c, target_category_title: c.target_category?.title}));
    },
    async upsertChallenge(d) { const { error } = await this.db.from('challenges').upsert(d, { onConflict: 'id' }); if (error) throw error; },
    async deleteChallenge(id) { const { error } = await this.db.from('challenges').delete().eq('id', id); if (error) throw error; },

    async finishChallenge(challengeId) {
        const { error } = await this.db.rpc('finish_challenge', { challenge_id_param: challengeId });
        if (error) { console.error('Error finishing challenge:', error); throw new Error(`挑战结算失败: ${error.message}`); }
    },

    async getProfile(userId) {
        const { data, error } = await this.db.from('profiles').select('role, faction').eq('id', userId).single();
        if (error && error.code === 'PGRST116') { return null; }
        if (error) { console.error("Error fetching profile:", error); throw new Error('获取用户档案时出错。'); }
        return data;
    },

    async updateProfileFaction(userId, faction) {
        const { data, error } = await this.db.from('profiles').update({ faction: faction, updated_at: new Date() }).eq('id', userId).select('role, faction').single();
        if (error) throw new Error(`阵营选择失败: ${error.message}`);
        if (!data) throw new Error(`阵营更新失败：未找到用户档案。`);
        return data;
    },

    async updateProfile(userId, profileData) {
        const { data, error } = await this.db.from('profiles').update({ ...profileData, updated_at: new Date() }).eq('id', userId).select('*').single();
        if (error) throw new Error(`Failed to update profile: ${error.message}`);
        return data;
    },

    async getUserProgress(userId) {
        return withRetry(async () => {
            const { data, error } = await this.db.from('user_progress')
                .select('completed_blocks, awarded_points_blocks')
                .eq('user_id', userId)
                .single();
            if (error && error.code !== 'PGRST116') { 
                console.error('Error fetching user progress:', error); 
                throw new Error('获取用户进度失败'); 
            }
            return { 
                completed: data ? data.completed_blocks || [] : [], 
                awarded: data ? data.awarded_points_blocks || [] : [] 
            };
        }, 3, 1000, '获取用户进度');
    },

    async saveUserProgress(userId, progressData) {
        const { error } = await this.db.from('user_progress').upsert({ user_id: userId, completed_blocks: progressData.completed, awarded_points_blocks: progressData.awarded, updated_at: new Date() }, { onConflict: 'user_id' });
        if (error) throw new Error(`进度保存失败: ${error.message}`);
    },
    async resetUserProgress() {
        const { error } = await this.db.rpc('reset_user_progress');
        if (error) throw new Error('重置进度失败');
    },

    async addPoints(userId, points) {
        const { error } = await this.db.rpc('upsert_score', { user_id_input: userId, points_to_add: points });
        if (error) { console.error("RPC 'upsert_score' failed:", error); throw new Error(`积分更新失败: ${error.message}`); }
    },

    async signIn(email, password) {
        return withRetry(async () => {
            try {
                console.log('🔐 开始登录请求...');
                const startTime = Date.now();
                
                // 尝试使用更短的超时时间进行快速登录
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 20000); // 20秒超时
                
                const { data, error } = await this.db.auth.signInWithPassword({ 
                    email, 
                    password 
                });
                
                clearTimeout(timeoutId);
                
                const duration = Date.now() - startTime;
                console.log(`⏱️ 登录请求耗时: ${duration}ms`);
                
                if (error) {
                    console.error('Login error:', error);
                    throw error;
                }
                
                console.log('✅ 登录成功');
                return data;
            } catch (error) {
                console.error('Network or authentication error:', error);
                if (error.name === 'AbortError') {
                    throw new Error('登录超时，认证服务响应缓慢，请稍后重试');
                } else if (error.message.includes('ERR_CONNECTION_TIMED_OUT')) {
                    throw new Error('网络连接超时，请检查网络连接');
                } else if (error.message.includes('Failed to fetch')) {
                    throw new Error('网络连接失败，请检查网络连接');
                } else if (error.message.includes('signal is aborted')) {
                    throw new Error('认证服务响应超时，请稍后重试');
                }
                throw error;
            }
        }, 2, 5000, '用户登录'); // 减少重试次数到2次，增加间隔到5秒
    },
    async signOut() {
        try {
            console.log('🚪 开始退出流程...');
            
            // 第一步：检查当前会话状态
            const { data: { session }, error: sessionError } = await this.db.auth.getSession();
            
            if (sessionError) {
                console.warn('获取会话状态失败:', sessionError);
            }
            
            if (session) {
                console.log('✅ 发现有效会话，执行服务器端退出');
                try {
                    // 只有在存在有效会话时才调用服务器端退出
                    const { error } = await this.db.auth.signOut();
                    if (error) {
                        console.error("服务器端退出失败:", error);
                        // 即使服务器端退出失败，也继续执行本地清理
                    } else {
                        console.log('✅ 服务器端退出成功');
                    }
                } catch (signOutError) {
                    console.error("退出请求异常:", signOutError);
                    // 继续执行本地清理
                }
            } else {
                console.warn("⚠️ 未发现有效会话，跳过服务器端退出");
            }
            
            // 第二步：无论如何都执行本地清理
            this.clearCache();
            
            // 第三步：清理本地存储中的认证数据
            try {
                // 清理可能的本地存储数据
                localStorage.removeItem('sb-' + SUPABASE_URL.split('//')[1].split('.')[0] + '-auth-token');
                sessionStorage.clear();
                console.log('✅ 本地存储清理完成');
            } catch (storageError) {
                console.warn('本地存储清理失败:', storageError);
            }
            
            // 第四步：触发全局退出事件
            this.triggerSignOutEvent();
            
            console.log('✅ 退出流程完成');
            
        } catch (error) {
            console.error('退出流程异常:', error);
            // 即使出现异常，也要确保本地状态被清理
            this.clearCache();
            this.triggerSignOutEvent();
        }
    },

    // 新增：触发退出事件的方法
    triggerSignOutEvent() {
        try {
            // 触发自定义事件，通知应用其他部分用户已退出
            const signOutEvent = new CustomEvent('userSignOut', {
                detail: { timestamp: Date.now() }
            });
            window.dispatchEvent(signOutEvent);
            console.log('✅ 退出事件已触发');
        } catch (error) {
            console.warn('触发退出事件失败:', error);
        }
    },

    // 清除所有缓存
    clearCache() {
        cache.clear();
        console.log('🗑️ 已清除所有缓存');
    },

    // 清除特定缓存
    clearCacheKey(key) {
        cache.delete(key);
        console.log(`🗑️ 已清除缓存: ${key}`);
    },
};
