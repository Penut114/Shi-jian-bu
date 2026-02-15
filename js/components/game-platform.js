class GamePlatform {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.currentUser = null;
        this.currentRoom = null;
        this.token = localStorage.getItem('token');
        
        this.listeners = new Map();
    }
    
    async init() {
        if (this.token) {
            await this.validateToken();
        }
    }
    
    async validateToken() {
        try {
            const response = await fetch('/api/validate-token', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.currentUser = data.user;
                this.connect();
            } else {
                this.logout();
            }
        } catch (error) {
            console.error('验证token失败:', error);
            this.logout();
        }
    }
    
    connect() {
        if (this.socket) return;
        
        this.socket = io({
            auth: {
                token: this.token
            }
        });
        
        this.socket.on('connect', () => {
            console.log('已连接到服务器');
            this.isConnected = true;
            this.emit('connected');
        });
        
        this.socket.on('disconnect', () => {
            console.log('与服务器断开连接');
            this.isConnected = false;
            this.emit('disconnected');
        });
        
        this.socket.on('init', (data) => {
            this.currentUser = data.user;
            this.emit('init', data);
        });
        
        this.socket.on('roomCreated', (data) => {
            this.currentRoom = data.room;
            this.emit('roomCreated', data);
        });
        
        this.socket.on('playerJoined', (data) => {
            if (this.currentRoom) {
                this.currentRoom = data.room;
            }
            this.emit('playerJoined', data);
        });
        
        this.socket.on('playerLeft', (data) => {
            if (this.currentRoom) {
                this.currentRoom = data.room;
            }
            this.emit('playerLeft', data);
        });
        
        this.socket.on('playerReady', (data) => {
            if (this.currentRoom) {
                this.currentRoom = data.room;
            }
            this.emit('playerReady', data);
        });
        
        this.socket.on('gameStart', (data) => {
            this.emit('gameStart', data);
        });
        
        this.socket.on('matchFound', (data) => {
            this.currentRoom = data.room;
            this.emit('matchFound', data);
        });
        
        this.socket.on('matchmaking', (data) => {
            this.emit('matchmaking', data);
        });
        
        this.socket.on('matchCancelled', () => {
            this.emit('matchCancelled');
        });
        
        this.socket.on('chat', (data) => {
            this.emit('chat', data);
        });
        
        this.socket.on('error', (data) => {
            this.emit('error', data);
            this.showNotification(data.message, 'error');
        });
        
        this.socket.on('userOnline', (data) => {
            this.emit('userOnline', data);
        });
        
        this.socket.on('userOffline', (data) => {
            this.emit('userOffline', data);
        });
        
        this.socket.on('roomListUpdate', (data) => {
            this.emit('roomListUpdate', data);
        });
        
        this.socket.on('friendAdded', (data) => {
            this.emit('friendAdded', data);
        });
    }
    
    async register(username, password, nickname) {
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password, nickname })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.token = data.token;
                this.currentUser = data.user;
                localStorage.setItem('token', this.token);
                this.connect();
                return { success: true };
            }
            
            return { success: false, error: data.error };
        } catch (error) {
            console.error('注册失败:', error);
            return { success: false, error: '网络错误' };
        }
    }
    
    async login(username, password) {
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.token = data.token;
                this.currentUser = data.user;
                localStorage.setItem('token', this.token);
                this.connect();
                return { success: true };
            }
            
            return { success: false, error: data.error };
        } catch (error) {
            console.error('登录失败:', error);
            return { success: false, error: '网络错误' };
        }
    }
    
    logout() {
        this.token = null;
        this.currentUser = null;
        this.currentRoom = null;
        localStorage.removeItem('token');
        
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        
        this.emit('logout');
    }
    
    createRoom(options = {}) {
        if (!this.isConnected) {
            this.showNotification('未连接到服务器', 'error');
            return;
        }
        
        this.socket.emit('createRoom', {
            name: options.name,
            maxPlayers: options.maxPlayers || 6,
            isPublic: options.isPublic !== false
        });
    }
    
    joinRoom(roomId) {
        if (!this.isConnected) {
            this.showNotification('未连接到服务器', 'error');
            return;
        }
        
        this.socket.emit('joinRoom', { roomId });
    }
    
    leaveRoom() {
        if (!this.isConnected) return;
        
        this.socket.emit('leaveRoom');
        this.currentRoom = null;
    }
    
    toggleReady() {
        if (!this.isConnected) return;
        
        this.socket.emit('toggleReady');
    }
    
    startGame() {
        if (!this.isConnected) return;
        
        this.socket.emit('startGame');
    }
    
    quickMatch() {
        if (!this.isConnected) {
            this.showNotification('未连接到服务器', 'error');
            return;
        }
        
        this.socket.emit('quickMatch');
    }
    
    cancelMatch() {
        if (!this.isConnected) return;
        
        this.socket.emit('cancelMatch');
    }
    
    sendChat(message) {
        if (!this.isConnected) return;
        
        this.socket.emit('chat', { message });
    }
    
    addFriend(username) {
        if (!this.isConnected) return;
        
        this.socket.emit('addFriend', { username });
    }
    
    async getLeaderboard() {
        try {
            const response = await fetch('/api/leaderboard');
            const data = await response.json();
            return data.leaderboard;
        } catch (error) {
            console.error('获取排行榜失败:', error);
            return [];
        }
    }
    
    async getRooms() {
        try {
            const response = await fetch('/api/rooms');
            const data = await response.json();
            return data.rooms;
        } catch (error) {
            console.error('获取房间列表失败:', error);
            return [];
        }
    }
    
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    
    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index !== -1) {
                callbacks.splice(index, 1);
            }
        }
    }
    
    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => callback(data));
        }
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

const gamePlatform = new GamePlatform();
