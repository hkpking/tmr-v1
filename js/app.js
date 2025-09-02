/**
 * @file app.js
 * @description The main entry point for the application.
 * @version 7.0.0 - [REFACTOR] Lobby UI simplified, actions moved to bottom nav.
 */
import { AppState, resetUserProgressState } from './state.js';
import { UI } from './ui.js';
import { ApiService } from './services/api.js';
import { AuthView } from './views/auth.js';
import { CourseView } from './views/course.js';
import { AdminView } from './views/admin.js';
import { ProfileView } from './views/profile.js';
import { getFactionInfo } from './constants.js';
import { PerformanceMonitor } from './performance-monitor.js';

const App = {
    // 添加标志位防止重复处理认证
    isHandlingAuth: false,
    performanceMonitor: null,
    
    init() {
        // 初始化性能监控
        this.performanceMonitor = new PerformanceMonitor();
        
        this.bindEvents();
        this.initLandingPageAnimation();
        this.initMusicControls();
        ApiService.initialize();
        ApiService.db.auth.onAuthStateChange((_event, session) => {
            if (this.isHandlingAuth) {
                console.log('认证处理中，跳过重复处理');
                return;
            }
            
            if (session && session.user) {
                console.log('🔄 检测到有效会话，自动恢复登录状态');
                this.isHandlingAuth = true;
                // [OPTIMIZATION] Set navigate to true to automatically enter the lobby
                this.handleLogin(session.user, true).finally(() => {
                    this.isHandlingAuth = false;
                });
            } else {
                // 会话为空时的处理
                console.log('🔓 检测到用户会话已失效');
                AppState.user = null;
                AppState.profile = null;
                resetUserProgressState();
                UI.showNarrative();
            }
        });

        // 新增：监听自定义退出事件
        window.addEventListener('userSignOut', (event) => {
            console.log('📢 收到退出事件:', event.detail);
            // 确保应用状态被正确清理
            if (AppState.user) {
                AppState.user = null;
                AppState.profile = null;
                resetUserProgressState();
            }
        });
    },

    initLandingPageAnimation() {
        const subtitle = UI.elements.landing.subtitle;
        const script = [
            { t: "流程真经，曾护佑大唐盛世千年……", d: 4000 }, 
            { t: "然大道蒙尘，秩序失落，妖魔横行。", d: 4000 }, 
            { t: "为重归繁荣，遍发《无字真书》，寻觅天命之人。", d: 5000 }, 
            { t: "于机缘巧合，你，得到了它……", d: 4000 }, 
            { t: "当你翻开《流程密码》的瞬间，亦被其选中。", d: 5000 }, 
            { t: "欢迎你，天命人。你的旅程，由此开始。", d: 4000 }
        ];
        let currentLine = 0;
        
        const playNarrative = () => {
            if (currentLine >= script.length) {
                currentLine = 0; // Loop the animation
            }
            const scene = script[currentLine];
            subtitle.classList.remove('visible');
            setTimeout(() => {
                subtitle.textContent = scene.t;
                subtitle.classList.add('visible');
                currentLine++;
                setTimeout(playNarrative, scene.d);
            }, 1500); 
        }
        playNarrative();
    },

    initMusicControls() {
        const music = document.getElementById('background-music');
        const controlBtn = document.getElementById('music-control-btn');
        const playIcon = document.getElementById('play-icon');
        const pauseIcon = document.getElementById('pause-icon');
        const landingView = document.getElementById('landing-view');

        const togglePlayback = () => {
            if (music.paused) {
                music.play().then(() => {
                    playIcon.classList.add('hidden');
                    pauseIcon.classList.remove('hidden');
                }).catch(error => console.error("Music play failed:", error));
            } else {
                music.pause();
                playIcon.classList.remove('hidden');
                pauseIcon.classList.add('hidden');
            }
        };

        controlBtn.addEventListener('click', togglePlayback);

        // Autoplay logic
        const attemptAutoplay = () => {
            music.play().then(() => {
                playIcon.classList.add('hidden');
                pauseIcon.classList.remove('hidden');
            }).catch(() => {
                // Autoplay was blocked, user must click.
                playIcon.classList.remove('hidden');
                pauseIcon.classList.add('hidden');
            });
        };

        // Observer to control visibility and playback based on view
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.attributeName === 'class') {
                    const isLandingActive = landingView.classList.contains('active');
                    if (isLandingActive) {
                        controlBtn.classList.remove('opacity-0');
                        controlBtn.classList.remove('pointer-events-none');
                    } else {
                        music.pause();
                        playIcon.classList.remove('hidden');
                        pauseIcon.classList.add('hidden');
                        controlBtn.classList.add('opacity-0');
                        controlBtn.classList.add('pointer-events-none');
                    }
                }
            });
        });

        observer.observe(landingView, { attributes: true });

        // Initial check
        if (landingView.classList.contains('active')) {
            controlBtn.classList.remove('opacity-0');
            controlBtn.classList.remove('pointer-events-none');
            attemptAutoplay();
        } else {
            controlBtn.classList.add('opacity-0');
            controlBtn.classList.add('pointer-events-none');
        }
    },

    bindEvents() {
        // --- Landing View Events ---
        UI.elements.landing.loginBtn.addEventListener('click', () => UI.showAuthForm());
        UI.elements.landing.startJourneyBtn.addEventListener('click', () => {
            if (AppState.user) {
                UI.switchTopLevelView('game-lobby');
            } else {
                UI.showAuthForm();
            }
        });

        // --- Auth Form Events (now on landing page) ---
        UI.elements.auth.backToLandingBtn.addEventListener('click', () => UI.showNarrative());
        UI.elements.auth.form.addEventListener('submit', (e) => AuthView.handleAuthSubmit(e));
        UI.elements.auth.switchBtn.addEventListener('click', (e) => AuthView.switchAuthMode(e));
        
        // --- Game Lobby Events ---
        UI.elements.lobby.playerInfo.addEventListener('click', () => ProfileView.showProfileView());
        UI.elements.lobby.logoutBtn.addEventListener('click', async () => {
            try {
                // 显示退出确认或加载状态
                UI.showLoadingState('正在退出...');
                
                // 调用优化的退出方法
                await ApiService.signOut();
                
                // 强制清理应用状态
                AppState.user = null;
                AppState.profile = null;
                resetUserProgressState();
                
                // 隐藏加载状态
                UI.hideLoadingState();
                
                // 切换到登录页面
                UI.switchTopLevelView('landing');
                
                // 显示退出成功提示
                UI.showNotification('已安全退出', 'success');
                
            } catch (error) {
                console.error('退出过程中发生错误:', error);
                
                // 即使退出失败，也要强制清理本地状态
                AppState.user = null;
                AppState.profile = null;
                resetUserProgressState();
                
                UI.hideLoadingState();
                UI.switchTopLevelView('landing');
                
                // 显示退出提示（即使有错误）
                UI.showNotification('已退出登录', 'info');
            }
        });

        // [MODIFIED] Centralized bottom nav event handling
        UI.elements.lobby.bottomNav.addEventListener('click', (e) => {
            const button = e.target.closest('.lobby-nav-btn');
            if (!button || !AppState.user) return;
            const action = button.dataset.action;
            switch(action) {
                case 'start-journey': this.handleStartJourney(); break;
                case 'show-faction-challenges': this.showLobbyModal('faction-challenges'); break;
                case 'show-profile': ProfileView.showProfileView(); break;
                case 'show-admin': AdminView.showAdminView(); break;
            }
        });

        UI.elements.lobby.leaderboardTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                UI.elements.lobby.leaderboardTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                document.querySelectorAll('#leaderboard-panel-lobby .panel-content').forEach(c => c.classList.remove('active'));
                document.getElementById(`leaderboard-content-${tabName}`).classList.add('active');
            });
        });
        document.getElementById('lobby-modal-backdrop').addEventListener('click', (e) => {
            if (e.target.id === 'lobby-modal-backdrop') this.hideLobbyModal();
        });

        // --- Other View Events ---
        UI.elements.mainApp.backToHubBtn.addEventListener('click', (e) => { e.preventDefault(); UI.switchTopLevelView('game-lobby'); });
        UI.elements.mainApp.profileViewBtn.addEventListener('click', () => ProfileView.showProfileView());
        UI.elements.mainApp.adminViewBtn.addEventListener('click', () => AdminView.showAdminView());
        UI.elements.mainApp.restartBtn.addEventListener('click', () => this.toggleRestartModal(true));
        UI.elements.mainApp.backToCategoriesBtn.addEventListener('click', () => CourseView.showCategoryView());
        UI.elements.mainApp.backToChaptersBtn.addEventListener('click', () => CourseView.showChapterView());
        UI.elements.profile.backToMainAppBtn.addEventListener('click', () => UI.switchTopLevelView('game-lobby'));
        UI.elements.immersiveView.closeBtn.addEventListener('click', () => CourseView.closeImmersiveViewer());
        UI.elements.restartModal.cancelBtn.addEventListener('click', () => this.toggleRestartModal(false));
        UI.elements.restartModal.confirmBtn.addEventListener('click', () => this.handleConfirmRestart());
        UI.elements.factionModal.container.addEventListener('click', (e) => {
            const button = e.target.closest('.faction-btn');
            if (button) this.handleFactionSelection(button.dataset.faction);
        });
    },

    async handleLogin(user, navigate = true) {
        if (AppState.user && AppState.user.id === user.id) {
            console.log('✅ 用户已登录，直接跳转到游戏大厅');
            if(navigate) UI.switchTopLevelView('game-lobby');
            return;
        }
        
        try {
            // 开始监控登录性能
            if (this.performanceMonitor) {
                this.performanceMonitor.startLogin();
            }
            
            // 显示登录加载状态
            UI.showLoadingState('正在验证用户信息...');
            
            resetUserProgressState();
            AppState.user = user;
            
            const [profile, scoreInfo] = await Promise.all([ 
                ApiService.getProfile(user.id), 
                ApiService.getScoreInfo(user.id) 
            ]);
            
            AppState.profile = { 
                ...(profile || { role: 'user', faction: null }), 
                username: scoreInfo?.username, 
                points: scoreInfo?.points || 0 
            };
            
            if (!AppState.profile.faction) {
                UI.hideLoadingState();
                this.showFactionSelection();
            } else {
                await this.loadMainAppData();
                if(navigate) {
                    console.log('🎮 数据加载完成，自动跳转到游戏大厅');
                    UI.switchTopLevelView('game-lobby');
                }
            }
            
            // 完成登录监控
            if (this.performanceMonitor) {
                this.performanceMonitor.endLogin();
            }
        } catch (error) {
            console.error("Login process failed:", error);
            UI.hideLoadingState();
            UI.showNotification(`登录失败: ${error.message}`, 'error');
            ApiService.signOut();
        }
    },

    async loadMainAppData() {
        try {
            // 开始监控数据加载性能
            if (this.performanceMonitor) {
                this.performanceMonitor.startDataLoad();
            }
            
            // 显示加载状态
            UI.showLoadingState('正在加载核心数据...');
            
            // 并行加载所有核心数据
            const [progress, categories, challenges, personalLb, factionLb] = await Promise.allSettled([
                ApiService.getUserProgress(AppState.user.id),
                ApiService.fetchLearningMap(),
                ApiService.fetchActiveChallenges(),
                ApiService.fetchLeaderboard(),
                ApiService.fetchFactionLeaderboard()
            ]);
            
            // 处理核心数据
            if (progress.status === 'fulfilled') {
                AppState.userProgress.completedBlocks = new Set(progress.value.completed);
                AppState.userProgress.awardedPointsBlocks = new Set(progress.value.awarded);
            }
            
            if (categories.status === 'fulfilled') {
                AppState.learningMap.categories = categories.value;
                this.flattenLearningStructure();
            }
            
            // 处理次要数据
            AppState.activeChallenges = challenges.status === 'fulfilled' ? challenges.value : [];
            AppState.leaderboard = personalLb.status === 'fulfilled' ? personalLb.value : [];
            AppState.factionLeaderboard = factionLb.status === 'fulfilled' ? factionLb.value : [];
            
            this.updateHeaders();
            
            // 立即显示界面
            this.renderGameLobby(true);
            UI.hideLoadingState();
            
            // 完成数据加载监控
            if (this.performanceMonitor) {
                this.performanceMonitor.endDataLoad();
            }
            
        } catch (error) {
            console.error("Failed to load main app data:", error);
            UI.hideLoadingState();
            UI.showNotification(`加载核心数据失败: ${error.message}`, 'error');
        }
    },

    // loadSecondaryData 函数已合并到 loadMainAppData 中，实现更好的并行化

    updateHeaders() {
        const profile = AppState.profile;
        const user = AppState.user;
        if (!profile || !user) return;
        const displayName = profile.username || user.email.split('@')[0];
        const isAdmin = profile.role === 'admin';
        UI.elements.mainApp.userGreeting.textContent = `欢迎, ${displayName}`;
        UI.elements.mainApp.adminViewBtn.classList.toggle('hidden', !isAdmin);
        UI.elements.lobby.playerName.textContent = displayName;
        UI.elements.lobby.adminNavBtn.style.display = isAdmin ? 'flex' : 'none';
    },
    
    renderGameLobby(isLoggedIn) {
        const { lobby } = UI.elements;
        if (isLoggedIn) {
            const profile = AppState.profile;
            const factionInfo = getFactionInfo(profile.faction);
            const avatarChar = (profile.username || '玩家').charAt(0).toUpperCase();
            const points = profile.points || 0;
            const level = Math.floor(points / 100) + 1;
            lobby.avatar.textContent = avatarChar;
            lobby.avatar.style.borderColor = factionInfo.color;
            lobby.playerName.textContent = profile.username || '天命人';
            lobby.playerLevel.textContent = level;
            lobby.logoutBtn.classList.remove('hidden');
            lobby.adminNavBtn.style.display = profile.role === 'admin' ? 'flex' : 'none';
            // [REMOVED] Logic for the old plot task button
            this.renderLeaderboards();
        } else {
            lobby.avatar.textContent = '?';
            lobby.avatar.style.borderColor = '#475569';
            lobby.playerName.textContent = '未登录';
            lobby.playerLevel.textContent = '??';
            lobby.logoutBtn.classList.add('hidden');
            lobby.adminNavBtn.style.display = 'none';
            UI.renderEmpty(lobby.personalBoard, '登录后查看排名');
            UI.renderEmpty(lobby.factionBoard, '登录后查看排名');
        }
    },

    renderLeaderboards() {
        const { personalBoard, factionBoard } = UI.elements.lobby;
        if (!AppState.leaderboard || AppState.leaderboard.length === 0) {
            UI.renderEmpty(personalBoard, '暂无个人排名');
        } else {
            personalBoard.innerHTML = AppState.leaderboard.map((p, i) => {
                const rank = i + 1;
                const isCurrentUser = AppState.user && p.user_id === AppState.user.id;
                const icon = ['🥇', '🥈', '🥉'][rank - 1] || `<span class="rank-number">${rank}</span>`;
                const displayName = p.full_name || p.username.split('@')[0];
                return `<div class="personal-leaderboard-item ${isCurrentUser ? 'current-user' : ''}"><div class="rank-icon">${icon}</div><div class="player-name">${displayName}</div><div class="player-score">${p.points}</div></div>`;
            }).join('');
        }
        if (!AppState.factionLeaderboard || AppState.factionLeaderboard.length === 0) {
            UI.renderEmpty(factionBoard, '暂无部门排名');
        } else {
            factionBoard.innerHTML = AppState.factionLeaderboard.map(f => {
                const fInfo = getFactionInfo(f.faction);
                return `<div class="faction-leaderboard-item faction-${fInfo.color}"><div class="flex justify-between items-start"><div><h3 class="faction-name faction-name-${fInfo.color}">${fInfo.name}</h3><div class="faction-stats"><span>👥 ${f.total_members}</span><span>⭐ ${f.total_points}</span></div></div><div class="faction-score"><div class="avg-score">${parseFloat(f.average_score).toFixed(0)}</div><div class="avg-label">均分</div></div></div></div>`;
            }).join('');
        }
    },
    
    handleStartJourney() {
        if (!AppState.user) {
            UI.showAuthForm();
            return;
        }
        UI.switchTopLevelView('main-app');
        CourseView.showCategoryView();
    },

    showLobbyModal(modalType) {
        const backdrop = document.getElementById('lobby-modal-backdrop');
        document.querySelectorAll('.lobby-modal-content').forEach(m => m.classList.add('hidden'));
        const modal = document.getElementById(`${modalType}-modal`);
        const content = document.getElementById(`${modalType}-content`);
        if (modalType === 'all-quests') {
            content.innerHTML = '';
            const categories = AppState.learningMap.categories;
            if (!categories || categories.length === 0) {
                UI.renderEmpty(content, '暂无任务篇章');
            } else {
                categories.forEach(c => content.appendChild(ComponentFactory.createCategoryCard(c, !CourseView.isCategoryUnlocked(c.id))));
            }
        } else if (modalType === 'faction-challenges') {
            this.renderFactionChallenges(content);
        }
        backdrop.classList.remove('hidden');
        backdrop.classList.add('active');
        modal.classList.remove('hidden');
    },

    hideLobbyModal() {
        const backdrop = document.getElementById('lobby-modal-backdrop');
        backdrop.classList.add('hidden');
        backdrop.classList.remove('active');
    },

    async renderFactionChallenges(container) {
        if (!AppState.activeChallenges || AppState.activeChallenges.length === 0) {
            UI.renderEmpty(container, '当前没有阵营挑战');
            return;
        }
        container.innerHTML = '';
        for (const challenge of AppState.activeChallenges) {
            const card = document.createElement('div');
            card.className = 'challenge-card mb-4';
            const progress = await ApiService.fetchFactionChallengeProgress(challenge.id, AppState.profile.faction);
            const progressPercentage = parseFloat(progress).toFixed(1);
            card.innerHTML = `<h3 class="challenge-title">${challenge.title}</h3><p class="challenge-description">目标: 完成 <strong class="text-purple-300">${challenge.target_category_title || '指定'}</strong> 篇章</p><div class="mt-2"><div class="challenge-progress-bar-bg"><div class="challenge-progress-bar" style="width: ${progressPercentage}%;"></div></div><div class="challenge-meta"><span class="challenge-reward"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg><span>${challenge.reward_points} 团队积分</span></span><span class="challenge-deadline">截止: ${new Date(challenge.end_date).toLocaleDateString()}</span></div></div>`;
            container.appendChild(card);
        }
    },

    showFactionSelection() { UI.elements.factionModal.container.classList.remove('hidden'); UI.elements.factionModal.container.classList.add('flex'); },
    hideFactionSelection() { UI.elements.factionModal.container.classList.add('hidden'); UI.elements.factionModal.container.classList.remove('flex'); },

    async handleFactionSelection(faction) {
        try {
            const updatedProfile = await ApiService.updateProfileFaction(AppState.user.id, faction);
            AppState.profile.faction = updatedProfile.faction; 
            this.hideFactionSelection();
            const factionInfo = getFactionInfo(faction);
            UI.showNotification(`你已加入【${factionInfo.name}】！`, 'success');
            await this.loadMainAppData();
            UI.switchTopLevelView('game-lobby');
        } catch (error) {
            console.error("Error during faction selection:", error);
            UI.showNotification(error.message, 'error');
        }
    },

    flattenLearningStructure() { const flat = []; (AppState.learningMap.categories || []).forEach(cat => { (cat.chapters || []).forEach(chap => { (chap.sections || []).forEach(sec => { (sec.blocks || []).forEach(block => { flat.push({ ...block, sectionId: sec.id, chapterId: chap.id, categoryId: cat.id }); }); }); }); }); AppState.learningMap.flatStructure = flat; },
    toggleRestartModal(show) { const modal = UI.elements.restartModal.container; modal.classList.toggle('hidden', !show); modal.classList.toggle('flex', show); },
    async handleConfirmRestart() {
        this.toggleRestartModal(false);
        try {
            await ApiService.resetUserProgress();
            await this.loadMainAppData();
            UI.showNotification("您的学习进度已重置！", "success");
        } catch (error) { UI.showNotification(error.message, "error"); }
    },
};

