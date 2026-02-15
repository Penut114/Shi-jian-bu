class AchievementManager {
    constructor() {
        this.achievements = [
            {
                id: 'first_win',
                title: '初次胜利',
                description: '赢得第一场比赛',
                icon: '🏆',
                rarity: 'common',
                reward: 100,
                condition: (stats) => stats.wins >= 1,
                progress: (stats) => ({ current: Math.min(stats.wins, 1), max: 1 })
            },
            {
                id: 'win_streak_3',
                title: '三连胜',
                description: '连续赢得3场比赛',
                icon: '🔥',
                rarity: 'rare',
                reward: 200,
                condition: (stats) => stats.highestWinStreak >= 3,
                progress: (stats) => ({ current: Math.min(stats.currentWinStreak, 3), max: 3 })
            },
            {
                id: 'win_streak_5',
                title: '五连胜',
                description: '连续赢得5场比赛',
                icon: '🌟',
                rarity: 'epic',
                reward: 500,
                condition: (stats) => stats.highestWinStreak >= 5,
                progress: (stats) => ({ current: Math.min(stats.currentWinStreak, 5), max: 5 })
            },
            {
                id: 'games_10',
                title: '新手入门',
                description: '完成10场比赛',
                icon: '🎮',
                rarity: 'common',
                reward: 150,
                condition: (stats) => stats.gamesPlayed >= 10,
                progress: (stats) => ({ current: Math.min(stats.gamesPlayed, 10), max: 10 })
            },
            {
                id: 'games_50',
                title: '游戏达人',
                description: '完成50场比赛',
                icon: '🎯',
                rarity: 'rare',
                reward: 300,
                condition: (stats) => stats.gamesPlayed >= 50,
                progress: (stats) => ({ current: Math.min(stats.gamesPlayed, 50), max: 50 })
            },
            {
                id: 'games_100',
                title: '游戏大师',
                description: '完成100场比赛',
                icon: '👑',
                rarity: 'epic',
                reward: 800,
                condition: (stats) => stats.gamesPlayed >= 100,
                progress: (stats) => ({ current: Math.min(stats.gamesPlayed, 100), max: 100 })
            },
            {
                id: 'wins_25',
                title: '常胜将军',
                description: '赢得25场比赛',
                icon: '⚔️',
                rarity: 'rare',
                reward: 400,
                condition: (stats) => stats.wins >= 25,
                progress: (stats) => ({ current: Math.min(stats.wins, 25), max: 25 })
            },
            {
                id: 'wins_50',
                title: '战无不胜',
                description: '赢得50场比赛',
                icon: '🏅',
                rarity: 'epic',
                reward: 1000,
                condition: (stats) => stats.wins >= 50,
                progress: (stats) => ({ current: Math.min(stats.wins, 50), max: 50 })
            },
            {
                id: 'win_rate_60',
                title: '技术流',
                description: '胜率达到60%以上',
                icon: '📊',
                rarity: 'rare',
                reward: 350,
                condition: (stats) => stats.gamesPlayed >= 10 && (stats.wins / stats.gamesPlayed) >= 0.6,
                progress: (stats) => {
                    const rate = stats.gamesPlayed > 0 ? Math.round((stats.wins / stats.gamesPlayed) * 100) : 0;
                    return { current: Math.min(rate, 60), max: 60 };
                }
            },
            {
                id: 'collector',
                title: '收藏爱好者',
                description: '解锁5个成就',
                icon: '🎁',
                rarity: 'epic',
                reward: 600,
                condition: (stats, unlocked) => unlocked.length >= 5,
                progress: (stats, unlocked) => ({ current: Math.min(unlocked.length, 5), max: 5 })
            },
            {
                id: 'gold_rank',
                title: '黄金选手',
                description: '达到黄金段位',
                icon: '🥇',
                rarity: 'rare',
                reward: 500,
                condition: (stats) => stats.highestPoints >= 300,
                progress: (stats) => ({ current: Math.min(stats.highestPoints, 300), max: 300 })
            },
            {
                id: 'diamond_rank',
                title: '钻石大神',
                description: '达到钻石段位',
                icon: '💠',
                rarity: 'legendary',
                reward: 2000,
                condition: (stats) => stats.highestPoints >= 1000,
                progress: (stats) => ({ current: Math.min(stats.highestPoints, 1000), max: 1000 })
            },
            {
                id: 'king_rank',
                title: '最强王者',
                description: '达到王者段位',
                icon: '👑',
                rarity: 'legendary',
                reward: 5000,
                condition: (stats) => stats.highestPoints >= 2000,
                progress: (stats) => ({ current: Math.min(stats.highestPoints, 2000), max: 2000 })
            }
        ];

        this.unlockedAchievements = [];
        this.playerStats = null;
        this.totalPoints = 0;
        this.init();
    }

    init() {
        this.loadData();
        this.bindEvents();
        this.updateUI();
    }

    loadData() {
        const savedAchievements = localStorage.getItem('unlockedAchievements');
        const savedPoints = localStorage.getItem('achievementPoints');
        
        if (savedAchievements) {
            this.unlockedAchievements = JSON.parse(savedAchievements);
        }
        if (savedPoints) {
            this.totalPoints = parseInt(savedPoints);
        }

        this.loadPlayerStats();
    }

    saveData() {
        localStorage.setItem('unlockedAchievements', JSON.stringify(this.unlockedAchievements));
        localStorage.setItem('achievementPoints', this.totalPoints.toString());
    }

    loadPlayerStats() {
        const rankedData = localStorage.getItem('rankedData');
        if (rankedData) {
            const data = JSON.parse(rankedData);
            this.playerStats = {
                gamesPlayed: data.wins + data.losses,
                wins: data.wins,
                losses: data.losses,
                highestPoints: data.highestPoints,
                currentWinStreak: data.currentWinStreak,
                highestWinStreak: data.highestWinStreak
            };
        } else {
            this.playerStats = {
                gamesPlayed: 0,
                wins: 0,
                losses: 0,
                highestPoints: 0,
                currentWinStreak: 0,
                highestWinStreak: 0
            };
        }
    }

    bindEvents() {
        document.addEventListener('DOMContentLoaded', () => {
            const filterBtns = document.querySelectorAll('.filter-btn');
            filterBtns.forEach(btn => {
                btn.addEventListener('click', () => this.filterAchievements(btn.dataset.filter));
            });
        });
    }

    checkAchievements() {
        this.loadPlayerStats();
        const newlyUnlocked = [];

        this.achievements.forEach(achievement => {
            if (!this.unlockedAchievements.includes(achievement.id)) {
                if (achievement.condition(this.playerStats, this.unlockedAchievements)) {
                    this.unlockAchievement(achievement);
                    newlyUnlocked.push(achievement);
                }
            }
        });

        return newlyUnlocked;
    }

    unlockAchievement(achievement) {
        this.unlockedAchievements.push(achievement.id);
        this.totalPoints += achievement.reward;
        this.saveData();
        this.showUnlockNotification(achievement);
    }

    showUnlockNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="notification-icon">${achievement.icon}</div>
            <div class="notification-content">
                <h4>🏆 成就解锁！</h4>
                <p>${achievement.title}</p>
            </div>
        `;
        document.body.appendChild(notification);

        setTimeout(() => notification.remove(), 5000);
    }

    filterAchievements(filter) {
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-filter="${filter}"]`)?.classList.add('active');

        this.updateUI(filter);
    }

    updateUI(filter = 'all') {
        this.loadPlayerStats();
        this.checkAchievements();

        const totalCount = this.achievements.length;
        const unlockedCount = this.unlockedAchievements.length;

        const totalStat = document.getElementById('achievement-total');
        const unlockedStat = document.getElementById('achievement-unlocked');
        const pointsStat = document.getElementById('achievement-points');

        if (totalStat) totalStat.textContent = totalCount;
        if (unlockedStat) unlockedStat.textContent = unlockedCount;
        if (pointsStat) pointsStat.textContent = this.totalPoints;

        const grid = document.querySelector('.achievements-grid');
        if (!grid) return;

        grid.innerHTML = '';

        let filteredAchievements = this.achievements;
        if (filter === 'unlocked') {
            filteredAchievements = this.achievements.filter(a => this.unlockedAchievements.includes(a.id));
        } else if (filter === 'locked') {
            filteredAchievements = this.achievements.filter(a => !this.unlockedAchievements.includes(a.id));
        } else if (filter !== 'all') {
            filteredAchievements = this.achievements.filter(a => a.rarity === filter);
        }

        filteredAchievements.forEach(achievement => {
            const isUnlocked = this.unlockedAchievements.includes(achievement.id);
            const progress = achievement.progress(this.playerStats, this.unlockedAchievements);
            const progressPercent = Math.round((progress.current / progress.max) * 100);

            const card = document.createElement('div');
            card.className = `achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`;
            card.innerHTML = `
                <div class="achievement-header">
                    <div class="achievement-icon">
                        ${achievement.icon}
                        <span class="achievement-rarity ${achievement.rarity}"></span>
                    </div>
                    <div class="achievement-info">
                        <div class="achievement-title">${achievement.title}</div>
                        <div class="achievement-description">${achievement.description}</div>
                    </div>
                </div>
                ${!isUnlocked ? `
                    <div class="achievement-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progressPercent}%"></div>
                        </div>
                        <div class="progress-text">
                            <span>${progress.current}/${progress.max}</span>
                        </div>
                    </div>
                ` : ''}
                <div class="achievement-reward">
                    <span class="reward-icon">💰</span>
                    <span class="reward-text">+${achievement.reward} 积分</span>
                </div>
                ${isUnlocked ? `
                    <div class="achievement-unlock-date">
                        <i class="fas fa-check-circle"></i>
                        已解锁
                    </div>
                ` : ''}
            `;
            grid.appendChild(card);
        });
    }

    reset() {
        this.unlockedAchievements = [];
        this.totalPoints = 0;
        this.saveData();
        this.updateUI();
    }

    getUnlockedCount() {
        return this.unlockedAchievements.length;
    }

    getTotalCount() {
        return this.achievements.length;
    }

    getProgress() {
        return {
            unlocked: this.unlockedAchievements.length,
            total: this.achievements.length,
            percentage: Math.round((this.unlockedAchievements.length / this.achievements.length) * 100)
        };
    }
}

const achievementManager = new AchievementManager();

document.addEventListener('DOMContentLoaded', () => {
    achievementManager.updateUI();
});