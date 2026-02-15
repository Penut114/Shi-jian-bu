class AuthUI {
    constructor() {
        this.init();
    }
    
    init() {
        this.createAuthModal();
        this.bindEvents();
        
        gamePlatform.on('init', (data) => {
            this.hideAuthModal();
            this.updateUserDisplay(data.user);
        });
        
        gamePlatform.on('logout', () => {
            this.showAuthModal();
        });
    }
    
    createAuthModal() {
        const modal = document.createElement('div');
        modal.id = 'auth-modal';
        modal.innerHTML = `
            <div class="auth-container">
                <div class="auth-tabs">
                    <button class="auth-tab active" data-tab="login">登录</button>
                    <button class="auth-tab" data-tab="register">注册</button>
                </div>
                
                <div class="auth-form" id="login-form">
                    <div class="form-group">
                        <label>用户名</label>
                        <input type="text" id="login-username" placeholder="请输入用户名">
                    </div>
                    <div class="form-group">
                        <label>密码</label>
                        <input type="password" id="login-password" placeholder="请输入密码">
                    </div>
                    <button class="auth-btn" id="login-btn">登录</button>
                </div>
                
                <div class="auth-form hidden" id="register-form">
                    <div class="form-group">
                        <label>用户名</label>
                        <input type="text" id="register-username" placeholder="请输入用户名">
                    </div>
                    <div class="form-group">
                        <label>昵称</label>
                        <input type="text" id="register-nickname" placeholder="请输入昵称（可选）">
                    </div>
                    <div class="form-group">
                        <label>密码</label>
                        <input type="password" id="register-password" placeholder="请输入密码">
                    </div>
                    <div class="form-group">
                        <label>确认密码</label>
                        <input type="password" id="register-confirm" placeholder="请再次输入密码">
                    </div>
                    <button class="auth-btn" id="register-btn">注册</button>
                </div>
                
                <div class="auth-divider">
                    <span>或者</span>
                </div>
                
                <button class="guest-btn" id="guest-btn">以游客身份继续</button>
            </div>
        `;
        
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        document.body.appendChild(modal);
        
        const style = document.createElement('style');
        style.textContent = `
            .auth-container {
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                padding: 40px;
                border-radius: 16px;
                width: 400px;
                max-width: 90%;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
            }
            
            .auth-tabs {
                display: flex;
                margin-bottom: 30px;
                border-bottom: 2px solid #2d3748;
            }
            
            .auth-tab {
                flex: 1;
                padding: 12px;
                background: none;
                border: none;
                color: #a0aec0;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .auth-tab.active {
                color: #4299e1;
                border-bottom: 2px solid #4299e1;
                margin-bottom: -2px;
            }
            
            .auth-form {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            
            .auth-form.hidden {
                display: none;
            }
            
            .form-group {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .form-group label {
                color: #a0aec0;
                font-size: 14px;
            }
            
            .form-group input {
                padding: 12px 16px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid #2d3748;
                border-radius: 8px;
                color: white;
                font-size: 16px;
                transition: all 0.3s;
            }
            
            .form-group input:focus {
                outline: none;
                border-color: #4299e1;
                background: rgba(255, 255, 255, 0.15);
            }
            
            .auth-btn {
                padding: 14px;
                background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
                border: none;
                border-radius: 8px;
                color: white;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .auth-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(66, 153, 225, 0.4);
            }
            
            .auth-divider {
                display: flex;
                align-items: center;
                margin: 24px 0;
            }
            
            .auth-divider::before,
            .auth-divider::after {
                content: '';
                flex: 1;
                height: 1px;
                background: #2d3748;
            }
            
            .auth-divider span {
                padding: 0 16px;
                color: #a0aec0;
                font-size: 14px;
            }
            
            .guest-btn {
                width: 100%;
                padding: 14px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid #2d3748;
                border-radius: 8px;
                color: #a0aec0;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .guest-btn:hover {
                background: rgba(255, 255, 255, 0.15);
                color: white;
            }
        `;
        document.head.appendChild(style);
    }
    
    bindEvents() {
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const tabName = tab.dataset.tab;
                document.getElementById('login-form').classList.toggle('hidden', tabName !== 'login');
                document.getElementById('register-form').classList.toggle('hidden', tabName !== 'register');
            });
        });
        
        document.getElementById('login-btn').addEventListener('click', async () => {
            const username = document.getElementById('login-username').value.trim();
            const password = document.getElementById('login-password').value;
            
            if (!username || !password) {
                gamePlatform.showNotification('请填写用户名和密码', 'error');
                return;
            }
            
            const result = await gamePlatform.login(username, password);
            if (!result.success) {
                gamePlatform.showNotification(result.error, 'error');
            }
        });
        
        document.getElementById('register-btn').addEventListener('click', async () => {
            const username = document.getElementById('register-username').value.trim();
            const nickname = document.getElementById('register-nickname').value.trim();
            const password = document.getElementById('register-password').value;
            const confirm = document.getElementById('register-confirm').value;
            
            if (!username || !password) {
                gamePlatform.showNotification('请填写用户名和密码', 'error');
                return;
            }
            
            if (password !== confirm) {
                gamePlatform.showNotification('两次输入的密码不一致', 'error');
                return;
            }
            
            if (password.length < 6) {
                gamePlatform.showNotification('密码至少需要6个字符', 'error');
                return;
            }
            
            const result = await gamePlatform.register(username, password, nickname);
            if (!result.success) {
                gamePlatform.showNotification(result.error, 'error');
            }
        });
        
        document.getElementById('guest-btn').addEventListener('click', () => {
            this.hideAuthModal();
        });
        
        document.querySelectorAll('.auth-form input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const form = input.closest('.auth-form');
                    const btn = form.querySelector('.auth-btn');
                    btn.click();
                }
            });
        });
    }
    
    showAuthModal() {
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }
    
    hideAuthModal() {
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    updateUserDisplay(user) {
        console.log('当前用户:', user);
    }
}

const authUI = new AuthUI();