window.App = App;

window.onload = () => {
    try { 
        // 检查必要的配置
        if (!window.APP_CONFIG || !window.APP_CONFIG.SUPABASE_URL || !window.APP_CONFIG.SUPABASE_KEY) {
            throw new Error('应用配置缺失，无法启动');
        }
        
        App.init(); 
        console.log('✅ 应用初始化成功');
    } catch (error) {
        console.error("❌ 应用初始化失败:", error);
        document.body.innerHTML = `
            <div style="color: red; text-align: center; padding: 50px; font-family: sans-serif; background: #1e1e1e; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
                <div style="background: #2d2d2d; padding: 40px; border-radius: 10px; border: 2px solid #ff4444;">
                    <h1 style="color: #ff4444; margin-bottom: 20px;">❌ 应用启动失败</h1>
                    <p style="color: #ccc; margin-bottom: 20px;">错误信息:</p>
                    <p style="color: #ff6666; margin-bottom: 30px; font-family: monospace; background: #1a1a1a; padding: 10px; border-radius: 5px;">${error.message}</p>
                    <button onclick="location.reload()" style="background: #007acc; color: white; border: none; padding: 12px 24px; border-radius: 5px; cursor: pointer; font-size: 16px;">
                        🔄 重新加载
                    </button>
                </div>
            </div>
        `;
    }
};
