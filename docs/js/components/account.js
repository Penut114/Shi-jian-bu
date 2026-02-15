class AccountManager {
    constructor() {
        this.currentUser = null;
        this.isLoggedIn = false;
        this.init();
    }

    init() {
        this.loadSavedUser();
        this.bindEvents();
        this.updateUI();
    }

    loadSavedUser() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.isLoggedIn = true;
        }
    }

    saveUser() {
        if (this.currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        }
    }

    bindEvents() {
        document.addEventListener('DOMContentLoaded', () => {
            const loginTab = document.getElementById('login-tab');
            const registerTab = document.getElementById('register-tab');
            const loginForm = document.getElementById('login-form');
            const registerForm = document.getElementById('register-form');
            const logoutBtn = document.getElementById('logout-btn');

            if (loginTab) {
                loginTab.addEventListener('click', () => this.switchTab('login'));
            }
            if (registerTab) {
                registerTab.addEventListener('click', () => this.switchTab('register'));
            }
            if (loginForm) {
                loginForm.addEventListener('submit', (e) => this.handleLogin(e));
            }
            if (registerForm) {
                registerForm.addEventListener('submit', (e) => this.handleRegister(e));
            }
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => this.handleLogout());
            }
        });
    }

    switchTab(tab) {
        const loginTab = document.getElementById('login-tab');
        const registerTab = document.getElementById('register-tab');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');

        if (tab === 'login') {
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
            loginForm.classList.add('active');
            registerForm.classList.remove('active');
        } else {
            registerTab.classList.add('active');
            loginTab.classList.remove('active');
            registerForm.classList.add('active');
            loginForm.classList.remove('active');
        }
    }

    handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            this.currentUser = user;
            this.isLoggedIn = true;
            this.saveUser();
            this.showNotification('登录成功！', 'success');
            this.updateUI();
        } else {
            this.showNotification('用户名或密码错误', 'error');
        }
    }

    handleRegister(e) {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;

        if (password !== confirmPassword) {
            this.showNotification('两次输入的密码不一致', 'error');
            return;
        }

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.find(u => u.username === username)) {
            this.showNotification('用户名已存在', 'error');
            return;
        }

        const newUser = {
            id: Date.now(),
            username,
            email,
            password,
            createdAt: new Date().toISOString(),
            stats: {
                gamesPlayed: 0,
                wins: 0,
                losses: 0,
                totalScore: 0
            }
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        this.currentUser = newUser;
        this.isLoggedIn = true;
        this.saveUser();
        this.showNotification('注册成功！', 'success');
        this.updateUI();
    }

    handleLogout() {
        this.currentUser = null;
        this.isLoggedIn = false;
        localStorage.removeItem('currentUser');
        this.showNotification('已退出登录', 'info');
        this.updateUI();
    }

    updateUI() {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const userProfile = document.getElementById('user-profile');

        if (this.isLoggedIn && this.currentUser) {
            if (loginForm) loginForm.classList.remove('active');
            if (registerForm) registerForm.classList.remove('active');
            if (userProfile) {
                userProfile.classList.remove('hidden');
                this.updateProfileDisplay();
            }
        } else {
            if (userProfile) userProfile.classList.add('hidden');
            if (loginForm) loginForm.classList.add('active');
        }
    }

    updateProfileDisplay() {
        const profileName = document.getElementById('profile-name');
        const profileEmail = document.getElementById('profile-email');
        const gamesPlayed = document.getElementById('games-played');
        const wins = document.getElementById('wins');
        const winRate = document.getElementById('win-rate');

        if (profileName) profileName.textContent = this.currentUser.username;
        if (profileEmail) profileEmail.textContent = this.currentUser.email;
        
        const stats = this.currentUser.stats;
        if (gamesPlayed) gamesPlayed.textContent = stats.gamesPlayed;
        if (wins) wins.textContent = stats.wins;
        
        const rate = stats.gamesPlayed > 0 ? Math.round((stats.wins / stats.gamesPlayed) * 100) : 0;
        if (winRate) winRate.textContent = rate + '%';
    }

    updateGameStats(won, score) {
        if (!this.currentUser) return;

        this.currentUser.stats.gamesPlayed++;
        if (won) this.currentUser.stats.wins++;
        else this.currentUser.stats.losses++;
        this.currentUser.stats.totalScore += score;

        this.saveUser();

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = this.currentUser;
            localStorage.setItem('users', JSON.stringify(users));
        }
    }

    showNotification(message, type = 'info') {
        const colors = {
            success: '#2ecc71',
            error: '#e74c3c',
            info: '#3498db'
        };

        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type]};
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.3);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;

        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

const accountManager = new AccountManager();