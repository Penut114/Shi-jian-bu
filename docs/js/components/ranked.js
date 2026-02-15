class RankedManager {
    constructor() {
        this.ranks = [
            { name: '青铜', minPoints: 0, icon: '🥉', color: '#cd7f32' },
            { name: '白银', minPoints: 100, icon: '🥈', color: '#c0c0c0' },
            { name: '黄金', minPoints: 300, icon: '🥇', color: '#ffd700' },
            { name: '铂金', minPoints: 600, icon: '💎', color: '#e5e4e2' },
            { name: '钻石', minPoints: 1000, icon: '💠', color: '#b9f2ff' },
            { name: '大师', minPoints: 1500, icon: '⭐', color: '#9400d3' },
            { name: '王者', minPoints: 2000, icon: '👑', color: '#ff6b6b' }
        ];
        
        this.currentSeason = {
            name: 'S1 赛季',
            startDate: '2024-01-01',
            endDate: '2024-03-31'
        };

        this.playerData = null;
        this.matchHistory = [];
        this.init();
    }

    init() {
        this.loadPlayerData();
        this.loadMatchHistory();
        this.bindEvents();
        this.updateUI();
    }

    loadPlayerData() {
        const saved = localStorage.getItem('rankedData');
        if (saved) {
            this.playerData = JSON.parse(saved);
        } else {
            this.playerData = {
                currentPoints: 0,
                highestPoints: 0,
                wins: 0,
                losses: 0,
                currentWinStreak: 0,
                highestWinStreak: 0,
                rankUpdateHistory: []
            };
        }
    }

    savePlayerData() {
        localStorage.setItem('rankedData', JSON.stringify(this.playerData));
    }

    loadMatchHistory() {
        const saved = localStorage.getItem('matchHistory');
        if (saved) {
            this.matchHistory = JSON.parse(saved);
        }
    }

    saveMatchHistory() {
        localStorage.setItem('matchHistory', JSON.stringify(this.matchHistory));
    }

    bindEvents() {
        document.addEventListener('DOMContentLoaded', () => {
            const startMatchBtn = document.getElementById('start-ranked-match');
            const viewHistoryBtn = document.getElementById('view-ranked-history');
            
            if (startMatchBtn) {
                startMatchBtn.addEventListener('click', () => this.startRankedMatch());
            }
            if (viewHistoryBtn) {
                viewHistoryBtn.addEventListener('click', () => this.showMatchHistory());
            }
        });
    }

    getCurrentRank() {
        for (let i = this.ranks.length - 1; i >= 0; i--) {
            if (this.playerData.currentPoints >= this.ranks[i].minPoints) {
                return this.ranks[i];
            }
        }
        return this.ranks[0];
    }

    getNextRank() {
        const currentRank = this.getCurrentRank();
        const currentIndex = this.ranks.findIndex(r => r.name === currentRank.name);
        if (currentIndex < this.ranks.length - 1) {
            return this.ranks[currentIndex + 1];
        }
        return null;
    }

    getProgressToNextRank() {
        const currentRank = this.getCurrentRank();
        const nextRank = this.getNextRank();
        
        if (!nextRank) {
            return { current: this.playerData.currentPoints, max: this.playerData.currentPoints, percentage: 100 };
        }

        const progress = this.playerData.currentPoints - currentRank.minPoints;
        const total = nextRank.minPoints - currentRank.minPoints;
        const percentage = Math.min(100, Math.round((progress / total) * 100));

        return {
            current: progress,
            max: total,
            percentage
        };
    }

    addMatchResult(won, pointsChange, opponentName = '对手') {
        const oldRank = this.getCurrentRank();
        
        this.playerData.currentPoints = Math.max(0, this.playerData.currentPoints + pointsChange);
        this.playerData.highestPoints = Math.max(this.playerData.highestPoints, this.playerData.currentPoints);

        if (won) {
            this.playerData.wins++;
            this.playerData.currentWinStreak++;
            this.playerData.highestWinStreak = Math.max(this.playerData.highestWinStreak, this.playerData.currentWinStreak);
        } else {
            this.playerData.losses++;
            this.playerData.currentWinStreak = 0;
        }

        const newRank = this.getCurrentRank();
        const rankChanged = oldRank.name !== newRank.name;

        const match = {
            id: Date.now(),
            date: new Date().toISOString(),
            result: won ? 'win' : 'lose',
            pointsChange,
            opponentName,
            rankBefore: oldRank.name,
            rankAfter: newRank.name,
            rankChanged
        };

        this.matchHistory.unshift(match);
        if (this.matchHistory.length > 50) {
            this.matchHistory = this.matchHistory.slice(0, 50);
        }

        this.savePlayerData();
        this.saveMatchHistory();
        this.updateUI();

        if (rankChanged && won) {
            this.showRankUpNotification(newRank);
        }

        return match;
    }

    calculatePointsChange(won, opponentRank = null) {
        let baseChange = won ? 15 : -10;

        if (won && this.playerData.currentWinStreak >= 3) {
            baseChange += Math.min(this.playerData.currentWinStreak - 2, 5) * 2;
        }

        return baseChange;
    }

    startRankedMatch() {
        this.showNotification('正在匹配对手...', 'info');
        
        setTimeout(() => {
            const won = Math.random() > 0.5;
            const pointsChange = this.calculatePointsChange(won);
            this.addMatchResult(won, pointsChange, '随机对手');
            
            this.showNotification(
                won ? `胜利！+${pointsChange} 积分` : `失败 ${pointsChange} 积分`,
                won ? 'success' : 'error'
            );
        }, 2000);
    }

    updateUI() {
        const rank = this.getCurrentRank();
        const progress = this.getProgressToNextRank();
        const winRate = this.playerData.wins + this.playerData.losses > 0 
            ? Math.round((this.playerData.wins / (this.playerData.wins + this.playerData.losses)) * 100) 
            : 0;

        const rankBadge = document.querySelector('.rank-badge');
        if (rankBadge) {
            rankBadge.innerHTML = rank.icon;
            rankBadge.style.background = `linear-gradient(45deg, ${rank.color}, ${this.adjustColor(rank.color, -30)})`;
        }

        const rankName = document.querySelector('.rank-name');
        if (rankName) rankName.textContent = rank.name;

        const rankPoints = document.querySelector('.rank-points');
        if (rankPoints) rankPoints.textContent = `${this.playerData.currentPoints} 积分`;

        const progressFill = document.querySelector('.rank-progress .progress-fill');
        if (progressFill) progressFill.style.width = `${progress.percentage}%`;

        const progressText = document.querySelector('.progress-text');
        if (progressText) {
            const nextRank = this.getNextRank();
            if (nextRank) {
                progressText.textContent = `${progress.current}/${progress.max} 到 ${nextRank.name}`;
            } else {
                progressText.textContent = '已达到最高段位！';
            }
        }

        this.updateMatchHistoryUI();
    }

    updateMatchHistoryUI() {
        const historyList = document.querySelector('.match-history-list');
        if (!historyList) return;

        historyList.innerHTML = '';

        this.matchHistory.slice(0, 10).forEach(match => {
            const item = document.createElement('div');
            item.className = 'match-item';
            item.innerHTML = `
                <span class="match-result ${match.result}">${match.result === 'win' ? '胜利' : '失败'}</span>
                <div class="match-info">
                    <div>VS ${match.opponentName}</div>
                    <div style="font-size: 0.8rem; color: #7f8c8d;">${this.formatDate(match.date)}</div>
                </div>
                <span class="match-points ${match.pointsChange > 0 ? 'positive' : 'negative'}">
                    ${match.pointsChange > 0 ? '+' : ''}${match.pointsChange}
                </span>
            `;
            historyList.appendChild(item);
        });
    }

    showMatchHistory() {
        this.showNotification('显示完整战绩历史', 'info');
    }

    showRankUpNotification(newRank) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="notification-icon">${newRank.icon}</div>
            <div class="notification-content">
                <h4>🎉 段位提升！</h4>
                <p>恭喜达到 ${newRank.name} 段位！</p>
            </div>
        `;
        document.body.appendChild(notification);

        setTimeout(() => notification.remove(), 5000);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    adjustColor(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
        const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
        const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    showNotification(message, type = 'info') {
        if (typeof accountManager !== 'undefined' && accountManager.showNotification) {
            accountManager.showNotification(message, type);
        }
    }

    resetSeason() {
        this.playerData.currentPoints = Math.floor(this.playerData.currentPoints * 0.5);
        this.playerData.wins = 0;
        this.playerData.losses = 0;
        this.playerData.currentWinStreak = 0;
        this.savePlayerData();
        this.updateUI();
    }
}

const rankedManager = new RankedManager();