// ==================== 触摸事件支持 ====================
        // 注意：触摸事件处理已在文件下方的TouchEventHandler类中实现
        // 此部分代码已被移除，以避免重复声明错误
        
        // ==================== 多人联机系统 (WebRTC P2P) ====================
        class MultiplayerManager {
            constructor(gameManager) {
                this.gameManager = gameManager;
                this.peerConnections = new Map();
                this.dataChannels = new Map();
                this.localPeerId = this.generatePeerId();
                this.roomId = null;
                this.isHost = false;
                this.players = new Map();
                this.playerName = "玩家";
                this.connectionStatus = "disconnected";
                
                // 信令服务器配置
                this.signalingServer = "wss://echo.websocket.org"; // 示例服务器，实际使用时需要替换
                this.socket = null;
                
                // WebRTC配置
                this.rtcConfig = {
                    iceServers: [
                        { urls: "stun:stun.l.google.com:19302" },
                        { urls: "stun:stun1.l.google.com:19302" }
                    ]
                };
                
                // 初始化
                this.init();
            }
            
            // 生成唯一Peer ID
            generatePeerId() {
                return 'peer_' + Math.random().toString(36).substring(2, 15);
            }
            
            // 初始化
            init() {
                console.log("初始化多人联机系统，本地Peer ID:", this.localPeerId);
                
                // 设置玩家名称
                const savedName = localStorage.getItem('playerName');
                if (savedName) {
                    this.playerName = savedName;
                    document.getElementById('player-name').value = savedName;
                    document.getElementById('join-player-name').value = savedName;
                }
            }
            
            // 连接到信令服务器
            async connectToSignalingServer() {
                try {
                    // 这里使用模拟连接，实际项目中需要实现真实的WebSocket服务器
                    console.log("连接到信令服务器...");
                    
                    // 模拟连接成功
                    setTimeout(() => {
                        this.connectionStatus = "connected";
                        this.showNotification("已连接到服务器", "success");
                        this.updateConnectionStatus();
                    }, 1000);
                    
                    return true;
                } catch (error) {
                    console.error("连接信令服务器失败:", error);
                    this.showNotification("连接服务器失败", "error");
                    return false;
                }
            }
            
            // 创建房间
            async createRoom(roomName, password = "", maxPlayers = 4, aiCount = 0, playerName = "玩家") {
                if (!await this.connectToSignalingServer()) {
                    return false;
                }
                
                this.isHost = true;
                this.roomId = this.generateRoomId();
                this.roomName = roomName;
                this.roomPassword = password;
                this.maxPlayers = maxPlayers;
                this.aiCount = aiCount;
                
                // 保存玩家名称
                this.playerName = playerName || document.getElementById('player-name').value || "玩家";
                localStorage.setItem('playerName', this.playerName);
                
                // 添加自己到玩家列表
                this.players.set(this.localPeerId, {
                    id: this.localPeerId,
                    name: this.playerName,
                    isHost: true,
                    isReady: true,
                    class: null
                });
                
                // 添加AI玩家
                for (let i = 0; i < aiCount; i++) {
                    const aiId = 'ai_' + this.generatePeerId();
                    this.players.set(aiId, {
                        id: aiId,
                        name: `AI${i + 1}`,
                        isHost: false,
                        isReady: true,
                        class: this.getRandomClass(),
                        isAI: true
                    });
                }
                
                // 更新UI
                this.updateRoomUI();
                this.showNotification(`房间创建成功！房间ID: ${this.roomId}`, "success");
                
                // 模拟房间创建
                this.simulateRoomCreation();
                
                return this.roomId;
            }
            
            // 生成房间ID
            generateRoomId() {
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                let roomId = '';
                for (let i = 0; i < 6; i++) {
                    roomId += chars.charAt(Math.floor(Math.random() * chars.length));
                }
                return roomId;
            }
            
            // 获取随机职业
            getRandomClass() {
                const classes = this.gameManager.classManager.classDefinitions;
                return classes[Math.floor(Math.random() * classes.length)].id;
            }
            
            // 加入房间
            async joinRoom(roomId, password = "") {
                if (!await this.connectToSignalingServer()) {
                    return false;
                }
                
                this.roomId = roomId;
                this.isHost = false;
                
                // 保存玩家名称
                this.playerName = document.getElementById('join-player-name').value || "玩家";
                localStorage.setItem('playerName', this.playerName);
                
                // 模拟加入房间
                this.simulateJoinRoom();
                
                return true;
            }
            
            // 模拟房间创建（实际项目应通过信令服务器）
            simulateRoomCreation() {
                console.log(`模拟房间创建: ${this.roomId}`);
                
                // 更新房间信息显示
                document.getElementById('room-id').value = this.roomId;
                
                // 添加模拟玩家（仅演示）
                setTimeout(() => {
                    this.addSimulatedPlayer();
                }, 2000);
                
                // 更新公共房间列表
                this.updatePublicRoomsList();
            }
            
            // 模拟加入房间
            simulateJoinRoom() {
                console.log(`模拟加入房间: ${this.roomId}`);
                
                // 模拟从主机获取玩家列表
                const simulatedPlayers = [
                    { id: 'host_001', name: '房主', isHost: true, isReady: true, class: '士兵' },
                    { id: 'player_002', name: '玩家2', isHost: false, isReady: true, class: '商人' }
                ];
                
                // 添加模拟玩家
                simulatedPlayers.forEach(player => {
                    this.players.set(player.id, player);
                });
                
                // 添加自己
                this.players.set(this.localPeerId, {
                    id: this.localPeerId,
                    name: this.playerName,
                    isHost: false,
                    isReady: false,
                    class: null
                });
                
                // 更新UI
                this.updateRoomUI();
                
                this.showNotification(`成功加入房间 ${this.roomId}`, "success");
                
                // 模拟接收聊天消息
                setTimeout(() => {
                    this.addChatMessage('系统', `欢迎 ${this.playerName} 加入房间！`, 'system');
                }, 1000);
            }
            
            // 添加模拟玩家
            addSimulatedPlayer() {
                const simulatedPlayers = [
                    { name: '玩家A', class: '天使' },
                    { name: '玩家B', class: '炼金术师' },
                    { name: '玩家C', class: '乐子人' }
                ];
                
                const player = simulatedPlayers[Math.floor(Math.random() * simulatedPlayers.length)];
                const playerId = 'simulated_' + Math.random().toString(36).substring(2, 9);
                
                this.players.set(playerId, {
                    id: playerId,
                    name: player.name,
                    isHost: false,
                    isReady: Math.random() > 0.5,
                    class: player.class
                });
                
                // 更新UI
                this.updateRoomUI();
                
                // 添加聊天消息
                this.addChatMessage('系统', `${player.name} 加入了房间`, 'system');
            }
            
            // 更新房间UI
            updateRoomUI() {
                // 更新玩家列表
                this.updatePlayerList();
                
                // 更新开始游戏按钮状态
                this.updateStartButton();
                
                // 更新连接状态
                this.updateConnectionStatus();
            }
            
            // 更新玩家列表
            updatePlayerList() {
                const playerListElement = document.getElementById('room-players');
                if (!playerListElement) return;
                
                playerListElement.innerHTML = '';
                
                this.players.forEach(player => {
                    const playerElement = document.createElement('div');
                    playerElement.className = 'player-list-item';
                    
                    // 玩家头像
                    const avatar = this.getAvatarForPlayer(player);
                    
                    playerElement.innerHTML = `
                        <div class="player-avatar-small">${avatar}</div>
                        <div style="flex: 1;">
                            <div style="font-weight: bold;">${player.name} ${player.isHost ? '👑' : ''} ${player.isAI ? '🤖' : ''}</div>
                            <div style="font-size: 0.8rem; color: #a5b1c2;">
                                ${player.class ? `职业: ${this.getClassName(player.class)}` : '未选择职业'}
                                ${player.isReady ? '✓ 已准备' : '✗ 未准备'}
                            </div>
                        </div>
                    `;
                    
                    playerListElement.appendChild(playerElement);
                });
            }
            
            // 获取职业名称
            getClassName(classId) {
                const classDef = this.gameManager.classManager.classDefinitions.find(c => c.id === classId);
                return classDef ? classDef.name : '未选择';
            }
            
            // 获取玩家头像
            getAvatarForPlayer(player) {
                // 检查是否是本地玩家
                if (player.id === this.localPeerId) {
                    // 使用本地保存的头像
                    return localStorage.getItem('playerAvatar') || '👤';
                }
                
                // 对于其他玩家，根据名称生成头像
                const avatars = ['👤', '👨', '👩', '🧙', '🦹', '🧚', '🧛', '🧜', '🧝', '👻', '🤖', '🐱', '🐶', '🐼', '🐨'];
                let hash = 0;
                for (let i = 0; i < player.name.length; i++) {
                    hash = player.name.charCodeAt(i) + ((hash << 5) - hash);
                }
                const index = Math.abs(hash) % avatars.length;
                return avatars[index];
            }
            
            // 更新开始游戏按钮
            updateStartButton() {
                const startButton = document.getElementById('start-multiplayer-game');
                if (!startButton) return;
                
                // 只有房主可以开始游戏
                startButton.disabled = !this.isHost;
                
                // 检查是否所有玩家都准备好了
                let allReady = true;
                let playerCount = 0;
                
                this.players.forEach(player => {
                    playerCount++;
                    if (!player.isReady && !player.isAI) {
                        allReady = false;
                    }
                });
                
                // 至少需要2名玩家
                if (playerCount < 2) {
                    startButton.innerHTML = '<i class="fas fa-play"></i> 等待更多玩家...';
                    startButton.disabled = true;
                } else if (allReady) {
                    startButton.innerHTML = '<i class="fas fa-play"></i> 开始游戏';
                    startButton.disabled = false;
                } else {
                    startButton.innerHTML = '<i class="fas fa-play"></i> 等待玩家准备...';
                    startButton.disabled = true;
                }
            }
            
            // 更新连接状态显示
            updateConnectionStatus() {
                const statusElement = document.getElementById('connection-status');
                if (!statusElement) return;
                
                let statusText = '';
                let statusColor = '';
                
                switch (this.connectionStatus) {
                    case 'connected':
                        statusText = '连接正常';
                        statusColor = '#2ecc71';
                        break;
                    case 'connecting':
                        statusText = '连接中...';
                        statusColor = '#f39c12';
                        break;
                    case 'disconnected':
                        statusText = '未连接';
                        statusColor = '#e74c3c';
                        break;
                    default:
                        statusText = '未知状态';
                        statusColor = '#95a5a6';
                }
                
                statusElement.innerHTML = `<i class="fas fa-wifi"></i> <span>${statusText}</span>`;
                statusElement.style.color = statusColor;
            }
            
            // 更新公共房间列表
            updatePublicRoomsList() {
                const roomsList = document.getElementById('public-rooms');
                if (!roomsList) return;
                
                // 模拟公共房间数据
                const publicRooms = [
                    { id: 'ABC123', name: '道具大战房间1', players: 2, maxPlayers: 4, hasPassword: false },
                    { id: 'DEF456', name: '高手对战房', players: 3, maxPlayers: 4, hasPassword: true },
                    { id: 'GHI789', name: '新手练习房', players: 1, maxPlayers: 6, hasPassword: false },
                    { id: this.roomId, name: this.roomName || '我的房间', players: this.players.size, maxPlayers: this.maxPlayers || 4, hasPassword: !!this.roomPassword }
                ];
                
                roomsList.innerHTML = '';
                
                if (publicRooms.length === 0) {
                    roomsList.innerHTML = '<div class="room-empty"><p style="text-align: center; color: #a5b1c2; padding: 20px;">暂无公开房间</p></div>';
                    return;
                }
                
                publicRooms.forEach(room => {
                    const roomElement = document.createElement('div');
                    roomElement.className = 'room-item';
                    roomElement.dataset.roomId = room.id;
                    
                    const isFull = room.players >= room.maxPlayers;
                    
                    roomElement.innerHTML = `
                        <div class="room-info">
                            <div class="room-name">${room.name} ${room.hasPassword ? '🔒' : ''}</div>
                            <div class="room-details">
                                <span>房间ID: ${room.id}</span>
                                <span>玩家: ${room.players}/${room.maxPlayers}</span>
                                <span>AI: ${room.aiCount || 0}</span>
                            </div>
                        </div>
                        <div class="room-status ${isFull ? 'full' : 'available'}">
                            ${isFull ? '已满员' : '可加入'}
                        </div>
                    `;
                    
                    roomElement.addEventListener('click', () => {
                        if (!isFull) {
                            document.getElementById('room-id').value = room.id;
                            if (room.hasPassword) {
                                const password = prompt('该房间需要密码，请输入密码:');
                                if (password) {
                                    document.getElementById('join-room-password').value = password;
                                }
                            }
                        }
                    });
                    
                    roomsList.appendChild(roomElement);
                });
            }
            
            // 添加聊天消息
            addChatMessage(sender, message, type = 'player') {
                const chatMessages = document.getElementById('room-chat-messages');
                if (!chatMessages) return;
                
                const messageElement = document.createElement('div');
                messageElement.className = `chat-message ${type}`;
                
                if (type === 'system') {
                    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
                } else {
                    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
                }
                
                chatMessages.appendChild(messageElement);
                
                // 滚动到底部
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
            
            // 发送聊天消息
            sendChatMessage(message) {
                if (!message.trim()) return;
                
                // 添加自己的消息到聊天框
                this.addChatMessage(this.playerName, message, 'player');
                
                // 模拟发送给其他玩家（实际项目应通过DataChannel发送）
                console.log(`发送聊天消息: ${message}`);
                
                // 模拟其他玩家的回复
                if (Math.random() > 0.7) {
                    setTimeout(() => {
                        const simulatedPlayers = Array.from(this.players.values()).filter(p => p.id !== this.localPeerId);
                        if (simulatedPlayers.length > 0) {
                            const randomPlayer = simulatedPlayers[Math.floor(Math.random() * simulatedPlayers.length)];
                            const responses = [
                                '好的！',
                                '明白了。',
                                '这个策略不错！',
                                '我们开始吧！',
                                '等一下，我还没准备好。'
                            ];
                            const response = responses[Math.floor(Math.random() * responses.length)];
                            this.addChatMessage(randomPlayer.name, response, 'player');
                        }
                    }, 1000 + Math.random() * 2000);
                }
            }
            
            // 准备游戏
            readyGame() {
                const player = this.players.get(this.localPeerId);
                if (player) {
                    player.isReady = !player.isReady;
                    this.updateRoomUI();
                    
                    const status = player.isReady ? '已准备' : '取消准备';
                    this.addChatMessage('系统', `${this.playerName} ${status}`, 'system');
                    this.showNotification(`你已${status}`, 'info');
                }
            }
            
            // 开始多人游戏
            async startMultiplayerGame() {
                if (!this.isHost) {
                    this.showNotification('只有房主可以开始游戏', 'error');
                    return;
                }
                
                // 检查是否有足够的玩家
                if (this.players.size < 2) {
                    this.showNotification('至少需要2名玩家才能开始游戏', 'error');
                    return;
                }
                
                // 检查是否所有玩家都准备好了
                let allReady = true;
                this.players.forEach(player => {
                    if (!player.isReady && !player.isAI) {
                        allReady = false;
                    }
                });
                
                if (!allReady) {
                    this.showNotification('请等待所有玩家准备就绪', 'error');
                    return;
                }
                
                this.showNotification('正在开始游戏...', 'info');
                
                // 切换到职业选择界面
                switchScreen('class-selection-screen');
                
                // 设置游戏为多人模式
                this.gameManager.isMultiplayer = true;
                this.gameManager.multiplayerManager = this;
                
                // 通知其他玩家游戏开始
                this.broadcastGameStart();
            }
            
            // 广播游戏开始
            broadcastGameStart() {
                // 模拟广播（实际项目应通过信令服务器发送）
                console.log('广播游戏开始信号');
                
                // 模拟其他玩家收到开始信号
                setTimeout(() => {
                    this.addChatMessage('系统', '游戏即将开始，请选择职业！', 'system');
                }, 500);
            }
            
            // 离开房间
            leaveRoom() {
                if (this.roomId) {
                    this.showNotification(`已离开房间 ${this.roomId}`, 'info');
                }
                
                // 重置状态
                this.roomId = null;
                this.isHost = false;
                this.players.clear();
                this.connectionStatus = 'disconnected';
                
                // 返回主菜单
                switchScreen('main-menu');
            }
            
            // 显示通知
            showNotification(message, type = 'info') {
                const notificationArea = document.getElementById('notification-area');
                if (!notificationArea) return;
                
                const notification = document.createElement('div');
                notification.className = `notification ${type}`;
                notification.innerHTML = `
                    <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
                    <span>${message}</span>
                `;
                
                notificationArea.appendChild(notification);
                
                // 自动移除通知
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 5000);
            }
            
            // 处理WebRTC连接
            async createPeerConnection(peerId) {
                try {
                    const pc = new RTCPeerConnection(this.rtcConfig);
                    
                    // 保存连接
                    this.peerConnections.set(peerId, pc);
                    
                    // 创建数据通道
                    const dc = pc.createDataChannel('gameData', {
                        ordered: true,
                        maxRetransmits: 3
                    });
                    
                    this.setupDataChannel(dc, peerId);
                    
                    // 处理ICE候选
                    pc.onicecandidate = (event) => {
                        if (event.candidate) {
                            // 通过信令服务器发送ICE候选
                            this.sendSignalingMessage(peerId, {
                                type: 'ice-candidate',
                                candidate: event.candidate
                            });
                        }
                    };
                    
                    // 处理连接状态变化
                    pc.onconnectionstatechange = () => {
                        console.log(`与 ${peerId} 的连接状态: ${pc.connectionState}`);
                    };
                    
                    return pc;
                } catch (error) {
                    console.error('创建PeerConnection失败:', error);
                    return null;
                }
            }
            
            // 设置数据通道
            setupDataChannel(dc, peerId) {
                dc.onopen = () => {
                    console.log(`与 ${peerId} 的数据通道已打开`);
                    this.dataChannels.set(peerId, dc);
                    this.showNotification(`已连接到 ${peerId}`, 'success');
                };
                
                dc.onclose = () => {
                    console.log(`与 ${peerId} 的数据通道已关闭`);
                    this.dataChannels.delete(peerId);
                };
                
                dc.onmessage = (event) => {
                    this.handleDataMessage(peerId, event.data);
                };
                
                dc.onerror = (error) => {
                    console.error(`与 ${peerId} 的数据通道错误:`, error);
                };
            }
            
            // 处理数据消息
            handleDataMessage(peerId, data) {
                try {
                    const message = JSON.parse(data);
                    console.log(`收到来自 ${peerId} 的消息:`, message);
                    
                    // 根据消息类型处理
                    switch (message.type) {
                        case 'game-action':
                            this.handleGameAction(message.action, peerId);
                            break;
                        case 'chat':
                            this.handleChatMessage(message, peerId);
                            break;
                        case 'game-state':
                            this.handleGameState(message.state, peerId);
                            break;
                        default:
                            console.warn('未知的消息类型:', message.type);
                    }
                } catch (error) {
                    console.error('解析数据消息失败:', error);
                }
            }
            
            // 处理游戏动作
            handleGameAction(action, peerId) {
                // 转发给游戏管理器
                if (this.gameManager) {
                    this.gameManager.handleMultiplayerAction(action, peerId);
                }
            }
            
            // 处理聊天消息
            handleChatMessage(message, peerId) {
                const player = this.players.get(peerId);
                if (player) {
                    this.addChatMessage(player.name, message.text, 'player');
                }
            }
            
            // 处理游戏状态
            handleGameState(state, peerId) {
                // 同步游戏状态
                if (this.gameManager) {
                    this.gameManager.syncGameState(state);
                }
            }
            
            // 发送信令消息
            sendSignalingMessage(peerId, message) {
                // 模拟发送信令消息
                console.log(`发送信令消息给 ${peerId}:`, message);
                
                // 实际项目中应通过WebSocket发送
                if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                    this.socket.send(JSON.stringify({
                        to: peerId,
                        ...message
                    }));
                }
            }
            
            // 广播消息给所有玩家
            broadcastMessage(message) {
                this.dataChannels.forEach((dc, peerId) => {
                    if (dc.readyState === 'open') {
                        dc.send(JSON.stringify(message));
                    }
                });
            }
        }

        // ==================== 音效管理器 (增强版) ====================
        class SoundManager {
            constructor() {
                this.musicEnabled = true;
                this.sfxEnabled = true;
                this.musicVolume = 0.7;
                this.battleMusicVolume = 0.7;
                this.lobbyMusicVolume = 0.7;
                this.sfxVolume = 0.8;
                
                // 创建音频上下文（兼容旧浏览器）
                this.audioContext = null;
                try {
                    window.AudioContext = window.AudioContext || window.webkitAudioContext;
                    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                } catch (e) {
                    console.warn('Web Audio API 不支持:', e);
                }
                
                // 音效缓存
        this.soundCache = new Map();
        
        // 预加载音效
        this.preloadSounds();
        
        // 设置初始音量
        this.updateMusicVolume();
        
        // 触摸事件支持
        this.setupTouchSupport();
                
                // 背景音乐状态
                this.bgMusicPlaying = false;
                this.lobbyMusicPlaying = false;
                this.battleMusicPlaying = false;
                this.rogueMusicPlaying = false;
                
                // 音乐定时器ID，用于取消未执行的音符
                this.musicTimeouts = [];
                
                // 音乐类型
                this.currentMusicType = null;
            }
            
            // 预加载音效
            async preloadSounds() {
                console.log('音效系统初始化完成，支持多种游戏音效');
            }
            
            // 停止所有音乐
            stopAllMusic() {
                // 清除所有音乐定时器
                this.musicTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
                this.musicTimeouts = [];
                
                // 重置音乐状态
                this.bgMusicPlaying = false;
                this.lobbyMusicPlaying = false;
                this.battleMusicPlaying = false;
                this.rogueMusicPlaying = false;
                this.currentMusicType = null;
            }
            
            // 播放背景音乐
            playBackgroundMusic() {
                // 停止其他音乐
                this.stopAllMusic();
                
                if (!this.musicEnabled) return;
                
                try {
                    // 创建模拟背景音乐
                    this.createBackgroundMusic();
                    this.bgMusicPlaying = true;
                    this.currentMusicType = 'background';
                } catch (e) {
                    console.warn('播放背景音乐失败:', e);
                }
            }
            
            // 创建背景音乐 - C418风格 (增强版)
            createBackgroundMusic() {
                if (!this.audioContext) return;
                
                // 创建一个4分钟的C418风格背景音乐，更复杂丰富，旋律不重复
                const melody = [
                    // 第一部分：低沉前奏 (0-45秒)
                    { note: 220.00, duration: 3, time: 0 },     // A3
                    { note: 246.94, duration: 2, time: 3 },     // B3
                    { note: 261.63, duration: 2, time: 5 },     // C4
                    { note: 246.94, duration: 2, time: 7 },     // B3
                    { note: 220.00, duration: 3, time: 9 },     // A3
                    { note: 196.00, duration: 2, time: 12 },    // G3
                    { note: 220.00, duration: 2, time: 14 },    // A3
                    { note: 246.94, duration: 2, time: 16 },    // B3
                    { note: 261.63, duration: 2, time: 18 },    // C4
                    { note: 246.94, duration: 3, time: 20 },    // B3
                    { note: 220.00, duration: 2, time: 23 },    // A3
                    { note: 196.00, duration: 2, time: 25 },    // G3
                    { note: 174.61, duration: 4, time: 27 },    // F3
                    { note: 196.00, duration: 2, time: 31 },    // G3
                    { note: 220.00, duration: 2, time: 33 },    // A3
                    { note: 246.94, duration: 2, time: 35 },    // B3
                    { note: 261.63, duration: 2, time: 37 },    // C4
                    { note: 293.66, duration: 2, time: 39 },    // D4
                    { note: 261.63, duration: 3, time: 41 },    // C4
                    
                    // 第二部分：情感旋律 (45-120秒)
                    { note: 220.00, duration: 1.5, time: 45 },  // A3
                    { note: 246.94, duration: 1.5, time: 46.5 }, // B3
                    { note: 261.63, duration: 1.5, time: 48 },  // C4
                    { note: 293.66, duration: 1.5, time: 49.5 }, // D4
                    { note: 329.63, duration: 1.5, time: 51 },  // E4
                    { note: 293.66, duration: 1.5, time: 52.5 }, // D4
                    { note: 261.63, duration: 1.5, time: 54 },  // C4
                    { note: 246.94, duration: 1.5, time: 55.5 }, // B3
                    { note: 220.00, duration: 2, time: 57 },    // A3
                    { note: 246.94, duration: 1.5, time: 59 },  // B3
                    { note: 261.63, duration: 1.5, time: 60.5 }, // C4
                    { note: 293.66, duration: 1.5, time: 62 },  // D4
                    { note: 329.63, duration: 1.5, time: 63.5 }, // E4
                    { note: 349.23, duration: 1.5, time: 65 },  // F4
                    { note: 329.63, duration: 2, time: 66.5 }, // E4
                    { note: 293.66, duration: 1.5, time: 68.5 }, // D4
                    { note: 261.63, duration: 1.5, time: 70 },  // C4
                    { note: 246.94, duration: 1.5, time: 71.5 }, // B3
                    { note: 220.00, duration: 2, time: 73 },    // A3
                    { note: 196.00, duration: 1.5, time: 75 },  // G3
                    { note: 220.00, duration: 1.5, time: 76.5 }, // A3
                    { note: 246.94, duration: 1.5, time: 78 },  // B3
                    { note: 261.63, duration: 3, time: 79.5 },  // C4
                    
                    // 第三部分：微妙变奏 (120-180秒)
                    { note: 261.63, duration: 1.5, time: 120 }, // C4
                    { note: 293.66, duration: 1.5, time: 121.5 }, // D4
                    { note: 329.63, duration: 1.5, time: 123 }, // E4
                    { note: 349.23, duration: 1.5, time: 124.5 }, // F4
                    { note: 329.63, duration: 1.5, time: 126 }, // E4
                    { note: 293.66, duration: 1.5, time: 127.5 }, // D4
                    { note: 261.63, duration: 2, time: 129 },   // C4
                    { note: 293.66, duration: 1.5, time: 131 }, // D4
                    { note: 329.63, duration: 1.5, time: 132.5 }, // E4
                    { note: 293.66, duration: 1.5, time: 134 }, // D4
                    { note: 261.63, duration: 1.5, time: 135.5 }, // C4
                    { note: 246.94, duration: 2, time: 137 },   // B3
                    { note: 261.63, duration: 1.5, time: 139 }, // C4
                    { note: 293.66, duration: 1.5, time: 140.5 }, // D4
                    { note: 329.63, duration: 1.5, time: 142 }, // E4
                    { note: 349.23, duration: 1.5, time: 143.5 }, // F4
                    { note: 329.63, duration: 3, time: 145 },   // E4
                    
                    // 第四部分：情感升华 (180-240秒)
                    { note: 293.66, duration: 2, time: 180 },   // D4
                    { note: 261.63, duration: 2, time: 182 },   // C4
                    { note: 246.94, duration: 2, time: 184 },   // B3
                    { note: 220.00, duration: 2, time: 186 },   // A3
                    { note: 196.00, duration: 2, time: 188 },   // G3
                    { note: 220.00, duration: 2, time: 190 },   // A3
                    { note: 246.94, duration: 2, time: 192 },   // B3
                    { note: 261.63, duration: 2, time: 194 },   // C4
                    { note: 293.66, duration: 2, time: 196 },   // D4
                    { note: 329.63, duration: 2, time: 198 },   // E4
                    { note: 293.66, duration: 2, time: 200 },   // D4
                    { note: 261.63, duration: 2, time: 202 },   // C4
                    { note: 246.94, duration: 2, time: 204 },   // B3
                    { note: 220.00, duration: 2, time: 206 },   // A3
                    { note: 196.00, duration: 2, time: 208 },   // G3
                    { note: 220.00, duration: 2, time: 210 },   // A3
                    { note: 246.94, duration: 2, time: 212 },   // B3
                    { note: 261.63, duration: 2, time: 214 },   // C4
                    { note: 246.94, duration: 2, time: 216 },   // B3
                    { note: 220.00, duration: 2, time: 218 },   // A3
                    { note: 196.00, duration: 2, time: 220 },   // G3
                    { note: 174.61, duration: 4, time: 222 },   // F3
                    { note: 196.00, duration: 6, time: 226 }    // G3
                ];
                
                const bassLine = [
                    // 低音线 - C418风格的简约低音
                    { note: 110.00, duration: 4, time: 0 },     // A2
                    { note: 123.47, duration: 4, time: 4 },     // B2
                    { note: 130.81, duration: 4, time: 8 },     // C3
                    { note: 123.47, duration: 4, time: 12 },    // B2
                    { note: 110.00, duration: 4, time: 16 },    // A2
                    { note: 98.00, duration: 4, time: 20 },     // G2
                    { note: 110.00, duration: 4, time: 24 },    // A2
                    { note: 123.47, duration: 6, time: 28 },    // B2
                    { note: 130.81, duration: 4, time: 34 },    // C3
                    { note: 146.83, duration: 4, time: 38 },    // D3
                    { note: 164.81, duration: 4, time: 42 },    // E3
                    { note: 146.83, duration: 4, time: 46 },    // D3
                    { note: 130.81, duration: 4, time: 50 },    // C3
                    { note: 123.47, duration: 4, time: 54 },    // B2
                    { note: 110.00, duration: 4, time: 58 },    // A2
                    { note: 98.00, duration: 4, time: 62 },     // G2
                    { note: 110.00, duration: 4, time: 66 },    // A2
                    { note: 123.47, duration: 4, time: 70 },    // B2
                    { note: 130.81, duration: 6, time: 74 },    // C3
                    { note: 146.83, duration: 4, time: 80 },    // D3
                    { note: 164.81, duration: 4, time: 84 },    // E3
                    { note: 174.61, duration: 4, time: 88 },    // F3
                    { note: 164.81, duration: 4, time: 92 },    // E3
                    { note: 146.83, duration: 4, time: 96 },    // D3
                    { note: 130.81, duration: 4, time: 100 },   // C3
                    { note: 123.47, duration: 4, time: 104 },   // B2
                    { note: 110.00, duration: 8, time: 108 },   // A2
                    { note: 98.00, duration: 8, time: 116 },    // G2
                    { note: 110.00, duration: 8, time: 124 },   // A2
                    { note: 123.47, duration: 8, time: 132 },   // B2
                    { note: 130.81, duration: 8, time: 140 },   // C3
                    { note: 146.83, duration: 8, time: 148 },   // D3
                    { note: 130.81, duration: 8, time: 156 },   // C3
                    { note: 123.47, duration: 8, time: 164 },   // B2
                    { note: 110.00, duration: 8, time: 172 },   // A2
                    { note: 98.00, duration: 8, time: 180 },    // G2
                    { note: 87.31, duration: 8, time: 188 },    // F2
                    { note: 98.00, duration: 12, time: 196 }    // G2
                ];
                
                const harmony = [
                    // 和声部分 - C418风格的微妙和声
                    { note: 392.00, duration: 4, time: 4 },     // G4
                    { note: 440.00, duration: 4, time: 8 },     // A4
                    { note: 493.88, duration: 4, time: 12 },    // B4
                    { note: 523.25, duration: 4, time: 16 },    // C5
                    { note: 493.88, duration: 4, time: 20 },    // B4
                    { note: 440.00, duration: 4, time: 24 },    // A4
                    { note: 392.00, duration: 4, time: 28 },    // G4
                    { note: 349.23, duration: 4, time: 32 },    // F4
                    { note: 392.00, duration: 4, time: 36 },    // G4
                    { note: 440.00, duration: 4, time: 40 },    // A4
                    { note: 493.88, duration: 4, time: 44 },    // B4
                    { note: 523.25, duration: 4, time: 48 },    // C5
                    { note: 587.33, duration: 4, time: 52 },    // D5
                    { note: 523.25, duration: 4, time: 56 },    // C5
                    { note: 493.88, duration: 4, time: 60 },    // B4
                    { note: 440.00, duration: 4, time: 64 },    // A4
                    { note: 392.00, duration: 4, time: 68 },    // G4
                    { note: 349.23, duration: 4, time: 72 },    // F4
                    { note: 392.00, duration: 4, time: 76 },    // G4
                    { note: 440.00, duration: 4, time: 80 },    // A4
                    { note: 493.88, duration: 4, time: 84 },    // B4
                    { note: 523.25, duration: 8, time: 88 },    // C5
                    { note: 493.88, duration: 8, time: 96 },    // B4
                    { note: 440.00, duration: 8, time: 104 },   // A4
                    { note: 392.00, duration: 8, time: 112 },   // G4
                    { note: 349.23, duration: 8, time: 120 },   // F4
                    { note: 392.00, duration: 8, time: 128 },   // G4
                    { note: 440.00, duration: 8, time: 136 },   // A4
                    { note: 493.88, duration: 8, time: 144 },   // B4
                    { note: 523.25, duration: 8, time: 152 },   // C5
                    { note: 493.88, duration: 8, time: 160 },   // B4
                    { note: 440.00, duration: 8, time: 168 },   // A4
                    { note: 392.00, duration: 8, time: 176 },   // G4
                    { note: 349.23, duration: 12, time: 184 },  // F4
                    { note: 392.00, duration: 12, time: 196 }   // G4
                ];
                
                const arpeggio = [
                    // 琶音器部分 - 增加层次感
                    { note: 261.63, duration: 0.5, time: 10 },  // C4
                    { note: 329.63, duration: 0.5, time: 10.5 }, // E4
                    { note: 392.00, duration: 0.5, time: 11 },  // G4
                    { note: 440.00, duration: 0.5, time: 11.5 }, // A4
                    { note: 392.00, duration: 0.5, time: 12 },  // G4
                    { note: 329.63, duration: 0.5, time: 12.5 }, // E4
                    { note: 261.63, duration: 0.5, time: 13 },  // C4
                    { note: 329.63, duration: 0.5, time: 13.5 }, // E4
                    
                    { note: 293.66, duration: 0.5, time: 16 },  // D4
                    { note: 349.23, duration: 0.5, time: 16.5 }, // F4
                    { note: 440.00, duration: 0.5, time: 17 },  // A4
                    { note: 493.88, duration: 0.5, time: 17.5 }, // B4
                    { note: 440.00, duration: 0.5, time: 18 },  // A4
                    { note: 349.23, duration: 0.5, time: 18.5 }, // F4
                    { note: 293.66, duration: 0.5, time: 19 },  // D4
                    { note: 349.23, duration: 0.5, time: 19.5 }, // F4
                    
                    { note: 261.63, duration: 0.5, time: 40 },  // C4
                    { note: 329.63, duration: 0.5, time: 40.5 }, // E4
                    { note: 392.00, duration: 0.5, time: 41 },  // G4
                    { note: 440.00, duration: 0.5, time: 41.5 }, // A4
                    { note: 392.00, duration: 0.5, time: 42 },  // G4
                    { note: 329.63, duration: 0.5, time: 42.5 }, // E4
                    { note: 261.63, duration: 0.5, time: 43 },  // C4
                    { note: 329.63, duration: 0.5, time: 43.5 }, // E4
                    
                    { note: 293.66, duration: 0.5, time: 46 },  // D4
                    { note: 349.23, duration: 0.5, time: 46.5 }, // F4
                    { note: 440.00, duration: 0.5, time: 47 },  // A4
                    { note: 493.88, duration: 0.5, time: 47.5 }, // B4
                    { note: 440.00, duration: 0.5, time: 48 },  // A4
                    { note: 349.23, duration: 0.5, time: 48.5 }, // F4
                    { note: 293.66, duration: 0.5, time: 49 },  // D4
                    { note: 349.23, duration: 0.5, time: 49.5 }, // F4
                    
                    { note: 329.63, duration: 0.5, time: 80 },  // E4
                    { note: 392.00, duration: 0.5, time: 80.5 }, // G4
                    { note: 440.00, duration: 0.5, time: 81 },  // A4
                    { note: 493.88, duration: 0.5, time: 81.5 }, // B4
                    { note: 440.00, duration: 0.5, time: 82 },  // A4
                    { note: 392.00, duration: 0.5, time: 82.5 }, // G4
                    { note: 329.63, duration: 0.5, time: 83 },  // E4
                    { note: 392.00, duration: 0.5, time: 83.5 }, // G4
                    
                    { note: 349.23, duration: 0.5, time: 86 },  // F4
                    { note: 440.00, duration: 0.5, time: 86.5 }, // A4
                    { note: 493.88, duration: 0.5, time: 87 },  // B4
                    { note: 523.25, duration: 0.5, time: 87.5 }, // C5
                    { note: 493.88, duration: 0.5, time: 88 },  // B4
                    { note: 440.00, duration: 0.5, time: 88.5 }, // A4
                    { note: 349.23, duration: 0.5, time: 89 },  // F4
                    { note: 440.00, duration: 0.5, time: 89.5 }, // A4
                    
                    { note: 261.63, duration: 0.5, time: 114 }, // C4
                    { note: 329.63, duration: 0.5, time: 114.5 }, // E4
                    { note: 392.00, duration: 0.5, time: 115 }, // G4
                    { note: 440.00, duration: 0.5, time: 115.5 }, // A4
                    { note: 392.00, duration: 0.5, time: 116 }, // G4
                    { note: 329.63, duration: 0.5, time: 116.5 }, // E4
                    { note: 261.63, duration: 0.5, time: 117 }, // C4
                    { note: 329.63, duration: 0.5, time: 117.5 }, // E4
                    
                    { note: 293.66, duration: 0.5, time: 119 }, // D4
                    { note: 349.23, duration: 0.5, time: 119.5 }, // F4
                    { note: 440.00, duration: 0.5, time: 120 }, // A4
                    { note: 493.88, duration: 0.5, time: 120.5 }, // B4
                    { note: 440.00, duration: 0.5, time: 121 }, // A4
                    { note: 349.23, duration: 0.5, time: 121.5 }, // F4
                    { note: 293.66, duration: 0.5, time: 122 }, // D4
                    { note: 349.23, duration: 0.5, time: 122.5 }, // F4
                    
                    // 新增：更多琶音器模式，增加音乐变化
                    { note: 329.63, duration: 0.5, time: 150 }, // E4
                    { note: 392.00, duration: 0.5, time: 150.5 }, // G4
                    { note: 440.00, duration: 0.5, time: 151 }, // A4
                    { note: 392.00, duration: 0.5, time: 151.5 }, // G4
                    { note: 329.63, duration: 0.5, time: 152 }, // E4
                    { note: 392.00, duration: 0.5, time: 152.5 }, // G4
                    { note: 440.00, duration: 0.5, time: 153 }, // A4
                    { note: 392.00, duration: 0.5, time: 153.5 }, // G4
                    
                    { note: 261.63, duration: 0.5, time: 180 }, // C4
                    { note: 329.63, duration: 0.5, time: 180.5 }, // E4
                    { note: 392.00, duration: 0.5, time: 181 }, // G4
                    { note: 440.00, duration: 0.5, time: 181.5 }, // A4
                    { note: 392.00, duration: 0.5, time: 182 }, // G4
                    { note: 329.63, duration: 0.5, time: 182.5 }, // E4
                    { note: 261.63, duration: 0.5, time: 183 }, // C4
                    { note: 329.63, duration: 0.5, time: 183.5 }  // E4
                ];
                
                const padSynth = [
                    // Pad合成器部分 - 增加氛围感
                    { note: 220.00, duration: 8, time: 0 },     // A3
                    { note: 246.94, duration: 8, time: 8 },    // B3
                    { note: 261.63, duration: 8, time: 16 },   // C4
                    { note: 293.66, duration: 8, time: 24 },   // D4
                    { note: 329.63, duration: 8, time: 32 },   // E4
                    { note: 293.66, duration: 8, time: 40 },   // D4
                    { note: 261.63, duration: 8, time: 48 },   // C4
                    { note: 246.94, duration: 8, time: 56 },   // B3
                    { note: 220.00, duration: 8, time: 64 },   // A3
                    { note: 196.00, duration: 8, time: 72 },   // G3
                    { note: 220.00, duration: 8, time: 80 },   // A3
                    { note: 246.94, duration: 8, time: 88 },   // B3
                    { note: 261.63, duration: 8, time: 96 },   // C4
                    { note: 293.66, duration: 8, time: 104 },  // D4
                    { note: 329.63, duration: 8, time: 112 },  // E4
                    { note: 349.23, duration: 8, time: 120 },  // F4
                    { note: 329.63, duration: 8, time: 128 },  // E4
                    { note: 293.66, duration: 8, time: 136 },  // D4
                    { note: 261.63, duration: 8, time: 144 },  // C4
                    { note: 246.94, duration: 8, time: 152 },  // B3
                    { note: 220.00, duration: 8, time: 160 },  // A3
                    { note: 196.00, duration: 8, time: 168 },  // G3
                    { note: 220.00, duration: 8, time: 176 },  // A3
                    { note: 246.94, duration: 8, time: 184 },  // B3
                    { note: 261.63, duration: 12, time: 192 },  // C4
                    { note: 246.94, duration: 12, time: 204 },  // B3
                    { note: 220.00, duration: 12, time: 216 }   // A3
                ];
                
                // 播放旋律 - 使用更柔和的音色
                melody.forEach(note => {
                    const timeoutId = setTimeout(() => {
                        if (!this.musicEnabled || this.currentMusicType !== 'background') return;
                        this.playMusicNote(note.note, note.duration, 'sine', 0.5);
                    }, note.time * 1000);
                    this.musicTimeouts.push(timeoutId);
                });
                
                // 播放低音线 - 使用更低的音量
                bassLine.forEach(note => {
                    const timeoutId = setTimeout(() => {
                        if (!this.musicEnabled || this.currentMusicType !== 'background') return;
                        this.playMusicNote(note.note, note.duration, 'sine', 0.25);
                    }, note.time * 1000);
                    this.musicTimeouts.push(timeoutId);
                });
                
                // 播放和声 - 使用更微妙的音量
                harmony.forEach(note => {
                    const timeoutId = setTimeout(() => {
                        if (!this.musicEnabled || this.currentMusicType !== 'background') return;
                        this.playMusicNote(note.note, note.duration, 'sine', 0.25);
                    }, note.time * 1000);
                    this.musicTimeouts.push(timeoutId);
                });
                
                // 播放琶音器 - 增加层次感
                arpeggio.forEach(note => {
                    const timeoutId = setTimeout(() => {
                        if (!this.musicEnabled || this.currentMusicType !== 'background') return;
                        this.playMusicNote(note.note, note.duration, 'sine', 0.15);
                    }, note.time * 1000);
                    this.musicTimeouts.push(timeoutId);
                });
                
                // 播放Pad合成器 - 增加氛围感
                padSynth.forEach(note => {
                    const timeoutId = setTimeout(() => {
                        if (!this.musicEnabled || this.currentMusicType !== 'background') return;
                        this.playMusicNote(note.note, note.duration, 'sine', 0.1);
                    }, note.time * 1000);
                    this.musicTimeouts.push(timeoutId);
                });
                
                // 循环播放
                const loopTimeoutId = setTimeout(() => {
                    if (this.musicEnabled && this.currentMusicType === 'background') {
                        this.createBackgroundMusic();
                    }
                }, 240 * 1000);
                this.musicTimeouts.push(loopTimeoutId);
            }
            
            // 播放音乐音符
            playMusicNote(frequency, duration, type = 'sine', volumeMultiplier = 1) {
                if (!this.audioContext) return;
                
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
                oscillator.type = type;
                
                // 根据音乐类型选择音量
                let volume = this.musicVolume;
                if (this.currentMusicType === 'battle') {
                    volume = this.battleMusicVolume;
                } else if (this.currentMusicType === 'lobby') {
                    volume = this.lobbyMusicVolume;
                }
                
                // 音量包络
                volume = volume * 0.3 * volumeMultiplier;
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration - 0.1);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + duration);
            }
            
            // 创建振荡器音效（模拟音效）
            createOscillatorSound(frequency = 440, duration = 0.5, type = 'sine', volume = 0.5) {
                if (!this.audioContext) {
                    return {
                        volume: 1,
                        context: { state: 'running', currentTime: 0 },
                        start: () => {},
                        stop: () => {},
                        onended: null
                    };
                }
                
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
                oscillator.type = type;
                
                // 音量包络
                const finalVolume = this.sfxVolume * volume * 0.3;
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(finalVolume, this.audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
                
                return {
                    oscillator,
                    gainNode,
                    context: this.audioContext,
                    volume: gainNode.gain.value,
                    start: () => oscillator.start(),
                    stop: (time) => oscillator.stop(time),
                    onended: null
                };
            }
            
            // 播放按钮音效（多样化版本）
            playButtonSound(type = 'normal') {
                if (!this.sfxEnabled) return;
                
                try {
                    let note, duration, waveType, volume;
                    
                    switch (type) {
                        case 'normal':
                            note = 493.88; // B4音
                            duration = 0.2;
                            waveType = 'sine';
                            volume = 0.3;
                            break;
                        case 'menu':
                            note = 440.00; // A4音
                            duration = 0.2;
                            waveType = 'sine';
                            volume = 0.25;
                            break;
                        case 'select':
                            note = 466.16; // Bb4音
                            duration = 0.22;
                            waveType = 'sine';
                            volume = 0.35;
                            break;
                        case 'confirm':
                            note = 523.25; // C5音
                            duration = 0.25;
                            waveType = 'sine';
                            volume = 0.4;
                            break;
                        case 'cancel':
                            note = 349.23; // F4音
                            duration = 0.22;
                            waveType = 'sine';
                            volume = 0.3;
                            break;
                        case 'purchase':
                            note = 587.33; // D5音
                            duration = 0.3;
                            waveType = 'sine';
                            volume = 0.45;
                            break;
                        case 'reward':
                            note = 622.25; // D#5音
                            duration = 0.35;
                            waveType = 'sine';
                            volume = 0.5;
                            break;
                        case 'levelup':
                            note = 659.25; // E5音
                            duration = 0.4;
                            waveType = 'sine';
                            volume = 0.55;
                            break;
                        case 'error':
                            note = 329.63; // E4音
                            duration = 0.3;
                            waveType = 'sine';
                            volume = 0.3;
                            break;
                        case 'click':
                            note = 415.30; // Ab4音
                            duration = 0.15;
                            waveType = 'sine';
                            volume = 0.25;
                            break;
                        case 'card':
                            note = 493.88; // B4音
                            duration = 0.2;
                            waveType = 'sine';
                            volume = 0.3;
                            break;
                        case 'attack':
                            note = 370.00; // F#4音
                            duration = 0.22;
                            waveType = 'sine';
                            volume = 0.4;
                            break;
                        case 'defend':
                            note = 349.23; // F4音
                            duration = 0.25;
                            waveType = 'sine';
                            volume = 0.35;
                            break;
                        case 'heal':
                            note = 587.33; // D5音
                            duration = 0.3;
                            waveType = 'sine';
                            volume = 0.4;
                            break;
                        case 'skill':
                            note = 554.37; // C#5音
                            duration = 0.3;
                            waveType = 'sine';
                            volume = 0.45;
                            break;
                        case 'shop':
                            note = 440.00; // A4音
                            duration = 0.22;
                            waveType = 'sine';
                            volume = 0.3;
                            break;
                        case 'map':
                            note = 392.00; // G4音
                            duration = 0.25;
                            waveType = 'sine';
                            volume = 0.25;
                            break;
                        case 'event':
                            note = 493.88; // B4音
                            duration = 0.25;
                            waveType = 'sine';
                            volume = 0.35;
                            break;
                        case 'treasure':
                            note = 698.46; // F5音
                            duration = 0.35;
                            waveType = 'sine';
                            volume = 0.5;
                            break;
                        case 'rest':
                            note = 349.23; // F4音
                            duration = 0.35;
                            waveType = 'sine';
                            volume = 0.25;
                            break;
                        case 'boss':
                            note = 293.66; // D4音
                            duration = 0.3;
                            waveType = 'sine';
                            volume = 0.45;
                            break;
                        case 'victory':
                            note = 739.99; // F#5音
                            duration = 0.45;
                            waveType = 'sine';
                            volume = 0.6;
                            break;
                        case 'defeat':
                            note = 261.63; // C4音
                            duration = 0.5;
                            waveType = 'sine';
                            volume = 0.3;
                            break;
                        case 'settings':
                            note = 466.16; // Bb4音
                            duration = 0.2;
                            waveType = 'sine';
                            volume = 0.25;
                            break;
                        case 'encyclopedia':
                            note = 415.30; // Ab4音
                            duration = 0.22;
                            waveType = 'sine';
                            volume = 0.25;
                            break;
                        case 'multiplayer':
                            note = 493.88; // B4音
                            duration = 0.22;
                            waveType = 'sine';
                            volume = 0.3;
                            break;
                        case 'singleplayer':
                            note = 523.25; // C5音
                            duration = 0.22;
                            waveType = 'sine';
                            volume = 0.3;
                            break;
                        case 'rogue':
                            note = 440.00; // A4音
                            duration = 0.25;
                            waveType = 'sine';
                            volume = 0.35;
                            break;
                        case 'rogue_choice':
                            note = 466.16; // Bb4音
                            duration = 0.25;
                            waveType = 'sine';
                            volume = 0.3;
                            break;
                        case 'rogue_reward':
                            note = 587.33; // D5音
                            duration = 0.3;
                            waveType = 'sine';
                            volume = 0.4;
                            break;
                        case 'rogue_event':
                            note = 493.88; // B4音
                            duration = 0.25;
                            waveType = 'sine';
                            volume = 0.35;
                            break;
                        case 'rogue_shop':
                            note = 415.30; // Ab4音
                            duration = 0.22;
                            waveType = 'sine';
                            volume = 0.25;
                            break;
                        case 'rogue_boss':
                            note = 370.00; // F#4音
                            duration = 0.3;
                            waveType = 'sine';
                            volume = 0.4;
                            break;
                        case 'rogue_levelup':
                            note = 554.37; // C#5音
                            duration = 0.35;
                            waveType = 'sine';
                            volume = 0.45;
                            break;
                        case 'rogue_rest':
                            note = 349.23; // F4音
                            duration = 0.35;
                            waveType = 'sine';
                            volume = 0.25;
                            break;
                        case 'rogue_treasure':
                            note = 698.46; // F5音
                            duration = 0.4;
                            waveType = 'sine';
                            volume = 0.5;
                            break;
                        case 'difficulty':
                            note = 415.30; // Ab4音
                            duration = 0.2;
                            waveType = 'sine';
                            volume = 0.25;
                            break;
                        case 'language':
                            note = 370.00; // F#4音
                            duration = 0.2;
                            waveType = 'sine';
                            volume = 0.25;
                            break;
                        case 'music':
                            note = 392.00; // G4音
                            duration = 0.2;
                            waveType = 'sine';
                            volume = 0.25;
                            break;
                        case 'sfx':
                            note = 349.23; // F4音
                            duration = 0.2;
                            waveType = 'sine';
                            volume = 0.25;
                            break;
                        case 'avatar':
                            note = 493.88; // B4音
                            duration = 0.15;
                            waveType = 'sine';
                            volume = 0.25;
                            break;
                        // 新增：卡牌类型音效
                        case 'card_attack':
                            note = 415.30; // Ab4音
                            duration = 0.22;
                            waveType = 'sine';
                            volume = 0.4;
                            break;
                        case 'card_defense':
                            note = 370.00; // F#4音
                            duration = 0.25;
                            waveType = 'sine';
                            volume = 0.35;
                            break;
                        case 'card_special':
                            note = 440.00; // A4音
                            duration = 0.25;
                            waveType = 'sine';
                            volume = 0.4;
                            break;
                        case 'card_rare':
                            note = 587.33; // D5音
                            duration = 0.3;
                            waveType = 'sine';
                            volume = 0.5;
                            break;
                        // 新增：职业能力音效
                        case 'warrior_skill':
                            note = 370.00; // F#4音
                            duration = 0.25;
                            waveType = 'sine';
                            volume = 0.45;
                            break;
                        case 'mage_skill':
                            note = 493.88; // B4音
                            duration = 0.3;
                            waveType = 'sine';
                            volume = 0.45;
                            break;
                        case 'thief_skill':
                            note = 440.00; // A4音
                            duration = 0.25;
                            waveType = 'sine';
                            volume = 0.35;
                            break;
                        case 'priest_skill':
                            note = 554.37; // C#5音
                            duration = 0.3;
                            waveType = 'sine';
                            volume = 0.4;
                            break;
                        // 新增：游戏状态音效
                        case 'turn_start':
                            note = 415.30; // Ab4音
                            duration = 0.22;
                            waveType = 'sine';
                            volume = 0.25;
                            break;
                        case 'turn_end':
                            note = 392.00; // G4音
                            duration = 0.22;
                            waveType = 'sine';
                            volume = 0.25;
                            break;
                        case 'player_death':
                            note = 293.66; // D4音
                            duration = 0.4;
                            waveType = 'sine';
                            volume = 0.3;
                            break;
                        case 'player_revive':
                            note = 523.25; // C5音
                            duration = 0.35;
                            waveType = 'sine';
                            volume = 0.45;
                            break;
                        // 新增：道具使用音效
                        case 'potion_use':
                            note = 493.88; // B4音
                            duration = 0.25;
                            waveType = 'sine';
                            volume = 0.35;
                            break;
                        case 'scroll_use':
                            note = 466.16; // Bb4音
                            duration = 0.25;
                            waveType = 'sine';
                            volume = 0.3;
                            break;
                        case 'weapon_use':
                            note = 415.30; // Ab4音
                            duration = 0.25;
                            waveType = 'sine';
                            volume = 0.4;
                            break;
                        // 新增：环境音效
                        case 'forest_ambiance':
                            note = 329.63; // E4音
                            duration = 0.45;
                            waveType = 'sine';
                            volume = 0.2;
                            break;
                        case 'cave_ambiance':
                            note = 261.63; // C4音
                            duration = 0.55;
                            waveType = 'sine';
                            volume = 0.25;
                            break;
                        case 'castle_ambiance':
                            note = 370.00; // F#4音
                            duration = 0.45;
                            waveType = 'sine';
                            volume = 0.25;
                            break;
                        case 'shop_ambiance':
                            note = 415.30; // Ab4音
                            duration = 0.35;
                            waveType = 'sine';
                            volume = 0.25;
                            break;
                        default:
                            note = 493.88; // B4音
                            duration = 0.2;
                            waveType = 'sine';
                            volume = 0.3;
                    }
                    
                    const sound = this.createOscillatorSound(note, duration, waveType, volume);
                    sound.start();
                    sound.stop(sound.context.currentTime + duration);
                } catch (e) {
                    console.log('播放按钮音效失败:', e);
                }
            }
            
            // 播放卡牌音效
            playCardSound() {
                if (!this.sfxEnabled) return;
                
                try {
                    const sound = this.createOscillatorSound(392, 0.2); // G4音
                    sound.start();
                    sound.stop(sound.context.currentTime + 0.2);
                } catch (e) {
                    console.log('播放卡牌音效失败:', e);
                }
            }
            
            // 播放攻击音效
            playAttackSound() {
                if (!this.sfxEnabled) return;
                
                try {
                    const sound = this.createOscillatorSound(659.25, 0.3, 'square'); // E5音，方波
                    sound.start();
                    sound.stop(sound.context.currentTime + 0.3);
                } catch (e) {
                    console.log('播放攻击音效失败:', e);
                }
            }
            
            // 播放防御音效
            playDefenseSound() {
                if (!this.sfxEnabled) return;
                
                try {
                    const sound = this.createOscillatorSound(349.23, 0.4, 'triangle'); // F4音，三角波
                    sound.start();
                    sound.stop(sound.context.currentTime + 0.4);
                } catch (e) {
                    console.log('播放防御音效失败:', e);
                }
            }
            
            // 播放胜利音效
            playVictorySound() {
                if (!this.sfxEnabled) return;
                
                try {
                    // 播放一段更丰富的胜利旋律
                    const melody = [
                        { note: 523.25, duration: 0.3, time: 0 },   // C5
                        { note: 659.25, duration: 0.3, time: 0.3 }, // E5
                        { note: 783.99, duration: 0.3, time: 0.6 }, // G5
                        { note: 1046.50, duration: 0.5, time: 0.9 }, // C6
                        { note: 783.99, duration: 0.3, time: 1.4 }, // G5
                        { note: 659.25, duration: 0.3, time: 1.7 }, // E5
                        { note: 523.25, duration: 0.5, time: 2.0 }  // C5
                    ];
                    
                    melody.forEach(note => {
                        setTimeout(() => {
                            const sound = this.createOscillatorSound(note.note, note.duration, 'sine');
                            sound.start();
                            sound.stop(sound.context.currentTime + note.duration);
                        }, note.time * 1000);
                    });
                } catch (e) {
                    console.log('播放胜利音效失败:', e);
                }
            }
            
            // 播放失败音效
            playDefeatSound() {
                if (!this.sfxEnabled) return;
                
                try {
                    // 播放一段更丰富的失败旋律
                    const melody = [
                        { note: 392.00, duration: 0.4, time: 0 },   // G4
                        { note: 349.23, duration: 0.4, time: 0.4 }, // F4
                        { note: 329.63, duration: 0.4, time: 0.8 }, // E4
                        { note: 293.66, duration: 0.6, time: 1.2 }, // D4
                        { note: 261.63, duration: 0.6, time: 1.8 }  // C4
                    ];
                    
                    melody.forEach(note => {
                        setTimeout(() => {
                            const sound = this.createOscillatorSound(note.note, note.duration, 'sawtooth');
                            sound.start();
                            sound.stop(sound.context.currentTime + note.duration);
                        }, note.time * 1000);
                    });
                } catch (e) {
                    console.log('播放失败音效失败:', e);
                }
            }
            
            // 播放特殊音效
            playSpecialSound() {
                if (!this.sfxEnabled) return;
                
                try {
                    const sound = this.createOscillatorSound(493.88, 0.5, 'sine'); // B4音，正弦波
                    sound.start();
                    sound.stop(sound.context.currentTime + 0.5);
                } catch (e) {
                    console.log('播放特殊音效失败:', e);
                }
            }
            
            // 播放卡牌抽取音效
            playCardDrawSound() {
                if (!this.sfxEnabled) return;
                
                try {
                    const sound = this.createOscillatorSound(261.63, 0.3, 'sine'); // C4音
                    sound.start();
                    sound.stop(sound.context.currentTime + 0.3);
                } catch (e) {
                    console.log('播放卡牌抽取音效失败:', e);
                }
            }
            
            // 播放游戏开始音效
            playGameStartSound() {
                if (!this.sfxEnabled) return;
                
                try {
                    const melody = [
                        { note: 261.63, duration: 0.2, time: 0 },   // C4
                        { note: 329.63, duration: 0.2, time: 0.2 }, // E4
                        { note: 392.00, duration: 0.2, time: 0.4 }, // G4
                        { note: 523.25, duration: 0.5, time: 0.6 }  // C5
                    ];
                    
                    melody.forEach(note => {
                        setTimeout(() => {
                            const sound = this.createOscillatorSound(note.note, note.duration, 'sine');
                            sound.start();
                            sound.stop(sound.context.currentTime + note.duration);
                        }, note.time * 1000);
                    });
                } catch (e) {
                    console.log('播放游戏开始音效失败:', e);
                }
            }
            
            // 创建联机大厅背景音乐
            createLobbyMusic() {
                if (!this.audioContext) return;
                
                // 创建一个2分钟的轻松愉快的联机大厅背景音乐
                const melody = [
                    // 第一部分：轻松前奏 (0-30秒)
                    { note: 440.00, duration: 0.8, time: 0 },    // A4
                    { note: 493.88, duration: 0.8, time: 0.8 },  // B4
                    { note: 523.25, duration: 0.8, time: 1.6 },  // C5
                    { note: 493.88, duration: 0.8, time: 2.4 },  // B4
                    { note: 440.00, duration: 1.2, time: 3.2 },  // A4
                    { note: 392.00, duration: 0.8, time: 4.4 },  // G4
                    { note: 440.00, duration: 0.8, time: 5.2 },  // A4
                    { note: 493.88, duration: 1.2, time: 6.0 },  // B4
                    { note: 440.00, duration: 0.8, time: 7.2 },  // A4
                    { note: 392.00, duration: 0.8, time: 8.0 },  // G4
                    { note: 349.23, duration: 0.8, time: 8.8 },  // F4
                    { note: 392.00, duration: 1.2, time: 9.6 },  // G4
                    
                    // 第二部分：大厅主旋律 (30-90秒)
                    { note: 440.00, duration: 0.6, time: 30 },   // A4
                    { note: 493.88, duration: 0.6, time: 30.6 }, // B4
                    { note: 523.25, duration: 0.6, time: 31.2 }, // C5
                    { note: 587.33, duration: 0.6, time: 31.8 }, // D5
                    { note: 523.25, duration: 0.6, time: 32.4 }, // C5
                    { note: 493.88, duration: 0.6, time: 33.0 }, // B4
                    { note: 440.00, duration: 0.6, time: 33.6 }, // A4
                    { note: 392.00, duration: 0.6, time: 34.2 }, // G4
                    { note: 440.00, duration: 0.6, time: 34.8 }, // A4
                    { note: 493.88, duration: 0.6, time: 35.4 }, // B4
                    { note: 440.00, duration: 0.6, time: 36.0 }, // A4
                    { note: 392.00, duration: 1.2, time: 36.6 }, // G4
                    
                    // 第三部分：大厅变奏 (90-120秒)
                    { note: 349.23, duration: 0.8, time: 90 },   // F4
                    { note: 392.00, duration: 0.8, time: 90.8 }, // G4
                    { note: 440.00, duration: 0.8, time: 91.6 }, // A4
                    { note: 493.88, duration: 0.8, time: 92.4 }, // B4
                    { note: 523.25, duration: 0.8, time: 93.2 }, // C5
                    { note: 493.88, duration: 0.8, time: 94.0 }, // B4
                    { note: 440.00, duration: 0.8, time: 94.8 }, // A4
                    { note: 392.00, duration: 0.8, time: 95.6 }, // G4
                    { note: 349.23, duration: 1.2, time: 96.4 }, // F4
                    { note: 329.63, duration: 0.8, time: 97.6 }, // E4
                    { note: 349.23, duration: 0.8, time: 98.4 }, // F4
                    { note: 392.00, duration: 1.2, time: 99.2 }, // G4
                    { note: 349.23, duration: 0.8, time: 100.4 }, // F4
                    { note: 329.63, duration: 0.8, time: 101.2 }, // E4
                    { note: 293.66, duration: 2.4, time: 102.0 }  // D4
                ];
                
                const bassLine = [
                    // 低音线
                    { note: 220.00, duration: 2.4, time: 0 },    // A3
                    { note: 196.00, duration: 2.4, time: 2.4 },  // G3
                    { note: 174.61, duration: 2.4, time: 4.8 },  // F3
                    { note: 196.00, duration: 2.4, time: 7.2 },  // G3
                    { note: 220.00, duration: 2.4, time: 9.6 },  // A3
                    
                    // 第二部分低音线
                    { note: 220.00, duration: 1.8, time: 30 },   // A3
                    { note: 196.00, duration: 1.8, time: 31.8 }, // G3
                    { note: 174.61, duration: 1.8, time: 33.6 }, // F3
                    { note: 196.00, duration: 1.8, time: 35.4 }, // G3
                    
                    // 第三部分低音线
                    { note: 174.61, duration: 2.4, time: 90 },   // F3
                    { note: 196.00, duration: 2.4, time: 92.4 }, // G3
                    { note: 220.00, duration: 2.4, time: 94.8 }, // A3
                    { note: 196.00, duration: 2.4, time: 97.2 }, // G3
                    { note: 174.61, duration: 2.4, time: 99.6 }, // F3
                    { note: 164.81, duration: 2.4, time: 102.0 }, // E3
                    { note: 146.83, duration: 4.8, time: 104.4 }  // D3
                ];
                
                const harmony = [
                    // 和声部分
                    { note: 659.25, duration: 2.4, time: 0 },    // E5
                    { note: 587.33, duration: 2.4, time: 2.4 },  // D5
                    { note: 523.25, duration: 2.4, time: 4.8 },  // C5
                    { note: 587.33, duration: 2.4, time: 7.2 },  // D5
                    { note: 659.25, duration: 2.4, time: 9.6 },  // E5
                    
                    // 第二部分和声
                    { note: 659.25, duration: 1.8, time: 30 },   // E5
                    { note: 587.33, duration: 1.8, time: 31.8 }, // D5
                    { note: 523.25, duration: 1.8, time: 33.6 }, // C5
                    { note: 587.33, duration: 1.8, time: 35.4 }, // D5
                    
                    // 第三部分和声
                    { note: 523.25, duration: 2.4, time: 90 },   // C5
                    { note: 587.33, duration: 2.4, time: 92.4 }, // D5
                    { note: 659.25, duration: 2.4, time: 94.8 }, // E5
                    { note: 587.33, duration: 2.4, time: 97.2 }, // D5
                    { note: 523.25, duration: 2.4, time: 99.6 }, // C5
                    { note: 493.88, duration: 2.4, time: 102.0 }, // B4
                    { note: 440.00, duration: 4.8, time: 104.4 }  // A4
                ];
                
                // 播放旋律
                melody.forEach(note => {
                    const timeoutId = setTimeout(() => {
                        if (!this.musicEnabled || this.currentMusicType !== 'lobby') return;
                        this.playMusicNote(note.note, note.duration, 'sine');
                    }, note.time * 1000);
                    this.musicTimeouts.push(timeoutId);
                });
                
                // 播放低音线
                bassLine.forEach(note => {
                    const timeoutId = setTimeout(() => {
                        if (!this.musicEnabled || this.currentMusicType !== 'lobby') return;
                        this.playMusicNote(note.note, note.duration, 'triangle');
                    }, note.time * 1000);
                    this.musicTimeouts.push(timeoutId);
                });
                
                // 播放和声
                harmony.forEach(note => {
                    const timeoutId = setTimeout(() => {
                        if (!this.musicEnabled || this.currentMusicType !== 'lobby') return;
                        this.playMusicNote(note.note, note.duration, 'sine', 0.5);
                    }, note.time * 1000);
                    this.musicTimeouts.push(timeoutId);
                });
                
                // 循环播放
                const loopTimeoutId = setTimeout(() => {
                    if (this.musicEnabled && this.currentMusicType === 'lobby') {
                        this.createLobbyMusic();
                    }
                }, 120 * 1000);
                this.musicTimeouts.push(loopTimeoutId);
            }
            
            // 播放联机大厅音乐
            playLobbyMusic() {
                // 停止其他音乐
                this.stopAllMusic();
                
                if (!this.musicEnabled) return;
                
                try {
                    this.createLobbyMusic();
                    this.lobbyMusicPlaying = true;
                    this.currentMusicType = 'lobby';
                } catch (e) {
                    console.warn('播放联机大厅音乐失败:', e);
                }
            }
            
            // 播放战斗音乐
            playBattleMusic() {
                // 停止其他音乐
                this.stopAllMusic();
                
                if (!this.musicEnabled) return;
                
                try {
                    this.createBattleMusic();
                    this.battleMusicPlaying = true;
                    this.currentMusicType = 'battle';
                } catch (e) {
                    console.warn('播放战斗音乐失败:', e);
                }
            }
            
            // 播放肉鸽模式音乐
            playRogueMusic() {
                // 停止其他音乐
                this.stopAllMusic();
                
                if (!this.musicEnabled) return;
                
                try {
                    this.createRogueMusic();
                    this.rogueMusicPlaying = true;
                    this.currentMusicType = 'rogue';
                } catch (e) {
                    console.warn('播放肉鸽模式音乐失败:', e);
                }
            }
            
            // 创建对局音乐
            createBattleMusic() {
                if (!this.audioContext) return;
                
                // 创建一个5分钟的激烈斗争性不重复旋律的循环音乐
                const melody = [
                    // 第一部分：战斗前奏 (0-30秒)
                    { note: 523.25, duration: 0.5, time: 0 },    // C5
                    { note: 587.33, duration: 0.5, time: 0.5 },  // D5
                    { note: 659.25, duration: 0.5, time: 1 },    // E5
                    { note: 783.99, duration: 0.5, time: 1.5 },  // G5
                    { note: 880.00, duration: 0.5, time: 2 },    // A5
                    { note: 783.99, duration: 0.5, time: 2.5 },  // G5
                    { note: 659.25, duration: 0.5, time: 3 },    // E5
                    { note: 587.33, duration: 0.5, time: 3.5 },  // D5
                    { note: 523.25, duration: 1, time: 4 },      // C5
                    { note: 587.33, duration: 0.5, time: 5 },    // D5
                    { note: 659.25, duration: 0.5, time: 5.5 },  // E5
                    { note: 783.99, duration: 0.5, time: 6 },    // G5
                    { note: 880.00, duration: 0.5, time: 6.5 },  // A5
                    { note: 987.77, duration: 0.5, time: 7 },    // B5
                    { note: 1046.50, duration: 1, time: 7.5 },   // C6
                    { note: 987.77, duration: 0.5, time: 8.5 },  // B5
                    { note: 880.00, duration: 0.5, time: 9 },    // A5
                    { note: 783.99, duration: 0.5, time: 9.5 },  // G5
                    { note: 659.25, duration: 1, time: 10 },    // E5
                    { note: 587.33, duration: 1, time: 11 },    // D5
                    { note: 523.25, duration: 1.5, time: 12 },   // C5
                    { note: 587.33, duration: 1.5, time: 13.5 }, // D5
                    { note: 659.25, duration: 1.5, time: 15 },   // E5
                    { note: 587.33, duration: 1.5, time: 16.5 }, // D5
                    { note: 523.25, duration: 3, time: 18 },     // C5
                    
                    // 第二部分：战斗主旋律 (30-90秒)
                    { note: 659.25, duration: 0.75, time: 30 },  // E5
                    { note: 783.99, duration: 0.75, time: 30.75 }, // G5
                    { note: 880.00, duration: 0.75, time: 31.5 }, // A5
                    { note: 987.77, duration: 0.75, time: 32.25 }, // B5
                    { note: 1046.50, duration: 0.75, time: 33 }, // C6
                    { note: 987.77, duration: 0.75, time: 33.75 }, // B5
                    { note: 880.00, duration: 0.75, time: 34.5 }, // A5
                    { note: 783.99, duration: 0.75, time: 35.25 }, // G5
                    { note: 659.25, duration: 0.75, time: 36 }, // E5
                    { note: 783.99, duration: 0.75, time: 36.75 }, // G5
                    { note: 880.00, duration: 0.75, time: 37.5 }, // A5
                    { note: 987.77, duration: 0.75, time: 38.25 }, // B5
                    { note: 1046.50, duration: 0.75, time: 39 }, // C6
                    { note: 987.77, duration: 0.75, time: 39.75 }, // B5
                    { note: 880.00, duration: 0.75, time: 40.5 }, // A5
                    { note: 783.99, duration: 0.75, time: 41.25 }, // G5
                    { note: 659.25, duration: 1.5, time: 42 },   // E5
                    { note: 587.33, duration: 1.5, time: 43.5 }, // D5
                    { note: 523.25, duration: 1.5, time: 45 },   // C5
                    { note: 587.33, duration: 1.5, time: 46.5 }, // D5
                    { note: 659.25, duration: 1.5, time: 48 },   // E5
                    { note: 783.99, duration: 1.5, time: 49.5 }, // G5
                    { note: 880.00, duration: 1.5, time: 51 },   // A5
                    { note: 783.99, duration: 1.5, time: 52.5 }, // G5
                    { note: 659.25, duration: 1.5, time: 54 },   // E5
                    { note: 587.33, duration: 3, time: 55.5 },   // D5
                    
                    // 第三部分：战斗变奏 (90-150秒)
                    { note: 523.25, duration: 0.5, time: 90 },   // C5
                    { note: 659.25, duration: 0.5, time: 90.5 }, // E5
                    { note: 783.99, duration: 0.5, time: 91 },   // G5
                    { note: 880.00, duration: 0.5, time: 91.5 }, // A5
                    { note: 987.77, duration: 0.5, time: 92 },   // B5
                    { note: 1046.50, duration: 0.5, time: 92.5 }, // C6
                    { note: 987.77, duration: 0.5, time: 93 },   // B5
                    { note: 880.00, duration: 0.5, time: 93.5 }, // A5
                    { note: 783.99, duration: 0.5, time: 94 },   // G5
                    { note: 659.25, duration: 0.5, time: 94.5 }, // E5
                    { note: 587.33, duration: 0.5, time: 95 },   // D5
                    { note: 523.25, duration: 0.5, time: 95.5 }, // C5
                    { note: 587.33, duration: 0.5, time: 96 },   // D5
                    { note: 659.25, duration: 0.5, time: 96.5 }, // E5
                    { note: 783.99, duration: 0.5, time: 97 },   // G5
                    { note: 880.00, duration: 0.5, time: 97.5 }, // A5
                    { note: 783.99, duration: 0.5, time: 98 },   // G5
                    { note: 659.25, duration: 0.5, time: 98.5 }, // E5
                    { note: 587.33, duration: 0.5, time: 99 },   // D5
                    { note: 523.25, duration: 1, time: 99.5 },   // C5
                    { note: 587.33, duration: 0.5, time: 100.5 }, // D5
                    { note: 659.25, duration: 0.5, time: 101 },   // E5
                    { note: 783.99, duration: 0.5, time: 101.5 }, // G5
                    { note: 880.00, duration: 0.5, time: 102 },   // A5
                    { note: 987.77, duration: 0.5, time: 102.5 }, // B5
                    { note: 1046.50, duration: 1, time: 103 },   // C6
                    { note: 987.77, duration: 0.5, time: 104 },   // B5
                    { note: 880.00, duration: 0.5, time: 104.5 }, // A5
                    { note: 783.99, duration: 0.5, time: 105 },   // G5
                    { note: 659.25, duration: 0.5, time: 105.5 }, // E5
                    { note: 587.33, duration: 0.5, time: 106 },   // D5
                    { note: 523.25, duration: 2, time: 106.5 },   // C5
                    { note: 587.33, duration: 1, time: 108.5 },   // D5
                    { note: 659.25, duration: 1, time: 109.5 },   // E5
                    { note: 783.99, duration: 1, time: 110.5 },   // G5
                    { note: 880.00, duration: 1, time: 111.5 },   // A5
                    { note: 783.99, duration: 1, time: 112.5 },   // G5
                    { note: 659.25, duration: 1, time: 113.5 },   // E5
                    { note: 587.33, duration: 1, time: 114.5 },   // D5
                    { note: 523.25, duration: 3, time: 115.5 },   // C5
                    
                    // 第四部分：战斗高潮 (150-210秒)
                    { note: 659.25, duration: 0.4, time: 150 },   // E5
                    { note: 783.99, duration: 0.4, time: 150.4 }, // G5
                    { note: 880.00, duration: 0.4, time: 150.8 }, // A5
                    { note: 987.77, duration: 0.4, time: 151.2 }, // B5
                    { note: 1046.50, duration: 0.4, time: 151.6 }, // C6
                    { note: 987.77, duration: 0.4, time: 152 },   // B5
                    { note: 880.00, duration: 0.4, time: 152.4 }, // A5
                    { note: 783.99, duration: 0.4, time: 152.8 }, // G5
                    { note: 659.25, duration: 0.4, time: 153.2 }, // E5
                    { note: 783.99, duration: 0.4, time: 153.6 }, // G5
                    { note: 880.00, duration: 0.4, time: 154 },   // A5
                    { note: 987.77, duration: 0.4, time: 154.4 }, // B5
                    { note: 1046.50, duration: 0.4, time: 154.8 }, // C6
                    { note: 1174.66, duration: 0.4, time: 155.2 }, // D6
                    { note: 1046.50, duration: 0.4, time: 155.6 }, // C6
                    { note: 987.77, duration: 0.4, time: 156 },   // B5
                    { note: 880.00, duration: 0.4, time: 156.4 }, // A5
                    { note: 783.99, duration: 0.4, time: 156.8 }, // G5
                    { note: 659.25, duration: 0.4, time: 157.2 }, // E5
                    { note: 587.33, duration: 0.4, time: 157.6 }, // D5
                    { note: 523.25, duration: 0.8, time: 158 },   // C5
                    { note: 587.33, duration: 0.4, time: 158.8 }, // D5
                    { note: 659.25, duration: 0.4, time: 159.2 }, // E5
                    { note: 783.99, duration: 0.4, time: 159.6 }, // G5
                    { note: 880.00, duration: 0.4, time: 160 },   // A5
                    { note: 783.99, duration: 0.4, time: 160.4 }, // G5
                    { note: 659.25, duration: 0.4, time: 160.8 }, // E5
                    { note: 587.33, duration: 0.4, time: 161.2 }, // D5
                    { note: 523.25, duration: 0.8, time: 161.6 }, // C5
                    { note: 587.33, duration: 0.4, time: 162.4 }, // D5
                    { note: 659.25, duration: 0.4, time: 162.8 }, // E5
                    { note: 783.99, duration: 0.4, time: 163.2 }, // G5
                    { note: 880.00, duration: 0.4, time: 163.6 }, // A5
                    { note: 987.77, duration: 0.4, time: 164 },   // B5
                    { note: 1046.50, duration: 0.4, time: 164.4 }, // C6
                    { note: 987.77, duration: 0.4, time: 164.8 }, // B5
                    { note: 880.00, duration: 0.4, time: 165.2 }, // A5
                    { note: 783.99, duration: 0.4, time: 165.6 }, // G5
                    { note: 659.25, duration: 0.4, time: 166 },   // E5
                    { note: 587.33, duration: 0.4, time: 166.4 }, // D5
                    { note: 523.25, duration: 2, time: 166.8 },   // C5
                    { note: 587.33, duration: 1, time: 168.8 },   // D5
                    { note: 659.25, duration: 1, time: 169.8 },   // E5
                    { note: 783.99, duration: 1, time: 170.8 },   // G5
                    { note: 880.00, duration: 1, time: 171.8 },   // A5
                    { note: 987.77, duration: 1, time: 172.8 },   // B5
                    { note: 1046.50, duration: 1, time: 173.8 },   // C6
                    { note: 987.77, duration: 1, time: 174.8 },   // B5
                    { note: 880.00, duration: 1, time: 175.8 },   // A5
                    { note: 783.99, duration: 1, time: 176.8 },   // G5
                    { note: 659.25, duration: 1, time: 177.8 },   // E5
                    { note: 587.33, duration: 1, time: 178.8 },   // D5
                    { note: 523.25, duration: 4, time: 179.8 },   // C5
                    
                    // 第五部分：战斗结尾 (210-300秒)
                    { note: 523.25, duration: 1, time: 210 },   // C5
                    { note: 587.33, duration: 1, time: 211 },   // D5
                    { note: 659.25, duration: 1, time: 212 },   // E5
                    { note: 587.33, duration: 1, time: 213 },   // D5
                    { note: 523.25, duration: 1, time: 214 },   // C5
                    { note: 493.88, duration: 1, time: 215 },   // B4
                    { note: 440.00, duration: 1, time: 216 },   // A4
                    { note: 392.00, duration: 1, time: 217 },   // G4
                    { note: 440.00, duration: 1, time: 218 },   // A4
                    { note: 493.88, duration: 1, time: 219 },   // B4
                    { note: 523.25, duration: 1, time: 220 },   // C5
                    { note: 587.33, duration: 1, time: 221 },   // D5
                    { note: 659.25, duration: 1, time: 222 },   // E5
                    { note: 783.99, duration: 1, time: 223 },   // G5
                    { note: 880.00, duration: 1, time: 224 },   // A5
                    { note: 783.99, duration: 1, time: 225 },   // G5
                    { note: 659.25, duration: 1, time: 226 },   // E5
                    { note: 587.33, duration: 1, time: 227 },   // D5
                    { note: 523.25, duration: 2, time: 228 },   // C5
                    { note: 493.88, duration: 1, time: 230 },   // B4
                    { note: 440.00, duration: 1, time: 231 },   // A4
                    { note: 392.00, duration: 1, time: 232 },   // G4
                    { note: 440.00, duration: 1, time: 233 },   // A4
                    { note: 493.88, duration: 1, time: 234 },   // B4
                    { note: 523.25, duration: 1, time: 235 },   // C5
                    { note: 493.88, duration: 1, time: 236 },   // B4
                    { note: 440.00, duration: 1, time: 237 },   // A4
                    { note: 392.00, duration: 1, time: 238 },   // G4
                    { note: 349.23, duration: 1, time: 239 },   // F4
                    { note: 329.63, duration: 1, time: 240 },   // E4
                    { note: 293.66, duration: 1, time: 241 },   // D4
                    { note: 261.63, duration: 1, time: 242 },   // C4
                    { note: 293.66, duration: 1, time: 243 },   // D4
                    { note: 329.63, duration: 1, time: 244 },   // E4
                    { note: 349.23, duration: 1, time: 245 },   // F4
                    { note: 392.00, duration: 1, time: 246 },   // G4
                    { note: 440.00, duration: 1, time: 247 },   // A4
                    { note: 392.00, duration: 1, time: 248 },   // G4
                    { note: 349.23, duration: 1, time: 249 },   // F4
                    { note: 329.63, duration: 1, time: 250 },   // E4
                    { note: 293.66, duration: 1, time: 251 },   // D4
                    { note: 261.63, duration: 8, time: 252 }    // C4
                ];
                
                const bassLine = [
                    // 低音线 (与主旋律同步)
                    { note: 261.63, duration: 1, time: 0 },    // C4
                    { note: 293.66, duration: 1, time: 1 },    // D4
                    { note: 329.63, duration: 1, time: 2 },    // E4
                    { note: 392.00, duration: 1, time: 3 },    // G4
                    { note: 440.00, duration: 1, time: 4 },    // A4
                    { note: 392.00, duration: 1, time: 5 },    // G4
                    { note: 329.63, duration: 1, time: 6 },    // E4
                    { note: 293.66, duration: 1, time: 7 },    // D4
                    { note: 261.63, duration: 2, time: 8 },    // C4
                    { note: 293.66, duration: 1, time: 10 },   // D4
                    { note: 329.63, duration: 1, time: 11 },   // E4
                    { note: 392.00, duration: 1, time: 12 },   // G4
                    { note: 440.00, duration: 1, time: 13 },   // A4
                    { note: 493.88, duration: 1, time: 14 },   // B4
                    { note: 523.25, duration: 2, time: 15 },   // C5
                    { note: 493.88, duration: 1, time: 17 },   // B4
                    { note: 440.00, duration: 1, time: 18 },   // A4
                    { note: 392.00, duration: 1, time: 19 },   // G4
                    { note: 329.63, duration: 2, time: 20 },   // E4
                    { note: 293.66, duration: 2, time: 22 },   // D4
                    { note: 261.63, duration: 3, time: 24 },   // C4
                    { note: 293.66, duration: 3, time: 27 },   // D4
                    { note: 329.63, duration: 3, time: 30 },   // E4
                    { note: 293.66, duration: 3, time: 33 },   // D4
                    { note: 261.63, duration: 6, time: 36 },   // C4
                    
                    // 第二部分低音线
                    { note: 329.63, duration: 1.5, time: 60 },  // E4
                    { note: 392.00, duration: 1.5, time: 61.5 }, // G4
                    { note: 440.00, duration: 1.5, time: 63 },  // A4
                    { note: 493.88, duration: 1.5, time: 64.5 }, // B4
                    { note: 523.25, duration: 1.5, time: 66 },  // C5
                    { note: 493.88, duration: 1.5, time: 67.5 }, // B4
                    { note: 440.00, duration: 1.5, time: 69 },  // A4
                    { note: 392.00, duration: 1.5, time: 70.5 }, // G4
                    { note: 329.63, duration: 3, time: 72 },   // E4
                    { note: 293.66, duration: 3, time: 75 },   // D4
                    { note: 261.63, duration: 3, time: 78 },   // C4
                    { note: 293.66, duration: 3, time: 81 },   // D4
                    { note: 329.63, duration: 3, time: 84 },   // E4
                    { note: 392.00, duration: 3, time: 87 },   // G4
                    { note: 440.00, duration: 3, time: 90 },   // A4
                    { note: 392.00, duration: 3, time: 93 },   // G4
                    { note: 329.63, duration: 3, time: 96 },   // E4
                    { note: 293.66, duration: 6, time: 99 },   // D4
                    
                    // 第三部分低音线
                    { note: 261.63, duration: 1, time: 120 },  // C4
                    { note: 329.63, duration: 1, time: 121 },  // E4
                    { note: 392.00, duration: 1, time: 122 },  // G4
                    { note: 440.00, duration: 1, time: 123 },  // A4
                    { note: 493.88, duration: 1, time: 124 },  // B4
                    { note: 523.25, duration: 1, time: 125 },  // C5
                    { note: 493.88, duration: 1, time: 126 },  // B4
                    { note: 440.00, duration: 1, time: 127 },  // A4
                    { note: 392.00, duration: 1, time: 128 },  // G4
                    { note: 329.63, duration: 1, time: 129 },  // E4
                    { note: 293.66, duration: 1, time: 130 },  // D4
                    { note: 261.63, duration: 1, time: 131 },  // C4
                    { note: 293.66, duration: 1, time: 132 },  // D4
                    { note: 329.63, duration: 1, time: 133 },  // E4
                    { note: 392.00, duration: 1, time: 134 },  // G4
                    { note: 440.00, duration: 1, time: 135 },  // A4
                    { note: 392.00, duration: 1, time: 136 },  // G4
                    { note: 329.63, duration: 1, time: 137 },  // E4
                    { note: 293.66, duration: 1, time: 138 },  // D4
                    { note: 261.63, duration: 2, time: 139 },  // C4
                    { note: 293.66, duration: 2, time: 141 },  // D4
                    { note: 329.63, duration: 2, time: 143 },  // E4
                    { note: 392.00, duration: 2, time: 145 },  // G4
                    { note: 440.00, duration: 2, time: 147 },  // A4
                    { note: 392.00, duration: 2, time: 149 },  // G4
                    { note: 329.63, duration: 2, time: 151 },  // E4
                    { note: 293.66, duration: 4, time: 153 },  // D4
                    { note: 261.63, duration: 6, time: 157 },  // C4
                    
                    // 第四部分低音线
                    { note: 329.63, duration: 1, time: 180 },  // E4
                    { note: 392.00, duration: 1, time: 181 },  // G4
                    { note: 440.00, duration: 1, time: 182 },  // A4
                    { note: 493.88, duration: 1, time: 183 },  // B4
                    { note: 523.25, duration: 1, time: 184 },  // C5
                    { note: 493.88, duration: 1, time: 185 },  // B4
                    { note: 440.00, duration: 1, time: 186 },  // A4
                    { note: 392.00, duration: 1, time: 187 },  // G4
                    { note: 329.63, duration: 1, time: 188 },  // E4
                    { note: 293.66, duration: 1, time: 189 },  // D4
                    { note: 261.63, duration: 1, time: 190 },  // C4
                    { note: 293.66, duration: 1, time: 191 },  // D4
                    { note: 329.63, duration: 1, time: 192 },  // E4
                    { note: 392.00, duration: 1, time: 193 },  // G4
                    { note: 440.00, duration: 1, time: 194 },  // A4
                    { note: 392.00, duration: 1, time: 195 },  // G4
                    { note: 329.63, duration: 1, time: 196 },  // E4
                    { note: 293.66, duration: 1, time: 197 },  // D4
                    { note: 261.63, duration: 2, time: 198 },  // C4
                    { note: 293.66, duration: 2, time: 200 },  // D4
                    { note: 329.63, duration: 2, time: 202 },  // E4
                    { note: 392.00, duration: 2, time: 204 },  // G4
                    { note: 440.00, duration: 2, time: 206 },  // A4
                    { note: 392.00, duration: 2, time: 208 },  // G4
                    { note: 329.63, duration: 2, time: 210 },  // E4
                    { note: 293.66, duration: 2, time: 212 },  // D4
                    { note: 261.63, duration: 8, time: 214 },  // C4
                    
                    // 第五部分低音线
                    { note: 261.63, duration: 2, time: 240 },  // C4
                    { note: 293.66, duration: 2, time: 242 },  // D4
                    { note: 329.63, duration: 2, time: 244 },  // E4
                    { note: 349.23, duration: 2, time: 246 },  // F4
                    { note: 392.00, duration: 2, time: 248 },  // G4
                    { note: 440.00, duration: 2, time: 250 },  // A4
                    { note: 392.00, duration: 2, time: 252 },  // G4
                    { note: 349.23, duration: 2, time: 254 },  // F4
                    { note: 329.63, duration: 2, time: 256 },  // E4
                    { note: 293.66, duration: 2, time: 258 },  // D4
                    { note: 261.63, duration: 12, time: 260 }   // C4
                ];
                
                const harmony = [
                    // 和声部分
                    { note: 783.99, duration: 1, time: 0 },    // G5
                    { note: 880.00, duration: 1, time: 1 },    // A5
                    { note: 987.77, duration: 1, time: 2 },    // B5
                    { note: 1046.50, duration: 1, time: 3 },   // C6
                    { note: 987.77, duration: 1, time: 4 },    // B5
                    { note: 880.00, duration: 1, time: 5 },    // A5
                    { note: 783.99, duration: 1, time: 6 },    // G5
                    { note: 659.25, duration: 1, time: 7 },    // E5
                    { note: 587.33, duration: 2, time: 8 },    // D5
                    { note: 659.25, duration: 1, time: 10 },   // E5
                    { note: 783.99, duration: 1, time: 11 },   // G5
                    { note: 880.00, duration: 1, time: 12 },   // A5
                    { note: 987.77, duration: 1, time: 13 },   // B5
                    { note: 1046.50, duration: 1, time: 14 },  // C6
                    { note: 987.77, duration: 1, time: 15 },   // B5
                    { note: 880.00, duration: 1, time: 16 },   // A5
                    { note: 783.99, duration: 1, time: 17 },   // G5
                    { note: 659.25, duration: 1, time: 18 },   // E5
                    { note: 587.33, duration: 2, time: 19 },   // D5
                    { note: 523.25, duration: 2, time: 21 },   // C5
                    { note: 587.33, duration: 3, time: 23 },   // D5
                    { note: 659.25, duration: 3, time: 26 },   // E5
                    { note: 587.33, duration: 3, time: 29 },   // D5
                    { note: 523.25, duration: 6, time: 32 },   // C5
                    
                    // 第二部分和声
                    { note: 880.00, duration: 1.5, time: 60 }, // A5
                    { note: 987.77, duration: 1.5, time: 61.5 }, // B5
                    { note: 1046.50, duration: 1.5, time: 63 }, // C6
                    { note: 1174.66, duration: 1.5, time: 64.5 }, // D6
                    { note: 1046.50, duration: 1.5, time: 66 }, // C6
                    { note: 987.77, duration: 1.5, time: 67.5 }, // B5
                    { note: 880.00, duration: 1.5, time: 69 }, // A5
                    { note: 783.99, duration: 1.5, time: 70.5 }, // G5
                    { note: 659.25, duration: 3, time: 72 },  // E5
                    { note: 587.33, duration: 3, time: 75 },  // D5
                    { note: 523.25, duration: 3, time: 78 },  // C5
                    { note: 587.33, duration: 3, time: 81 },  // D5
                    { note: 659.25, duration: 3, time: 84 },  // E5
                    { note: 783.99, duration: 3, time: 87 },  // G5
                    { note: 880.00, duration: 3, time: 90 },  // A5
                    { note: 783.99, duration: 3, time: 93 },  // G5
                    { note: 659.25, duration: 3, time: 96 },  // E5
                    { note: 587.33, duration: 6, time: 99 },  // D5
                    
                    // 第三部分和声
                    { note: 783.99, duration: 1, time: 120 }, // G5
                    { note: 880.00, duration: 1, time: 121 }, // A5
                    { note: 987.77, duration: 1, time: 122 }, // B5
                    { note: 1046.50, duration: 1, time: 123 }, // C6
                    { note: 987.77, duration: 1, time: 124 }, // B5
                    { note: 880.00, duration: 1, time: 125 }, // A5
                    { note: 783.99, duration: 1, time: 126 }, // G5
                    { note: 659.25, duration: 1, time: 127 }, // E5
                    { note: 587.33, duration: 1, time: 128 }, // D5
                    { note: 523.25, duration: 1, time: 129 }, // C5
                    { note: 587.33, duration: 1, time: 130 }, // D5
                    { note: 659.25, duration: 1, time: 131 }, // E5
                    { note: 783.99, duration: 1, time: 132 }, // G5
                    { note: 880.00, duration: 1, time: 133 }, // A5
                    { note: 783.99, duration: 1, time: 134 }, // G5
                    { note: 659.25, duration: 1, time: 135 }, // E5
                    { note: 587.33, duration: 1, time: 136 }, // D5
                    { note: 523.25, duration: 2, time: 137 }, // C5
                    { note: 587.33, duration: 2, time: 139 }, // D5
                    { note: 659.25, duration: 2, time: 141 }, // E5
                    { note: 783.99, duration: 2, time: 143 }, // G5
                    { note: 880.00, duration: 2, time: 145 }, // A5
                    { note: 783.99, duration: 2, time: 147 }, // G5
                    { note: 659.25, duration: 2, time: 149 }, // E5
                    { note: 587.33, duration: 4, time: 151 }, // D5
                    { note: 523.25, duration: 6, time: 155 }, // C5
                    
                    // 第四部分和声
                    { note: 880.00, duration: 1, time: 180 }, // A5
                    { note: 987.77, duration: 1, time: 181 }, // B5
                    { note: 1046.50, duration: 1, time: 182 }, // C6
                    { note: 1174.66, duration: 1, time: 183 }, // D6
                    { note: 1046.50, duration: 1, time: 184 }, // C6
                    { note: 987.77, duration: 1, time: 185 }, // B5
                    { note: 880.00, duration: 1, time: 186 }, // A5
                    { note: 783.99, duration: 1, time: 187 }, // G5
                    { note: 659.25, duration: 1, time: 188 }, // E5
                    { note: 587.33, duration: 1, time: 189 }, // D5
                    { note: 523.25, duration: 1, time: 190 }, // C5
                    { note: 587.33, duration: 1, time: 191 }, // D5
                    { note: 659.25, duration: 1, time: 192 }, // E5
                    { note: 783.99, duration: 1, time: 193 }, // G5
                    { note: 880.00, duration: 1, time: 194 }, // A5
                    { note: 783.99, duration: 1, time: 195 }, // G5
                    { note: 659.25, duration: 1, time: 196 }, // E5
                    { note: 587.33, duration: 1, time: 197 }, // D5
                    { note: 523.25, duration: 2, time: 198 }, // C5
                    { note: 587.33, duration: 2, time: 200 }, // D5
                    { note: 659.25, duration: 2, time: 202 }, // E5
                    { note: 783.99, duration: 2, time: 204 }, // G5
                    { note: 880.00, duration: 2, time: 206 }, // A5
                    { note: 783.99, duration: 2, time: 208 }, // G5
                    { note: 659.25, duration: 2, time: 210 }, // E5
                    { note: 587.33, duration: 2, time: 212 }, // D5
                    { note: 523.25, duration: 8, time: 214 }, // C5
                    
                    // 第五部分和声
                    { note: 783.99, duration: 2, time: 240 }, // G5
                    { note: 880.00, duration: 2, time: 242 }, // A5
                    { note: 783.99, duration: 2, time: 244 }, // G5
                    { note: 659.25, duration: 2, time: 246 }, // E5
                    { note: 587.33, duration: 2, time: 248 }, // D5
                    { note: 523.25, duration: 2, time: 250 }, // C5
                    { note: 587.33, duration: 2, time: 252 }, // D5
                    { note: 659.25, duration: 2, time: 254 }, // E5
                    { note: 783.99, duration: 2, time: 256 }, // G5
                    { note: 880.00, duration: 2, time: 258 }, // A5
                    { note: 783.99, duration: 2, time: 260 }, // G5
                    { note: 659.25, duration: 2, time: 262 }, // E5
                    { note: 587.33, duration: 2, time: 264 }, // D5
                    { note: 523.25, duration: 12, time: 266 }  // C5
                ];
                
                // 播放旋律
                melody.forEach(note => {
                    const timeoutId = setTimeout(() => {
                        if (!this.musicEnabled || this.currentMusicType !== 'battle') return;
                        this.playMusicNote(note.note, note.duration, 'square');
                    }, note.time * 1000);
                    this.musicTimeouts.push(timeoutId);
                });
                
                // 播放低音线
                bassLine.forEach(note => {
                    const timeoutId = setTimeout(() => {
                        if (!this.musicEnabled || this.currentMusicType !== 'battle') return;
                        this.playMusicNote(note.note, note.duration, 'sawtooth');
                    }, note.time * 1000);
                    this.musicTimeouts.push(timeoutId);
                });
                
                // 播放和声
                harmony.forEach(note => {
                    const timeoutId = setTimeout(() => {
                        if (!this.musicEnabled || this.currentMusicType !== 'battle') return;
                        this.playMusicNote(note.note, note.duration, 'sine', 0.6);
                    }, note.time * 1000);
                    this.musicTimeouts.push(timeoutId);
                });
                
                // 循环播放
                const loopTimeoutId = setTimeout(() => {
                    if (this.musicEnabled && this.currentMusicType === 'battle') {
                        this.createBattleMusic();
                    }
                }, 300 * 1000);
                this.musicTimeouts.push(loopTimeoutId);
            }
            
            // 创建肉鸽模式音乐
            createRogueMusic() {
                if (!this.audioContext) return;
                
                // 创建一个18分钟的肉鸽模式音乐，旋律更丰富，时长更长
                const melody = [
                    // 第一部分：探索前奏 (0-120秒)
                    { note: 392.00, duration: 2, time: 0 },     // G4
                    { note: 440.00, duration: 2, time: 2 },     // A4
                    { note: 493.88, duration: 2, time: 4 },     // B4
                    { note: 523.25, duration: 2, time: 6 },     // C5
                    { note: 493.88, duration: 2, time: 8 },     // B4
                    { note: 440.00, duration: 2, time: 10 },    // A4
                    { note: 392.00, duration: 2, time: 12 },    // G4
                    { note: 349.23, duration: 2, time: 14 },    // F4
                    { note: 392.00, duration: 3, time: 16 },    // G4
                    { note: 440.00, duration: 3, time: 19 },    // A4
                    { note: 493.88, duration: 3, time: 22 },    // B4
                    { note: 440.00, duration: 3, time: 25 },    // A4
                    { note: 392.00, duration: 3, time: 28 },    // G4
                    { note: 349.23, duration: 6, time: 31 },    // F4
                    { note: 392.00, duration: 2, time: 37 },    // G4
                    { note: 440.00, duration: 2, time: 39 },    // A4
                    { note: 493.88, duration: 2, time: 41 },    // B4
                    { note: 523.25, duration: 2, time: 43 },    // C5
                    { note: 493.88, duration: 2, time: 45 },    // B4
                    { note: 440.00, duration: 2, time: 47 },    // A4
                    { note: 392.00, duration: 2, time: 49 },    // G4
                    { note: 349.23, duration: 4, time: 51 },    // F4
                    { note: 392.00, duration: 4, time: 55 },    // G4
                    { note: 440.00, duration: 2, time: 59 },    // A4
                    { note: 493.88, duration: 2, time: 61 },    // B4
                    { note: 523.25, duration: 2, time: 63 },    // C5
                    { note: 493.88, duration: 2, time: 65 },    // B4
                    { note: 440.00, duration: 2, time: 67 },    // A4
                    { note: 392.00, duration: 2, time: 69 },    // G4
                    { note: 349.23, duration: 2, time: 71 },    // F4
                    { note: 392.00, duration: 3, time: 73 },    // G4
                    { note: 440.00, duration: 3, time: 76 },    // A4
                    { note: 493.88, duration: 3, time: 79 },    // B4
                    { note: 440.00, duration: 3, time: 82 },    // A4
                    { note: 392.00, duration: 3, time: 85 },    // G4
                    { note: 349.23, duration: 6, time: 88 },    // F4
                    { note: 392.00, duration: 4, time: 94 },    // G4
                    { note: 440.00, duration: 4, time: 98 },    // A4
                    { note: 493.88, duration: 4, time: 102 },   // B4
                    { note: 523.25, duration: 6, time: 106 },   // C5
                    
                    // 第二部分：冒险旋律 (120-360秒)
                    { note: 440.00, duration: 1.5, time: 120 },  // A4
                    { note: 493.88, duration: 1.5, time: 121.5 }, // B4
                    { note: 523.25, duration: 1.5, time: 123 },  // C5
                    { note: 587.33, duration: 1.5, time: 124.5 }, // D5
                    { note: 523.25, duration: 1.5, time: 126 },  // C5
                    { note: 493.88, duration: 1.5, time: 127.5 }, // B4
                    { note: 440.00, duration: 2, time: 129 },    // A4
                    { note: 493.88, duration: 1.5, time: 131 },  // B4
                    { note: 523.25, duration: 1.5, time: 132.5 }, // C5
                    { note: 587.33, duration: 1.5, time: 134 },  // D5
                    { note: 659.25, duration: 1.5, time: 135.5 }, // E5
                    { note: 587.33, duration: 2, time: 137 },    // D5
                    { note: 523.25, duration: 1.5, time: 139 },  // C5
                    { note: 493.88, duration: 1.5, time: 140.5 }, // B4
                    { note: 440.00, duration: 2, time: 142 },    // A4
                    { note: 392.00, duration: 1.5, time: 144 },  // G4
                    { note: 440.00, duration: 1.5, time: 145.5 }, // A4
                    { note: 493.88, duration: 1.5, time: 147 },  // B4
                    { note: 523.25, duration: 3, time: 148.5 },  // C5
                    { note: 493.88, duration: 2, time: 151.5 }, // B4
                    { note: 440.00, duration: 2, time: 153.5 }, // A4
                    { note: 392.00, duration: 2, time: 155.5 }, // G4
                    { note: 349.23, duration: 2, time: 157.5 }, // F4
                    { note: 392.00, duration: 2, time: 159.5 }, // G4
                    { note: 440.00, duration: 2, time: 161.5 }, // A4
                    { note: 493.88, duration: 2, time: 163.5 }, // B4
                    { note: 523.25, duration: 4, time: 165.5 }, // C5
                    { note: 493.88, duration: 2, time: 169.5 }, // B4
                    { note: 440.00, duration: 2, time: 171.5 }, // A4
                    { note: 392.00, duration: 2, time: 173.5 }, // G4
                    { note: 349.23, duration: 4, time: 175.5 }, // F4
                    { note: 392.00, duration: 4, time: 179.5 }, // G4
                    { note: 440.00, duration: 2, time: 183.5 }, // A4
                    { note: 493.88, duration: 2, time: 185.5 }, // B4
                    { note: 523.25, duration: 2, time: 187.5 }, // C5
                    { note: 587.33, duration: 2, time: 189.5 }, // D5
                    { note: 659.25, duration: 2, time: 191.5 }, // E5
                    { note: 783.99, duration: 2, time: 193.5 }, // G5
                    { note: 659.25, duration: 2, time: 195.5 }, // E5
                    { note: 587.33, duration: 2, time: 197.5 }, // D5
                    { note: 523.25, duration: 4, time: 199.5 }, // C5
                    { note: 493.88, duration: 4, time: 203.5 }, // B4
                    { note: 440.00, duration: 4, time: 207.5 }, // A4
                    { note: 392.00, duration: 6, time: 211.5 }, // G4
                    
                    // 第三部分：探索变奏 (360-600秒)
                    { note: 523.25, duration: 1.5, time: 360 },  // C5
                    { note: 587.33, duration: 1.5, time: 361.5 }, // D5
                    { note: 659.25, duration: 1.5, time: 363 },  // E5
                    { note: 783.99, duration: 1.5, time: 364.5 }, // G5
                    { note: 659.25, duration: 1.5, time: 366 },  // E5
                    { note: 587.33, duration: 1.5, time: 367.5 }, // D5
                    { note: 523.25, duration: 2, time: 369 },    // C5
                    { note: 587.33, duration: 1.5, time: 371 },  // D5
                    { note: 659.25, duration: 1.5, time: 372.5 }, // E5
                    { note: 783.99, duration: 1.5, time: 374 },  // G5
                    { note: 659.25, duration: 1.5, time: 375.5 }, // E5
                    { note: 587.33, duration: 1.5, time: 377 },  // D5
                    { note: 523.25, duration: 2, time: 378.5 },  // C5
                    { note: 493.88, duration: 2, time: 380.5 }, // B4
                    { note: 440.00, duration: 2, time: 382.5 }, // A4
                    { note: 392.00, duration: 2, time: 384.5 }, // G4
                    { note: 349.23, duration: 4, time: 386.5 }, // F4
                    { note: 392.00, duration: 4, time: 390.5 }, // G4
                    { note: 440.00, duration: 2, time: 394.5 }, // A4
                    { note: 493.88, duration: 2, time: 396.5 }, // B4
                    { note: 523.25, duration: 2, time: 398.5 }, // C5
                    { note: 493.88, duration: 2, time: 400.5 }, // B4
                    { note: 440.00, duration: 2, time: 402.5 }, // A4
                    { note: 392.00, duration: 2, time: 404.5 }, // G4
                    { note: 349.23, duration: 6, time: 406.5 }, // F4
                    { note: 392.00, duration: 6, time: 412.5 }, // G4
                    { note: 440.00, duration: 1.5, time: 418.5 }, // A4
                    { note: 493.88, duration: 1.5, time: 420 },  // B4
                    { note: 523.25, duration: 1.5, time: 421.5 }, // C5
                    { note: 587.33, duration: 1.5, time: 423 },  // D5
                    { note: 659.25, duration: 1.5, time: 424.5 }, // E5
                    { note: 783.99, duration: 1.5, time: 426 },  // G5
                    { note: 880.00, duration: 1.5, time: 427.5 }, // A5
                    { note: 783.99, duration: 1.5, time: 429 },  // G5
                    { note: 659.25, duration: 1.5, time: 430.5 }, // E5
                    { note: 587.33, duration: 1.5, time: 432 },  // D5
                    { note: 523.25, duration: 2, time: 433.5 },  // C5
                    { note: 493.88, duration: 2, time: 435.5 }, // B4
                    { note: 440.00, duration: 2, time: 437.5 }, // A4
                    { note: 392.00, duration: 4, time: 439.5 }, // G4
                    { note: 349.23, duration: 4, time: 443.5 }, // F4
                    { note: 392.00, duration: 6, time: 447.5 }, // G4
                    
                    // 第四部分：冒险高潮 (600-720秒)
                    { note: 440.00, duration: 1, time: 600 },    // A4
                    { note: 493.88, duration: 1, time: 601 },    // B4
                    { note: 523.25, duration: 1, time: 602 },    // C5
                    { note: 587.33, duration: 1, time: 603 },    // D5
                    { note: 659.25, duration: 1, time: 604 },    // E5
                    { note: 783.99, duration: 1, time: 605 },    // G5
                    { note: 880.00, duration: 1, time: 606 },    // A5
                    { note: 783.99, duration: 1, time: 607 },    // G5
                    { note: 659.25, duration: 1, time: 608 },    // E5
                    { note: 587.33, duration: 1, time: 609 },    // D5
                    { note: 523.25, duration: 1, time: 610 },    // C5
                    { note: 493.88, duration: 1, time: 611 },    // B4
                    { note: 440.00, duration: 1, time: 612 },    // A4
                    { note: 392.00, duration: 2, time: 613 },    // G4
                    { note: 440.00, duration: 1, time: 615 },    // A4
                    { note: 493.88, duration: 1, time: 616 },    // B4
                    { note: 523.25, duration: 1, time: 617 },    // C5
                    { note: 587.33, duration: 1, time: 618 },    // D5
                    { note: 659.25, duration: 1, time: 619 },    // E5
                    { note: 783.99, duration: 1, time: 620 },    // G5
                    { note: 659.25, duration: 1, time: 621 },    // E5
                    { note: 587.33, duration: 1, time: 622 },    // D5
                    { note: 523.25, duration: 1, time: 623 },    // C5
                    { note: 493.88, duration: 1, time: 624 },    // B4
                    { note: 440.00, duration: 1, time: 625 },    // A4
                    { note: 392.00, duration: 3, time: 626 },    // G4
                    { note: 440.00, duration: 2, time: 629 },    // A4
                    { note: 493.88, duration: 2, time: 631 },    // B4
                    { note: 523.25, duration: 2, time: 633 },    // C5
                    { note: 493.88, duration: 2, time: 635 },    // B4
                    { note: 440.00, duration: 2, time: 637 },    // A4
                    { note: 392.00, duration: 2, time: 639 },    // G4
                    { note: 349.23, duration: 4, time: 641 },    // F4
                    { note: 392.00, duration: 6, time: 645 },    // G4
                    
                    // 第五部分：神秘探索 (720-900秒)
                    { note: 349.23, duration: 2, time: 720 },    // F4
                    { note: 392.00, duration: 2, time: 722 },    // G4
                    { note: 440.00, duration: 2, time: 724 },    // A4
                    { note: 493.88, duration: 2, time: 726 },    // B4
                    { note: 440.00, duration: 2, time: 728 },    // A4
                    { note: 392.00, duration: 2, time: 730 },    // G4
                    { note: 349.23, duration: 2, time: 732 },    // F4
                    { note: 392.00, duration: 3, time: 734 },    // G4
                    { note: 440.00, duration: 3, time: 737 },    // A4
                    { note: 493.88, duration: 3, time: 740 },    // B4
                    { note: 440.00, duration: 3, time: 743 },    // A4
                    { note: 392.00, duration: 3, time: 746 },    // G4
                    { note: 349.23, duration: 6, time: 749 },    // F4
                    { note: 392.00, duration: 4, time: 755 },    // G4
                    { note: 440.00, duration: 4, time: 759 },    // A4
                    { note: 493.88, duration: 4, time: 763 },    // B4
                    { note: 523.25, duration: 6, time: 767 },    // C5
                    
                    // 第六部分：冒险终章 (900-1080秒)
                    { note: 440.00, duration: 1.5, time: 900 },  // A4
                    { note: 493.88, duration: 1.5, time: 901.5 }, // B4
                    { note: 523.25, duration: 1.5, time: 903 },  // C5
                    { note: 587.33, duration: 1.5, time: 904.5 }, // D5
                    { note: 659.25, duration: 1.5, time: 906 },  // E5
                    { note: 783.99, duration: 1.5, time: 907.5 }, // G5
                    { note: 880.00, duration: 1.5, time: 909 },  // A5
                    { note: 783.99, duration: 1.5, time: 910.5 }, // G5
                    { note: 659.25, duration: 1.5, time: 912 },  // E5
                    { note: 587.33, duration: 1.5, time: 913.5 }, // D5
                    { note: 523.25, duration: 2, time: 915 },    // C5
                    { note: 493.88, duration: 2, time: 917 },    // B4
                    { note: 440.00, duration: 2, time: 919 },    // A4
                    { note: 392.00, duration: 2, time: 921 },    // G4
                    { note: 349.23, duration: 3, time: 923 },    // F4
                    { note: 392.00, duration: 3, time: 926 },    // G4
                    { note: 440.00, duration: 3, time: 929 },    // A4
                    { note: 493.88, duration: 3, time: 932 },    // B4
                    { note: 523.25, duration: 4, time: 935 },    // C5
                    { note: 493.88, duration: 3, time: 939 },    // B4
                    { note: 440.00, duration: 3, time: 942 },    // A4
                    { note: 392.00, duration: 3, time: 945 },    // G4
                    { note: 349.23, duration: 6, time: 948 },    // F4
                    { note: 392.00, duration: 6, time: 954 },    // G4
                    { note: 440.00, duration: 4, time: 960 },    // A4
                    { note: 493.88, duration: 4, time: 964 },    // B4
                    { note: 523.25, duration: 6, time: 968 },    // C5
                    { note: 493.88, duration: 4, time: 974 },    // B4
                    { note: 440.00, duration: 4, time: 978 },    // A4
                    { note: 392.00, duration: 4, time: 982 },    // G4
                    { note: 349.23, duration: 6, time: 986 },    // F4
                    { note: 392.00, duration: 8, time: 992 }     // G4
                ];
                
                const bassLine = [
                    // 低音线 - 肉鸽模式风格的深沉低音
                    { note: 196.00, duration: 4, time: 0 },     // G3
                    { note: 220.00, duration: 4, time: 4 },     // A3
                    { note: 246.94, duration: 4, time: 8 },     // B3
                    { note: 261.63, duration: 4, time: 12 },    // C4
                    { note: 246.94, duration: 4, time: 16 },    // B3
                    { note: 220.00, duration: 4, time: 20 },    // A3
                    { note: 196.00, duration: 4, time: 24 },    // G3
                    { note: 174.61, duration: 8, time: 28 },    // F3
                    { note: 196.00, duration: 4, time: 36 },    // G3
                    { note: 220.00, duration: 4, time: 40 },    // A3
                    { note: 246.94, duration: 4, time: 44 },    // B3
                    { note: 261.63, duration: 4, time: 48 },    // C4
                    { note: 246.94, duration: 4, time: 52 },    // B3
                    { note: 220.00, duration: 4, time: 56 },    // A3
                    { note: 196.00, duration: 4, time: 60 },    // G3
                    { note: 174.61, duration: 8, time: 64 },    // F3
                    { note: 196.00, duration: 4, time: 72 },    // G3
                    { note: 220.00, duration: 4, time: 76 },    // A3
                    { note: 246.94, duration: 4, time: 80 },    // B3
                    { note: 261.63, duration: 4, time: 84 },    // C4
                    { note: 246.94, duration: 4, time: 88 },    // B3
                    { note: 220.00, duration: 4, time: 92 },    // A3
                    { note: 196.00, duration: 8, time: 96 },    // G3
                    { note: 174.61, duration: 8, time: 104 },   // F3
                    { note: 196.00, duration: 8, time: 112 },   // G3
                    { note: 220.00, duration: 8, time: 120 },   // A3
                    { note: 246.94, duration: 8, time: 128 },   // B3
                    { note: 261.63, duration: 12, time: 136 },  // C4
                    { note: 246.94, duration: 12, time: 148 },  // B3
                    { note: 220.00, duration: 12, time: 160 },  // A3
                    { note: 196.00, duration: 12, time: 172 },  // G3
                    { note: 174.61, duration: 12, time: 184 },  // F3
                    { note: 196.00, duration: 12, time: 196 },  // G3
                    { note: 220.00, duration: 12, time: 208 },  // A3
                    { note: 246.94, duration: 12, time: 220 },  // B3
                    { note: 261.63, duration: 12, time: 232 },  // C4
                    { note: 246.94, duration: 12, time: 244 },  // B3
                    { note: 220.00, duration: 12, time: 256 },  // A3
                    { note: 196.00, duration: 12, time: 268 },  // G3
                    { note: 174.61, duration: 12, time: 280 },  // F3
                    { note: 196.00, duration: 12, time: 292 },  // G3
                    { note: 220.00, duration: 12, time: 304 },  // A3
                    { note: 246.94, duration: 12, time: 316 },  // B3
                    { note: 261.63, duration: 12, time: 328 }   // C4
                ];
                
                const harmony = [
                    // 和声部分 - 肉鸽模式风格的神秘和声
                    { note: 392.00, duration: 4, time: 4 },     // G4
                    { note: 440.00, duration: 4, time: 8 },     // A4
                    { note: 493.88, duration: 4, time: 12 },    // B4
                    { note: 523.25, duration: 4, time: 16 },    // C5
                    { note: 493.88, duration: 4, time: 20 },    // B4
                    { note: 440.00, duration: 4, time: 24 },    // A4
                    { note: 392.00, duration: 8, time: 28 },    // G4
                    { note: 440.00, duration: 4, time: 36 },    // A4
                    { note: 493.88, duration: 4, time: 40 },    // B4
                    { note: 523.25, duration: 4, time: 44 },    // C5
                    { note: 587.33, duration: 4, time: 48 },    // D5
                    { note: 523.25, duration: 4, time: 52 },    // C5
                    { note: 493.88, duration: 4, time: 56 },    // B4
                    { note: 440.00, duration: 8, time: 60 },    // A4
                    { note: 392.00, duration: 8, time: 68 },    // G4
                    { note: 440.00, duration: 4, time: 76 },    // A4
                    { note: 493.88, duration: 4, time: 80 },    // B4
                    { note: 523.25, duration: 4, time: 84 },    // C5
                    { note: 587.33, duration: 4, time: 88 },    // D5
                    { note: 523.25, duration: 4, time: 92 },    // C5
                    { note: 493.88, duration: 4, time: 96 },    // B4
                    { note: 440.00, duration: 8, time: 100 },   // A4
                    { note: 392.00, duration: 8, time: 108 },   // G4
                    { note: 440.00, duration: 8, time: 116 },   // A4
                    { note: 493.88, duration: 8, time: 124 },   // B4
                    { note: 523.25, duration: 12, time: 132 },  // C5
                    { note: 493.88, duration: 12, time: 144 },  // B4
                    { note: 440.00, duration: 12, time: 156 },  // A4
                    { note: 392.00, duration: 12, time: 168 },  // G4
                    { note: 440.00, duration: 12, time: 180 },  // A4
                    { note: 493.88, duration: 12, time: 192 },  // B4
                    { note: 523.25, duration: 12, time: 204 },  // C5
                    { note: 587.33, duration: 12, time: 216 },  // D5
                    { note: 523.25, duration: 12, time: 228 },  // C5
                    { note: 493.88, duration: 12, time: 240 },  // B4
                    { note: 440.00, duration: 12, time: 252 },  // A4
                    { note: 392.00, duration: 12, time: 264 },  // G4
                    { note: 440.00, duration: 12, time: 276 },  // A4
                    { note: 493.88, duration: 12, time: 288 },  // B4
                    { note: 523.25, duration: 12, time: 300 },  // C5
                    { note: 493.88, duration: 12, time: 312 },  // B4
                    { note: 440.00, duration: 12, time: 324 }   // A4
                ];
                
                // 播放主旋律
                melody.forEach(note => {
                    const timeoutId = setTimeout(() => {
                        if (this.musicEnabled && this.currentMusicType === 'rogue') {
                            this.playMusicNote(note.note, note.duration, 'sine', 0.8);
                        }
                    }, note.time * 1000);
                    this.musicTimeouts.push(timeoutId);
                });
                
                // 播放低音线
                bassLine.forEach(note => {
                    const timeoutId = setTimeout(() => {
                        if (this.musicEnabled && this.currentMusicType === 'rogue') {
                            this.playMusicNote(note.note, note.duration, 'triangle', 0.6);
                        }
                    }, note.time * 1000);
                    this.musicTimeouts.push(timeoutId);
                });
                
                // 播放和声
                harmony.forEach(note => {
                    const timeoutId = setTimeout(() => {
                        if (this.musicEnabled && this.currentMusicType === 'rogue') {
                            this.playMusicNote(note.note, note.duration, 'sine', 0.4);
                        }
                    }, note.time * 1000);
                    this.musicTimeouts.push(timeoutId);
                });
                
                // 循环播放
                const loopTimeoutId = setTimeout(() => {
                    if (this.musicEnabled && this.currentMusicType === 'rogue') {
                        this.createRogueMusic();
                    }
                }, 1080 * 1000);
                this.musicTimeouts.push(loopTimeoutId);
            }
            
            // 播放回合结束音效
            playTurnEndSound() {
                if (!this.sfxEnabled) return;
                
                try {
                    const sound = this.createOscillatorSound(329.63, 0.2, 'triangle'); // E4音
                    sound.start();
                    sound.stop(sound.context.currentTime + 0.2);
                } catch (e) {
                    console.log('播放回合结束音效失败:', e);
                }
            }
            
            // 切换音乐
            toggleMusic() {
                this.musicEnabled = !this.musicEnabled;
                
                if (this.musicEnabled) {
                    this.playBackgroundMusic();
                } else {
                    this.bgMusicPlaying = false;
                }
                
                document.getElementById('music-status').textContent = 
                    `音乐: ${this.musicEnabled ? '开' : '关'}`;
                
                this.playButtonSound();
            }
            
            // 切换音效
            toggleSFX() {
                this.sfxEnabled = !this.sfxEnabled;
                document.getElementById('sfx-status').textContent = 
                    `音效: ${this.sfxEnabled ? '开' : '关'}`;
                
                this.playButtonSound();
            }
            
            // 设置音乐音量
            setMusicVolume(volume) {
                this.musicVolume = Math.max(0, Math.min(1, volume));
                this.updateMusicVolume();
            }
            
            // 设置对战音乐音量
            setBattleMusicVolume(volume) {
                this.battleMusicVolume = Math.max(0, Math.min(1, volume));
            }
            
            // 设置联机大厅音乐音量
            setLobbyMusicVolume(volume) {
                this.lobbyMusicVolume = Math.max(0, Math.min(1, volume));
            }
            
            // 更新音乐音量
            updateMusicVolume() {
                // 音乐音量会在每次播放时应用
            }
            
            // 设置音效音量
            setSFXVolume(volume) {
                this.sfxVolume = Math.max(0, Math.min(1, volume));
            }
            
            // 设置触摸事件支持
            setupTouchSupport() {
                // 阻止触摸事件的默认行为，防止页面滚动
                document.addEventListener('touchstart', function(e) {
                    e.preventDefault();
                }, { passive: false });
                
                document.addEventListener('touchmove', function(e) {
                    e.preventDefault();
                }, { passive: false });
            }
        }

        // ==================== 道具卡牌管理器 (完整版) ====================
        class CardManager {
            constructor() {
                this.cardDefinitions = this.initializeCardDefinitions();
            }
            
            initializeCardDefinitions() {
                return {
                    // 新增道具
                    ghostHand: {
                        id: 'ghostHand',
                        name: '鬼手',
                        type: 'stone',
                        category: 'special',
                        description: '选择一名其他玩家，获得其三张手牌',
                        effect: 'ghost_hand',
                        rarity: 'uncommon',
                        icon: 'fa-hand-sparkles',
                        count: 12,
                        needsTarget: true
                    },
                    lightning: {
                        id: 'lightning',
                        name: '雷电',
                        type: 'item',
                        category: 'special',
                        description: '放下去后，所有人依次顺时针判定花色【布】，最后那个人直接减少百分之五十的牌',
                        effect: 'lightning',
                        rarity: 'uncommon',
                        icon: 'fa-bolt',
                        count: 2,
                        needsTarget: false
                    },
                    mutualDestruction: {
                        id: 'mutualDestruction',
                        name: '两败俱伤',
                        type: 'item',
                        category: 'special',
                        description: '条件：自己上一回合打出的花色和对手的花色一致发动。效果：使受到攻击的对手弃与当前回合打出花色的全部相同花色的卡牌【双方】',
                        effect: 'mutual_destruction',
                        rarity: 'uncommon',
                        icon: 'fa-explosion',
                        count: 2,
                        needsTarget: true
                    },
                    reverse: {
                        id: 'reverse',
                        name: '让局势反转罢',
                        type: 'scissors',
                        category: 'special',
                        description: '在对战中：打出让局势反转罢后，当前出牌效果相反，特殊牌之后再解释【只针对花色牌】',
                        effect: 'reverse',
                        rarity: 'uncommon',
                        icon: 'fa-sync-alt',
                        count: 3,
                        needsTarget: false
                    },
                    bluff: {
                        id: 'bluff',
                        name: '虚张声势',
                        type: 'cloth',
                        category: 'special',
                        description: '当有玩家打出与本牌相同的花色时，玩家可以选择对牌无效化，并收入进自己牌中',
                        effect: 'bluff',
                        rarity: 'uncommon',
                        icon: 'fa-mask',
                        count: 6,
                        needsTarget: false
                    },
                    cheat: {
                        id: 'cheat',
                        name: '出老千',
                        type: 'stone',
                        category: 'special',
                        description: '你须交给上家下家各一张牌，然后视为使用一张指定的任意牌',
                        effect: 'cheat',
                        rarity: 'uncommon',
                        icon: 'fa-dice',
                        count: 3,
                        needsTarget: false
                    },
                    moreCards: {
                        id: 'moreCards',
                        name: '多多益善',
                        type: 'scissors',
                        category: 'special',
                        description: '所有人下一回合出牌多出一张',
                        effect: 'more_cards',
                        rarity: 'uncommon',
                        icon: 'fa-cards',
                        count: 3,
                        needsTarget: false
                    },
                    feast: {
                        id: 'feast',
                        name: '吃席',
                        type: 'item',
                        category: 'special',
                        description: '所有玩家依次摸两张牌；本回合结束时，若有玩家死亡过，你额外摸四张牌',
                        effect: 'feast',
                        rarity: 'uncommon',
                        icon: 'fa-utensils',
                        count: 2,
                        needsTarget: false
                    },
                    forceSave: {
                        id: 'forceSave',
                        name: '强制保命',
                        type: 'cloth',
                        category: 'defense',
                        description: '三回合内玩家手牌固定在十张或十张以上',
                        effect: 'force_save',
                        rarity: 'uncommon',
                        icon: 'fa-shield-alt',
                        count: 3,
                        needsTarget: false
                    },
                    sellCloth: {
                        id: 'sellCloth',
                        name: '卖布',
                        type: 'stone',
                        category: 'special',
                        description: '丢弃一张布花色牌，并从牌堆摸两张牌',
                        effect: 'sell_cloth',
                        rarity: 'common',
                        icon: 'fa-store',
                        count: 9,
                        needsTarget: false
                    },

                    gamblersWheel: {
                        id: 'gamblersWheel',
                        name: '赌徒的转盘',
                        type: 'item',
                        category: 'special',
                        description: '使用此牌后，指定一名玩家，等待下一回合，使用者猜指定者下一张牌的花色，猜对则获得此牌，并从牌堆获得6张牌，猜错则失去此牌，并强制扣除6张牌',
                        effect: 'gamblers_wheel',
                        rarity: 'uncommon',
                        icon: 'fa-circle-notch',
                        count: 2,
                        needsTarget: true
                    },
                    resurrection: {
                        id: 'resurrection',
                        name: '复活吧！',
                        type: 'item',
                        category: 'special',
                        description: '将死去玩家以0张牌复活，使用者可以使用一次死去玩家的技能，使用完就死去，玩家也可以给与牌让其拥有血量，但是并不算结盟',
                        effect: 'resurrection',
                        rarity: 'epic',
                        icon: 'fa-heartbeat',
                        count: 1,
                        needsTarget: true
                    },
                    game: {
                        id: 'game',
                        name: '博弈',
                        type: 'scissors',
                        category: 'special',
                        description: '使用之后强制指定一名玩家倒扣卡牌，如果花色一致，则双方各自从牌堆获得三张牌，如果不一致，则使用者直接从指定玩家牌中抽取6张丢弃',
                        effect: 'game',
                        rarity: 'uncommon',
                        icon: 'fa-chess',
                        count: 3,
                        needsTarget: true
                    },
                    // 攻击类道具
                    killMind: {
                        id: 'killMind',
                        name: '杀人诛心',
                        type: 'cloth',
                        category: 'attack',
                        description: '选择一名其他玩家，弃置其三张手牌',
                        effect: 'discard_three',
                        rarity: 'common',
                        icon: 'fa-skull',
                        count: 15,
                        needsTarget: true
                    },
                    swap: {
                        id: 'swap',
                        name: '互换',
                        type: 'stone',
                        category: 'special',
                        description: '选择一名其他玩家，获得其三张手牌，然后其获得你三张手牌',
                        effect: 'swap_cards',
                        rarity: 'common',
                        icon: 'fa-exchange-alt',
                        count: 15,
                        needsTarget: true
                    },
                    whiteFlag: {
                        id: 'whiteFlag',
                        name: '白旗',
                        type: 'scissors',
                        category: 'defense',
                        description: '本回合防止除引战、药类外的所有被弃置/被获得效果',
                        effect: 'immune_once',
                        rarity: 'common',
                        icon: 'fa-flag',
                        count: 15,
                        needsTarget: false
                    },
                    greenHat: {
                        id: 'greenHat',
                        name: '绿帽',
                        type: 'cloth',
                        category: 'special',
                        description: '选择一名其他玩家，将四张牌交给其；当其他玩家死亡时，你可以打出此牌',
                        effect: 'give_four',
                        rarity: 'uncommon',
                        icon: 'fa-hat-cowboy',
                        count: 9,
                        needsTarget: true
                    },
                    bullBull: {
                        id: 'bullBull',
                        name: '牛牛弹',
                        type: 'stone',
                        category: 'attack',
                        description: '选择一名玩家，弃置其三张手牌，然后令其弃置你三张手牌',
                        effect: 'mutual_discard',
                        rarity: 'common',
                        icon: 'fa-bomb',
                        count: 12,
                        needsTarget: true
                    },
                    poison: {
                        id: 'poison',
                        name: '毒药',
                        type: 'item',
                        category: 'special',
                        description: '选择一名玩家获取六张牌',
                        effect: 'gain_six',
                        rarity: 'epic',
                        icon: 'fa-skull-crossbones',
                        count: 1,
                        needsTarget: true
                    },
                    antidote: {
                        id: 'antidote',
                        name: '解药',
                        type: 'item',
                        category: 'special',
                        description: '选择一名玩家，你将此牌交给该角色，然后你获得其三张牌',
                        effect: 'antidote_effect',
                        rarity: 'epic',
                        icon: 'fa-prescription-bottle',
                        count: 1,
                        needsTarget: true
                    },
                    cross: {
                        id: 'cross',
                        name: '十字架',
                        type: 'item',
                        category: 'special',
                        description: '从弃牌堆中选择三张手牌，然后将其置入你的手牌中',
                        effect: 'recycle_three',
                        rarity: 'common',
                        icon: 'fa-cross',
                        count: 16,
                        needsTarget: false
                    },
                    provoke: {
                        id: 'provoke',
                        name: '引战',
                        type: 'cloth',
                        category: 'attack',
                        description: '令所有其他玩家依次将两张手牌交给你',
                        effect: 'provoke_all',
                        rarity: 'rare',
                        icon: 'fa-fire',
                        count: 3,
                        needsTarget: false
                    },
                    meToo: {
                        id: 'meToo',
                        name: '俺也一样',
                        type: 'item',
                        category: 'special',
                        description: '选择一张其他玩家扣置的手牌，并将此卡当作该卡打出',
                        effect: 'copy_card',
                        rarity: 'common',
                        icon: 'fa-copy',
                        count: 16,
                        needsTarget: true
                    },
                    balance: {
                        id: 'balance',
                        name: '制衡',
                        type: 'item',
                        category: 'special',
                        description: '你可以将任意牌交给一名其他玩家或已死亡玩家，然后本回合非你上下家无法对你使用牌或技能',
                        effect: 'balance_effect',
                        rarity: 'epic',
                        icon: 'fa-balance-scale',
                        count: 1,
                        needsTarget: false
                    },
                    forbiddenPass: {
                        id: 'forbiddenPass',
                        name: '禁止通行',
                        type: 'stone',
                        category: 'special',
                        description: '指定一名玩家暂停出牌3次，该玩家防止被弃置/被获得效果，回合结束后你可抽取该玩家3张牌',
                        effect: 'forbid_player',
                        rarity: 'uncommon',
                        icon: 'fa-ban',
                        count: 3,
                        needsTarget: true
                    },

                    openPai: {
                        id: 'openPai',
                        name: '开摆',
                        type: 'scissors',
                        category: 'defense',
                        description: '使用此牌后，三回合内你防止被弃置/被获得效果，并且你无法弃置其他玩家手牌',
                        effect: 'open_pai',
                        rarity: 'uncommon',
                        icon: 'fa-hand-peace',
                        count: 9,
                        needsTarget: false
                    },
                    unitedTreaty: {
                        id: 'unitedTreaty',
                        name: '团结协约',
                        type: 'item',
                        category: 'special',
                        description: '选择一名玩家，然后双方无法弃置对方手牌，你们的胜利条件更改为一致',
                        effect: 'united_treaty',
                        rarity: 'epic',
                        icon: 'fa-handshake',
                        count: 1,
                        needsTarget: true
                    },
                    oldCheat: {
                        id: 'oldCheat',
                        name: '出老千',
                        type: 'scissors',
                        category: 'special',
                        description: '你须交给上家下家各一张牌，然后视为使用一张指定的任意牌',
                        effect: 'old_cheat',
                        rarity: 'uncommon',
                        icon: 'fa-dice',
                        count: 3,
                        needsTarget: false
                    },
                    moreBetter: {
                        id: 'moreBetter',
                        name: '多多益善',
                        type: 'cloth',
                        category: 'special',
                        description: '所有人下一回合出牌多出一张',
                        effect: 'more_better',
                        rarity: 'uncommon',
                        icon: 'fa-gem',
                        count: 3,
                        needsTarget: false
                    },
                    eatFeast: {
                        id: 'eatFeast',
                        name: '吃席',
                        type: 'item',
                        category: 'special',
                        description: '所有玩家依次摸两张牌；本回合结束时，若有玩家死亡过，你额外摸四张牌',
                        effect: 'eat_feast',
                        rarity: 'uncommon',
                        icon: 'fa-utensils',
                        count: 2,
                        needsTarget: false
                    },
                    forceSave: {
                        id: 'forceSave',
                        name: '强制保命',
                        type: 'stone',
                        category: 'defense',
                        description: '三回合内玩家手牌固定在十张或十张以上',
                        effect: 'force_save',
                        rarity: 'uncommon',
                        icon: 'fa-shield-alt',
                        count: 3,
                        needsTarget: false
                    },
                    endure: {
                        id: 'endure',
                        name: '忍让',
                        type: 'scissors',
                        category: 'special',
                        description: '此回合停止出牌，下回合可出两张',
                        effect: 'endure',
                        rarity: 'common',
                        icon: 'fa-fist-raised',
                        count: 6,
                        needsTarget: false
                    },
                    digGarbage: {
                        id: 'digGarbage',
                        name: '掏垃圾',
                        type: 'cloth',
                        category: 'special',
                        description: '本回合不出牌，且被指定无效，可以从牌堆中获得两张牌',
                        effect: 'dig_garbage',
                        rarity: 'common',
                        icon: 'fa-trash-restore',
                        count: 9,
                        needsTarget: false
                    },
                    designateMurder: {
                        id: 'designateMurder',
                        name: '指定谋杀',
                        type: 'stone',
                        category: 'special',
                        description: '此回合有人使用杀人诛心，既可以改变使用玩家指向',
                        effect: 'designate_murder',
                        rarity: 'common',
                        icon: 'fa-crosshairs',
                        count: 6,
                        needsTarget: true
                    },
                    blackHole: {
                        id: 'blackHole',
                        name: '黑洞',
                        type: 'cloth',
                        category: 'special',
                        description: '本回合结束时，将回合内在场上的所有牌将移出游戏（不进入弃牌堆）',
                        effect: 'black_hole',
                        rarity: 'rare',
                        icon: 'fa-circle',
                        count: 3,
                        needsTarget: false
                    },
                    chargeUp: {
                        id: 'chargeUp',
                        name: '蓄力',
                        type: 'item',
                        category: 'attack',
                        description: '选择两名玩家，判定花色：若两名玩家下一张牌花色相同，则各弃置3张牌；若不同，则你从牌堆获得4张牌',
                        effect: 'charge_up',
                        rarity: 'rare',
                        icon: 'fa-bolt',
                        count: 3,
                        needsTarget: true,
                        needsDoubleTarget: true
                    },
                    thunderLightning: {
                        id: 'thunderLightning',
                        name: '雷電',
                        type: 'item',
                        category: 'attack',
                        description: '选择一名玩家，判定花色链：从该玩家开始，按座位顺序依次判定，花色相同者弃置手牌数的30%（向下取整），最多影响4名玩家',
                        effect: 'thunder_lightning',
                        rarity: 'epic',
                        icon: 'fa-cloud-bolt',
                        count: 2,
                        needsTarget: true
                    }
                };
            }
            
            // 获取所有卡牌数据用于图鉴
            getAllCardsForEncyclopedia() {
                const cards = Object.values(this.cardDefinitions).map(card => ({
                    ...card,
                    // 移除count属性
                    count: undefined
                }));
                
                // 按名称排序
                cards.sort((a, b) => a.name.localeCompare(b.name));
                
                return cards;
            }
            
            // 获取按类型分类的卡牌
            getCardsByCategory(category) {
                const allCards = this.getAllCardsForEncyclopedia();
                
                if (category === 'all') {
                    return allCards;
                }
                
                return allCards.filter(card => {
                    if (category === 'attack') return card.category === 'attack';
                    if (category === 'defense') return card.category === 'defense';
                    if (category === 'special') return card.category === 'special';
                    if (category === 'epic') return card.rarity === 'epic';
                    return true;
                });
            }
            
            // 获取按稀有度分类的卡牌
            getCardsByRarity(rarity) {
                const allCards = this.getAllCardsForEncyclopedia();
                
                if (rarity === 'all') {
                    return allCards;
                }
                
                return allCards.filter(card => card.rarity === rarity);
            }
            
            // 应用卡牌效果（完整版）
            applyCardEffect(card, playerId, targetId, players, gameManager) {
                const player = players.find(p => p.id === playerId);
                const target = targetId ? players.find(p => p.id === targetId) : null;
                
                if (!player) {
                    return { success: false, message: '玩家不存在' };
                }
                
                let message = `${player.name}使用了${card.name}`;
                let extraEffects = [];
                
                switch(card.effect) {
                    case 'discard_three':
                        if (target && !target.isDead) {
                            const discardCount = Math.min(3, target.hand.length);
                            const discarded = target.hand.splice(0, discardCount);
                            discarded.forEach(card => gameManager.discardCard(card));
                            message += `，弃置了${target.name}的${discarded.length}张手牌`;
                        }
                        break;
                        
                    case 'swap_cards':
                        if (target && !target.isDead) {
                            const playerCards = player.hand.splice(0, Math.min(3, player.hand.length));
                            const targetCards = target.hand.splice(0, Math.min(3, target.hand.length));
                            
                            player.hand.push(...targetCards);
                            target.hand.push(...playerCards);
                            message += `，与${target.name}交换了${playerCards.length}张手牌`;
                        }
                        break;
                        
                    case 'immune_once':
                        player.isImmune = true;
                        player.immuneExpires = gameManager.turn + 1;
                        message += `，获得了本回合免疫效果`;
                        break;
                        
                    case 'give_four':
                        if (target && !target.isDead) {
                            const giveCount = Math.min(4, player.hand.length);
                            const given = player.hand.splice(0, giveCount);
                            target.hand.push(...given);
                            message += `，给了${target.name}${given.length}张牌`;
                        }
                        break;
                        
                    case 'mutual_discard':
                        if (target && !target.isDead) {
                            const targetDiscard = Math.min(3, target.hand.length);
                            const playerDiscard = Math.min(3, player.hand.length);
                            
                            const targetDiscarded = target.hand.splice(0, targetDiscard);
                            const playerDiscarded = player.hand.splice(0, playerDiscard);
                            
                            targetDiscarded.forEach(card => gameManager.discardCard(card));
                            playerDiscarded.forEach(card => gameManager.discardCard(card));
                            
                            message += `，${target.name}弃置了${targetDiscarded.length}张牌，你弃置了${playerDiscarded.length}张牌`;
                        }
                        break;
                        
                    case 'gain_six':
                        if (target && !target.isDead) {
                            for (let i = 0; i < 6; i++) {
                                const drawnCard = gameManager.drawCardFromDeck();
                                if (drawnCard) {
                                    target.hand.push(drawnCard);
                                }
                            }
                            message += `，${target.name}获得了6张牌`;
                        }
                        break;
                        
                    case 'recycle_three':
                        if (gameManager.discardPile.length > 0) {
                            const recycleCount = Math.min(3, gameManager.discardPile.length);
                            const recycled = gameManager.discardPile.splice(-recycleCount, recycleCount);
                            player.hand.push(...recycled);
                            message += `，从弃牌堆回收了${recycled.length}张牌`;
                        } else {
                            message += `，但弃牌堆是空的`;
                        }
                        break;
                        
                    case 'provoke_all':
                        players.forEach(p => {
                            if (p.id !== playerId && !p.isDead) {
                                const giveCount = Math.min(2, p.hand.length);
                                const given = p.hand.splice(0, giveCount);
                                player.hand.push(...given);
                                message += `，${p.name}给出了${given.length}张牌`;
                            }
                        });
                        break;
                        
                    case 'copy_card':
                        if (target && !target.isDead && target.hand.length > 0) {
                            const randomIndex = Math.floor(Math.random() * target.hand.length);
                            const copiedCard = {...target.hand[randomIndex]};
                            copiedCard.id = `copied_${Date.now()}`;
                            player.hand.push(copiedCard);
                            message += `，复制了${target.name}的${copiedCard.name}`;
                        }
                        break;
                        
                    case 'resurrect_player':
                        if (target && target.isDead) {
                            target.isDead = false;
                            target.hand = [];
                            message += `，复活了${target.name}`;
                            
                            // 使用者可以使用一次死去玩家的技能
                            if (player.className !== target.className) {
                                player.canUseTargetSkill = true;
                                player.targetSkillOwner = target.className;
                                extraEffects.push(`可以临时使用一次${target.className}的技能`);
                            }
                        }
                        break;
                        
                    case 'open_pai':
                        player.isImmune = true;
                        player.openPaiExpires = gameManager.turn + 3;
                        player.cannotDiscardOthers = true;
                        message += `，三回合内免疫弃置/获得效果且不能弃置他人手牌`;
                        break;
                        
                    case 'stone':
                        message += `，打出了石头`;
                        break;
                    
                    case 'scissors':
                        message += `，打出了剪刀`;
                        break;
                    
                    case 'cloth':
                        message += `，打出了布`;
                        break;
                    
                    case 'black_hole':
                        gameManager.blackHoleActive = true;
                        message += `，本回合结束时所有牌将移出游戏`;
                        break;
                        
                    case 'charge_up':
                        if (target && !target.isDead) {
                            player.chargeUpTarget1 = target.id;
                            player.chargeUpActive = true;
                            player.chargeUpUser = playerId;
                            message += `，选择了${target.name}作为第一个目标，请选择第二个目标`;
                        }
                        break;
                        
                    case 'thunder_lightning':
                        if (target && !target.isDead) {
                            const targetType = target.hand.length > 0 ? target.hand[0].type : 'stone';
                            let affectedPlayers = [];
                            let currentPlayerIndex = players.findIndex(p => p.id === target.id);
                            let checkCount = 0;
                            const maxChecks = 4;
                            
                            for (let i = 0; i < players.length && checkCount < maxChecks; i++) {
                                const checkIndex = (currentPlayerIndex + i) % players.length;
                                const checkPlayer = players[checkIndex];
                                
                                if (checkPlayer.isDead || checkPlayer.hand.length === 0) continue;
                                
                                const playerCardType = checkPlayer.hand[0].type;
                                if (playerCardType === targetType) {
                                    const discardCount = Math.floor(checkPlayer.hand.length * 0.3);
                                    if (discardCount > 0) {
                                        const discarded = checkPlayer.hand.splice(0, discardCount);
                                        discarded.forEach(c => gameManager.discardCard(c));
                                        affectedPlayers.push(`${checkPlayer.name}(${discarded.length}张)`);
                                    }
                                }
                                checkCount++;
                            }
                            
                            const typeNames = { stone: '石头', scissors: '剪刀', cloth: '布' };
                            if (affectedPlayers.length > 0) {
                                message += `，花色链判定(${typeNames[targetType]})，影响了：${affectedPlayers.join('、')}`;
                            } else {
                                message += `，花色链判定(${typeNames[targetType]})但未影响任何玩家`;
                            }
                        }
                        break;
                        
                    case 'dig_garbage':
                        player.digGarbageActive = true;
                        player.digGarbageTurns = 1;
                        player.cannotPlayCards = true;
                        player.invalidAsTarget = true;
                        for (let i = 0; i < 2; i++) {
                            const drawnCard = gameManager.drawCardFromDeck();
                            if (drawnCard) {
                                player.hand.push(drawnCard);
                            }
                        }
                        message += `，本回合不出牌且被指定无效，从牌堆获得了2张牌`;
                        break;
                        
                    case 'ghost_hand':
                        if (target && !target.isDead && !target.invalidAsTarget) {
                            const takeCount = Math.min(3, target.hand.length);
                            const taken = target.hand.splice(0, takeCount);
                            player.hand.push(...taken);
                            message += `，获得了${target.name}的${taken.length}张手牌`;
                        } else if (target && target.invalidAsTarget) {
                            message += `，${target.name}本回合不能被指定为目标`;
                        }
                        break;
                        
                    case 'lightning':
                        // 所有人依次顺时针判定花色【布】，最后那个人直接减少百分之五十的牌
                        message += `，所有人依次顺时针判定花色【布】`;
                        
                        // 顺时针遍历所有玩家，最后一个玩家受到效果
                        let lastPlayer = null;
                        for (let i = 0; i < players.length; i++) {
                            const currentPlayer = players[i];
                            if (!currentPlayer.isDead) {
                                lastPlayer = currentPlayer;
                                message += `，${currentPlayer.name}判定花色【布】`;
                            }
                        }
                        
                        if (lastPlayer && !lastPlayer.isDead) {
                            const discardCount = Math.floor(lastPlayer.hand.length * 0.5);
                            const discarded = lastPlayer.hand.splice(0, discardCount);
                            discarded.forEach(card => gameManager.discardCard(card));
                            message += `，最后${lastPlayer.name}减少了${discarded.length}张牌`;
                        }
                        break;
                        
                    case 'mutual_destruction':
                        if (target && !target.isDead) {
                            // 效果：自己上一回合打出的花色和对手的花色一致发动，使受到攻击的对手弃与当前回合打出花色的全部相同花色的卡牌【双方】
                            const currentSuit = card.type;
                            if (currentSuit === 'stone' || currentSuit === 'scissors' || currentSuit === 'cloth') {
                                // 检查是否满足发动条件：自己上一回合打出的花色和对手的花色一致
                                // 这里简化实现，假设满足条件
                                message += `，发动两败俱伤效果`;
                                
                                // 弃置双方的相同花色牌
                                const playerDiscarded = player.hand.filter(c => c.type === currentSuit);
                                const targetDiscarded = target.hand.filter(c => c.type === currentSuit);
                                
                                playerDiscarded.forEach(c => {
                                    const index = player.hand.findIndex(card => card.id === c.id);
                                    if (index > -1) {
                                        player.hand.splice(index, 1);
                                        gameManager.discardCard(c);
                                    }
                                });
                                
                                targetDiscarded.forEach(c => {
                                    const index = target.hand.findIndex(card => card.id === c.id);
                                    if (index > -1) {
                                        target.hand.splice(index, 1);
                                        gameManager.discardCard(c);
                                    }
                                });
                                
                                message += `，双方弃置了所有${currentSuit === 'stone' ? '石头' : currentSuit === 'scissors' ? '剪刀' : '布'}花色的牌`;
                            }
                        }
                        break;
                        
                    case 'reverse':
                        // 当前出牌效果相反（只针对花色牌）
                        message += `，当前出牌效果相反（只针对花色牌）`;
                        // 设置反转效果标记
                        gameManager.reverseActive = true;
                        break;
                        
                    case 'bluff':
                        // 当有玩家打出与本牌相同的花色时，玩家可以选择对牌无效化，并收入进自己牌中
                        message += `，准备虚张声势`;
                        // 设置虚张声势效果标记
                        gameManager.bluffActive = true;
                        gameManager.bluffPlayerId = playerId;
                        gameManager.bluffSuit = card.type;
                        break;
                        
                    case 'cheat':
                        // 你须交给上家下家各一张牌，然后视为使用一张指定的任意牌
                        // 简化实现：交给其他玩家各一张牌，然后抽一张牌
                        players.forEach(p => {
                            if (p.id !== playerId && !p.isDead) {
                                if (player.hand.length > 0) {
                                    const given = player.hand.splice(0, 1);
                                    p.hand.push(...given);
                                    message += `，给了${p.name}1张牌`;
                                }
                            }
                        });
                        // 抽一张牌
                        const drawnCard = gameManager.drawCardFromDeck();
                        if (drawnCard) {
                            player.hand.push(drawnCard);
                            message += `，获得了一张牌`;
                        }
                        break;
                        
                    case 'more_cards':
                        // 所有人下一回合出牌多出一张
                        gameManager.moreCardsNextTurn = true;
                        message += `，所有人下一回合可以多出一张牌`;
                        break;
                        
                    case 'feast':
                        // 所有玩家依次摸两张牌；本回合结束时，若有玩家死亡过，你额外摸四张牌
                        players.forEach(p => {
                            if (!p.isDead) {
                                for (let i = 0; i < 2; i++) {
                                    const drawnCard = gameManager.drawCardFromDeck();
                                    if (drawnCard) {
                                        p.hand.push(drawnCard);
                                    }
                                }
                            }
                        });
                        message += `，所有玩家获得了2张牌`;
                        // 本回合结束时检查是否有玩家死亡
                        gameManager.feastPlayerId = playerId;
                        break;
                        
                    case 'force_save':
                        // 三回合内玩家手牌固定在十张或十张以上
                        player.forceSave = true;
                        player.forceSaveExpires = gameManager.turn + 3;
                        message += `，三回合内手牌固定在十张或十张以上`;
                        break;
                        
                    case 'sell_cloth':
                        // 丢弃一张布花色牌，并从牌堆摸两张牌
                        const clothCardIndex = player.hand.findIndex(c => c.type === 'cloth');
                        if (clothCardIndex > -1) {
                            const discarded = player.hand.splice(clothCardIndex, 1);
                            gameManager.discardCard(discarded[0]);
                            for (let i = 0; i < 2; i++) {
                                const drawnCard = gameManager.drawCardFromDeck();
                                if (drawnCard) {
                                    player.hand.push(drawnCard);
                                }
                            }
                            message += `，丢弃了一张布花色牌并从牌堆摸两张牌`;
                        } else {
                            message += `，但没有布花色牌可以丢弃`;
                        }
                        break;
                        
                    case 'designate_murder':
                        // 此回合有人使用杀人诛心，既可以改变使用玩家指向
                        gameManager.designateMurderActive = true;
                        gameManager.designateMurderPlayerId = playerId;
                        message += `，准备改变杀人诛心的指向`;
                        break;
                        
                    case 'gamblers_wheel':
                        if (target && !target.isDead && !target.invalidAsTarget) {
                            // 使用此牌后，指定一名玩家，等待下一回合，使用者猜指定者下一张牌的花色
                            message += `，指定${target.name}，等待下一回合猜花色`;
                            
                            // 设置赌徒转盘效果标记
                            gameManager.gamblersWheelActive = true;
                            gameManager.gamblersWheelPlayerId = playerId;
                            gameManager.gamblersWheelTargetId = targetId;
                            
                            // 简化实现：直接进行猜花色
                            const suits = ['stone', 'scissors', 'cloth'];
                            const guessedSuit = suits[Math.floor(Math.random() * suits.length)];
                            const actualSuit = target.hand.length > 0 ? target.hand[0].type : suits[Math.floor(Math.random() * suits.length)];
                            
                            message += `，猜花色为${guessedSuit === 'stone' ? '石头' : guessedSuit === 'scissors' ? '剪刀' : '布'}`;
                            message += `，实际花色为${actualSuit === 'stone' ? '石头' : actualSuit === 'scissors' ? '剪刀' : '布'}`;
                            
                            if (guessedSuit === actualSuit) {
                                // 猜对，获得此牌，并从牌堆获得6张牌
                                player.hand.push(card);
                                for (let i = 0; i < 6; i++) {
                                    const drawnCard = gameManager.drawCardFromDeck();
                                    if (drawnCard) {
                                        player.hand.push(drawnCard);
                                    }
                                }
                                message += `，猜对了花色，获得了此牌并从牌堆获得6张牌`;
                            } else {
                                // 猜错，失去此牌，并强制扣除6张牌
                                const discardCount = Math.min(6, player.hand.length);
                                const discarded = player.hand.splice(0, discardCount);
                                discarded.forEach(c => gameManager.discardCard(c));
                                message += `，猜错了花色，失去了此牌并强制扣除${discarded.length}张牌`;
                            }
                        }
                        break;
                        
                    case 'resurrection':
                        if (target && target.isDead && !target.invalidAsTarget) {
                            target.isDead = false;
                            target.hand = [];
                            message += `，复活了${target.name}`;
                            
                            // 使用者可以使用一次死去玩家的技能
                            if (player.className !== target.className) {
                                player.canUseTargetSkill = true;
                                player.targetSkillOwner = target.className;
                                extraEffects.push(`可以临时使用一次${target.className}的技能`);
                            }
                        }
                        break;
                        
                    case 'game':
                        if (target && !target.isDead && !target.invalidAsTarget) {
                            // 使用之后强制指定一名玩家倒扣卡牌，如果花色一致，则双方各自从牌堆获得三张牌，如果不一致，则使用者直接从指定玩家牌中抽取6张丢弃
                            message += `，强制${target.name}倒扣卡牌`;
                            
                            // 简化实现：随机生成花色
                            const suits = ['stone', 'scissors', 'cloth'];
                            const playerSuit = suits[Math.floor(Math.random() * suits.length)];
                            const targetSuit = suits[Math.floor(Math.random() * suits.length)];
                            
                            message += `，你的花色为${playerSuit === 'stone' ? '石头' : playerSuit === 'scissors' ? '剪刀' : '布'}`;
                            message += `，${target.name}的花色为${targetSuit === 'stone' ? '石头' : targetSuit === 'scissors' ? '剪刀' : '布'}`;
                            
                            if (playerSuit === targetSuit) {
                                // 花色一致，双方各自从牌堆获得三张牌
                                for (let i = 0; i < 3; i++) {
                                    const playerCard = gameManager.drawCardFromDeck();
                                    const targetCard = gameManager.drawCardFromDeck();
                                    if (playerCard) player.hand.push(playerCard);
                                    if (targetCard) target.hand.push(targetCard);
                                }
                                message += `，花色一致，双方各自从牌堆获得三张牌`;
                            } else {
                                // 花色不一致，使用者直接从指定玩家牌中抽取6张丢弃
                                const discardCount = Math.min(6, target.hand.length);
                                const discarded = target.hand.splice(0, discardCount);
                                discarded.forEach(card => gameManager.discardCard(card));
                                message += `，花色不一致，使用者直接从${target.name}牌中抽取${discarded.length}张丢弃`;
                            }
                        }
                        break;
                        
                    default:
                        message += `，效果生效`;
                        break;
                }
                
                if (extraEffects.length > 0) {
                    message += `（${extraEffects.join('，')}）`;
                }
                
                return { success: true, message };
            }
            
            // 初始化牌堆
            initializeDeck() {
                const deck = [];
                
                // 根据文档数量添加道具卡
                Object.values(this.cardDefinitions).forEach(cardDef => {
                    for (let i = 0; i < cardDef.count; i++) {
                        deck.push({
                            ...cardDef,
                            id: `${cardDef.id}_${i}`,
                            // 移除count属性，避免对象引用问题
                            count: undefined
                        });
                    }
                });
                
                // 洗牌
                this.shuffleDeck(deck);
                
                console.log(`初始化牌堆完成，共${deck.length}张道具牌`);
                return deck;
            }
            
            // 洗牌
            shuffleDeck(deck) {
                for (let i = deck.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [deck[i], deck[j]] = [deck[j], deck[i]];
                }
                return deck;
            }
        }

        // ==================== 职业系统 (完善版) ====================
        class ClassManager {
            constructor() {
                this.classDefinitions = this.initializeClassDefinitions();
            }
            
            initializeClassDefinitions() {
                return [
                    {
                        id: 'alchemist',
                        name: '炼金术师',
                        difficulty: 'hard',
                        description: '擅长使用药剂和转换卡牌',
                        abilities: [
                            '游戏开始时获得[毒药][解药]',
                            '使用药类道具时额外获得三张手牌',
                            '可以将一张牌制作成神秘药剂'
                        ],
                        icon: 'fa-flask',
                        color: '#9b59b6',
                        ability: 'alchemist',
                        initialCards: 32, // 默认40张，-8
                        specialRules: this.getAlchemistRules()
                    },
                    {
                        id: 'soldier',
                        name: '士兵',
                        difficulty: 'medium',
                        description: '强力的攻击型职业',
                        abilities: [
                            '当你打出[杀人诛心]指定玩家后，你将弃置牌数更改为五张',
                            '当你对其他玩家使用[杀人诛心]时，根据目标玩家使用的牌，该道具失效',
                            '攻击型职业的代表'
                        ],
                        icon: 'fa-shield-alt',
                        color: '#3498db',
                        ability: 'soldier',
                        initialCards: 55, // 默认40张，+15
                        specialRules: this.getSoldierRules()
                    },
                    {
                        id: 'merchant',
                        name: '商人',
                        difficulty: 'medium',
                        description: '擅长交换和交易卡牌',
                        abilities: [
                            '你使用[互换]改为获得指定玩家四张手牌',
                            '出牌阶段前，你可以选择一项特殊交易',
                            '交易大师'
                        ],
                        icon: 'fa-coins',
                        color: '#f1c40f',
                        ability: 'merchant',
                        initialCards: 30, // 默认40张，-10
                        specialRules: this.getMerchantRules()
                    },
                    {
                        id: 'angel',
                        name: '天使',
                        difficulty: 'easy',
                        description: '拥有复活能力的辅助型职业',
                        abilities: [
                            '整局游戏限两次，当一名玩家死亡时，你可以选择复活',
                            '复活时将其获胜条件更改为与你一致',
                            '复活时将其手牌补充至二十张'
                        ],
                        icon: 'fa-angel',
                        color: '#ecf0f1',
                        ability: 'angel',
                        initialCards: 30, // 默认40张，-10
                        specialRules: this.getAngelRules()
                    },
                    {
                        id: 'peeper',
                        name: '偷窥狂',
                        difficulty: 'hard',
                        description: '擅长窥探和使用其他玩家的牌',
                        abilities: [
                            '当你使用鬼手时，额外从牌堆获得一张牌',
                            '扣置阶段，你可以翻开未被你翻开过牌的一名玩家扣置的牌，然后你可以使用之',
                            '使用后可以选择交给其本阶段获得的牌或被其弃置3张牌'
                        ],
                        icon: 'fa-eye',
                        color: '#e74c3c',
                        ability: 'peeper',
                        specialRules: this.getPeeperRules()
                    },
                    {
                        id: 'magician',
                        name: '魔术师',
                        difficulty: 'hard',
                        description: '擅长变换和操控卡牌',
                        abilities: [
                            '扣置阶段，你可以获得至多三张牌并展示',
                            '弃置展示中未记录类型的牌并记录此牌',
                            '本回合所有翻出与弃置的展示牌中同种类型的牌无效且你获得之',
                            '当有玩家展示牌时，你可以用一张牌置换其中一张展示牌'
                        ],
                        icon: 'fa-hat-wizard',
                        color: '#8e44ad',
                        ability: 'magician',
                        initialCards: 30, // 默认40张，-10
                        specialRules: this.getMagicianRules()
                    },
                    {
                        id: 'police',
                        name: '警官',
                        difficulty: 'medium',
                        description: '控制型和通缉能力',
                        abilities: [
                            '发牌阶段，你额外获得三张[引战]',
                            '整局游戏限一次，游戏开始后或休息阶段，你可以选择一名玩家进行“通缉”',
                            '当通缉玩家死亡时，你可以对其他一名玩家进行“逮捕”'
                        ],
                        icon: 'fa-badge',
                        color: '#34495e',
                        ability: 'police',
                        initialCards: 30, // 默认40张，-10
                        specialRules: this.getPoliceRules()
                    },
                    {
                        id: 'politician',
                        name: '政治家',
                        difficulty: 'hard',
                        description: '外交和联盟大师',
                        abilities: [
                            '发牌阶段，你获得一张[同盟]',
                            '扣置阶段，你可以对每名玩家选择一项特殊外交',
                            '当不为你的玩家指定多个目标且包含你时，其可以让你获得一张牌'
                        ],
                        icon: 'fa-landmark',
                        color: '#2c3e50',
                        ability: 'politician',
                        specialRules: this.getPoliticianRules()
                    },
                    {
                        id: 'corpse',
                        name: '尸体',
                        difficulty: 'hard',
                        description: '特殊的不死系职业',
                        abilities: [
                            '游戏开始时进入死亡期',
                            '当你为非死亡期且非因技能获得牌时，额外获得一张牌',
                            '当你为死亡期时，休息阶段需额外弃置一张牌'
                        ],
                        icon: 'fa-skull',
                        color: '#7f8c8d',
                        ability: 'corpse',
                        initialCards: 50, // 默认40张，+10
                        specialRules: this.getCorpseRules()
                    },
                    {
                        id: 'fool',
                        name: '傻子',
                        difficulty: 'easy',
                        description: '看似简单实则复杂的职业',
                        abilities: [
                            '始终不参与休息阶段',
                            '可以自己选择失去的牌',
                            '扣置阶段可以扣置至多三张牌'
                        ],
                        icon: 'fa-grin-tongue-wink',
                        color: '#f39c12',
                        ability: 'fool',
                        specialRules: this.getFoolRules()
                    },
                    {
                        id: 'joker',
                        name: '乐子人',
                        difficulty: 'medium',
                        description: '喜欢制造混乱和乐趣',
                        abilities: [
                            '每阶段开始时，你可以暗置调换两名玩家被指定目标',
                            '被调换玩家被指定为目标时明置',
                            '调换失效至下回合开始时'
                        ],
                        icon: 'fa-laugh',
                        color: '#ff6b6b',
                        ability: 'joker',
                        specialRules: this.getJokerRules()
                    },
                    {
                        id: 'coward',
                        name: '胆小鬼',
                        difficulty: 'easy',
                        description: '拥有反伤能力的防御型职业',
                        abilities: [
                            '每回合可以强制反伤一名玩家',
                            '如果有玩家使用恢复类牌，自动获得3张牌',
                            '一回合自由出牌，一回合只能出除了伤害类的牌'
                        ],
                        icon: 'fa-meh',
                        color: '#a29bfe',
                        ability: 'coward',
                        specialRules: this.getCowardRules()
                    },
                    {
                        id: 'parasite',
                        name: '寄生者',
                        difficulty: 'medium',
                        description: '依附于其他玩家生存',
                        abilities: [
                            '游戏开始时，你选择一名玩家然后将胜利和死亡条件更改至与其一致',
                            '当指定的玩家因为牌的效果获得/失去牌时，你立刻获得/弃置等量牌'
                        ],
                        icon: 'fa-bug',
                        color: '#00b894',
                        ability: 'parasite',
                        specialRules: this.getParasiteRules()
                    },
                    {
                        id: 'killer',
                        name: '杀手',
                        difficulty: 'hard',
                        description: '专注于标记和击杀目标',
                        abilities: [
                            '整局游戏限一次，休息阶段，你可以对一名玩家进行标记',
                            '你获得/弃置其牌数翻倍，然后你直接进入死亡期',
                            '如果被你标记的玩家因你牌或技能效果死亡时，你重置自己状态并获得十张牌'
                        ],
                        icon: 'fa-user-secret',
                        color: '#2d3436',
                        ability: 'killer',
                        specialRules: this.getKillerRules()
                    },
                    {
                        id: 'terrorist',
                        name: '恐怖分子',
                        difficulty: 'very_hard',
                        description: '高风险高回报的职业',
                        abilities: [
                            '发牌阶段，你额外获得三张[牛牛弹]',
                            '你使用牛牛弹对方额外弃置牌数3倍你使用牛牛弹次数的张牌',
                            '当你死亡时，你可以令一名角色强制更改为达成死亡条件的状态'
                        ],
                        icon: 'fa-bomb',
                        color: '#e17055',
                        ability: 'terrorist',
                        initialCards: 55, // 默认40张，+15
                        specialRules: this.getTerroristRules()
                    },
                    {
                        id: 'cultLeader',
                        name: '异教主',
                        difficulty: 'very_hard',
                        description: '可以创造邪教徒的领导者',
                        abilities: [
                            '当有玩家死亡后，你可以将20张牌置入弃牌堆，然后令该玩家获得10张牌并将职业替换成【邪教徒】',
                            '邪教徒无法复活，复活后替换回原本的职业',
                            '休息阶段，邪教徒须弃置一张牌'
                        ],
                        icon: 'fa-church',
                        color: '#6c5ce7',
                        ability: 'cultLeader',
                        initialCards: 70, // 默认40张，+30
                        specialRules: this.getCultLeaderRules()
                    },
                    {
                        id: 'cultist',
                        name: '邪教徒',
                        difficulty: 'easy',
                        description: '追随异教主的信徒',
                        abilities: [
                            '【异教主】存活时，你无法复活',
                            '当你复活后，你替换回原本的职业',
                            '休息阶段，你须弃置一张牌'
                        ],
                        icon: 'fa-user',
                        color: '#a29bfe',
                        ability: 'cultist',
                        specialRules: this.getCultistRules()
                    },
                    {
                        id: 'demon',
                        name: '恶魔',
                        difficulty: 'very_hard',
                        description: '具有隐藏身份的特殊角色',
                        abilities: [
                            '游戏开始时，你的胜利条件更改为你没有手牌时，其他角色的胜利条件不包含你',
                            '当你使用「制衡」时改为交给其他所有玩家一张牌，本回合指定为你的牌无效',
                            '手牌为0时不会死亡'
                        ],
                        icon: 'fa-fire',
                        color: '#e74c3c',
                        ability: 'demon',
                        specialRules: this.getDemonRules(),
                        initialCards: 30
                    },
                    {
                        id: 'pope',
                        name: '教皇',
                        difficulty: 'hard',
                        description: '神圣的宗教领袖',
                        abilities: [
                            '当你打出以下道具时(绿帽，十字架，制衡，白旗）你额外获得两张道具',
                            '死亡条件更改为没有以下道具时的其中一个（绿帽，十字架，制衡，白旗）',
                            '休息阶段，弃置两张牌并获得一张牌'
                        ],
                        icon: 'fa-crown',
                        color: '#f39c12',
                        ability: 'pope',
                        initialCards: 30, // 默认40张，-10
                        specialRules: this.getPopeRules()
                    },
                    {
                        id: 'burner',
                        name: '燃烧者',
                        difficulty: 'very_hard',
                        description: '具有强大爆发能力的角色',
                        abilities: [
                            '当你每回合首次进入死亡期时，本回合你使用牌和被使用的牌无效；且然后直到下回合结束时其他所有玩家技能失效',
                            '回合开始时或你死亡时，你可以立刻进入死亡期且你无法被复活和重置状态，然后立刻获得30张牌',
                            '从下回合开始的第三个回合开始时，你弃置所有手牌'
                        ],
                        icon: 'fa-fire-alt',
                        color: '#e67e22',
                        ability: 'burner',
                        specialRules: this.getBurnerRules(),
                        initialCards: 30
                    }
                ];
            }
            
            // 获取所有职业数据用于图鉴
            getAllClassesForEncyclopedia() {
                return this.classDefinitions;
            }
            
            // 获取按难度分类的职业
            getClassesByDifficulty(difficulty) {
                if (difficulty === 'all') {
                    return this.classDefinitions;
                }
                
                return this.classDefinitions.filter(cls => cls.difficulty === difficulty);
            }
            
            // 炼金术师特殊规则
            getAlchemistRules() {
                return {
                    onGameStart: (player, gameManager) => {
                        // 游戏开始时获得毒药和解药
                        const poisonCard = {...gameManager.cardManager.cardDefinitions.poison};
                        const antidoteCard = {...gameManager.cardManager.cardDefinitions.antidote};
                        
                        poisonCard.id = `poison_${player.id}`;
                        antidoteCard.id = `antidote_${player.id}`;
                        
                        player.hand.push(poisonCard, antidoteCard);
                        return `炼金术师获得了毒药和解药`;
                    },
                    onUseCard: (player, card, target, gameManager) => {
                        // 使用药类道具时额外获得三张手牌
                        if (card.id.includes('poison') || card.id.includes('antidote')) {
                            for (let i = 0; i < 3; i++) {
                                const drawnCard = gameManager.drawCardFromDeck();
                                if (drawnCard) {
                                    player.hand.push(drawnCard);
                                }
                            }
                            return `炼金术师使用药类道具，额外获得3张牌`;
                        }
                        return null;
                    },
                    onTurnEnd: (player, gameManager) => {
                        // 回合结束后可以制作神秘药剂
                        if (player.hand.length > 0) {
                            // 创建神秘药剂
                            const mysteryPotion = {
                                id: `mystery_potion_${player.id}_${Date.now()}`,
                                name: '神秘药剂',
                                type: 'item',
                                description: '神秘的药剂，效果未知',
                                effect: 'mystery_potion',
                                icon: 'fa-flask',
                                color: '#9b59b6'
                            };
                            
                            // 替换一张手牌为神秘药剂
                            const removedCard = player.hand.pop();
                            player.hand.push(mysteryPotion);
                            gameManager.discardCard(removedCard);
                            return `炼金术师制作了神秘药剂`;
                        }
                        return null;
                    },
                    onUseMysteryPotion: (player, target, gameManager) => {
                        // 神秘药剂的效果
                        const amount = Math.floor(Math.random() * 8) + 3; // 3-10张
                        
                        if (target && target.id !== player.id) {
                            // 对敌人使用：弃置3-10张牌
                            const discardAmount = Math.min(amount, target.hand.length);
                            for (let i = 0; i < discardAmount; i++) {
                                gameManager.discardCard(target.hand.pop());
                            }
                            return `神秘药剂效果：${target.name}弃置了${discardAmount}张牌`;
                        } else {
                            // 对自己使用：获得3-10张牌
                            for (let i = 0; i < amount; i++) {
                                const drawnCard = gameManager.drawCardFromDeck();
                                if (drawnCard) {
                                    player.hand.push(drawnCard);
                                }
                            }
                            return `神秘药剂效果：获得了${amount}张牌`;
                        }
                    }
                };
            }
            
            // 士兵特殊规则
            getSoldierRules() {
                return {
                    onUseCard: (player, card, target, gameManager) => {
                        // 当打出[杀人诛心]指定玩家后，弃置牌数更改为五张
                        if (card.name === '杀人诛心' && target) {
                            // 弃置五张牌
                            const discardCount = Math.min(5, target.hand.length);
                            for (let i = 0; i < discardCount; i++) {
                                gameManager.discardCard(target.hand.pop());
                            }
                            return `士兵使用杀人诛心，弃置了${discardCount}张牌`;
                        }
                        return null;
                    },
                    onTargetDefense: (player, targetPlayer, card, defenseCard, gameManager) => {
                        // 当对其他玩家使用[杀人诛心]时，根据目标玩家使用的牌，该道具失效
                        if (card.name === '杀人诛心' && targetPlayer && defenseCard) {
                            // 根据目标玩家使用的牌类型，道具失效
                            // 这里简化处理：如果目标使用了任何牌进行防御，杀人诛心失效
                            return {
                                invalid: true,
                                message: `目标使用${defenseCard.name}防御，杀人诛心失效`
                            };
                        }
                        return null;
                    }
                };
            }
            
            // 商人特殊规则
            getMerchantRules() {
                return {
                    onUseCard: (player, card, target, gameManager) => {
                        // 使用[互换]改为获得指定玩家四张手牌
                        if (card.name === '互换' && target) {
                            // 获得目标玩家四张手牌
                            const takeCount = Math.min(4, target.hand.length);
                            const takenCards = [];
                            for (let i = 0; i < takeCount; i++) {
                                takenCards.push(target.hand.pop());
                            }
                            // 添加到商人手牌
                            takenCards.forEach(takenCard => {
                                player.hand.push(takenCard);
                            });
                            return `商人使用互换，获得了${takenCards.length}张牌`;
                        }
                        return null;
                    },
                    onPreActionPhase: (player, gameManager) => {
                        // 出牌阶段前，选择一项特殊交易
                        const actionChoice = Math.random() > 0.5 ? 1 : 2;
                        
                        if (actionChoice === 1) {
                            // 选项1: 展示至多五张牌，指定一名玩家让你展示其等量牌
                            const showCount = Math.min(5, player.hand.length);
                            if (showCount > 0) {
                                const otherPlayers = gameManager.players.filter(p => !p.isDead && p.id !== player.id);
                                if (otherPlayers.length > 0) {
                                    const targetPlayer = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
                                    const targetShowCount = Math.min(showCount, targetPlayer.hand.length);
                                    
                                    // 展示商人的牌
                                    const merchantShownCards = player.hand.splice(0, showCount);
                                    
                                    // 展示目标玩家的牌
                                    const targetShownCards = targetPlayer.hand.splice(0, targetShowCount);
                                    
                                    // 选择至少等量牌交给目标
                                    const giveCount = Math.min(showCount, merchantShownCards.length);
                                    const givenCards = merchantShownCards.splice(0, giveCount);
                                    
                                    // 交给目标玩家
                                    givenCards.forEach(card => {
                                        targetPlayer.hand.push(card);
                                    });
                                    
                                    // 商人获得剩余的牌
                                    merchantShownCards.forEach(card => {
                                        player.hand.push(card);
                                    });
                                    targetShownCards.forEach(card => {
                                        player.hand.push(card);
                                    });
                                    
                                    return `商人选择了交易选项1，获得了${merchantShownCards.length + targetShownCards.length}张牌`;
                                }
                            }
                        } else {
                            // 选项2: 弃置一张牌，选择两名玩家获得其中一名玩家一张牌
                            if (player.hand.length > 0) {
                                const otherPlayers = gameManager.players.filter(p => !p.isDead && p.id !== player.id);
                                if (otherPlayers.length >= 2) {
                                    // 弃置一张牌
                                    const discardedCard = player.hand.pop();
                                    gameManager.discardCard(discardedCard);
                                    
                                    // 选择两名玩家
                                    const [player1, player2] = this.getRandomPlayers(otherPlayers, 2);
                                    
                                    // 获得其中一名玩家一张牌
                                    if (player1.hand.length > 0) {
                                        const takenCard = player1.hand.pop();
                                        player.hand.push(takenCard);
                                    }
                                    
                                    // 令两人各亮出五张牌
                                    const player1Shown = player1.hand.splice(0, Math.min(5, player1.hand.length));
                                    const player2Shown = player2.hand.splice(0, Math.min(5, player2.hand.length));
                                    
                                    // 从获得牌的玩家开始依次选择获得
                                    player1Shown.forEach(card => {
                                        player.hand.push(card);
                                    });
                                    player2Shown.forEach(card => {
                                        player.hand.push(card);
                                    });
                                    
                                    return `商人选择了交易选项2，获得了额外的牌`;
                                }
                            }
                        }
                        return null;
                    }
                };
            }
            
            // 天使特殊规则
            getAngelRules() {
                return {
                    onGameStart: (player, gameManager) => {
                        // 初始化复活次数限制
                        player.resurrectionCount = 2;
                        return `天使获得了2次复活机会`;
                    },
                    onPlayerDeath: (player, deadPlayer, gameManager) => {
                        // 当一名玩家死亡时，可以选择复活
                        if (player.resurrectionCount > 0 && deadPlayer.isDead) {
                            // 执行复活
                            deadPlayer.isDead = false;
                            deadPlayer.isInDeathPeriod = false;
                            
                            // 将其获胜条件更改为与天使一致
                            deadPlayer.victoryCondition = 'angel';
                            
                            // 将其手牌补充至二十张
                            while (deadPlayer.hand.length < 20) {
                                const card = gameManager.drawCardFromDeck();
                                if (card) {
                                    deadPlayer.hand.push(card);
                                } else {
                                    break;
                                }
                            }
                            
                            // 减少复活次数
                            player.resurrectionCount--;
                            
                            return `天使复活了${deadPlayer.name}，剩余${player.resurrectionCount}次复活机会`;
                        }
                        return null;
                    }
                };
            }
            
            // 乐子人特殊规则
            getJokerRules() {
                return {
                    onPhaseStart: (player, phase, gameManager) => {
                        // 每阶段开始时可以暗置调换两名玩家被指定目标
                        if (!player.swappedTargets) {
                            const players = gameManager.players.filter(p => !p.isDead && p.id !== player.id);
                            if (players.length >= 2) {
                                const [player1, player2] = this.getRandomPlayers(players, 2);
                                player.swappedTargets = {
                                    player1: player1.id,
                                    player2: player2.id,
                                    active: true,
                                    hidden: true
                                };
                                return `乐子人暗置调换了${player1.name}和${player2.name}的目标`;
                            }
                        }
                        return null;
                    },
                    onTargetSpecified: (player, targetPlayer, gameManager) => {
                        // 当被调换的玩家被指定为目标时明置
                        if (player.swappedTargets && player.swappedTargets.active) {
                            const { player1, player2 } = player.swappedTargets;
                            if (targetPlayer.id === player1 || targetPlayer.id === player2) {
                                // 明置调换
                                player.swappedTargets.hidden = false;
                                
                                // 找到另一个被调换的玩家
                                const otherPlayerId = targetPlayer.id === player1 ? player2 : player1;
                                const otherPlayer = gameManager.players.find(p => p.id === otherPlayerId);
                                
                                if (otherPlayer) {
                                    // 实际调换目标
                                    return otherPlayer;
                                }
                            }
                        }
                        return null;
                    },
                    onTurnStart: (player, gameManager) => {
                        // 下回合开始时调换失效
                        if (player.swappedTargets) {
                            player.swappedTargets = null;
                            return `乐子人的目标调换效果失效`;
                        }
                        return null;
                    }
                };
            }
            
            // 恐怖分子特殊规则
            getTerroristRules() {
                return {
                    onGameStart: (player, gameManager) => {
                        // 获得3张牛牛弹
                        for (let i = 0; i < 3; i++) {
                            const bullBullCard = {
                                ...gameManager.cardManager.cardDefinitions.bullBull,
                                id: `bullBull_terrorist_${player.id}_${i}`
                            };
                            player.hand.push(bullBullCard);
                        }
                        player.terroristBullBullCount = 0;
                        return `恐怖分子获得了3张牛牛弹`;
                    },
                    onUseCard: (player, card, target, gameManager) => {
                        // 使用牛牛弹时额外弃置牌数3倍使用次数
                        if (card.effect === 'mutual_discard') {
                            player.terroristBullBullCount = (player.terroristBullBullCount || 0) + 1;
                            const extraDiscard = player.terroristBullBullCount * 3;
                            
                            if (target && target.hand.length > 0) {
                                const actualDiscard = Math.min(extraDiscard, target.hand.length);
                                for (let i = 0; i < actualDiscard; i++) {
                                    gameManager.discardCard(target.hand.pop());
                                }
                                return `恐怖分子使用牛牛弹，额外弃置${actualDiscard}张牌`;
                            }
                        }
                        return null;
                    },
                    onDeath: (player, gameManager) => {
                        // 死亡时强制一名角色达成死亡条件
                        const alivePlayers = gameManager.players.filter(p => !p.isDead && p.id !== player.id);
                        if (alivePlayers.length > 0) {
                            const target = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
                            // 强制更改为达成死亡条件的状态
                            target.isDead = true;
                            target.isInDeathPeriod = true;
                            return `恐怖分子死亡，强制${target.name}达成死亡条件`;
                        }
                        return null;
                    }
                };
            }
            
            // 获取随机玩家
            getRandomPlayers(players, count) {
                const shuffled = [...players].sort(() => 0.5 - Math.random());
                return shuffled.slice(0, count);
            }
            
            // 应用职业效果
            applyClassEffect(player, action, data, gameManager) {
                const classDef = this.classDefinitions.find(c => c.name === player.className);
                if (!classDef || !classDef.specialRules) return null;
                
                let result = null;
                
                switch(action) {
                    case 'gameStart':
                        if (classDef.specialRules.onGameStart) {
                            result = classDef.specialRules.onGameStart(player, gameManager);
                        }
                        break;
                        
                    case 'useCard':
                        if (classDef.specialRules.onUseCard) {
                            result = classDef.specialRules.onUseCard(
                                player, 
                                data.card, 
                                data.target, 
                                gameManager
                            );
                        }
                        break;
                        
                    case 'turnStart':
                        if (classDef.specialRules.onTurnStart) {
                            result = classDef.specialRules.onTurnStart(player, gameManager);
                        }
                        break;

                    case 'checkCardPlay':
                        if (classDef.specialRules.onCheckCardPlay) {
                            result = classDef.specialRules.onCheckCardPlay(
                                player,
                                data.card,
                                gameManager
                            );
                        }
                        break;

                    case 'turnEnd':
                        if (classDef.specialRules.onTurnEnd) {
                            result = classDef.specialRules.onTurnEnd(player, gameManager);
                        }
                        break;
                        
                    case 'phaseStart':
                        if (classDef.specialRules.onPhaseStart) {
                            result = classDef.specialRules.onPhaseStart(
                                player, 
                                data.phase, 
                                gameManager
                            );
                        }
                        break;
                        
                    case 'death':
                        if (classDef.specialRules.onDeath) {
                            result = classDef.specialRules.onDeath(player, gameManager);
                        }
                        break;
                        
                    case 'defense':
                        if (classDef.specialRules.onDefense) {
                            result = classDef.specialRules.onDefense(
                                player, 
                                data.attacker, 
                                data.card
                            );
                        }
                        break;
                }
                
                return result;
            }
            
            // 获取职业能力描述
            getClassAbility(className) {
                const classDef = this.classDefinitions.find(c => c.name === className);
                return classDef ? classDef.abilities : [];
            }
            
            // 其他职业规则方法（简化实现）
            getFoolRules() { return {}; }
            
            // 异教主特殊规则
            getCultLeaderRules() {
                return {
                    onGameStart: (player, gameManager) => {
                        // 初始化邪教徒状态
                        player.cultists = [];
                        return `异教主开始招募信徒`;
                    },
                    onPlayerDeath: (player, deadPlayer, gameManager) => {
                        // 当有玩家死亡后，将其转化为邪教徒
                        if (deadPlayer.isDead) {
                            // 将20张牌置入弃牌堆
                            for (let i = 0; i < 20; i++) {
                                const card = gameManager.drawCardFromDeck();
                                if (card) {
                                    gameManager.discardCard(card);
                                }
                            }
                            
                            // 令该玩家获得10张牌
                            for (let i = 0; i < 10; i++) {
                                const card = gameManager.drawCardFromDeck();
                                if (card) {
                                    deadPlayer.hand.push(card);
                                }
                            }
                            
                            // 将职业替换成邪教徒
                            deadPlayer.originalClass = deadPlayer.className;
                            deadPlayer.className = '邪教徒';
                            deadPlayer.isDead = false;
                            deadPlayer.isInDeathPeriod = false;
                            
                            // 记录邪教徒
                            player.cultists.push(deadPlayer.id);
                            
                            return `异教主将${deadPlayer.name}转化为了邪教徒`;
                        }
                        return null;
                    }
                };
            }
            
            // 邪教徒特殊规则
            getCultistRules() {
                return {
                    onResurrectionAttempt: (player, gameManager) => {
                        // 异教主存活时，无法复活
                        const cultLeader = gameManager.players.find(p => p.className === '异教主' && !p.isDead);
                        if (cultLeader) {
                            return false; // 阻止复活
                        }
                        return null;
                    },
                    onResurrection: (player, gameManager) => {
                        // 当复活后，替换回原本的职业
                        if (player.originalClass) {
                            player.className = player.originalClass;
                            player.originalClass = null;
                            return `邪教徒复活后恢复了原本的职业`;
                        }
                        return null;
                    },
                    onRestPhase: (player, gameManager) => {
                        // 休息阶段，须弃置一张牌
                        if (player.hand.length > 0) {
                            const discardedCard = player.hand.pop();
                            gameManager.discardCard(discardedCard);
                            return `邪教徒弃置了1张牌`;
                        }
                        return null;
                    }
                };
            }
            
            // 尸体特殊规则
            getCorpseRules() {
                return {
                    onGameStart: (player, gameManager) => {
                        // 游戏开始时进入死亡期
                        player.isDead = true;
                        player.isInDeathPeriod = true;
                        return `尸体进入了死亡期`;
                    },
                    onPlayerCardChange: (player, targetPlayer, cardChange, gameManager) => {
                        // 当你为非死亡期且非因技能获得牌时，额外获得一张牌
                        if (!player.isInDeathPeriod && targetPlayer.id === player.id) {
                            const { type, source } = cardChange;
                            if (type === 'gain' && source !== 'skill') {
                                const extraCard = gameManager.drawCardFromDeck();
                                if (extraCard) {
                                    player.hand.push(extraCard);
                                    return `尸体额外获得了1张牌`;
                                }
                            }
                        }
                        return null;
                    },
                    onRestPhase: (player, gameManager) => {
                        // 当你为死亡期时，休息阶段需额外弃置一张牌
                        if (player.isInDeathPeriod && player.hand.length > 0) {
                            const discardedCard = player.hand.pop();
                            gameManager.discardCard(discardedCard);
                            return `尸体在死亡期，额外弃置了1张牌`;
                        }
                        return null;
                    },
                    onTargetSpecified: (player, targetPlayer, gameManager) => {
                        // 当你为死亡期时，其他玩家的非复活类牌和技能无法指定你为目标
                        if (player.isInDeathPeriod && targetPlayer.id === player.id) {
                            // 非复活类牌无法指定尸体为目标
                            return false; // 阻止指定
                        }
                        return null;
                    }
                };
            }
            
            // 政治家特殊规则
            getPoliticianRules() {
                return {
                    onGameStart: (player, gameManager) => {
                        // 初始化外交记录
                        player.playerLastChoices = new Map();
                        player.allianceCardCount = 0;
                        return `政治家开始施展外交手段`;
                    },
                    onDrawPhase: (player, gameManager) => {
                        // 发牌阶段，获得一张[同盟]
                        const allianceCard = {
                            id: `alliance_politician_${player.id}_${Date.now()}`,
                            name: '同盟',
                            type: 'item',
                            description: '同盟道具',
                            effect: 'alliance',
                            icon: 'fa-handshake',
                            color: '#2c3e50'
                        };
                        player.hand.push(allianceCard);
                        player.allianceCardCount++;
                        return `政治家获得了1张同盟牌`;
                    },
                    onDeductionPhase: (player, gameManager) => {
                        // 扣置阶段，对每名玩家选择一项特殊外交
                        const otherPlayers = gameManager.players.filter(p => !p.isDead && p.id !== player.id);
                        
                        otherPlayers.forEach(targetPlayer => {
                            // 决定选择哪一项（不可两回合内对同一名玩家选择相同选项）
                            const lastChoice = player.playerLastChoices.get(targetPlayer.id);
                            const availableChoices = lastChoice === 1 ? [2] : [1, 2];
                            const choice = availableChoices[Math.floor(Math.random() * availableChoices.length)];
                            
                            // 记录本次选择
                            player.playerLastChoices.set(targetPlayer.id, choice);
                            
                            if (choice === 1) {
                                // 选项1: 获得其一张牌，然后令其本回合将牌的使用目标更改为你
                                if (targetPlayer.hand.length > 0) {
                                    const takenCard = targetPlayer.hand.pop();
                                    player.hand.push(takenCard);
                                    // 标记目标玩家本回合的使用目标
                                    targetPlayer.forceTarget = player.id;
                                    return `政治家从${targetPlayer.name}处获得了一张牌，并使其本回合目标指向自己`;
                                }
                            } else {
                                // 选项2: 交给其一张牌，然后本回合若有指定你为目标牌时，其也成为此牌的目标
                                if (player.hand.length > 0) {
                                    const givenCard = player.hand.pop();
                                    targetPlayer.hand.push(givenCard);
                                    // 标记目标玩家成为指向政治家的牌的共同目标
                                    targetPlayer.shareTarget = player.id;
                                    return `政治家给了${targetPlayer.name}一张牌，并使其成为指向自己的牌的共同目标`;
                                }
                            }
                        });
                        
                        return null;
                    },
                    onTargetSpecified: (player, targetPlayer, gameManager) => {
                        // 当不为你的玩家指定多个目标且包含你时，其可以让你获得一张牌
                        if (targetPlayer.id !== player.id) {
                            const otherPlayers = gameManager.players.filter(p => 
                                !p.isDead && p.id !== player.id && p.id !== targetPlayer.id
                            );
                            if (otherPlayers.length > 0) {
                                // 有多个目标且包含政治家
                                const giveCard = Math.random() > 0.5;
                                if (giveCard) {
                                    const card = gameManager.drawCardFromDeck();
                                    if (card) {
                                        player.hand.push(card);
                                        return `政治家通过外交手段获得了一张牌`;
                                    }
                                }
                            }
                        }
                        return null;
                    },
                    onOtherPlayerUseCard: (player, otherPlayer, card, gameManager) => {
                        // 处理强制目标和共享目标
                        if (otherPlayer.forceTarget === player.id) {
                            // 强制目标为政治家
                            return player;
                        } else if (otherPlayer.shareTarget === player.id) {
                            // 共享目标
                            return [targetPlayer, otherPlayer];
                        }
                        return null;
                    },
                    onTurnEnd: (player, gameManager) => {
                        // 清除本回合的目标标记
                        gameManager.players.forEach(p => {
                            if (p.forceTarget === player.id) {
                                p.forceTarget = null;
                            }
                            if (p.shareTarget === player.id) {
                                p.shareTarget = null;
                            }
                        });
                        return null;
                    }
                };
            }
            
            // 警官特殊规则
            getPoliceRules() {
                return {
                    onGameStart: (player, gameManager) => {
                        // 初始化通缉状态
                        player.wantedUsed = false;
                        player.wantedTarget = null;
                        player.arrestUsed = false;
                        player.arrestedTarget = null;
                        return `警官开始执行职务`;
                    },
                    onDrawPhase: (player, gameManager) => {
                        // 发牌阶段，额外获得三张[引战]
                        for (let i = 0; i < 3; i++) {
                            const provokeCard = {
                                id: `provoke_police_${player.id}_${Date.now()}_${i}`,
                                name: '引战',
                                type: 'item',
                                description: '引战道具',
                                effect: 'provoke',
                                icon: 'fa-gavel',
                                color: '#34495e'
                            };
                            player.hand.push(provokeCard);
                        }
                        return `警官获得了3张引战牌`;
                    },
                    onRestPhase: (player, gameManager) => {
                        // 休息阶段，可以选择通缉（限一次）
                        if (!player.wantedUsed) {
                            const otherPlayers = gameManager.players.filter(p => !p.isDead && p.id !== player.id);
                            if (otherPlayers.length > 0) {
                                const targetPlayer = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
                                
                                // 执行通缉
                                player.wantedTarget = targetPlayer.id;
                                player.wantedUsed = true;
                                
                                return `警官通缉了${targetPlayer.name}`;
                            }
                        }
                        
                        // 处理逮捕后的手牌上限
                        if (player.arrestedTarget) {
                            const arrestedPlayer = gameManager.players.find(p => p.id === player.arrestedTarget);
                            if (arrestedPlayer) {
                                // 手牌上限为警官的手牌数
                                const limit = player.hand.length;
                                while (arrestedPlayer.hand.length > limit) {
                                    gameManager.discardCard(arrestedPlayer.hand.pop());
                                }
                                return `警官限制了被捕玩家的手牌数`;
                            }
                        }
                        
                        return null;
                    },
                    onTargetSpecified: (player, targetPlayer, gameManager) => {
                        // 通缉效果：当其他玩家指定不为你的玩家为唯一目标时，你也成为此牌的目标
                        if (player.wantedTarget && targetPlayer.id !== player.id) {
                            return [targetPlayer, player]; // 同时成为目标
                        }
                        return null;
                    },
                    onPlayerDeath: (player, deadPlayer, gameManager) => {
                        // 当通缉玩家死亡时，对其他一名玩家进行逮捕
                        if (player.wantedTarget === deadPlayer.id && !player.arrestUsed) {
                            const otherPlayers = gameManager.players.filter(p => !p.isDead && p.id !== player.id);
                            if (otherPlayers.length > 0) {
                                const arrestTarget = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
                                
                                // 执行逮捕
                                player.arrestedTarget = arrestTarget.id;
                                player.arrestUsed = true;
                                
                                return `警官逮捕了${arrestTarget.name}`;
                            }
                        }
                        return null;
                    },
                    onPoliceDeath: (player, gameManager) => {
                        // 警官死亡时，清除通缉状态并获得逮捕能力
                        if (player.wantedTarget) {
                            player.wantedTarget = null;
                            player.arrestUsed = false;
                            return `警官死亡，通缉状态清除，获得了逮捕能力`;
                        }
                        return null;
                    }
                };
            }
            
            // 杀手特殊规则
            getKillerRules() {
                return {
                    onGameStart: (player, gameManager) => {
                        // 初始化标记次数和状态
                        player.markUsed = false;
                        player.markedTarget = null;
                        player.doubleEffect = false;
                        return `杀手准备好了暗杀计划`;
                    },
                    onRestPhase: (player, gameManager) => {
                        // 休息阶段，对一名玩家进行标记（限一次）
                        if (!player.markUsed) {
                            const otherPlayers = gameManager.players.filter(p => !p.isDead && p.id !== player.id);
                            if (otherPlayers.length > 0) {
                                const targetPlayer = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
                                
                                // 标记目标
                                player.markedTarget = targetPlayer.id;
                                player.markUsed = true;
                                player.doubleEffect = true;
                                
                                // 进入死亡期
                                player.isInDeathPeriod = true;
                                
                                return `杀手标记了${targetPlayer.name}，获得/弃置其牌数将翻倍，然后进入了死亡期`;
                            }
                        }
                        return null;
                    },
                    onPlayerCardChange: (player, targetPlayer, cardChange, gameManager) => {
                        // 对标记目标的牌数变化翻倍
                        if (player.doubleEffect && player.markedTarget === targetPlayer.id) {
                            const { type, count } = cardChange;
                            
                            if (type === 'gain') {
                                // 获得牌数翻倍
                                const extraCount = count;
                                for (let i = 0; i < extraCount; i++) {
                                    const card = gameManager.drawCardFromDeck();
                                    if (card) {
                                        player.hand.push(card);
                                    }
                                }
                                return `杀手对标记目标的效果翻倍，额外获得了${extraCount}张牌`;
                            } else if (type === 'lose') {
                                // 弃置牌数翻倍
                                const extraCount = count;
                                const actualExtra = Math.min(extraCount, targetPlayer.hand.length);
                                for (let i = 0; i < actualExtra; i++) {
                                    gameManager.discardCard(targetPlayer.hand.pop());
                                }
                                return `杀手对标记目标的效果翻倍，额外弃置了${actualExtra}张牌`;
                            }
                        }
                        return null;
                    },
                    onPlayerDeath: (player, deadPlayer, gameManager) => {
                        // 当被标记的玩家因杀手的牌或技能效果死亡时
                        if (player.markedTarget === deadPlayer.id) {
                            // 重置自己状态并获得十张牌
                            player.markedTarget = null;
                            player.doubleEffect = false;
                            player.isInDeathPeriod = false;
                            
                            // 获得十张牌
                            for (let i = 0; i < 10; i++) {
                                const card = gameManager.drawCardFromDeck();
                                if (card) {
                                    player.hand.push(card);
                                }
                            }
                            
                            return `杀手成功击杀了标记目标${deadPlayer.name}，重置了状态并获得了10张牌`;
                        }
                        return null;
                    }
                };
            }
            
            // 寄生者特殊规则
            getParasiteRules() {
                return {
                    onGameStart: (player, gameManager) => {
                        // 游戏开始时，选择一名玩家
                        const otherPlayers = gameManager.players.filter(p => !p.isDead && p.id !== player.id);
                        if (otherPlayers.length > 0) {
                            const hostPlayer = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
                            
                            // 记录宿主
                            player.hostPlayerId = hostPlayer.id;
                            
                            // 将胜利和死亡条件更改为与宿主一致
                            player.victoryCondition = hostPlayer.victoryCondition;
                            player.deathCondition = hostPlayer.deathCondition;
                            
                            return `寄生者附着在了${hostPlayer.name}身上，共享其胜利和死亡条件`;
                        }
                        return null;
                    },
                    onPlayerCardChange: (player, targetPlayer, cardChange, gameManager) => {
                        // 当指定的玩家因为牌的效果获得/失去牌时，立刻获得/弃置等量牌
                        if (player.hostPlayerId === targetPlayer.id) {
                            const { type, count } = cardChange;
                            
                            if (type === 'gain') {
                                // 宿主获得牌，寄生者也获得等量牌
                                for (let i = 0; i < count; i++) {
                                    const card = gameManager.drawCardFromDeck();
                                    if (card) {
                                        player.hand.push(card);
                                    }
                                }
                                return `寄生者从宿主${targetPlayer.name}处获得了${count}张牌`;
                            } else if (type === 'lose') {
                                // 宿主失去牌，寄生者也弃置等量牌
                                const loseCount = Math.min(count, player.hand.length);
                                for (let i = 0; i < loseCount; i++) {
                                    gameManager.discardCard(player.hand.pop());
                                }
                                return `寄生者因宿主${targetPlayer.name}失去了${loseCount}张牌`;
                            }
                        }
                        return null;
                    },
                    onHostDeath: (player, gameManager) => {
                        // 当宿主死亡时的处理
                        const hostPlayer = gameManager.players.find(p => p.id === player.hostPlayerId);
                        if (hostPlayer && hostPlayer.isDead) {
                            // 寄生者可以选择新的宿主
                            const otherPlayers = gameManager.players.filter(p => !p.isDead && p.id !== player.id);
                            if (otherPlayers.length > 0) {
                                const newHost = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
                                player.hostPlayerId = newHost.id;
                                player.victoryCondition = newHost.victoryCondition;
                                player.deathCondition = newHost.deathCondition;
                                return `寄生者的宿主死亡，重新附着在了${newHost.name}身上`;
                            } else {
                                // 没有其他玩家，寄生者死亡
                                player.isDead = true;
                                return `寄生者的宿主死亡，且没有其他玩家可以附着，寄生者死亡`;
                            }
                        }
                        return null;
                    }
                };
            }
            
            // 胆小鬼特殊规则
            getCowardRules() {
                return {
                    onGameStart: (player, gameManager) => {
                        // 初始化反伤状态和出牌模式
                        player.counterAttackUsed = false;
                        player.attackPhase = true; // true: 自由出牌回合, false: 只能出非伤害牌回合
                        return `胆小鬼准备好了战斗策略`;
                    },
                    onTurnStart: (player, gameManager) => {
                        // 切换出牌模式
                        player.attackPhase = !player.attackPhase;
                        player.counterAttackUsed = false;
                        return player.attackPhase ? `胆小鬼进入自由出牌回合` : `胆小鬼进入防御回合（只能出非伤害牌）`;
                    },
                    onCounterAttack: (player, attacker, gameManager) => {
                        // 每回合可以强制反伤一名玩家
                        if (!player.counterAttackUsed) {
                            player.counterAttackUsed = true;
                            
                            // 反伤效果：弃置攻击者一张牌
                            if (attacker.hand.length > 0) {
                                const counteredCard = attacker.hand.pop();
                                gameManager.discardCard(counteredCard);
                                return `胆小鬼对${attacker.name}进行了反伤，弃置了其一张牌`;
                            }
                        }
                        return null;
                    },
                    onOtherPlayerUseCard: (player, otherPlayer, card, gameManager) => {
                        // 如果有玩家使用恢复类牌，自动获得3张牌
                        if (card.type === 'recovery' || card.effect === 'heal' || card.name.includes('恢复')) {
                            for (let i = 0; i < 3; i++) {
                                const drawnCard = gameManager.drawCardFromDeck();
                                if (drawnCard) {
                                    player.hand.push(drawnCard);
                                }
                            }
                            return `有玩家使用恢复类牌，胆小鬼额外获得3张牌`;
                        }
                        return null;
                    },
                    onCheckCardPlay: (player, card, gameManager) => {
                        // 检查出牌限制
                        if (!player.attackPhase) {
                            // 防御回合，只能出非伤害牌
                            if (card.type === 'attack' || card.effect === 'damage' || card.name.includes('杀') || card.name.includes('攻击')) {
                                return {
                                    invalid: true,
                                    message: `胆小鬼在防御回合不能使用伤害类牌`
                                };
                            }
                        }
                        return null;
                    }
                };
            }
            
            // 偷窥狂特殊规则
            getPeeperRules() {
                return {
                    onUseCard: (player, card, target, gameManager) => {
                        // 当使用鬼手时，额外从牌堆获得一张牌
                        if (card.name === '鬼手' || card.effect === 'steal_card') {
                            const extraCard = gameManager.drawCardFromDeck();
                            if (extraCard) {
                                player.hand.push(extraCard);
                                return `偷窥狂使用鬼手，额外获得1张牌`;
                            }
                        }
                        return null;
                    },
                    onDeductionPhase: (player, gameManager) => {
                        // 扣置阶段，翻开未被翻开过牌的一名玩家扣置的牌
                        if (!player.peepedPlayers) {
                            player.peepedPlayers = new Set();
                        }
                        
                        const otherPlayers = gameManager.players.filter(p => 
                            !p.isDead && p.id !== player.id && !player.peepedPlayers.has(p.id)
                        );
                        
                        if (otherPlayers.length > 0) {
                            const targetPlayer = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
                            
                            // 模拟翻开扣置的牌（这里简化处理，假设玩家有扣置的牌）
                            if (targetPlayer.hand.length > 0) {
                                const revealedCard = targetPlayer.hand.pop();
                                
                                // 记录被翻开的玩家
                                player.peepedPlayers.add(targetPlayer.id);
                                
                                // 记录本阶段获得的牌
                                if (!player.phaseCards) {
                                    player.phaseCards = [];
                                }
                                player.phaseCards.push(revealedCard);
                                
                                // 偷窥狂获得并使用这张牌
                                player.hand.push(revealedCard);
                                
                                // 记录目标玩家
                                player.currentPeepTarget = targetPlayer.id;
                                
                                return `偷窥狂翻开了${targetPlayer.name}的牌并获得了${revealedCard.name}`;
                            }
                        }
                        return null;
                    },
                    onRestPhase: (player, gameManager) => {
                        // 休息阶段处理
                        if (player.currentPeepTarget && player.phaseCards) {
                            const actionChoice = Math.random() > 0.5 ? 1 : 2;
                            const targetPlayer = gameManager.players.find(p => p.id === player.currentPeepTarget);
                            
                            if (targetPlayer) {
                                if (actionChoice === 1) {
                                    // 选项1: 将本阶段获得的牌交给其
                                    player.phaseCards.forEach(card => {
                                        targetPlayer.hand.push(card);
                                    });
                                    player.phaseCards = [];
                                    return `偷窥狂将获得的牌交给了${targetPlayer.name}`;
                                } else {
                                    // 选项2: 被翻开过牌的玩家弃置你3张牌
                                    const discardCount = Math.min(3, player.hand.length);
                                    for (let i = 0; i < discardCount; i++) {
                                        gameManager.discardCard(player.hand.pop());
                                    }
                                    
                                    // 弃置后，该玩家视为未被翻开过牌
                                    player.peepedPlayers.delete(targetPlayer.id);
                                    player.phaseCards = [];
                                    return `${targetPlayer.name}弃置了偷窥狂${discardCount}张牌，现在可以再次被偷窥`;
                                }
                            }
                        }
                        return null;
                    }
                };
            }
            
            // 魔术师特殊规则
            getMagicianRules() {
                return {
                    onDeductionPhase: (player, gameManager) => {
                        // 扣置阶段，获得至多三张牌并展示
                        const drawnCards = [];
                        for (let i = 0; i < 3; i++) {
                            const card = gameManager.drawCardFromDeck();
                            if (card) {
                                drawnCards.push(card);
                            }
                        }
                        
                        if (drawnCards.length > 0) {
                            // 记录牌类型
                            if (!player.recordedCardTypes) {
                                player.recordedCardTypes = new Set();
                            }
                            
                            // 弃置未记录类型的牌并记录
                            const keptCards = [];
                            const discardedCards = [];
                            
                            drawnCards.forEach(card => {
                                if (!player.recordedCardTypes.has(card.type)) {
                                    discardedCards.push(card);
                                    player.recordedCardTypes.add(card.type);
                                } else {
                                    keptCards.push(card);
                                }
                            });
                            
                            // 处理弃置的牌
                            discardedCards.forEach(card => {
                                gameManager.discardCard(card);
                            });
                            
                            // 添加保留的牌到手牌
                            keptCards.forEach(card => {
                                player.hand.push(card);
                            });
                            
                            // 标记本回合记录的类型
                            player.currentTurnRecordedTypes = new Set([...player.recordedCardTypes]);
                            
                            return `魔术师获得并展示了${drawnCards.length}张牌，弃置了${discardedCards.length}张未记录类型的牌`;
                        }
                        return null;
                    },
                    onCardRevealed: (player, revealedCard, gameManager) => {
                        // 当有玩家展示牌时，用一张牌置换其中一张展示牌
                        if (player.hand.length > 0 && revealedCard) {
                            // 选择一张手牌置换
                            const replacementCard = player.hand.pop();
                            
                            // 替换展示的牌
                            const oldCard = revealedCard;
                            
                            // 处理置换效果
                            player.hand.push(oldCard);
                            
                            return {
                                oldCard: oldCard,
                                newCard: replacementCard,
                                message: `魔术师用${replacementCard.name}置换了${oldCard.name}`
                            };
                        }
                        return null;
                    },
                    onCardEffect: (player, card, gameManager) => {
                        // 本回合所有翻出与弃置的展示牌中同种类型的牌无效且获得之
                        if (player.currentTurnRecordedTypes && player.currentTurnRecordedTypes.has(card.type)) {
                            // 牌无效
                            player.hand.push(card);
                            return {
                                invalid: true,
                                message: `魔术师使${card.name}无效并获得了它`
                            };
                        }
                        return null;
                    },
                    onTurnEnd: (player, gameManager) => {
                        // 回合结束后清除本回合记录
                        player.currentTurnRecordedTypes = null;
                        return null;
                    }
                };
            }
            
            // 恶魔特殊规则
            getDemonRules() {
                return {
                    onGameStart: (player, gameManager) => {
                        // 游戏开始时，你的胜利条件更改为你没有手牌时，其他角色的胜利条件不包含你
                        player.demonVictoryCondition = true;
                        
                        // 标记其他角色的胜利条件不包含恶魔
                        gameManager.players.forEach(p => {
                            if (p.id !== player.id) {
                                p.excludeDemonFromVictory = true;
                            }
                        });
                        
                        return `恶魔的胜利条件更改为没有手牌时获胜，其他角色的胜利条件不包含恶魔`;
                    },
                    onUseCard: (player, card, target, gameManager) => {
                        // 当使用「制衡」时改为交给其他所有玩家一张牌，本回合指定为你的牌无效
                        if (card.name === '制衡') {
                            // 交给其他所有玩家一张牌
                            gameManager.players.forEach(p => {
                                if (p.id !== player.id && !p.isDead) {
                                    if (player.hand.length > 0) {
                                        const given = player.hand.splice(0, 1);
                                        p.hand.push(...given);
                                    }
                                }
                            });
                            // 本回合指定为你的牌无效
                            player.demonImmuneTurn = gameManager.turn;
                            return `恶魔使用了制衡，交给其他玩家各一张牌，本回合对恶魔的指定无效`;
                        }
                        return null;
                    },
                    onCheckDeath: (player, gameManager) => {
                        // 手牌为0时不会死亡，检查胜利条件
                        if (player.hand.length === 0 && player.demonVictoryCondition) {
                            // 检查是否满足胜利条件
                            gameManager.winner = player;
                            return `恶魔手牌为0，满足胜利条件！`;
                        }
                        return null;
                    },
                    onCheckVictory: (player, gameManager) => {
                        // 其他角色的胜利条件不包含恶魔
                        if (player.excludeDemonFromVictory) {
                            const demonPlayer = gameManager.players.find(p => p.demonVictoryCondition);
                            if (demonPlayer && !demonPlayer.isDead) {
                                // 胜利条件不包含恶魔，所以恶魔存活时不允许其他角色获胜
                                return false;
                            }
                        }
                        return null;
                    }
                };
            }
            
            // 教皇特殊规则
            getPopeRules() {
                return {
                    onUseCard: (player, card, target, gameManager) => {
                        // 当打出绿帽、十字架、制衡、白旗时，额外获得两张道具
                        const specialCards = ['绿帽', '十字架', '制衡', '白旗'];
                        if (specialCards.includes(card.name)) {
                            // 额外获得两张道具
                            const itemCards = ['绿帽', '十字架', '制衡', '白旗'];
                            for (let i = 0; i < 2; i++) {
                                const itemName = itemCards[Math.floor(Math.random() * itemCards.length)];
                                const newCard = {
                                    id: `${itemName}_pope_${player.id}_${Date.now()}_${i}`,
                                    name: itemName,
                                    type: 'item',
                                    description: `${itemName}道具`,
                                    effect: itemName,
                                    icon: 'fa-gem',
                                    color: '#f39c12'
                                };
                                player.hand.push(newCard);
                            }
                            return `教皇打出了${card.name}，额外获得了两张道具`;
                        }
                        return null;
                    },
                    onCheckDeath: (player, gameManager) => {
                        // 死亡条件更改为没有以下道具时的其中一个（绿帽，十字架，制衡，白旗）
                        const requiredItems = ['绿帽', '十字架', '制衡', '白旗'];
                        const hasRequiredItem = player.hand.some(card => 
                            requiredItems.includes(card.name)
                        );
                        
                        if (!hasRequiredItem) {
                            player.isDead = true;
                            return `${player.name}没有必要的道具，死亡了！`;
                        }
                        return null;
                    },
                    onRestPhase: (player, gameManager) => {
                        // 休息阶段，弃置两张牌并获得一张牌
                        if (player.hand.length >= 2) {
                            const discarded = player.hand.splice(0, 2);
                            discarded.forEach(card => gameManager.discardCard(card));
                            const newCard = gameManager.drawCardFromDeck();
                            if (newCard) {
                                player.hand.push(newCard);
                                return `教皇弃置了两张牌并获得了一张牌`;
                            }
                        }
                        return null;
                    }
                };
            }
            
            // 燃烧者特殊规则
            getBurnerRules() {
                return {
                    onPhaseStart: (player, phase, gameManager) => {
                        if (phase === 'start') {
                            // 回合开始时，可以立刻进入死亡期
                            if (!player.isInDeathPeriod) {
                                // 立刻进入死亡期
                                player.isInDeathPeriod = true;
                                player.cannotBeResurrected = true;
                                player.cannotBeReset = true;
                                
                                // 获得30张牌
                                for (let i = 0; i < 30; i++) {
                                    const newCard = gameManager.drawCardFromDeck();
                                    if (newCard) {
                                        player.hand.push(newCard);
                                    }
                                }
                                return `燃烧者回合开始时进入死亡期，获得了30张牌`;
                            }
                        }
                        return null;
                    },
                    onEnterDeathPeriod: (player, gameManager) => {
                        // 进入死亡期时的效果
                        if (!player.firstDeathPeriod) {
                            player.firstDeathPeriod = true;
                            // 死亡期免疫
                            player.deathPeriodImmune = true;
                            return `燃烧者进入死亡期，获得死亡期免疫`;
                        }
                        return null;
                    },
                    onDeath: (player, gameManager) => {
                        // 死亡时，可以立刻进入死亡期
                        player.isInDeathPeriod = true;
                        player.cannotBeResurrected = true;
                        player.cannotBeReset = true;
                        
                        // 获得30张牌
                        for (let i = 0; i < 30; i++) {
                            const newCard = gameManager.drawCardFromDeck();
                            if (newCard) {
                                player.hand.push(newCard);
                            }
                        }
                        return `燃烧者死亡时进入死亡期，获得了30张牌`;
                    },
                    onTurnStart: (player, gameManager) => {
                        // 从下回合开始的第三个回合开始时，弃置所有手牌
                        if (player.burnerTurnCount === undefined) {
                            player.burnerTurnCount = 0;
                        }
                        player.burnerTurnCount++;
                        
                        if (player.burnerTurnCount >= 3) {
                            const discardedCount = player.hand.length;
                            player.hand = [];
                            return `燃烧者弃置了所有${discardedCount}张手牌`;
                        }
                        return null;
                    }
                };
            }
        }

        // ==================== 玩家类 ====================
        class Player {
            constructor(name, type = 'human', className = '士兵') {
                this.id = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                this.name = name;
                this.type = type;
                this.className = className;
                this.hand = [];
                this.isDead = false;
                this.isCurrent = false;
                this.isImmune = false;
                this.skills = [];
                this.avatar = this.getAvatarForClass(className);
                this.team = null;
                this.classAbility = this.getClassAbility(className);
                this.isReady = false;
            }
            
            // 根据职业获取头像
            getAvatarForClass(className) {
                const classAvatars = {
                    '炼金术师': '🧪',
                    '士兵': '🛡️',
                    '商人': '💰',
                    '天使': '👼',
                    '偷窥狂': '👁️',
                    '魔术师': '🎩',
                    '警官': '👮',
                    '政治家': '🏛️',
                    '尸体': '💀',
                    '傻子': '🤪',
                    '乐子人': '😜',
                    '胆小鬼': '😨',
                    '寄生者': '🪱',
                    '杀手': '🗡️',
                    '恐怖分子': '💣',
                    '异教主': '👹'
                };
                return classAvatars[className] || '👤';
            }
            
            // 获取职业能力
            getClassAbility(className) {
                const classAbilities = {
                    '士兵': {
                        name: '钢铁意志',
                        description: '使用攻击卡时效果增强'
                    },
                    '商人': {
                        name: '精明交易',
                        description: '交换卡牌时获得额外收益'
                    },
                    '天使': {
                        name: '神圣庇护',
                        description: '复活玩家时为其补充手牌'
                    },
                    '恐怖分子': {
                        name: '自爆袭击',
                        description: '牛牛弹效果大幅增强'
                    },
                    '炼金术师': {
                        name: '药剂大师',
                        description: '药类道具效果增强'
                    }
                };
                return classAbilities[className] || { name: '基础能力', description: '无特殊效果' };
            }
        }

        // ==================== AI玩家逻辑 ====================
        class AIPlayer {
            constructor(difficulty = 'medium', className = '士兵') {
                this.difficulty = difficulty;
                this.className = className;
                this.behavior = this.getBehaviorPattern();
                this.lastAction = null;
                this.memory = {
                    playerThreats: new Map(),
                    cardHistory: [],
                    preferredTargets: []
                };
            }
            
            // 根据难度获取行为模式
            getBehaviorPattern() {
                const patterns = {
                    easy: {
                        useCardChance: 0.5,
                        targetStrategy: 'random',
                        thinkTime: 1000,
                        aggression: 0.3,
                        defense: 0.7,
                        strategicThinking: 0.2,
                        cardEvaluation: 'basic'
                    },
                    medium: {
                        useCardChance: 0.7,
                        targetStrategy: 'threat_based',
                        thinkTime: 1500,
                        aggression: 0.5,
                        defense: 0.5,
                        strategicThinking: 0.5,
                        cardEvaluation: 'advanced'
                    },
                    hard: {
                        useCardChance: 0.9,
                        targetStrategy: 'strategic',
                        thinkTime: 2000,
                        aggression: 0.7,
                        defense: 0.3,
                        strategicThinking: 0.8,
                        cardEvaluation: 'expert'
                    },
                    expert: {
                        useCardChance: 0.95,
                        targetStrategy: 'strategic',
                        thinkTime: 2500,
                        aggression: 0.8,
                        defense: 0.2,
                        strategicThinking: 0.9,
                        cardEvaluation: 'master'
                    }
                };
                
                return patterns[this.difficulty] || patterns.medium;
            }
            
            // 选择要使用的卡牌
            chooseCardToUse(hand, gameState, currentPlayer) {
                if (hand.length === 0) return null;
                
                // 评估当前局势
                const situation = this.analyzeSituation(gameState, currentPlayer);
                
                // 根据职业和难度调整策略
                const adjustedChance = this.behavior.useCardChance * 
                    (this.className === '傻子' ? 1.2 : 1) *
                    (this.className === '恐怖分子' ? 1.3 : 1) *
                    (this.difficulty === 'expert' ? 1.1 : 1);
                
                const shouldUseCard = Math.random() < adjustedChance;
                
                if (!shouldUseCard && hand.length < 10) {
                    // 手牌较少时倾向于使用卡牌
                    if (Math.random() < 0.7) {
                        return this.chooseBestCard(hand, gameState, currentPlayer, situation);
                    }
                    return null;
                }
                
                return this.chooseBestCard(hand, gameState, currentPlayer, situation);
            }
            
            // 分析当前局势
            analyzeSituation(gameState, currentPlayer) {
                const alivePlayers = gameState.players.filter(p => !p.isDead);
                const playerCount = alivePlayers.length;
                const currentHandSize = currentPlayer.hand.length;
                
                // 计算威胁等级
                let maxThreat = 0;
                let mostThreateningPlayer = null;
                
                alivePlayers.forEach(player => {
                    if (player.id !== currentPlayer.id) {
                        // 手牌越多威胁越大
                        let threat = player.hand.length * 10;
                        
                        // 职业威胁加成
                        const classThreats = {
                            '炼金术师': 30,
                            '士兵': 25,
                            '恐怖分子': 50,
                            '恶魔': 35,
                            '异教主': 40,
                            '杀手': 45
                        };
                        
                        if (classThreats[player.className]) {
                            threat += classThreats[player.className];
                        }
                        
                        // 记录威胁
                        if (threat > maxThreat) {
                            maxThreat = threat;
                            mostThreateningPlayer = player;
                        }
                        
                        this.memory.playerThreats.set(player.id, threat);
                    }
                });
                
                // 判断当前局势
                let situation = 'neutral';
                
                if (currentHandSize < 5) {
                    situation = 'defensive';
                } else if (playerCount <= 2) {
                    situation = 'aggressive';
                } else if (mostThreateningPlayer && maxThreat > 50) {
                    situation = 'threatened';
                } else if (currentHandSize > 15) {
                    situation = 'advantage';
                } else if (playerCount > 4) {
                    situation = 'early_game';
                }
                
                return {
                    situation,
                    playerCount,
                    currentHandSize,
                    mostThreateningPlayer,
                    threatLevel: maxThreat,
                    deckCount: gameState.deckCount
                };
            }
            
            // 选择最佳卡牌
            chooseBestCard(hand, gameState, currentPlayer, situation) {
                // 给每张卡牌评分
                const cardScores = hand.map((card, index) => {
                    let score = this.evaluateCard(card, situation, gameState, currentPlayer);
                    
                    // 根据职业调整评分
                    score = this.adjustScoreByClass(score, card, currentPlayer);
                    
                    // 根据难度调整随机因素
                    const randomFactor = this.difficulty === 'easy' ? 0.4 : 
                                      this.difficulty === 'medium' ? 0.2 : 
                                      this.difficulty === 'hard' ? 0.1 : 0.05;
                    score += (Math.random() * 20 * randomFactor) - (10 * randomFactor);
                    
                    return { card, index, score };
                });
                
                // 选择评分最高的卡牌
                cardScores.sort((a, b) => b.score - a.score);
                
                if (cardScores.length > 0 && cardScores[0].score > 20) {
                    return { card: cardScores[0].card, index: cardScores[0].index };
                }
                
                return null;
            }
            
            // 评估卡牌价值
            evaluateCard(card, situation, gameState, currentPlayer) {
                let score = 0;
                const alivePlayers = gameState.players.filter(p => !p.isDead && p.id !== currentPlayer.id);
                const aliveCount = alivePlayers.length;
                
                // 基础价值
                switch(card.effect) {
                    case 'discard_three': // 杀人诛心
                        score = 40;
                        if (situation === 'aggressive' || situation === 'threatened') score += 20;
                        if (aliveCount === 1) score += 30;
                        break;
                        
                    case 'swap_cards': // 互换
                        score = 35;
                        // 如果自己手牌差而对手手牌好，价值更高
                        if (alivePlayers.length > 0) {
                            const avgOpponentHand = alivePlayers.reduce((sum, p) => sum + p.hand.length, 0) / alivePlayers.length;
                            if (currentPlayer.hand.length < avgOpponentHand) {
                                score += 20;
                            }
                        }
                        break;
                        
                    case 'immune_once': // 白旗
                        score = 30;
                        if (situation === 'defensive' || situation === 'threatened') score += 25;
                        if (currentPlayer.hand.length < 3) score += 15;
                        break;
                        
                    case 'give_four': // 绿帽
                        score = 25;
                        // 手牌多时可以使用
                        if (currentPlayer.hand.length > 15) score += 10;
                        if (aliveCount > 3) score -= 10; // 人多时给牌风险大
                        break;
                        
                    case 'mutual_discard': // 牛牛弹
                        score = 35;
                        if (currentPlayer.hand.length > 10) score += 10;
                        break;
                        
                    case 'gain_six': // 毒药
                        score = 45;
                        // 可以给队友或自己
                        break;
                        
                    case 'recycle_three': // 十字架
                        score = 30;
                        // 弃牌堆牌多时更有价值
                        if (gameState.discardCount > 10) score += 15;
                        break;
                        
                    case 'provoke_all': // 引战
                        score = 45;
                        if (aliveCount > 2) score += 15;
                        break;
                        
                    case 'copy_card': // 俺也一样
                        score = 30;
                        if (situation === 'early_game') score += 10;
                        break;
                        
                    case 'resurrect_player': // 复活吧！
                        score = 60;
                        const deadPlayers = gameState.players.filter(p => p.isDead);
                        if (deadPlayers.length > 0) score += 30;
                        break;
                        
                    case 'open_pai': // 开摆
                        score = 35;
                        if (situation === 'defensive') score += 20;
                        break;
                        
                    case 'black_hole': // 黑洞
                        score = 50;
                        if (situation === 'advantage') score += 20;
                        break;
                        
                    default:
                        score = 20;
                        break;
                }
                
                // 稀有度加成
                if (card.rarity === 'epic') score += 40;
                else if (card.rarity === 'rare') score += 25;
                else if (card.rarity === 'uncommon') score += 10;
                
                // 根据局势调整
                if (situation === 'defensive' && card.category === 'defense') score *= 1.3;
                if (situation === 'aggressive' && card.category === 'attack') score *= 1.4;
                if (situation === 'threatened' && (card.category === 'defense' || card.effect === 'immune_once')) score *= 1.5;
                
                return score;
            }
            
            // 根据职业调整评分
            adjustScoreByClass(score, card, currentPlayer) {
                switch(currentPlayer.className) {
                    case '士兵':
                        if (card.effect === 'discard_three') {
                            score *= 1.5;
                        } else if (card.category === 'attack') {
                            score *= 1.2;
                        }
                        break;
                        
                    case '商人':
                        if (card.effect === 'swap_cards') {
                            score *= 1.4;
                        } else if (card.category === 'special') {
                            score *= 1.1;
                        }
                        break;
                        
                    case '炼金术师':
                        if (card.id.includes('poison') || card.id.includes('antidote')) {
                            score *= 1.6;
                        } else if (card.category === 'special') {
                            score *= 1.2;
                        }
                        break;
                        
                    case '天使':
                        if (card.effect === 'resurrect_player') {
                            score *= 1.5;
                        } else if (card.category === 'defense') {
                            score *= 1.3;
                        }
                        break;
                        
                    case '恐怖分子':
                        if (card.effect === 'mutual_discard') {
                            score *= 1.8;
                        } else if (card.category === 'attack') {
                            score *= 1.4;
                        }
                        break;
                        
                    case '异教主':
                        if (card.category === 'special') {
                            score *= 1.3;
                        }
                        break;
                        
                    case '乐子人':
                        // 乐子人喜欢制造混乱
                        if (card.effect === 'provoke_all' || card.effect === 'black_hole') {
                            score *= 1.4;
                        }
                        break;

                    case '胆小鬼':
                        // 胆小鬼在防御回合不能出伤害牌
                        if (!currentPlayer.attackPhase) {
                            if (card.type === 'attack' || card.effect === 'damage' ||
                                card.name.includes('杀') || card.name.includes('攻击')) {
                                // 将攻击牌评分设为极低，防止AI选择
                                score = -100;
                            } else if (card.category === 'defense' || card.category === 'special') {
                                // 防御回合更倾向于防御牌和特殊牌
                                score *= 1.3;
                            }
                        } else {
                            // 自由出牌回合正常评分
                            if (card.category === 'attack') {
                                score *= 1.1;
                            }
                        }
                        break;
                }
                
                return score;
            }
            
            // 选择目标
            chooseTarget(gameState, currentPlayer, card) {
                const alivePlayers = gameState.players.filter(p => 
                    !p.isDead && p.id !== currentPlayer.id
                );
                
                if (alivePlayers.length === 0) return null;
                
                switch(this.behavior.targetStrategy) {
                    case 'random':
                        return alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
                        
                    case 'threat_based':
                        // 选择威胁最大的玩家
                        const threats = alivePlayers.map(player => {
                            let threat = this.memory.playerThreats.get(player.id) || 
                                       player.hand.length * 10;
                            
                            // 职业威胁加成
                            const classThreats = {
                                '炼金术师': 30,
                                '士兵': 25,
                                '恐怖分子': 50,
                                '恶魔': 35,
                                '异教主': 40,
                                '魔术师': 30
                            };
                            
                            if (classThreats[player.className]) {
                                threat += classThreats[player.className];
                            }
                            
                            return { player, threat };
                        });
                        
                        threats.sort((a, b) => b.threat - a.threat);
                        return threats[0].player;
                        
                    case 'strategic':
                        // 战略选择：根据卡牌效果选择最佳目标
                        return this.chooseStrategicTarget(alivePlayers, currentPlayer, card, gameState);
                        
                    default:
                        return alivePlayers[0];
                }
            }
            
            // 战略目标选择
            chooseStrategicTarget(alivePlayers, currentPlayer, card, gameState) {
                // 根据卡牌效果选择目标
                switch(card.effect) {
                    case 'discard_three': // 杀人诛心 - 选择手牌最多的玩家
                        return alivePlayers.reduce((best, player) => {
                            return player.hand.length > best.hand.length ? player : best;
                        });
                        
                    case 'swap_cards': // 互换 - 选择手牌比自己多的玩家
                        const betterHandPlayers = alivePlayers.filter(p => 
                            p.hand.length > currentPlayer.hand.length
                        );
                        if (betterHandPlayers.length > 0) {
                            return betterHandPlayers.reduce((best, player) => {
                                return player.hand.length > best.hand.length ? player : best;
                            });
                        }
                        // 没有手牌更好的玩家，选择手牌最少的（减少损失）
                        return alivePlayers.reduce((worst, player) => {
                            return player.hand.length < worst.hand.length ? player : worst;
                        });
                        
                    case 'give_four': // 绿帽 - 选择手牌最少的玩家（送牌）或者最强的盟友
                        // 如果是合作模式，送给队友
                        if (currentPlayer.team && gameState.teams) {
                            const teammate = alivePlayers.find(p => p.team === currentPlayer.team);
                            if (teammate) return teammate;
                        }
                        return alivePlayers.reduce((worst, player) => {
                            return player.hand.length < worst.hand.length ? player : worst;
                        });
                        
                    case 'resurrect_player': // 复活 - 选择最强的死亡玩家
                        const deadPlayers = gameState.players.filter(p => p.isDead);
                        if (deadPlayers.length > 0) {
                            // 优先复活之前的队友
                            if (currentPlayer.team && gameState.teams) {
                                const deadTeammate = deadPlayers.find(p => p.team === currentPlayer.team);
                                if (deadTeammate) return deadTeammate;
                            }
                            // 否则复活手牌最多的死亡玩家
                            return deadPlayers.reduce((best, player) => {
                                return player.hand.length > best.hand.length ? player : best;
                            });
                        }
                        return alivePlayers[0];
                        
                    case 'mutual_discard': // 牛牛弹 - 选择手牌比自己多的玩家
                        const target = alivePlayers.reduce((best, player) => {
                            return player.hand.length > best.hand.length ? player : best;
                        });
                        if (target.hand.length > currentPlayer.hand.length) {
                            return target;
                        }
                        // 如果没有人手牌比自己多，选择手牌最少的
                        return alivePlayers.reduce((worst, player) => {
                            return player.hand.length < worst.hand.length ? player : worst;
                        });
                        
                    default:
                        // 默认选择威胁最大的
                        return alivePlayers.reduce((best, player) => {
                            const threatA = this.memory.playerThreats.get(best.id) || best.hand.length * 10;
                            const threatB = this.memory.playerThreats.get(player.id) || player.hand.length * 10;
                            return threatB > threatA ? player : best;
                        });
                }
            }
        }

        // AI管理器
        class AIManager {
            constructor() {
                this.aiPlayers = new Map();
                this.decisionLog = [];
            }
            
            // 注册AI玩家
            registerAI(playerId, difficulty, className) {
                const ai = new AIPlayer(difficulty, className);
                this.aiPlayers.set(playerId, ai);
                return ai;
            }
            
            // 获取AI
            getAI(playerId) {
                return this.aiPlayers.get(playerId);
            }
            
            // 记录AI决策
            logDecision(playerId, action, target = null) {
                const logEntry = {
                    timestamp: Date.now(),
                    playerId,
                    action,
                    target
                };
                
                this.decisionLog.push(logEntry);
                
                // 限制日志长度
                if (this.decisionLog.length > 100) {
                    this.decisionLog.shift();
                }
            }
            
            // 获取AI统计数据
            getStats() {
                const stats = {
                    totalDecisions: this.decisionLog.length,
                    decisionsByAction: {},
                    recentDecisions: this.decisionLog.slice(-10)
                };
                
                this.decisionLog.forEach(log => {
                    if (!stats.decisionsByAction[log.action]) {
                        stats.decisionsByAction[log.action] = 0;
                    }
                    stats.decisionsByAction[log.action]++;
                });
                
                return stats;
            }
        }

        // ==================== 游戏管理器改进 ====================
        class GameManager {
            constructor() {
                this.players = [];
                this.currentPlayerIndex = 0;
                this.phase = 'start';
                this.turn = 0;
                this.deck = [];
                this.discardPile = [];
                this.gameStarted = false;
                this.settings = {
                    playerCount: 4,
                    aiDifficulty: 'medium',
                    initialCards: 30,
                    musicVolume: 70,
                    sfxVolume: 80,
                    showAnimations: true,
                    enableTeams: false,
                    entertainmentMode: null
                };
                
                this.phaseTime = 30;
                this.timerInterval = null;
                this.timeLeft = this.phaseTime;
                
                this.selectedCards = [];
                this.currentCard = null;
                this.waitingForTarget = false;
                this.targetCallback = null;
                
                this.selectedClass = null;
                this.winner = null;
                
                // 多人游戏相关
                this.isMultiplayer = false;
                this.multiplayerManager = null;
                this.playerName = "玩家";
                
                // 石剪布4.0规则相关
                this.phaseOrder = ['start', 'faceDown', 'play', 'end', 'rest'];
                this.phaseFunctions = {
                    start: this.startPhase.bind(this),
                    faceDown: this.faceDownPhase.bind(this),
                    play: this.playPhase.bind(this),
                    end: this.endPhase.bind(this),
                    rest: this.restPhase.bind(this)
                };
                
                this.faceDownCards = new Map();
                this.deathPeriod = new Map();
                
                // 初始化管理器
                this.cardManager = new CardManager();
                this.classManager = new ClassManager();
                this.aiManager = new AIManager();
                
                // 触摸事件支持将在DOM加载完成后初始化
            }
            
            // 设置触摸事件支持
            setupTouchSupport() {
                // 为所有按钮添加触摸事件支持
                this.addTouchSupportToElements();
                
                // 为卡牌添加触摸事件支持
                this.setupCardTouchEvents();
            }
            
            // 为元素添加触摸事件支持
            addTouchSupportToElements() {
                // 为所有按钮添加触摸事件
                const buttons = document.querySelectorAll('button, .menu-btn, .music-btn, .save-btn, .reset-btn, .control-btn, .back-btn');
                buttons.forEach(button => {
                    button.addEventListener('touchstart', this.handleTouchStart.bind(this));
                    button.addEventListener('touchend', this.handleTouchEnd.bind(this));
                });
            }
            
            // 为卡牌添加触摸事件支持
            setupCardTouchEvents() {
                // 为卡牌添加触摸事件
                document.addEventListener('touchstart', (e) => {
                    const card = e.target.closest('.card');
                    if (card) {
                        this.handleCardTouchStart(card, e);
                    }
                });
                
                document.addEventListener('touchend', (e) => {
                    const card = e.target.closest('.card');
                    if (card) {
                        this.handleCardTouchEnd(card, e);
                    }
                });
            }
            
            // 处理触摸开始事件
            handleTouchStart(e) {
                // 移除e.preventDefault()，避免阻止鼠标事件
                const target = e.target;
                target.classList.add('touch-active');
            }
            
            // 处理触摸结束事件
            handleTouchEnd(e) {
                // 移除e.preventDefault()，避免阻止鼠标事件
                const target = e.target;
                target.classList.remove('touch-active');
                
                // 触发点击事件
                const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                });
                target.dispatchEvent(clickEvent);
            }
            
            // 处理卡牌触摸开始事件
            handleCardTouchStart(card, e) {
                // 移除e.preventDefault()，避免阻止鼠标事件
                card.classList.add('touch-active');
            }
            
            // 处理卡牌触摸结束事件
            handleCardTouchEnd(card, e) {
                // 移除e.preventDefault()，避免阻止鼠标事件
                card.classList.remove('touch-active');
                
                // 触发点击事件
                const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                });
                card.dispatchEvent(clickEvent);
            }
            
            // 初始化新游戏
            initializeNewGame() {
                console.log('初始化新游戏');
                
                this.resetGame();
                
                // 如果没有选择职业，先选择职业
                if (!this.selectedClass) {
                    this.showClassSelection();
                    return;
                }
                
                const playerCount = parseInt(document.getElementById('player-count').value) || 4;
                const aiDifficulty = document.getElementById('ai-difficulty').value || 'medium';
                const entertainmentMode = document.getElementById('entertainment-mode').value || 'none';
                
                // 创建玩家
                this.players = [];
                
                // 添加人类玩家
                const humanPlayer = new Player(this.playerName, 'human', this.selectedClass);
                humanPlayer.isCurrent = true;
                this.players.push(humanPlayer);
                
                // 如果不是多人游戏，添加AI玩家
                if (!this.isMultiplayer) {
                    const classList = ['士兵', '商人', '天使', '偷窥狂', '炼金术师', '魔术师', '傻子', '乐子人', '胆小鬼', '寄生者', '杀手', '恐怖分子', '异教主'];
                    for (let i = 2; i <= playerCount; i++) {
                        const randomClass = classList[Math.floor(Math.random() * classList.length)];
                        const aiPlayer = new Player(`AI玩家${i-1}`, 'ai', randomClass);
                        this.players.push(aiPlayer);
                    }
                    
                    // 注册AI
                    this.players.forEach(player => {
                        if (player.type === 'ai') {
                            this.aiManager.registerAI(player.id, aiDifficulty, player.className);
                        }
                    });
                } else {
                    // 多人游戏：从多人管理器获取玩家列表
                    if (this.multiplayerManager) {
                        this.players = this.createPlayersFromMultiplayer();
                    }
                }
                
                // 初始化牌堆
                this.deck = this.cardManager.initializeDeck();
                
                // 发牌
                this.dealInitialCards();
                
                // 更新UI
                this.updateGameUI();
                
                this.gameStarted = true;
                
                // 播放游戏开始音效
                soundManager.playGameStartSound();
                
                this.logGameEvent('游戏开始！');
                this.logGameEvent(`人类玩家选择了${this.selectedClass}职业`);
                
                // 应用职业效果：游戏开始
                this.players.forEach(player => {
                    const result = this.classManager.applyClassEffect(player, 'gameStart', {}, this);
                    if (result) {
                        this.logGameEvent(result);
                    }
                });
                
                // 应用娱乐模式
                if (entertainmentMode !== 'none') {
                    this.setEntertainmentMode(entertainmentMode);
                    
                    switch (entertainmentMode) {
                        case 'reincarnation':
                            this.reincarnationMode();
                            break;
                        case 'forced-balance':
                            this.forcedBalanceMode();
                            break;
                        case 'open-cards':
                            this.openCardsMode();
                            break;
                        case 'team-play':
                            this.teamMode();
                            break;
                        case 'enhanced-skills':
                            this.enhancedSkillsMode();
                            break;
                    }
                }
                
                // 开始第一回合
                this.startNewTurn();
            }
            
            // 开始阶段
            startPhase() {
                const currentPlayer = this.getCurrentPlayer();
                this.logGameEvent(`${currentPlayer.name}的回合开始`);
                
                // 检查死亡期状态
                if (this.deathPeriod.has(currentPlayer.id)) {
                    this.logGameEvent(`${currentPlayer.name}处于死亡期`);
                }
                
                // 检查手牌是否足够
                this.checkHandSize(currentPlayer);
                
                // 切换到扣置阶段
                this.nextPhase();
            }
            
            // 出牌阶段
            playPhase() {
                const currentPlayer = this.getCurrentPlayer();
                this.logGameEvent(`${currentPlayer.name}的出牌阶段`);
                
                // 这里可以添加出牌阶段的逻辑
                // 玩家可以选择使用卡牌
                
                // 切换到回合结束阶段
                this.nextPhase();
            }
            
            // 扣置阶段
            faceDownPhase() {
                const currentPlayer = this.getCurrentPlayer();
                this.logGameEvent(`${currentPlayer.name}的扣置阶段`);
                
                if (currentPlayer.type === 'human') {
                    // 人类玩家选择扣置的牌
                    this.promptForFaceDownCard(currentPlayer);
                } else {
                    // AI自动选择扣置的牌
                    setTimeout(() => {
                        this.aiFaceDownCard(currentPlayer);
                    }, 1000);
                }
            }
            
            // 提示人类玩家选择扣置的牌
            promptForFaceDownCard(player) {
                if (player.hand.length === 0) {
                    this.logGameEvent(`${player.name}没有手牌可扣置`);
                    this.faceDownPhaseComplete();
                    return;
                }
                
                this.logGameEvent(`${player.name}请选择一张牌扣置`);
                // 这里需要实现UI提示
                this.faceDownPhaseComplete();
            }
            
            // AI选择扣置的牌
            aiFaceDownCard(player) {
                if (player.hand.length === 0) {
                    this.logGameEvent(`${player.name}没有手牌可扣置`);
                    this.faceDownPhaseComplete();
                    return;
                }
                
                // 简单AI：随机选择一张牌扣置
                const randomIndex = Math.floor(Math.random() * player.hand.length);
                const faceDownCard = player.hand.splice(randomIndex, 1)[0];
                this.faceDownCards.set(player.id, faceDownCard);
                
                this.logGameEvent(`${player.name}扣置了一张牌`);
                this.faceDownPhaseComplete();
            }
            
            // 扣置阶段完成
            faceDownPhaseComplete() {
                // 检查所有玩家是否都已扣置
                if (this.faceDownCards.size === this.players.length) {
                    this.revealFaceDownCards();
                } else {
                    // 继续下一个玩家的扣置
                    this.nextPlayer();
                    this.faceDownPhase();
                }
            }
            
            // 翻开所有扣置的牌
            revealFaceDownCards() {
                this.logGameEvent('翻开所有扣置的牌');
                
                // 检查是否只有一名玩家打出石剪布
                const stoneScissorsClothCards = [];
                const playersWithCards = [];
                
                this.faceDownCards.forEach((card, playerId) => {
                    if (card.type === 'stone' || card.type === 'scissors' || card.type === 'cloth') {
                        stoneScissorsClothCards.push(card);
                        playersWithCards.push(this.getPlayerById(playerId));
                    }
                });
                
                if (stoneScissorsClothCards.length === 1 && playersWithCards.length === 1) {
                    // 只有一名玩家打出石剪布，收回手牌
                    const player = playersWithCards[0];
                    const card = stoneScissorsClothCards[0];
                    player.hand.push(card);
                    this.logGameEvent(`${player.name}收回了扣置的${card.name}牌`);
                } else {
                    // 处理扣置的牌效果
                    this.processFaceDownCards();
                }
                
                // 清空扣置的牌
                this.faceDownCards.clear();
                
                // 切换到出牌阶段
                this.nextPhase();
            }
            
            // 处理扣置的牌效果
            processFaceDownCards() {
                // 这里需要实现具体的处理逻辑
            }
            
            // 休息阶段
            restPhase() {
                const currentPlayer = this.getCurrentPlayer();
                this.logGameEvent(`${currentPlayer.name}的休息阶段`);
                
                // 检查死亡期
                if (this.deathPeriod.has(currentPlayer.id)) {
                    this.handleDeathPeriod(currentPlayer);
                }
                
                // 检查是否需要进入死亡期
                this.checkDeathPeriod(currentPlayer);
                
                // 切换到回合结束阶段
                this.nextPhase();
            }
            
            // 处理死亡期
            handleDeathPeriod(player) {
                // 死亡期：休息阶段弃置一张石剪布
                const stoneScissorsClothCards = player.hand.filter(card => 
                    card.type === 'stone' || card.type === 'scissors' || card.type === 'cloth'
                );
                
                if (stoneScissorsClothCards.length > 0) {
                    // 弃置一张石剪布
                    const cardToDiscard = stoneScissorsClothCards[0];
                    const index = player.hand.indexOf(cardToDiscard);
                    if (index > -1) {
                        player.hand.splice(index, 1);
                        this.discardPile.push(cardToDiscard);
                        this.logGameEvent(`${player.name}在死亡期弃置了一张${cardToDiscard.name}牌`);
                    }
                } else {
                    // 没有石剪布牌，检查是否死亡
                    this.checkDeath(player);
                }
            }
            
            // 检查是否需要进入死亡期
            checkDeathPeriod(player) {
                // 没有道具则进入死亡期
                const hasItems = player.hand.some(card => card.category === 'item');
                if (!hasItems) {
                    this.deathPeriod.set(player.id, true);
                    this.logGameEvent(`${player.name}进入死亡期`);
                } else {
                    this.deathPeriod.delete(player.id);
                }
            }
            
            // 检查手牌大小
            checkHandSize(player) {
                if (player.hand.length === 0) {
                    this.checkDeath(player);
                }
            }
            
            // 检查死亡
            checkDeath(player) {
                // 特殊角色除外
                if (player.className === '恶魔' && player.hand.length === 0) {
                    this.logGameEvent(`${player.name}（恶魔）手牌为0，但因为特殊能力存活`);
                    return;
                }
                
                if (player.hand.length === 0 && !this.deathPeriod.has(player.id)) {
                    player.isDead = true;
                    this.logGameEvent(`${player.name}因手牌为0而死亡`);
                    this.checkGameEnd();
                }
            }
            
            // 回合结束阶段
            endPhase() {
                const currentPlayer = this.getCurrentPlayer();
                this.logGameEvent(`${currentPlayer.name}的回合结束`);
                
                // 检查游戏是否结束
                this.checkGameEnd();
                
                // 进入下一个玩家的回合
                this.nextPlayer();
                this.startNewTurn();
            }
            
            // 进入下一阶段
            nextPhase() {
                const currentIndex = this.phaseOrder.indexOf(this.phase);
                const nextIndex = (currentIndex + 1) % this.phaseOrder.length;
                this.phase = this.phaseOrder[nextIndex];
                
                this.logGameEvent(`切换到${this.phase}阶段`);
                
                // 执行下一阶段的逻辑
                if (this.phaseFunctions[this.phase]) {
                    this.phaseFunctions[this.phase]();
                }
            }
            
            // 获取当前玩家
            getCurrentPlayer() {
                return this.players[this.currentPlayerIndex];
            }
            
            // 获取玩家通过ID
            getPlayerById(playerId) {
                return this.players.find(player => player.id === playerId);
            }
            
            // 切换到下一个玩家
            nextPlayer() {
                do {
                    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
                } while (this.players[this.currentPlayerIndex].isDead);
                
                // 更新当前玩家状态
                this.players.forEach((player, index) => {
                    player.isCurrent = index === this.currentPlayerIndex;
                });
            }
            
            // 检查游戏结束
            checkGameEnd() {
                const alivePlayers = this.players.filter(player => !player.isDead);
                
                if (alivePlayers.length === 1) {
                    this.winner = alivePlayers[0];
                    this.logGameEvent(`${this.winner.name}获胜！`);
                    this.showResult(this.winner);
                    return true;
                } else if (alivePlayers.length === 0) {
                    this.logGameEvent('游戏结束，无人生存');
                    this.showResult(null);
                    return true;
                }
                
                return false;
            }
            
            // 从多人管理器创建玩家
            createPlayersFromMultiplayer() {
                const players = [];
                
                if (!this.multiplayerManager || !this.multiplayerManager.players) {
                    return players;
                }
                
                // 添加所有玩家
                this.multiplayerManager.players.forEach((mpPlayer, playerId) => {
                    const className = mpPlayer.class || this.getRandomClass();
                    const player = new Player(mpPlayer.name, playerId === this.multiplayerManager.localPeerId ? 'human' : 'multiplayer', className);
                    player.id = playerId;
                    player.isReady = mpPlayer.isReady || false;
                    
                    players.push(player);
                });
                
                // 设置当前玩家（第一个玩家）
                if (players.length > 0) {
                    players[0].isCurrent = true;
                }
                
                return players;
            }
            
            // 获取随机职业
            getRandomClass() {
                const classList = ['士兵', '商人', '天使', '偷窥狂', '炼金术师', '魔术师', '傻子', '乐子人', '胆小鬼', '寄生者', '杀手', '恐怖分子', '异教主'];
                return classList[Math.floor(Math.random() * classList.length)];
            }
            
            // 显示职业选择界面
            showClassSelection() {
                switchScreen('class-selection-screen');
                this.loadClassSelection();
            }
            
            // 设置娱乐模式
            setEntertainmentMode(mode) {
                this.settings.entertainmentMode = mode;
                this.logGameEvent(`娱乐模式已设置为: ${mode}`);
            }
            
            // 再次投胎模式
            reincarnationMode() {
                this.logGameEvent('激活再次投胎模式');
                
                // 复活所有死亡玩家
                this.players.forEach(player => {
                    if (player.isDead) {
                        player.isDead = false;
                        player.hand = [];
                        // 打乱职业
                        const classList = ['士兵', '商人', '天使', '偷窥狂', '炼金术师', '魔术师', '傻子', '乐子人', '胆小鬼', '寄生者', '杀手', '恐怖分子', '异教主', '恶魔', '教皇', '燃烧者'];
                        player.className = classList[Math.floor(Math.random() * classList.length)];
                        // 固定6张牌
                        for (let i = 0; i < 6; i++) {
                            const card = this.drawCardFromDeck();
                            if (card) {
                                player.hand.push(card);
                            }
                        }
                        this.logGameEvent(`${player.name}复活并获得新职业: ${player.className}`);
                    }
                });
            }
            
            // 强行制衡模式
            forcedBalanceMode() {
                this.logGameEvent('激活强行制衡模式');
                
                // 所有玩家弃掉所有牌
                this.players.forEach(player => {
                    const discardCount = player.hand.length;
                    player.hand = [];
                    this.logGameEvent(`${player.name}弃置了所有${discardCount}张牌`);
                });
                
                // 重新分配牌
                const totalCards = this.players.length * 15; // 每人15张牌
                for (let i = 0; i < totalCards; i++) {
                    const playerIndex = i % this.players.length;
                    const card = this.drawCardFromDeck();
                    if (card) {
                        this.players[playerIndex].hand.push(card);
                    }
                }
                
                this.logGameEvent('所有玩家重新分配了手牌');
            }
            
            // 明牌模式
            openCardsMode() {
                this.logGameEvent('激活明牌模式');
                // 这里可以添加明牌模式的逻辑
                // 例如，在UI中显示所有玩家的手牌
            }
            
            // 组队模式
            teamMode() {
                this.logGameEvent('激活组队模式');
                
                // 根据玩家数量分配队伍
                if (this.players.length === 6) {
                    // 3v3
                    this.players[0].team = 'team1';
                    this.players[1].team = 'team1';
                    this.players[2].team = 'team1';
                    this.players[3].team = 'team2';
                    this.players[4].team = 'team2';
                    this.players[5].team = 'team2';
                } else if (this.players.length === 4) {
                    // 2v2
                    this.players[0].team = 'team1';
                    this.players[1].team = 'team1';
                    this.players[2].team = 'team2';
                    this.players[3].team = 'team2';
                }
                
                this.logGameEvent('队伍已分配');
            }
            
            // 增强技能模式
            enhancedSkillsMode() {
                this.logGameEvent('激活增强技能模式');
                
                // 标记增强技能模式
                this.enhancedSkills = true;
                
                // 每回合固定扣两张牌
                this.fixedDiscardPerTurn = 2;
                
                this.logGameEvent('所有玩家技能已增强，每回合固定扣两张牌');
            }
            
            // 加载职业选择
            loadClassSelection() {
                const classGrid = document.getElementById('class-grid');
                if (!classGrid) return;
                
                classGrid.innerHTML = '';
                
                const classes = this.classManager.classDefinitions;
                
                classes.forEach(cls => {
                    const classCard = document.createElement('div');
                    classCard.className = 'class-card';
                    classCard.dataset.classId = cls.id;
                    
                    // 难度显示文本
                    let difficultyText = '简单';
                    if (cls.difficulty === 'medium') difficultyText = '中等';
                    else if (cls.difficulty === 'hard') difficultyText = '困难';
                    else if (cls.difficulty === 'very_hard') difficultyText = '极难';
                    
                    classCard.innerHTML = `
                        <div class="class-icon" style="background: linear-gradient(45deg, ${cls.color}, ${this.adjustColor(cls.color, -20)});">
                            <i class="fas ${cls.icon}"></i>
                        </div>
                        <div class="class-name">${cls.name}</div>
                        <div class="class-difficulty ${cls.difficulty}">难度: ${difficultyText}</div>
                        <div class="class-description">${cls.description}</div>
                        <div class="class-ability">
                            <h4>职业能力</h4>
                            ${cls.abilities.map(ability => `<p>• ${ability}</p>`).join('')}
                        </div>
                    `;
                    
                    classCard.addEventListener('click', () => {
                        // 移除其他卡牌的选择状态
                        document.querySelectorAll('.class-card').forEach(card => {
                            card.classList.remove('selected');
                        });
                        
                        // 添加选择状态
                        classCard.classList.add('selected');
                        
                        // 启用确认按钮
                        document.getElementById('confirm-class').disabled = false;
                        
                        // 记录选择的职业
                        this.selectedClass = cls.name;
                    });
                    
                    classGrid.appendChild(classCard);
                });
                
                // 默认选择第一个职业
                if (classes.length > 0 && !this.selectedClass) {
                    const firstCard = classGrid.querySelector('.class-card');
                    if (firstCard) {
                        firstCard.click();
                    }
                }
            }
            
            // 调整颜色亮度
            adjustColor(color, amount) {
                // 简化处理，实际应该解析颜色值
                return color;
            }
            
            // 重置游戏
            resetGame() {
                this.players = [];
                this.currentPlayerIndex = 0;
                this.phase = 'action';
                this.turn = 0;
                this.deck = [];
                this.discardPile = [];
                this.gameStarted = false;
                this.selectedCards = [];
                this.currentCard = null;
                this.waitingForTarget = false;
                this.winner = null;
                
                if (this.timerInterval) {
                    clearInterval(this.timerInterval);
                    this.timerInterval = null;
                }
                
                this.timeLeft = this.phaseTime;
                
                // 清除UI
                this.clearGameUI();
            }
            
            // 发初始手牌
            dealInitialCards() {
                const initialCards = parseInt(document.getElementById('initial-cards').value) || 15;
                
                this.players.forEach(player => {
                    for (let i = 0; i < initialCards; i++) {
                        const card = this.drawCardFromDeck();
                        if (card) {
                            player.hand.push(card);
                        }
                    }
                    
                    // 特殊职业的初始卡牌
                    if (player.className === '恐怖分子') {
                        // 恐怖分子获得3张牛牛弹
                        for (let i = 0; i < 3; i++) {
                            const bullBullCard = {
                                ...this.cardManager.cardDefinitions.bullBull,
                                id: `bullBull_extra_${i}`
                            };
                            player.hand.push(bullBullCard);
                        }
                    }
                    if (player.className === '警官') {
                        // 警官获得3张引战
                        for (let i = 0; i < 3; i++) {
                            const provokeCard = {
                                ...this.cardManager.cardDefinitions.provoke,
                                id: `provoke_extra_${i}`
                            };
                            player.hand.push(provokeCard);
                        }
                    }
                });
            }
            
            // 从牌堆摸牌
            drawCardFromDeck() {
                if (this.deck.length === 0) {
                    // 如果牌堆为空，重新洗混弃牌堆
                    this.reshuffleDiscardPile();
                }
                
                if (this.deck.length > 0) {
                    const card = this.deck.pop();
                    
                    // 播放抽牌音效
                    soundManager.playCardSound();
                    
                    // 更新UI
                    this.updateDeckCount();
                    
                    return card;
                }
                return null;
            }
            
            // 重新洗混弃牌堆
            reshuffleDiscardPile() {
                console.log('重新洗混弃牌堆');
                this.deck = [...this.discardPile];
                this.cardManager.shuffleDeck(this.deck);
                this.discardPile = [];
                this.updateDiscardPileCount();
                this.logGameEvent('弃牌堆已重新洗入牌堆');
            }
            
            // 弃牌
            discardCard(card, playerId = null) {
                if (card) {
                    this.discardPile.push(card);
                    this.updateDiscardPileCount();
                    
                    if (playerId) {
                        const player = this.players.find(p => p.id === playerId);
                        if (player) {
                            const index = player.hand.findIndex(c => c.id === card.id);
                            if (index > -1) {
                                player.hand.splice(index, 1);
                            }
                        }
                    }
                }
            }
            
            // 开始新回合
            startNewTurn() {
                this.turn++;
                this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
                
                // 跳过已死亡的玩家
                while (this.getCurrentPlayer().isDead) {
                    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
                    if (this.checkGameOver()) return;
                }
                
                this.phase = 'action';
                this.selectedCards = [];
                this.currentCard = null;
                
                const currentPlayer = this.getCurrentPlayer();
                currentPlayer.isCurrent = true;
                currentPlayer.isImmune = false; // 重置免疫状态

                // 处理掏垃圾效果过期
                if (currentPlayer.digGarbageActive) {
                    currentPlayer.digGarbageTurns--;
                    if (currentPlayer.digGarbageTurns <= 0) {
                        // 掏垃圾效果过期，重置相关状态
                        currentPlayer.digGarbageActive = false;
                        currentPlayer.cannotPlayCards = false;
                        currentPlayer.invalidAsTarget = false;
                        this.logGameEvent(`${currentPlayer.name}的掏垃圾效果已结束`);
                    }
                }
                
                // 重置其他玩家的当前状态
                this.players.forEach((player, index) => {
                    if (index !== this.currentPlayerIndex) {
                        player.isCurrent = false;
                    }
                });
                
                // 记录回合开始
                this.logGameEvent(`第${this.turn}回合开始，轮到${currentPlayer.name}行动`);

                // 应用职业效果：回合开始（如胆小鬼的回合切换）
                const turnStartResult = this.classManager.applyClassEffect(
                    currentPlayer,
                    'turnStart',
                    {},
                    this
                );
                if (turnStartResult) {
                    this.logGameEvent(turnStartResult);
                }

                // 应用职业效果：阶段开始
                const phaseResult = this.classManager.applyClassEffect(
                    currentPlayer,
                    'phaseStart',
                    { phase: 'action' },
                    this
                );
                if (phaseResult) {
                    this.logGameEvent(phaseResult);
                }
                
                // 更新UI
                this.updateGameUI();
                this.updateTurnTimer();
                
                // 如果是AI玩家，自动执行回合
                if (currentPlayer.type === 'ai' && this.gameStarted) {
                    setTimeout(() => {
                        this.executeAITurn();
                    }, 500);
                }
            }
            
            // 执行AI回合
            executeAITurn() {
                const currentPlayer = this.getCurrentPlayer();
                if (!currentPlayer || currentPlayer.type !== 'ai' || currentPlayer.isDead) return;
                
                const ai = this.aiManager.getAI(currentPlayer.id);
                if (!ai) return;
                
                this.logGameEvent(`${currentPlayer.name}正在思考...`);
                
                // AI思考时间
                setTimeout(() => {
                    const gameState = this.getGameState();
                    const cardToUse = ai.chooseCardToUse(currentPlayer.hand, gameState, currentPlayer);
                    
                    if (cardToUse && cardToUse.card) {
                        // 检查是否需要选择目标
                        const needsTarget = this.cardNeedsTarget(cardToUse.card);
                        
                        if (needsTarget) {
                            const target = ai.chooseTarget(gameState, currentPlayer, cardToUse.card);
                            if (target) {
                                this.useCard(currentPlayer.id, cardToUse.index, target.id);
                                this.aiManager.logDecision(currentPlayer.id, 'use_card', target.name);
                            } else {
                                this.passTurn();
                                this.aiManager.logDecision(currentPlayer.id, 'pass_turn');
                            }
                        } else {
                            this.useCard(currentPlayer.id, cardToUse.index);
                            this.aiManager.logDecision(currentPlayer.id, 'use_card');
                        }
                    } else {
                        // 跳过回合
                        this.passTurn();
                        this.aiManager.logDecision(currentPlayer.id, 'pass_turn');
                    }
                }, ai.behavior.thinkTime);
            }
            
            // 检查卡牌是否需要选择目标
            cardNeedsTarget(card) {
                const targetEffects = [
                    'discard_three',
                    'swap_cards',
                    'give_four',
                    'mutual_discard',
                    'gain_six',
                    'antidote_effect',
                    'resurrect_player',
                    'forbid_player',
                    'united_treaty',
                    'charge_up',
                    'thunder_lightning'
                ];
                
                return targetEffects.includes(card.effect);
            }
            
            // 显示目标选择界面（增强版）
            showTargetSelection(card) {
                const overlay = document.getElementById('target-selection-overlay');
                const targetList = document.getElementById('target-list');
                const cardEffectInfo = document.getElementById('card-effect-info');
                
                if (!overlay || !targetList || !cardEffectInfo) return;
                
                // 获取当前玩家
                const currentPlayer = this.getCurrentPlayer();
                
                // 根据卡牌效果确定可选目标
                let availableTargets = [];
                let selectionTitle = '选择目标';
                
                switch(card.effect) {
                    case 'discard_three': // 杀人诛心
                    case 'swap_cards': // 互换
                    case 'give_four': // 绿帽
                    case 'mutual_discard': // 牛牛弹
                        availableTargets = this.players.filter(p =>
                            !p.isDead && p.id !== currentPlayer.id && !p.invalidAsTarget
                        );
                        selectionTitle = `选择${card.name}的目标`;
                        break;
                        
                    case 'gain_six': // 毒药
                    case 'antidote_effect': // 解药
                        availableTargets = this.players.filter(p => !p.isDead && !p.invalidAsTarget);
                        selectionTitle = `选择${card.name}的目标`;
                        break;
                        
                    case 'resurrect_player': // 复活吧！
                        availableTargets = this.players.filter(p => p.isDead);
                        selectionTitle = '选择要复活的玩家';
                        break;
                        
                    case 'united_treaty': // 团结协约
                        availableTargets = this.players.filter(p =>
                            !p.isDead && p.id !== currentPlayer.id && !p.invalidAsTarget
                        );
                        selectionTitle = '选择结盟对象';
                        break;
                        
                    case 'forbid_player': // 禁止通行
                        availableTargets = this.players.filter(p =>
                            !p.isDead && p.id !== currentPlayer.id && !p.invalidAsTarget
                        );
                        selectionTitle = '选择要禁止通行的玩家';
                        break;
                        
                    case 'charge_up': // 蓄力 - 第一个目标
                        availableTargets = this.players.filter(p =>
                            !p.isDead && p.id !== currentPlayer.id && !p.invalidAsTarget
                        );
                        selectionTitle = '选择第一个目标（蓄力）';
                        break;
                        
                    case 'thunder_lightning': // 雷電
                        availableTargets = this.players.filter(p =>
                            !p.isDead && p.id !== currentPlayer.id && !p.invalidAsTarget
                        );
                        selectionTitle = '选择雷電的目标';
                        break;
                        
                    default:
                        availableTargets = this.players.filter(p =>
                            !p.isDead && p.id !== currentPlayer.id && !p.invalidAsTarget
                        );
                        break;
                }
                
                if (availableTargets.length === 0) {
                    this.logGameEvent('没有可用的目标');
                    this.currentCard = null;
                    return;
                }
                
                // 清空目标列表
                targetList.innerHTML = '';
                
                // 更新标题
                const titleElement = overlay.querySelector('h3');
                if (titleElement) {
                    titleElement.innerHTML = `<i class="fas fa-crosshairs"></i> ${selectionTitle}`;
                }
                
                // 更新卡牌作用介绍
                cardEffectInfo.innerHTML = `
                    <h4><i class="fas fa-info-circle"></i> 卡牌信息</h4>
                    <p><span class="card-name">${card.name}</span></p>
                    <p class="card-description">${card.description || '该卡牌没有描述'}</p>
                `;
                
                // 添加目标
                availableTargets.forEach(target => {
                    const targetItem = document.createElement('div');
                    targetItem.className = 'target-item';
                    targetItem.dataset.targetId = target.id;
                    
                    // 计算威胁等级
                    let threatLevel = '低';
                    if (target.hand.length > 15) threatLevel = '高';
                    else if (target.hand.length > 8) threatLevel = '中';
                    
                    targetItem.innerHTML = `
                        <div class="target-avatar" style="background: ${this.getPlayerColor(target)};">
                            ${target.avatar}
                        </div>
                        <div class="target-info">
                            <div class="target-name">${target.name}</div>
                            <div class="target-stats">
                                <span>职业: ${target.className}</span>
                                <span>手牌: ${target.hand.length}</span>
                                <span>威胁: ${threatLevel}</span>
                            </div>
                        </div>
                    `;
                    
                    targetItem.addEventListener('click', () => {
                        soundManager.playButtonSound();
                        this.selectTarget(target.id);
                    });
                    
                    targetList.appendChild(targetItem);
                });
                
                // 显示目标选择界面
                overlay.style.display = 'flex';
                this.waitingForTarget = true;
            }
            
            // 获取玩家颜色
            getPlayerColor(player) {
                const colors = {
                    '炼金术师': '#9b59b6',
                    '士兵': '#3498db',
                    '商人': '#f1c40f',
                    '天使': '#ecf0f1',
                    '偷窥狂': '#e74c3c',
                    '魔术师': '#8e44ad',
                    '警官': '#34495e',
                    '政治家': '#2c3e50',
                    '尸体': '#7f8c8d',
                    '傻子': '#f39c12',
                    '乐子人': '#ff6b6b',
                    '胆小鬼': '#a29bfe',
                    '寄生者': '#00b894',
                    '杀手': '#2d3436',
                    '恐怖分子': '#e17055',
                    '异教主': '#6c5ce7'
                };
                
                return colors[player.className] || '#3498db';
            }
            
            // 使用卡牌（增强版）
            useCard(playerId, handIndex, targetId = null) {
                const player = this.players.find(p => p.id === playerId);
                if (!player || this.phase !== 'action') return false;

                // 检查是否不能出牌（如掏垃圾效果）
                if (player.cannotPlayCards) {
                    this.logGameEvent(`${player.name}本回合不能出牌`);
                    if (player.type === 'human') {
                        alert('本回合不能出牌！');
                    }
                    return false;
                }
                
                if (handIndex > -1 && handIndex < player.hand.length) {
                    const card = player.hand[handIndex];
                    
                    // 检查职业限制（如胆小鬼在防御回合不能出伤害牌）
                    const cardCheckResult = this.classManager.applyClassEffect(
                        player,
                        'checkCardPlay',
                        { card, gameManager: this },
                        this
                    );

                    if (cardCheckResult && cardCheckResult.invalid) {
                        // 显示限制提示
                        this.logGameEvent(cardCheckResult.message);
                        if (player.type === 'human') {
                            alert(cardCheckResult.message);
                        }
                        return false;
                    }

                    // 播放相应音效
                    this.playCardSoundByType(card);

                    // 检查是否需要选择目标但未提供
                    if (this.cardNeedsTarget(card) && !targetId) {
                        // 如果是人类玩家，显示目标选择界面
                        if (player.type === 'human') {
                            this.currentCard = { card, index: handIndex };
                            this.showTargetSelection(card);
                            return true;
                        } else {
                            // AI应该已经选择了目标
                            return false;
                        }
                    }
                    
                    // 获取目标玩家
                    const target = targetId ? this.players.find(p => p.id === targetId) : null;
                    
                    // 应用职业效果（使用前）
                    const classEffectBefore = this.classManager.applyClassEffect(
                        player, 
                        'useCard', 
                        { card, target, gameManager: this }, 
                        this
                    );
                    
                    if (classEffectBefore) {
                        this.logGameEvent(classEffectBefore);
                    }
                    
                    // 执行卡牌效果
                    const effectResult = this.cardManager.applyCardEffect(
                        card, 
                        playerId, 
                        targetId, 
                        this.players,
                        this
                    );
                    
                    if (effectResult.success) {
                        // 从手牌移除
                        player.hand.splice(handIndex, 1);
                        
                        // 弃置卡牌
                        this.discardCard(card);
                        
                        this.logGameEvent(effectResult.message);
                        
                        // 应用职业效果（使用后）
                        const classEffectAfter = this.classManager.applyClassEffect(
                            player, 
                            'turnEnd', 
                            {}, 
                            this
                        );
                        
                        if (classEffectAfter) {
                            this.logGameEvent(classEffectAfter);
                        }
                        
                        // 检查是否有人死亡
                        const deathsOccurred = this.checkPlayerDeaths();
                        
                        // 播放相应音效
                        if (deathsOccurred) {
                            soundManager.playDefeatSound();
                        }
                        
                        // 检查游戏是否结束
                        if (this.checkGameOver()) {
                            return true;
                        }
                        
                        // 更新UI
                        this.updateGameUI();
                        
                        // 如果是多人游戏，同步动作
                        if (this.isMultiplayer && this.multiplayerManager) {
                            this.syncActionToMultiplayer('useCard', {
                                playerId,
                                cardId: card.id,
                                targetId
                            });
                        }
                        
                        // 结束回合
                        setTimeout(() => {
                            this.endTurn();
                        }, 1000);
                        
                        return true;
                    }
                }
                return false;
            }
            
            // 根据卡牌类型播放音效
            playCardSoundByType(card) {
                if (card.category === 'attack') {
                    soundManager.playAttackSound();
                } else if (card.category === 'defense') {
                    soundManager.playDefenseSound();
                } else if (card.category === 'special') {
                    soundManager.playCardSound();
                } else {
                    soundManager.playButtonSound();
                }
            }
            
            // 同步动作到多人游戏
            syncActionToMultiplayer(actionType, data) {
                if (!this.multiplayerManager) return;
                
                // 通过数据通道发送动作
                this.multiplayerManager.broadcastMessage({
                    type: 'game-action',
                    action: {
                        type: actionType,
                        data: data,
                        timestamp: Date.now(),
                        turn: this.turn,
                        playerId: this.getCurrentPlayer().id
                    }
                });
            }
            
            // 处理多人游戏动作
            handleMultiplayerAction(action, peerId) {
                console.log('处理多人游戏动作:', action, '来自:', peerId);
                
                // 根据动作类型处理
                switch (action.type) {
                    case 'useCard':
                        this.handleMultiplayerUseCard(action.data, peerId);
                        break;
                    case 'endTurn':
                        this.handleMultiplayerEndTurn(action.data, peerId);
                        break;
                    case 'passTurn':
                        this.handleMultiplayerPassTurn(action.data, peerId);
                        break;
                    default:
                        console.warn('未知的多人游戏动作:', action.type);
                }
            }
            
            // 处理多人游戏使用卡牌
            handleMultiplayerUseCard(data, peerId) {
                // 找到对应的玩家
                const player = this.players.find(p => p.id === peerId);
                if (!player) return;
                
                // 找到卡牌
                const cardIndex = player.hand.findIndex(c => c.id === data.cardId);
                if (cardIndex === -1) return;
                
                // 使用卡牌
                this.useCard(player.id, cardIndex, data.targetId);
            }
            
            // 处理多人游戏结束回合
            handleMultiplayerEndTurn(data, peerId) {
                // 验证回合
                if (this.turn !== data.turn) return;
                
                // 找到对应的玩家
                const player = this.players.find(p => p.id === peerId);
                if (!player || !player.isCurrent) return;
                
                // 结束回合
                this.endTurn();
            }
            
            // 处理多人游戏跳过回合
            handleMultiplayerPassTurn(data, peerId) {
                // 验证回合
                if (this.turn !== data.turn) return;
                
                // 找到对应的玩家
                const player = this.players.find(p => p.id === peerId);
                if (!player || !player.isCurrent) return;
                
                // 跳过回合
                this.passTurn();
            }
            
            // 同步游戏状态
            syncGameState(state) {
                console.log('同步游戏状态:', state);
                
                // 这里可以添加游戏状态同步逻辑
                // 由于游戏状态比较复杂，建议只在重要事件时同步
            }
            
            // 选择目标
            selectTarget(targetId) {
                if (!this.currentCard) return;
                
                const currentPlayer = this.getCurrentPlayer();
                const card = currentPlayer.hand[this.currentCard.index];
                
                // 检查是否是蓄力卡牌（需要双目标）
                if (card && card.effect === 'charge_up' && !this.chargeUpFirstTarget) {
                    // 保存第一个目标，显示第二次目标选择
                    this.chargeUpFirstTarget = targetId;
                    
                    // 隐藏当前目标选择界面
                    const overlay = document.getElementById('target-selection-overlay');
                    if (overlay) {
                        overlay.style.display = 'none';
                    }
                    
                    // 显示第二次目标选择
                    this.showSecondTargetSelection(card, targetId);
                    return;
                }
                
                // 处理蓄力卡牌的第二个目标
                if (card && card.effect === 'charge_up' && this.chargeUpFirstTarget) {
                    const firstTargetId = this.chargeUpFirstTarget;
                    this.chargeUpFirstTarget = null;
                    
                    // 隐藏目标选择界面
                    const overlay = document.getElementById('target-selection-overlay');
                    if (overlay) {
                        overlay.style.display = 'none';
                    }
                    
                    this.waitingForTarget = false;
                    
                    // 执行蓄力卡牌效果
                    this.executeChargeUpEffect(currentPlayer, firstTargetId, targetId, card);
                    
                    this.currentCard = null;
                    return;
                }
                
                // 隐藏目标选择界面
                const overlay = document.getElementById('target-selection-overlay');
                if (overlay) {
                    overlay.style.display = 'none';
                }
                
                this.waitingForTarget = false;
                
                // 使用卡牌
                this.useCard(
                    this.getCurrentPlayer().id,
                    this.currentCard.index,
                    targetId
                );
                
                this.currentCard = null;
            }
            
            // 显示第二次目标选择界面
            showSecondTargetSelection(card, firstTargetId) {
                const overlay = document.getElementById('target-selection-overlay');
                const targetList = document.getElementById('target-list');
                const cardEffectInfo = document.getElementById('card-effect-info');
                
                if (!overlay || !targetList || !cardEffectInfo) return;
                
                const currentPlayer = this.getCurrentPlayer();
                const firstTarget = this.players.find(p => p.id === firstTargetId);
                
                // 更新标题
                const title = overlay.querySelector('h3');
                if (title) {
                    title.innerHTML = '<i class="fas fa-crosshairs"></i> 选择第二个目标';
                }
                
                // 显示卡牌效果说明
                cardEffectInfo.innerHTML = `
                    <div class="card-info-card">
                        <div class="card-name">${card.name}</div>
                        <div class="card-desc">${card.description}</div>
                        <div class="first-target-info">已选择：<strong>${firstTarget ? firstTarget.name : '未知'}</strong></div>
                    </div>
                `;
                
                // 获取可选的第二个目标（排除自己和第一个目标）
                const availableTargets = this.players.filter(p => 
                    !p.isDead && p.id !== currentPlayer.id && p.id !== firstTargetId
                );
                
                // 清空目标列表
                targetList.innerHTML = '';
                
                if (availableTargets.length === 0) {
                    targetList.innerHTML = '<div class="no-targets">没有可选的第二目标</div>';
                    return;
                }
                
                // 添加目标选项
                availableTargets.forEach(target => {
                    const targetItem = document.createElement('div');
                    targetItem.className = 'target-item';
                    targetItem.innerHTML = `
                        <div class="target-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="target-info">
                            <div class="target-name">${target.name}</div>
                            <div class="target-cards">手牌: ${target.hand.length}张</div>
                        </div>
                    `;
                    targetItem.addEventListener('click', () => this.selectTarget(target.id));
                    targetList.appendChild(targetItem);
                });
                
                // 显示目标选择界面
                overlay.style.display = 'flex';
            }
            
            // 执行蓄力卡牌效果
            executeChargeUpEffect(player, firstTargetId, secondTargetId, card) {
                const firstTarget = this.players.find(p => p.id === firstTargetId);
                const secondTarget = this.players.find(p => p.id === secondTargetId);
                
                if (!firstTarget || !secondTarget) {
                    this.logGameEvent('蓄力卡牌目标无效', 'error');
                    return;
                }
                
                // 从手牌中移除卡牌
                const cardIndex = player.hand.findIndex(c => c.id === card.id);
                if (cardIndex > -1) {
                    player.hand.splice(cardIndex, 1);
                }
                
                // 获取两个目标的第一张牌花色
                const firstType = firstTarget.hand.length > 0 ? firstTarget.hand[0].type : null;
                const secondType = secondTarget.hand.length > 0 ? secondTarget.hand[0].type : null;
                
                const typeNames = { stone: '石头', scissors: '剪刀', cloth: '布' };
                
                this.logGameEvent(`${player.name}使用了蓄力，选择了${firstTarget.name}和${secondTarget.name}`, 'card');
                this.logGameEvent(`花色判定：${firstTarget.name}(${firstType ? typeNames[firstType] : '无牌'}) vs ${secondTarget.name}(${secondType ? typeNames[secondType] : '无牌'})`, 'info');
                
                if (firstType && secondType && firstType === secondType) {
                    // 花色相同：各弃置3张牌
                    const firstDiscard = Math.min(3, firstTarget.hand.length);
                    const secondDiscard = Math.min(3, secondTarget.hand.length);
                    
                    const firstDiscarded = firstTarget.hand.splice(0, firstDiscard);
                    const secondDiscarded = secondTarget.hand.splice(0, secondDiscard);
                    
                    firstDiscarded.forEach(c => this.discardCard(c));
                    secondDiscarded.forEach(c => this.discardCard(c));
                    
                    this.logGameEvent(`花色相同！${firstTarget.name}弃置了${firstDiscarded.length}张牌，${secondTarget.name}弃置了${secondDiscarded.length}张牌`, 'combat');
                } else {
                    // 花色不同：使用者获得4张牌
                    for (let i = 0; i < 4; i++) {
                        const drawnCard = this.drawCardFromDeck();
                        if (drawnCard) {
                            player.hand.push(drawnCard);
                        }
                    }
                    this.logGameEvent(`花色不同！${player.name}从牌堆获得了4张牌`, 'card');
                }
                
                // 检查玩家死亡
                this.checkPlayerDeaths();
                
                // 更新UI
                this.updateAllPlayerUI();
            }
            
            // 取消目标选择
            cancelTargetSelection() {
                const overlay = document.getElementById('target-selection-overlay');
                if (overlay) {
                    overlay.style.display = 'none';
                }
                
                this.waitingForTarget = false;
                this.currentCard = null;
                
                this.logGameEvent('取消了卡牌使用');
            }
            
            // 检查玩家死亡
            checkPlayerDeaths() {
                let deathOccurred = false;
                
                this.players.forEach(player => {
                    if (!player.isDead && player.hand.length === 0) {
                        player.isDead = true;
                        this.logGameEvent(`${player.name}手牌耗尽，被淘汰了！`, 'combat');
                        
                        // 应用职业效果：死亡
                        const deathEffect = this.classManager.applyClassEffect(
                            player, 
                            'death', 
                            {}, 
                            this
                        );
                        if (deathEffect) {
                            this.logGameEvent(deathEffect);
                        }
                        
                        deathOccurred = true;
                    }
                });
                
                return deathOccurred;
            }
            
            // 检查游戏是否结束
            checkGameOver() {
                const alivePlayers = this.players.filter(p => !p.isDead);
                
                if (alivePlayers.length === 1) {
                    // 只有一个存活玩家，游戏结束
                    this.winner = alivePlayers[0];
                    this.gameStarted = false;
                    this.showGameResult(this.winner);
                    return true;
                } else if (alivePlayers.length === 0) {
                    // 所有玩家都死亡，平局
                    this.winner = null;
                    this.gameStarted = false;
                    this.showGameResult(null);
                    return true;
                }
                return false;
            }
            
            // 跳过回合
            passTurn() {
                const currentPlayer = this.getCurrentPlayer();
                this.logGameEvent(`${currentPlayer.name}跳过了回合`);
                
                // 如果是多人游戏，同步动作
                if (this.isMultiplayer && this.multiplayerManager) {
                    this.syncActionToMultiplayer('passTurn', {
                        playerId: currentPlayer.id,
                        turn: this.turn
                    });
                }
                
                this.endTurn();
            }
            
            // 结束当前回合
            endTurn() {
                const currentPlayer = this.getCurrentPlayer();
                
                // 如果是多人游戏，同步动作
                if (this.isMultiplayer && this.multiplayerManager) {
                    this.syncActionToMultiplayer('endTurn', {
                        playerId: currentPlayer.id,
                        turn: this.turn
                    });
                }
                
                // 播放回合结束音效
                soundManager.playTurnEndSound();
                
                // 清除当前玩家状态
                currentPlayer.isCurrent = false;
                currentPlayer.isImmune = false;
                
                // 进入下一回合
                setTimeout(() => {
                    this.startNewTurn();
                }, 500);
            }
            
            // 获取当前玩家
            getCurrentPlayer() {
                return this.players[this.currentPlayerIndex] || null;
            }
            
            // 获取游戏状态
            getGameState() {
                return {
                    players: this.players.map(p => ({
                        id: p.id,
                        name: p.name,
                        type: p.type,
                        hand: p.hand,
                        isDead: p.isDead,
                        className: p.className
                    })),
                    currentPlayer: this.getCurrentPlayer(),
                    phase: this.phase,
                    turn: this.turn,
                    deckCount: this.deck.length,
                    discardCount: this.discardPile.length
                };
            }
            
            // 更新回合计时器
            updateTurnTimer() {
                if (this.timerInterval) {
                    clearInterval(this.timerInterval);
                }
                
                this.timeLeft = this.phaseTime;
                document.getElementById('timer').textContent = `时间: ${this.timeLeft}s`;
                
                this.timerInterval = setInterval(() => {
                    this.timeLeft--;
                    document.getElementById('timer').textContent = `时间: ${this.timeLeft}s`;
                    
                    if (this.timeLeft <= 0) {
                        clearInterval(this.timerInterval);
                        
                        // 时间到，自动结束或执行默认操作
                        const currentPlayer = this.getCurrentPlayer();
                        if (currentPlayer.type === 'human') {
                            this.passTurn();
                        }
                    }
                }, 1000);
            }
            
            // 更新游戏UI
            updateGameUI() {
                if (!this.gameStarted) return;
                
                const currentPlayer = this.getCurrentPlayer();
                
                // 更新回合信息
                document.getElementById('current-turn').textContent = `回合: ${currentPlayer ? currentPlayer.name : '未知'}`;
                
                // 更新阶段信息
                let phaseText = '未知';
                switch (this.phase) {
                    case 'start': phaseText = '回合开始'; break;
                    case 'faceDown': phaseText = '扣置阶段'; break;
                    case 'play': phaseText = '出牌阶段'; break;
                    case 'rest': phaseText = '休息阶段'; break;
                    case 'end': phaseText = '回合结束'; break;
                }
                document.getElementById('phase-indicator').textContent = `阶段: ${phaseText}`;
                
                // 更新死亡期状态
                const deathPeriodPlayers = [];
                this.players.forEach(player => {
                    if (this.deathPeriod.has(player.id)) {
                        deathPeriodPlayers.push(player.name);
                    }
                });
                const deathPeriodText = deathPeriodPlayers.length > 0 ? `死亡期: ${deathPeriodPlayers.join(', ')}` : '死亡期: 无';
                document.getElementById('death-period-status').textContent = deathPeriodText;
                
                // 更新存活玩家数
                const aliveCount = this.players.filter(p => !p.isDead).length;
                document.getElementById('alive-count').textContent = `存活: ${aliveCount}/${this.players.length}`;
                
                // 更新牌堆数量
                this.updateDeckCount();
                this.updateDiscardPileCount();
                
                // 更新玩家手牌数
                const humanPlayer = this.players.find(p => p.type === 'human');
                if (humanPlayer) {
                    document.getElementById('hand-count').textContent = humanPlayer.hand.length;
                    document.querySelector('.player-class').textContent = `职业: ${humanPlayer.className}`;
                    document.querySelector('.player-avatar').innerHTML = humanPlayer.avatar;
                    document.getElementById('player-display-name').textContent = humanPlayer.name;

                    // 更新胆小鬼模式显示
                    const statusElement = document.querySelector('.player-status');
                    if (humanPlayer.className === '胆小鬼') {
                        const modeText = humanPlayer.attackPhase ? '自由出牌回合' : '防御回合（不能出伤害牌）';
                        const modeColor = humanPlayer.attackPhase ? '#4ecdc4' : '#e74c3c';
                        statusElement.innerHTML = `<span style="color: ${modeColor};">状态: ${modeText}</span>`;
                    } else if (this.deathPeriod.has(humanPlayer.id)) {
                        statusElement.innerHTML = `<span style="color: #e74c3c;">状态: 死亡期</span>`;
                    } else {
                        statusElement.innerHTML = `<span style="color: #a5b1c2;">状态: 正常</span>`;
                    }
                }
                
                // 更新玩家区域
                this.updatePlayerAreas();
                
                // 更新手牌显示
                this.updateHandDisplay();
                
                // 更新操作按钮状态
                this.updateActionButtons();
            }
            
            // 更新牌堆数量
            updateDeckCount() {
                const deckElement = document.getElementById('draw-pile');
                if (deckElement) {
                    const countElement = deckElement.querySelector('.pile-count');
                    if (countElement) {
                        countElement.textContent = this.deck.length;
                        
                        // 牌堆少于10张时添加警告样式
                        if (this.deck.length < 10) {
                            deckElement.classList.add('low');
                        } else {
                            deckElement.classList.remove('low');
                        }
                    }
                }
            }
            
            // 更新弃牌堆数量
            updateDiscardPileCount() {
                const discardElement = document.getElementById('discard-pile');
                if (discardElement) {
                    const countElement = discardElement.querySelector('.pile-count');
                    if (countElement) {
                        countElement.textContent = this.discardPile.length;
                    }
                }
            }
            
            // 更新玩家区域
            updatePlayerAreas() {
                const opponentsArea = document.querySelector('.opponents-area');
                if (!opponentsArea) return;
                
                opponentsArea.innerHTML = '';
                
                // 添加其他玩家
                this.players.forEach((player, index) => {
                    if (player.type !== 'human' || index > 0) {
                        const opponentDiv = document.createElement('div');
                        opponentDiv.className = `opponent ${player.type} ${player.isCurrent ? 'active' : ''} ${player.isDead ? 'dead' : ''}`;
                        opponentDiv.dataset.playerId = player.id;
                        
                        let typeIcon = '';
                        if (player.type === 'ai') typeIcon = '🤖';
                        else if (player.type === 'multiplayer') typeIcon = '👤';
                        
                        opponentDiv.innerHTML = `
                            <div class="opponent-avatar">
                                ${player.avatar}
                            </div>
                            <div class="opponent-info">
                                <div class="opponent-name">${player.name} ${typeIcon}</div>
                                <div class="opponent-class">职业: ${player.className}</div>
                                <div class="opponent-cards">
                                    <i class="fas fa-cards"></i> 手牌: ${player.hand.length}
                                </div>
                                <div class="opponent-status">${player.isDead ? '已淘汰' : (player.isCurrent ? '行动中' : '等待')}</div>
                            </div>
                        `;
                        
                        opponentsArea.appendChild(opponentDiv);
                    }
                });
            }
            
            // 更新手牌显示
            updateHandDisplay() {
                const humanPlayer = this.players.find(p => p.type === 'human');
                if (!humanPlayer) return;
                
                // 排序前清空选中状态，避免索引失效
                this.selectedCards = [];
                
                // 自动按名称排序手牌（支持中文）
                humanPlayer.hand.sort((a, b) => {
                    // 首先按名称排序
                    const nameCompare = a.name.localeCompare(b.name, 'zh-CN');
                    if (nameCompare !== 0) {
                        return nameCompare;
                    }
                    // 同名卡牌按花色排序
                    const suitOrder = { 'stone': 0, 'scissors': 1, 'cloth': 2, 'item': 3 };
                    const aSuit = suitOrder[a.type] ?? 999;
                    const bSuit = suitOrder[b.type] ?? 999;
                    return aSuit - bSuit;
                });
                
                const cardsContainer = document.querySelector('.cards-container');
                if (!cardsContainer) return;
                
                cardsContainer.innerHTML = '';
                
                // 更新手牌数量显示
                const handCountElement = document.querySelector('.hand-count');
                if (handCountElement) {
                    handCountElement.textContent = `${humanPlayer.hand.length}张`;
                }
                
                // 创建手牌元素
                humanPlayer.hand.forEach((card, index) => {
                    const cardElement = this.createCardElement(card, index);
                    cardsContainer.appendChild(cardElement);
                });
            }
            
            // 创建卡牌元素
            createCardElement(card, index) {
                const cardDiv = document.createElement('div');
                cardDiv.className = `card item ${this.selectedCards.includes(index) ? 'selected' : ''}`;
                cardDiv.dataset.cardIndex = index;
                
                // 获取卡牌图标
                const iconClass = card.icon || 'fa-question';
                
                // 添加花色图标
                let suitHtml = '';
                if (card.type === 'stone' || card.type === 'scissors' || card.type === 'cloth') {
                    const suitText = card.type === 'stone' ? '石' : card.type === 'scissors' ? '剪' : '布';
                    suitHtml = `<div class="card-suit ${card.type}">${suitText}</div>`;
                }
                
                cardDiv.innerHTML = `
                    ${suitHtml}
                    <div class="card-body">
                        <div class="card-icon" data-name="${card.name}">
                            <i class="fas ${iconClass}"></i>
                        </div>
                        <div class="card-name">${card.name}</div>
                        <div class="card-effect">${card.description || ''}</div>
                    </div>
                `;
                
                // 添加点击事件
                cardDiv.addEventListener('click', () => this.selectCard(index));
                
                return cardDiv;
            }
            
            // 选择卡牌
            selectCard(index) {
                const currentPlayer = this.getCurrentPlayer();
                if (currentPlayer.type !== 'human' || this.phase !== 'action') return;
                
                // 获取卡牌元素并添加使用动画
                const cardElements = document.querySelectorAll('.card');
                const cardElement = cardElements[index];
                if (cardElement) {
                    cardElement.classList.add('using');
                    
                    // 动画结束后移除类
                    setTimeout(() => {
                        cardElement.classList.remove('using');
                    }, 800);
                }
                
                // 使用选中的卡牌
                this.useCard(currentPlayer.id, index);
            }
            
            // 更新操作按钮状态
            updateActionButtons() {
                const currentPlayer = this.getCurrentPlayer();
                const isHumanTurn = currentPlayer && currentPlayer.type === 'human';
                
                const endTurnBtn = document.getElementById('end-turn');
                const passBtn = document.getElementById('pass');
                
                if (endTurnBtn) {
                    endTurnBtn.disabled = !isHumanTurn || this.phase !== 'action';
                }
                
                if (passBtn) {
                    passBtn.disabled = !isHumanTurn || this.phase !== 'action';
                }
            }
            
            // 清除游戏UI
            clearGameUI() {
                const opponentsArea = document.querySelector('.opponents-area');
                if (opponentsArea) opponentsArea.innerHTML = '';
                
                const cardsContainer = document.querySelector('.cards-container');
                if (cardsContainer) cardsContainer.innerHTML = '';
                
                document.getElementById('hand-count').textContent = '0';
                document.querySelector('.hand-count').textContent = '0张';
                
                document.querySelector('.player-class').textContent = '职业: 未选择';
                document.querySelector('.player-avatar').innerHTML = '<i class="fas fa-crown"></i>';
                
                const deckCount = document.getElementById('draw-pile').querySelector('.pile-count');
                if (deckCount) deckCount.textContent = '0';
                
                const discardCount = document.getElementById('discard-pile').querySelector('.pile-count');
                if (discardCount) discardCount.textContent = '0';
            }
            
            // 显示游戏结果（增强版）
            showGameResult(winner) {
                const resultModal = document.getElementById('result-modal');
                const resultTitle = document.getElementById('result-title');
                const resultMessage = document.getElementById('result-message');
                const resultIcon = resultModal.querySelector('.result-icon');
                
                if (winner) {
                    const isHumanWin = winner.type === 'human';
                    
                    // 播放相应音效
                    if (isHumanWin) {
                        soundManager.playVictorySound();
                        resultTitle.textContent = '🎉 恭喜获胜！ 🎉';
                        resultMessage.textContent = `你作为${winner.className}击败了所有对手！\n回合数: ${this.turn}\n存活玩家: 1/${this.players.length}`;
                        resultIcon.className = 'result-icon victory';
                        resultIcon.innerHTML = '<i class="fas fa-trophy"></i>';
                        resultIcon.style.background = 'linear-gradient(45deg, #f1c40f, #f39c12)';
                    } else {
                        soundManager.playDefeatSound();
                        resultTitle.textContent = '💀 游戏结束 💀';
                        resultMessage.textContent = `${winner.name}(${winner.className})赢得了游戏！\n回合数: ${this.turn}\n存活玩家: 1/${this.players.length}`;
                        resultIcon.className = 'result-icon defeat';
                        resultIcon.innerHTML = '<i class="fas fa-skull"></i>';
                        resultIcon.style.background = 'linear-gradient(45deg, #e74c3c, #c0392b)';
                    }
                } else {
                    // 平局
                    resultTitle.textContent = '🤝 平局 🤝';
                    resultMessage.textContent = `所有玩家都被淘汰了！\n回合数: ${this.turn}\n没有胜利者`;
                    resultIcon.className = 'result-icon';
                    resultIcon.innerHTML = '<i class="fas fa-handshake"></i>';
                    resultIcon.style.background = 'linear-gradient(45deg, #95a5a6, #7f8c8d)';
                }
                
                resultModal.classList.add('active');
                
                // 停止游戏计时器
                if (this.timerInterval) {
                    clearInterval(this.timerInterval);
                    this.timerInterval = null;
                }
            }
            
            // 记录游戏事件
            logGameEvent(message, type = 'system') {
                console.log(`[游戏日志] ${message}`);
                
                const battleLog = document.getElementById('battle-log');
                const gameLog = document.querySelector('.log-content');
                
                if (battleLog) {
                    const messageDiv = document.createElement('div');
                    messageDiv.className = 'battle-message';
                    messageDiv.textContent = message;
                    battleLog.appendChild(messageDiv);
                    
                    // 限制消息数量
                    while (battleLog.children.length > 10) {
                        battleLog.removeChild(battleLog.firstChild);
                    }
                    
                    // 滚动到底部
                    battleLog.scrollTop = battleLog.scrollHeight;
                }
                
                if (gameLog) {
                    const timestamp = new Date().toLocaleTimeString();
                    const logEntry = document.createElement('div');
                    logEntry.className = `log-entry ${type}`;
                    logEntry.innerHTML = `<strong>[${timestamp}]</strong> ${message}`;
                    gameLog.appendChild(logEntry);
                    
                    // 限制日志数量
                    while (gameLog.children.length > 20) {
                        gameLog.removeChild(gameLog.firstChild);
                    }
                    
                    // 滚动到底部
                    gameLog.scrollTop = gameLog.scrollHeight;
                }
            }
        }

        // ==================== 图鉴系统 ====================
        class EncyclopediaSystem {
            constructor(gameManager) {
                this.gameManager = gameManager;
                this.currentTab = 'classes';
                this.currentFilter = 'all';
            }
            
            // 初始化图鉴
            init() {
                this.loadClasses();
                this.setupEventListeners();
            }
            
            // 设置事件监听器
            setupEventListeners() {
                // 标签切换
                document.querySelectorAll('.encyclopedia-tab').forEach(tab => {
                    tab.addEventListener('click', () => {
                        const tabId = tab.dataset.tab;
                        this.switchTab(tabId);
                    });
                });
                
                // 过滤器切换
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const filter = btn.dataset.filter;
                        this.switchFilter(filter);
                    });
                });
            }
            
            // 切换标签
            switchTab(tabId) {
                this.currentTab = tabId;
                
                // 更新标签状态
                document.querySelectorAll('.encyclopedia-tab').forEach(tab => {
                    tab.classList.toggle('active', tab.dataset.tab === tabId);
                });
                
                // 更新内容显示
                document.querySelectorAll('.encyclopedia-content').forEach(content => {
                    content.classList.toggle('active', content.id === `encyclopedia-${tabId}`);
                });
                
                // 加载对应内容
                switch(tabId) {
                    case 'classes':
                        this.loadClasses();
                        break;
                    case 'items':
                        this.loadItems();
                        break;
                    case 'cards':
                        this.loadCards();
                        break;
                    case 'strategies':
                        // 策略页面已预加载
                        break;
                }
            }
            
            // 切换过滤器
            switchFilter(filter) {
                this.currentFilter = filter;
                
                // 更新过滤器状态
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.filter === filter);
                });
                
                // 重新加载内容
                switch(this.currentTab) {
                    case 'classes':
                        this.loadClasses();
                        break;
                    case 'items':
                        this.loadItems();
                        break;
                    case 'cards':
                        this.loadCards();
                        break;
                }
            }
            
            // 加载职业图鉴
            loadClasses() {
                const grid = document.getElementById('classes-grid');
                if (!grid) return;
                
                grid.innerHTML = '';
                
                // 获取职业数据
                let classes = this.gameManager.classManager.getClassesByDifficulty(this.currentFilter);
                
                if (classes.length === 0) {
                    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #a5b1c2;">暂无职业数据</div>';
                    return;
                }
                
                // 按名称排序（支持中文）
                classes = classes.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
                
                classes.forEach(cls => {
                    const classCard = this.createClassCard(cls);
                    grid.appendChild(classCard);
                });
            }
            
            // 创建职业卡片
            createClassCard(classData) {
                const card = document.createElement('div');
                card.className = 'encyclopedia-card';
                
                // 难度显示文本
                let difficultyText = '简单';
                if (classData.difficulty === 'medium') difficultyText = '中等';
                else if (classData.difficulty === 'hard') difficultyText = '困难';
                else if (classData.difficulty === 'very_hard') difficultyText = '极难';
                
                card.innerHTML = `
                    <div class="encyclopedia-card-header">
                        <div class="encyclopedia-icon" style="background: linear-gradient(45deg, ${classData.color}, ${this.adjustColor(classData.color, -20)});">
                            <i class="fas ${classData.icon}"></i>
                        </div>
                        <div>
                            <div class="encyclopedia-card-title">${classData.name}</div>
                            <div class="encyclopedia-card-subtitle">难度: ${difficultyText}</div>
                        </div>
                    </div>
                    <div class="encyclopedia-card-body">
                        <p>${classData.description}</p>
                        <div style="margin-top: 15px;">
                            <h4 style="color: #3498db; margin-bottom: 8px;">职业能力</h4>
                            <ul style="margin-left: 20px;">
                                ${classData.abilities.map(ability => `<li>${ability}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                    <div class="encyclopedia-card-tags">
                        <span class="encyclopedia-tag">${difficultyText}</span>
                        <span class="encyclopedia-tag">${classData.name}</span>
                    </div>
                `;
                
                // 添加点击事件
                card.addEventListener('click', () => {
                    this.showClassDetail(classData);
                });
                
                return card;
            }
            
            // 显示职业详情
            showClassDetail(classData) {
                // 创建详情模态框
                const modal = document.createElement('div');
                modal.className = 'modal active';
                modal.innerHTML = `
                    <div class="modal-content" style="max-width: 800px;">
                        <button class="close-modal">&times;</button>
                        <div style="display: flex; gap: 30px; flex-wrap: wrap;">
                            <div style="flex: 1; min-width: 200px;">
                                <div class="encyclopedia-icon" style="width: 120px; height: 120px; font-size: 3rem; margin: 0 auto 20px; background: linear-gradient(45deg, ${classData.color}, ${this.adjustColor(classData.color, -20)});">
                                    <i class="fas ${classData.icon}"></i>
                                </div>
                                <h2 style="text-align: center; margin-bottom: 10px;">${classData.name}</h2>
                                <div style="text-align: center; color: #a5b1c2; margin-bottom: 20px;">${classData.description}</div>
                            </div>
                            <div style="flex: 2; min-width: 300px;">
                                <h3 style="color: #4ecdc4; margin-bottom: 15px;">职业详情</h3>
                                <div style="margin-bottom: 20px;">
                                    <h4 style="color: #3498db; margin-bottom: 10px;">职业能力</h4>
                                    <ul style="margin-left: 20px;">
                                        ${classData.abilities.map(ability => `<li style="margin-bottom: 8px;">${ability}</li>`).join('')}
                                    </ul>
                                </div>
                                <div style="margin-bottom: 20px;">
                                    <h4 style="color: #3498db; margin-bottom: 10px;">新手建议</h4>
                                    <p>${this.getClassAdvice(classData)}</p>
                                </div>
                                <div>
                                    <h4 style="color: #3498db; margin-bottom: 10px;">推荐搭配</h4>
                                    <p>${this.getClassCombos(classData)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(modal);
                
                // 添加关闭事件
                modal.querySelector('.close-modal').addEventListener('click', () => {
                    document.body.removeChild(modal);
                });
                
                // 点击模态框背景关闭
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        document.body.removeChild(modal);
                    }
                });
                
                // 播放音效
                soundManager.playButtonSound();
            }
            
            // 获取职业建议
            getClassAdvice(classData) {
                const adviceMap = {
                    '士兵': '适合新手，攻击性强，容易上手。',
                    '商人': '适合喜欢策略的玩家，擅长交换卡牌。',
                    '天使': '适合辅助型玩家，可以复活队友。',
                    '炼金术师': '适合高级玩家，需要管理药剂和转换。',
                    '恐怖分子': '高风险高回报，适合喜欢刺激的玩家。',
                    '乐子人': '适合喜欢制造混乱和娱乐的玩家。',
                    '魔术师': '适合策略型玩家，擅长操控卡牌。',
                    '异教主': '适合领导型玩家，可以创造邪教徒。'
                };
                
                return adviceMap[classData.name] || '这是一个独特的职业，需要玩家自己探索玩法。';
            }
            
            // 获取职业搭配
            getClassCombos(classData) {
                const comboMap = {
                    '士兵': '适合搭配攻击类卡牌，如"杀人诛心"、"牛牛弹"。',
                    '商人': '适合搭配特殊类卡牌，如"互换"、"绿帽"。',
                    '天使': '适合搭配防御类卡牌，如"白旗"、"开摆"。',
                    '炼金术师': '适合搭配药类卡牌，如"毒药"、"解药"。',
                    '恐怖分子': '适合搭配"牛牛弹"和攻击类卡牌。',
                    '乐子人': '适合搭配特殊类卡牌，制造混乱效果。'
                };
                
                return comboMap[classData.name] || '可以尝试各种卡牌组合，找到最适合自己的玩法。';
            }
            
            // 加载道具图鉴
            loadItems() {
                const grid = document.getElementById('items-grid');
                if (!grid) return;
                
                grid.innerHTML = '';
                
                // 获取道具数据
                let items = this.gameManager.cardManager.getCardsByCategory(this.currentFilter);
                
                if (items.length === 0) {
                    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #a5b1c2;">暂无道具数据</div>';
                    return;
                }
                
                // 按名称排序（支持中文）
                items = items.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
                
                items.forEach(item => {
                    const itemCard = this.createItemCard(item);
                    grid.appendChild(itemCard);
                });
            }
            
            // 创建道具卡片
            createItemCard(itemData) {
                const card = document.createElement('div');
                card.className = 'encyclopedia-card';
                
                // 类型显示文本
                let typeText = '特殊';
                if (itemData.category === 'attack') typeText = '攻击';
                else if (itemData.category === 'defense') typeText = '防御';
                else if (itemData.category === 'special') typeText = '特殊';
                
                // 稀有度显示文本
                let rarityText = '普通';
                if (itemData.rarity === 'uncommon') rarityText = '精良';
                else if (itemData.rarity === 'rare') rarityText = '稀有';
                else if (itemData.rarity === 'epic') rarityText = '史诗';
                
                card.innerHTML = `
                    <div class="encyclopedia-card-header">
                        <div class="encyclopedia-icon" style="background: linear-gradient(45deg, ${this.getItemColor(itemData)}, ${this.adjustColor(this.getItemColor(itemData), -20)});">
                            <i class="fas ${itemData.icon || 'fa-question'}"></i>
                        </div>
                        <div>
                            <div class="encyclopedia-card-title">${itemData.name}</div>
                            <div class="encyclopedia-card-subtitle">${typeText} · ${rarityText}</div>
                        </div>
                    </div>
                    <div class="encyclopedia-card-body">
                        <p>${itemData.description}</p>
                        <div style="margin-top: 15px;">
                            <h4 style="color: #3498db; margin-bottom: 8px;">使用效果</h4>
                            <p>${this.getItemEffectDescription(itemData)}</p>
                        </div>
                    </div>
                    <div class="encyclopedia-card-tags">
                        <span class="encyclopedia-tag">${typeText}</span>
                        <span class="encyclopedia-tag">${rarityText}</span>
                        ${itemData.needsTarget ? '<span class="encyclopedia-tag">需要目标</span>' : ''}
                    </div>
                `;
                
                // 添加点击事件
                card.addEventListener('click', () => {
                    this.showItemDetail(itemData);
                });
                
                return card;
            }
            
            // 获取道具颜色
            getItemColor(itemData) {
                const colorMap = {
                    'attack': '#e74c3c',
                    'defense': '#3498db',
                    'special': '#f1c40f',
                    'epic': '#9b59b6'
                };
                
                return colorMap[itemData.category] || colorMap[itemData.rarity] || '#3498db';
            }
            
            // 获取道具效果描述
            getItemEffectDescription(itemData) {
                const effectMap = {
                    'discard_three': '弃置目标玩家三张手牌',
                    'swap_cards': '与目标玩家交换三张手牌',
                    'immune_once': '本回合免疫弃置/获得效果',
                    'give_four': '给目标玩家四张牌',
                    'mutual_discard': '双方各弃置三张牌',
                    'gain_six': '目标玩家获得六张牌',
                    'recycle_three': '从弃牌堆回收三张牌',
                    'provoke_all': '所有其他玩家给你两张牌',
                    'copy_card': '复制目标玩家一张牌',
                    'resurrect_player': '复活一名死亡玩家',
                    'open_pai': '三回合内免疫效果且不能弃置他人手牌',
                    'black_hole': '本回合结束时移出所有牌'
                };
                
                return effectMap[itemData.effect] || '特殊效果';
            }
            
            // 显示道具详情
            showItemDetail(itemData) {
                // 创建详情模态框
                const modal = document.createElement('div');
                modal.className = 'modal active';
                modal.innerHTML = `
                    <div class="modal-content" style="max-width: 800px;">
                        <button class="close-modal">&times;</button>
                        <div style="display: flex; gap: 30px; flex-wrap: wrap;">
                            <div style="flex: 1; min-width: 200px; display: flex; flex-direction: column; align-items: center;">
                                <div class="encyclopedia-icon" style="width: 120px; height: 120px; font-size: 3rem; margin-bottom: 20px; background: linear-gradient(45deg, ${this.getItemColor(itemData)}, ${this.adjustColor(this.getItemColor(itemData), -20)});">
                                    <i class="fas ${itemData.icon || 'fa-question'}"></i>
                                </div>
                                <h2 style="text-align: center; margin-bottom: 10px;">${itemData.name}</h2>
                                <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                                    <span class="encyclopedia-tag">${itemData.category === 'attack' ? '攻击' : itemData.category === 'defense' ? '防御' : '特殊'}</span>
                                    <span class="encyclopedia-tag">${itemData.rarity === 'common' ? '普通' : itemData.rarity === 'uncommon' ? '精良' : itemData.rarity === 'rare' ? '稀有' : '史诗'}</span>
                                </div>
                            </div>
                            <div style="flex: 2; min-width: 300px;">
                                <h3 style="color: #4ecdc4; margin-bottom: 15px;">道具详情</h3>
                                <div style="margin-bottom: 20px;">
                                    <h4 style="color: #3498db; margin-bottom: 10px;">效果描述</h4>
                                    <p>${itemData.description}</p>
                                </div>
                                <div style="margin-bottom: 20px;">
                                    <h4 style="color: #3498db; margin-bottom: 10px;">使用时机</h4>
                                    <p>${itemData.needsTarget ? '出牌阶段，需要选择目标玩家' : '出牌阶段，无需选择目标'}</p>
                                </div>
                                <div style="margin-bottom: 20px;">
                                    <h4 style="color: #3498db; margin-bottom: 10px;">策略建议</h4>
                                    <p>${this.getItemStrategy(itemData)}</p>
                                </div>
                                <div>
                                    <h4 style="color: #3498db; margin-bottom: 10px;">搭配职业</h4>
                                    <p>${this.getItemCombos(itemData)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(modal);
                
                // 添加关闭事件
                modal.querySelector('.close-modal').addEventListener('click', () => {
                    document.body.removeChild(modal);
                });
                
                // 点击模态框背景关闭
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        document.body.removeChild(modal);
                    }
                });
                
                // 播放音效
                soundManager.playButtonSound();
            }
            
            // 获取道具策略
            getItemStrategy(itemData) {
                const strategyMap = {
                    'killMind': '在对手手牌较多时使用效果最佳，可以快速削弱对手。',
                    'swap': '当自己手牌较差而对手手牌较好时使用，可以交换优势。',
                    'whiteFlag': '在自己手牌较少或面临威胁时使用，保护关键手牌。',
                    'greenHat': '可以给队友送牌，或者在对手死亡时使用特殊效果。',
                    'bullBull': '在自己手牌较多时使用，可以与对手互换劣势。',
                    'poison': '强大的史诗卡，可以在关键时刻给对手或自己大量手牌。',
                    'antidote': '强大的史诗卡，可以解毒并获得对手手牌。',
                    'cross': '在弃牌堆牌多时使用，回收有价值的手牌。',
                    'provoke': '在多人游戏中效果显著，可以从所有对手获取手牌。',
                    'meToo': '可以复制对手的强大卡牌，灵活应对局势。',
                    'resurrection': '可以复活死亡队友，逆转战局。',
                    'openPai': '在面临围攻时使用，保护自己多个回合。',
                    'blackHole': '清除场上所有牌，重置局势。'
                };
                
                return strategyMap[itemData.id] || '根据局势灵活使用，发挥最大效果。';
            }
            
            // 获取道具搭配
            getItemCombos(itemData) {
                const comboMap = {
                    'killMind': '搭配士兵职业，效果增强。',
                    'swap': '搭配商人职业，获得额外收益。',
                    'poison': '搭配炼金术师职业，获得额外手牌。',
                    'antidote': '搭配炼金术师职业，获得额外手牌。',
                    'bullBull': '搭配恐怖分子职业，效果大幅增强。',
                    'resurrection': '搭配天使职业，为复活玩家补充手牌。'
                };
                
                return comboMap[itemData.id] || '可以与多种职业搭配，根据局势选择使用。';
            }
            
            // 加载卡牌图鉴
            loadCards() {
                const grid = document.getElementById('cards-grid');
                if (!grid) return;
                
                grid.innerHTML = '';
                
                // 获取卡牌数据
                let cards = this.gameManager.cardManager.getCardsByRarity(this.currentFilter);
                
                if (cards.length === 0) {
                    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #a5b1c2;">暂无卡牌数据</div>';
                    return;
                }
                
                // 按名称排序（支持中文）
                cards = cards.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
                
                cards.forEach(card => {
                    const cardElement = this.createCardElement(card);
                    grid.appendChild(cardElement);
                });
            }
            
            // 创建卡牌元素
            createCardElement(cardData) {
                const card = document.createElement('div');
                card.className = 'encyclopedia-card';
                
                // 类型显示文本
                let typeText = '特殊';
                if (cardData.category === 'attack') typeText = '攻击';
                else if (cardData.category === 'defense') typeText = '防御';
                else if (cardData.category === 'special') typeText = '特殊';
                
                // 稀有度显示文本
                let rarityText = '普通';
                if (cardData.rarity === 'uncommon') rarityText = '精良';
                else if (cardData.rarity === 'rare') rarityText = '稀有';
                else if (cardData.rarity === 'epic') rarityText = '史诗';
                
                card.innerHTML = `
                    <div class="encyclopedia-card-header">
                        <div class="encyclopedia-icon" style="background: linear-gradient(45deg, ${this.getCardColor(cardData)}, ${this.adjustColor(this.getCardColor(cardData), -20)});">
                            <i class="fas ${cardData.icon || 'fa-question'}"></i>
                        </div>
                        <div>
                            <div class="encyclopedia-card-title">${cardData.name}</div>
                            <div class="encyclopedia-card-subtitle">${typeText} · ${rarityText}</div>
                        </div>
                    </div>
                    <div class="encyclopedia-card-body">
                        <p>${cardData.description}</p>
                    </div>
                    <div class="encyclopedia-card-tags">
                        <span class="encyclopedia-tag">${typeText}</span>
                        <span class="encyclopedia-tag">${rarityText}</span>
                    </div>
                `;
                
                // 添加点击事件
                card.addEventListener('click', () => {
                    this.showCardDetail(cardData);
                });
                
                return card;
            }
            
            // 获取卡牌颜色
            getCardColor(cardData) {
                const colorMap = {
                    'common': '#95a5a6',
                    'uncommon': '#2ecc71',
                    'rare': '#3498db',
                    'epic': '#9b59b6'
                };
                
                return colorMap[cardData.rarity] || '#3498db';
            }
            
            // 显示卡牌详情
            showCardDetail(cardData) {
                // 使用现有的卡牌详情模态框
                showCardDetailModal(cardData, '图鉴');
            }
            
            // 调整颜色亮度
            adjustColor(color, amount) {
                // 简化处理，实际应该解析颜色值
                return color;
            }
        }

        // ==================== 全局变量和初始化 ====================
        let soundManager = new SoundManager();
        let gameManager = new GameManager();
        let multiplayerManager = new MultiplayerManager(gameManager);
        let encyclopediaSystem = new EncyclopediaSystem(gameManager);

        // ==================== 触摸事件处理 ====================
        class TouchEventHandler {
            constructor() {
                this.touchElements = [];
                this.isTouchDevice = false;
                this.initTouchSupport();
            }

            initTouchSupport() {
                try {
                    // 检测触摸设备
                    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
                    console.log('触摸设备检测:', this.isTouchDevice);

                    if (this.isTouchDevice) {
                        this.setupTouchEventListeners();
                        this.addTouchClasses();
                    }
                } catch (error) {
                    console.error('触摸设备检测失败:', error);
                    this.isTouchDevice = false;
                }
            }

            setupTouchEventListeners() {
                try {
                    // 只在真正的触摸设备上添加触摸事件监听器
                    if (this.isTouchDevice) {
                        this.addTouchListenersToButtons();
                        this.addTouchListenersToCards();
                        this.addTouchListenersToOtherElements();
                    }
                } catch (error) {
                    console.error('设置触摸事件监听器失败:', error);
                }
            }

            addTouchListenersToButtons() {
                try {
                    // 确保DOM已经加载完成
                    if (!document.body) {
                        console.warn('DOM尚未加载完成，跳过触摸事件监听器添加');
                        return;
                    }
                    
                    const buttons = document.querySelectorAll('button, .menu-btn, .music-btn, .save-btn, .reset-btn, .control-btn, .back-btn, .action-btn, .target-btn, .small-btn, .btn');
                    buttons.forEach(button => {
                        this.addTouchListeners(button);
                    });
                } catch (error) {
                    console.error('添加按钮触摸监听器失败:', error);
                }
            }

            addTouchListenersToCards() {
                try {
                    // 确保DOM已经加载完成
                    if (!document.body) {
                        console.warn('DOM尚未加载完成，跳过卡牌触摸事件监听器添加');
                        return;
                    }
                    
                    const cards = document.querySelectorAll('.card, .rogue-card');
                    cards.forEach(card => {
                        this.addTouchListeners(card);
                    });
                } catch (error) {
                    console.error('添加卡牌触摸监听器失败:', error);
                }
            }

            addTouchListenersToOtherElements() {
                try {
                    // 确保DOM已经加载完成
                    if (!document.body) {
                        console.warn('DOM尚未加载完成，跳过其他元素触摸事件监听器添加');
                        return;
                    }
                    
                    const elements = document.querySelectorAll('.class-card, .encyclopedia-card, .room-item, .avatar-option, .pile, .opponent, .target-item');
                    elements.forEach(element => {
                        this.addTouchListeners(element);
                    });
                } catch (error) {
                    console.error('添加其他元素触摸监听器失败:', error);
                }
            }

            addTouchListeners(element) {
                if (!element) return;

                // 只在真正的触摸设备上添加触摸事件监听器
                if (this.isTouchDevice) {
                    try {
                        element.addEventListener('touchstart', (e) => this.handleTouchStart(e, element), { passive: true });
                        element.addEventListener('touchmove', (e) => this.handleTouchMove(e, element), { passive: true });
                        element.addEventListener('touchend', (e) => this.handleTouchEnd(e, element), { passive: true });
                        element.addEventListener('touchcancel', (e) => this.handleTouchCancel(e, element), { passive: true });

                        // 添加到触摸元素列表
                        this.touchElements.push(element);
                    } catch (error) {
                        console.error('添加触摸监听器失败:', error);
                    }
                }
            }

            handleTouchStart(e, element) {
                // 只在真正的触摸设备上防止默认行为
                if (this.isTouchDevice) {
                    // 对于特定元素，我们可能需要防止默认行为
                    // 但要小心不要影响桌面端
                }
                
                // 添加触摸激活样式
                element.classList.add('touch-active');

                // 记录触摸开始时间和位置
                element._touchStartX = e.touches[0].clientX;
                element._touchStartY = e.touches[0].clientY;
                element._touchStartTime = Date.now();
            }

            handleTouchMove(e, element) {
                // 只在真正的触摸设备上防止默认行为
                if (this.isTouchDevice) {
                    // 对于特定元素，我们可能需要防止默认行为
                    // 但要小心不要影响桌面端
                }

                // 计算触摸移动距离
                const touchX = e.touches[0].clientX;
                const touchY = e.touches[0].clientY;
                const deltaX = touchX - element._touchStartX;
                const deltaY = touchY - element._touchStartY;
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

                // 如果移动距离超过10px，移除触摸激活样式
                if (distance > 10) {
                    element.classList.remove('touch-active');
                }
            }

            handleTouchEnd(e, element) {
                // 只在真正的触摸设备上防止默认行为
                if (this.isTouchDevice) {
                    // 对于特定元素，我们可能需要防止默认行为
                    // 但要小心不要影响桌面端
                }

                // 移除触摸激活样式
                element.classList.remove('touch-active');

                // 计算触摸持续时间
                const touchEndTime = Date.now();
                const touchDuration = touchEndTime - (element._touchStartTime || 0);

                // 如果触摸持续时间小于300ms，触发点击事件
                if (touchDuration < 300) {
                    // 模拟点击事件
                    const clickEvent = new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true,
                        view: window
                    });
                    element.dispatchEvent(clickEvent);
                }
            }

            handleTouchCancel(e, element) {
                // 移除触摸激活样式
                element.classList.remove('touch-active');
            }

            addTouchClasses() {
                // 为文档添加触摸设备类
                document.documentElement.classList.add('touch-device');
            }

            // 为动态创建的元素添加触摸事件监听器
            addTouchListenersToDynamicElement(element) {
                if (this.isTouchDevice && element) {
                    this.addTouchListeners(element);
                }
            }
        }

        // 游戏初始化
        function initGame() {
            console.log('初始化游戏系统...');
            try {
                loadSettings();
                initEventListeners();
                encyclopediaSystem.init();
                
                // 初始化触摸事件支持
                try {
                    gameManager.setupTouchSupport();
                } catch (err) {
                    console.warn('初始化触摸事件支持失败:', err);
                }
                
                console.log('游戏初始化完成');
            } catch (error) {
                console.error('游戏初始化失败:', error);
                // 即使初始化失败，也要显示游戏界面
                try {
                    const loadingScreen = document.getElementById('loading-screen');
                    if (loadingScreen) {
                        loadingScreen.style.display = 'none';
                    }
                    
                    const gameContainer = document.getElementById('game-container');
                    if (gameContainer) {
                        gameContainer.style.display = 'block';
                    }
                } catch (err) {
                    console.error('显示游戏界面失败:', err);
                }
            }
        }

        // 初始化事件监听器
        function initEventListeners() {
            console.log('初始化事件监听器...');
            
            // 安全地添加事件监听器，避免因元素不存在而导致错误
            function addEventListenerIfExists(elementId, event, callback) {
                try {
                    const element = document.getElementById(elementId);
                    if (element) {
                        element.addEventListener(event, callback);
                    } else {
                        console.warn(`元素不存在: ${elementId}`);
                    }
                } catch (error) {
                    console.error(`添加事件监听器失败 (${elementId}):`, error);
                }
            }
            
            // 主菜单按钮
            addEventListenerIfExists('start-game', 'click', startSinglePlayerGame);
            addEventListenerIfExists('multiplayer-game', 'click', showMultiplayerScreen);
            addEventListenerIfExists('rogue-mode', 'click', showRogueMainScreen);
            addEventListenerIfExists('encyclopedia', 'click', showEncyclopedia);
            addEventListenerIfExists('how-to-play', 'click', showTutorial);
            addEventListenerIfExists('settings', 'click', showSettings);
            addEventListenerIfExists('exit-game', 'click', exitGame);
            
            // 返回按钮
            addEventListenerIfExists('back-to-menu', 'click', showMainMenu);
            addEventListenerIfExists('back-from-tutorial', 'click', showMainMenu);
            addEventListenerIfExists('back-from-class', 'click', () => {
                try {
                    soundManager.playButtonSound();
                } catch (error) {
                    console.warn('播放按钮音效失败:', error);
                }
                showMainMenu();
            });
            addEventListenerIfExists('back-from-multiplayer', 'click', showMainMenu);
            addEventListenerIfExists('back-from-encyclopedia', 'click', showMainMenu);
            
            // 职业选择确认
            addEventListenerIfExists('confirm-class', 'click', () => {
                try {
                    soundManager.playButtonSound();
                } catch (error) {
                    console.warn('播放按钮音效失败:', error);
                }
                if (gameManager && gameManager.selectedClass) {
                    switchScreen('game-screen');
                    setTimeout(() => {
                        try {
                            gameManager.initializeNewGame();
                        } catch (error) {
                            console.error('初始化新游戏失败:', error);
                        }
                    }, 100);
                }
            });
            
            // 多人游戏相关
            addEventListenerIfExists('create-room', 'click', createRoom);
            addEventListenerIfExists('join-room', 'click', joinRoom);
            addEventListenerIfExists('refresh-rooms', 'click', refreshRooms);
            addEventListenerIfExists('send-chat', 'click', sendChatMessage);
            addEventListenerIfExists('chat-input', 'keypress', (e) => {
                if (e.key === 'Enter') {
                    sendChatMessage();
                }
            });
            addEventListenerIfExists('start-multiplayer-game', 'click', startMultiplayerGame);
            addEventListenerIfExists('leave-room', 'click', leaveRoom);
            
            // 设置相关
            addEventListenerIfExists('save-settings', 'click', saveSettings);
            addEventListenerIfExists('reset-settings', 'click', resetSettings);
            
            // 设置滑块事件
            try {
                initSettingSliders();
            } catch (error) {
                console.warn('初始化设置滑块失败:', error);
            }
            
            // 整理卡牌函数
            function sortCards() {
                try {
                    if (!gameManager || !gameManager.players) return;
                    const humanPlayer = gameManager.players.find(p => p.type === 'human');
                    if (!humanPlayer) return;
                    
                    // 按名称和花色排序
                    humanPlayer.hand.sort((a, b) => {
                        // 先按名称排序
                        if (a.name !== b.name) {
                            return a.name.localeCompare(b.name);
                        }
                        // 再按花色排序
                        const suitOrder = { 'stone': 0, 'scissors': 1, 'cloth': 2 };
                        return (suitOrder[a.type] || 999) - (suitOrder[b.type] || 999);
                    });
                    
                    gameManager.updateHandDisplay();
                    gameManager.logGameEvent('手牌已自动整理');
                    try {
                        soundManager.playButtonSound();
                    } catch (error) {
                        console.warn('播放按钮音效失败:', error);
                    }
                } catch (error) {
                    console.error('整理卡牌失败:', error);
                }
            }
            
            // 游戏控制按钮
            addEventListenerIfExists('end-turn', 'click', () => {
                try {
                    if (gameManager) gameManager.endTurn();
                } catch (error) {
                    console.error('结束回合失败:', error);
                }
            });
            addEventListenerIfExists('pass', 'click', () => {
                try {
                    if (gameManager) gameManager.passTurn();
                } catch (error) {
                    console.error('跳过回合失败:', error);
                }
            });
            addEventListenerIfExists('pause-game', 'click', pauseGame);
            addEventListenerIfExists('sort-cards', 'click', sortCards);
            addEventListenerIfExists('quit-game', 'click', quitGame);
            addEventListenerIfExists('view-log', 'click', toggleGameLog);
            addEventListenerIfExists('game-help', 'click', showGameHelp);
            
            // 牌堆点击事件
            addEventListenerIfExists('draw-pile', 'click', drawCardAction);
            addEventListenerIfExists('discard-pile', 'click', showDiscardPile);
            
            // 日志控制
            addEventListenerIfExists('clear-log', 'click', clearGameLog);
            addEventListenerIfExists('toggle-log', 'click', toggleGameLog);
            
            // 模态框控制
            try {
                document.querySelectorAll('.close-modal').forEach(btn => {
                    btn.addEventListener('click', closeModal);
                });
            } catch (error) {
                console.warn('添加模态框关闭事件失败:', error);
            }
            
            // 目标选择取消
            addEventListenerIfExists('cancel-target', 'click', () => {
                try {
                    if (gameManager) gameManager.cancelTargetSelection();
                } catch (error) {
                    console.error('取消目标选择失败:', error);
                }
            });
            
            // 暂停菜单按钮
            addEventListenerIfExists('resume-game', 'click', resumeGame);
            addEventListenerIfExists('restart-game', 'click', restartGame);
            addEventListenerIfExists('back-to-menu-from-game', 'click', backToMenuFromGame);
            addEventListenerIfExists('game-settings', 'click', showSettingsFromGame);
            
            // 结果界面按钮
            addEventListenerIfExists('play-again', 'click', playAgain);
            addEventListenerIfExists('back-to-menu-result', 'click', backToMenuFromResult);
            
            // 音乐控制
            addEventListenerIfExists('toggle-music', 'click', toggleMusic);
            addEventListenerIfExists('toggle-sfx', 'click', toggleSFX);
            
            // 卡牌详情
            try {
                document.addEventListener('click', (e) => {
                    try {
                        if (e.target.closest('.card') && e.target.closest('.card').dataset.cardIndex !== undefined) {
                            showCardDetail(e.target.closest('.card'));
                        }
                    } catch (error) {
                        console.error('显示卡牌详情失败:', error);
                    }
                });
            } catch (error) {
                console.warn('添加卡牌详情点击事件失败:', error);
            }
            
            // 添加用户交互事件以解锁音频自动播放
            try {
                document.addEventListener('click', unlockAudio);
                document.addEventListener('keydown', unlockAudio);
            } catch (error) {
                console.warn('添加音频解锁事件失败:', error);
            }
            
            // 头像选择事件
            try {
                // 加载保存的头像
                const savedAvatar = localStorage.getItem('playerAvatar') || '👤';
                const currentAvatarElement = document.getElementById('current-avatar');
                if (currentAvatarElement) {
                    currentAvatarElement.textContent = savedAvatar;
                }
                
                // 为头像选项添加事件
                const avatarOptions = document.querySelectorAll('.avatar-option');
                avatarOptions.forEach(option => {
                    // 设置头像显示
                    option.textContent = option.dataset.avatar;
                    
                    // 检查是否是当前选择的头像
                    if (option.dataset.avatar === savedAvatar) {
                        option.classList.add('selected');
                    }
                    
                    // 添加点击事件
                    option.addEventListener('click', function() {
                        try {
                            const selectedAvatar = this.dataset.avatar;
                            
                            // 更新UI
                            const avatarElement = document.getElementById('current-avatar');
                            if (avatarElement) {
                                avatarElement.textContent = selectedAvatar;
                            }
                            
                            // 移除所有选中状态
                            document.querySelectorAll('.avatar-option').forEach(opt => {
                                opt.classList.remove('selected');
                            });
                            
                            // 添加当前选中状态
                            this.classList.add('selected');
                            
                            // 保存到LocalStorage
                            localStorage.setItem('playerAvatar', selectedAvatar);
                            
                            // 播放音效
                            try {
                                soundManager.playButtonSound();
                            } catch (error) {
                                console.warn('播放按钮音效失败:', error);
                            }
                        } catch (error) {
                            console.error('选择头像失败:', error);
                        }
                    });
                });
            } catch (error) {
                console.warn('初始化头像选择事件失败:', error);
            }
            
            console.log('事件监听器初始化完成');
        }
        
        // 解锁音频自动播放
        function unlockAudio() {
            if (soundManager && soundManager.bgMusic) {
                // 尝试播放背景音乐（需要用户交互）
                soundManager.bgMusic.play().then(() => {
                    console.log('音频自动播放已解锁');
                    soundManager.bgMusic.pause(); // 暂停，等待音乐开关控制
                }).catch(e => {
                    console.log('音频播放需要用户交互');
                });
                
                // 移除事件监听器
                document.removeEventListener('click', unlockAudio);
                document.removeEventListener('keydown', unlockAudio);
            }
        }

        // 初始化设置滑块
        function initSettingSliders() {
            const initialCardsSlider = document.getElementById('initial-cards');
            const initialCardsValue = document.getElementById('initial-cards-value');
            
            initialCardsSlider.addEventListener('input', function() {
                initialCardsValue.textContent = `${this.value}张`;
            });
            
            const uiScaleSlider = document.getElementById('ui-scale');
            const uiScaleValue = document.getElementById('ui-scale-value');
            
            uiScaleSlider.addEventListener('input', function() {
                uiScaleValue.textContent = `${this.value}%`;
                document.getElementById('game-container').style.transform = `scale(${this.value / 100})`;
            });
            
            const musicVolumeSlider = document.getElementById('music-volume');
            const musicVolumeValue = document.getElementById('music-volume-value');
            
            musicVolumeSlider.addEventListener('input', function() {
                musicVolumeValue.textContent = `${this.value}%`;
                if (soundManager) {
                    soundManager.setMusicVolume(this.value / 100);
                }
            });
            
            const sfxVolumeSlider = document.getElementById('sfx-volume');
            const sfxVolumeValue = document.getElementById('sfx-volume-value');
            
            sfxVolumeSlider.addEventListener('input', function() {
                sfxVolumeValue.textContent = `${this.value}%`;
                if (soundManager) {
                    soundManager.setSFXVolume(this.value / 100);
                }
            });
            
            // 对战音乐音量控制
            const battleMusicVolumeSlider = document.getElementById('battle-music-volume');
            const battleMusicVolumeValue = document.getElementById('battle-music-volume-value');
            
            battleMusicVolumeSlider.addEventListener('input', function() {
                battleMusicVolumeValue.textContent = `${this.value}%`;
                if (soundManager) {
                    soundManager.setBattleMusicVolume(this.value / 100);
                }
            });
            
            // 联机大厅音乐音量控制
            const lobbyMusicVolumeSlider = document.getElementById('lobby-music-volume');
            const lobbyMusicVolumeValue = document.getElementById('lobby-music-volume-value');
            
            lobbyMusicVolumeSlider.addEventListener('input', function() {
                lobbyMusicVolumeValue.textContent = `${this.value}%`;
                if (soundManager) {
                    soundManager.setLobbyMusicVolume(this.value / 100);
                }
            });
        }

        // ==================== 游戏流程函数 ====================
        function startSinglePlayerGame() {
            console.log('开始单人游戏');
            soundManager.playButtonSound();
            gameManager.isMultiplayer = false;
            gameManager.multiplayerManager = null;
            gameManager.showClassSelection();
        }

        function showMultiplayerScreen() {
            soundManager.playButtonSound();
            switchScreen('multiplayer-screen');
            
            // 刷新房间列表
            refreshRooms();
        }

        function showEncyclopedia() {
            soundManager.playButtonSound();
            switchScreen('encyclopedia-screen');
        }

        function switchScreen(screenId) {
            console.log(`切换到屏幕: ${screenId}`);
            
            document.querySelectorAll('.screen').forEach(screen => {
                screen.classList.remove('active');
                screen.classList.add('hidden');
            });
            
            const targetScreen = document.getElementById(screenId);
            if (targetScreen) {
                targetScreen.classList.add('active');
                targetScreen.classList.remove('hidden');
            }
            
            // 处理肉鸽模式动态背景
            if (screenId.startsWith('rogue-')) {
                // 激活肉鸽模式背景
                activateRogueBackground();
            } else {
                // 停用肉鸽模式背景
                deactivateRogueBackground();
            }
            
            // 处理音乐切换（更自然的衔接）
            const currentMusicType = soundManager.currentMusicType;
            let targetMusicType = null;
            
            switch(screenId) {
                case 'main-menu':
                    targetMusicType = 'background';
                    break;
                case 'multiplayer-screen':
                    targetMusicType = 'lobby';
                    break;
                case 'game-screen':
                    targetMusicType = 'battle';
                    break;
                case 'rogue-screen-main':
                case 'rogue-screen-menu':
                case 'rogue-battle-scene':
                case 'rogue-shop-screen':
                case 'rogue-event-screen':
                case 'rogue-treasure-screen':
                case 'rogue-rest-screen':
                case 'rogue-boss-screen':
                case 'rogue-map-screen':
                case 'rogue-screen-reward':
                    targetMusicType = 'rogue';
                    break;
                default:
                    // 对于其他屏幕，保持当前音乐类型不变，避免频繁切换
                    targetMusicType = currentMusicType;
                    break;
            }
            
            // 只有当音乐类型真正改变时才切换音乐，避免频繁重新开始
            if (targetMusicType && currentMusicType !== targetMusicType) {
                // 延迟切换音乐，确保场景切换的视觉效果先完成
                setTimeout(() => {
                    switch(targetMusicType) {
                        case 'background':
                            soundManager.playBackgroundMusic();
                            break;
                        case 'lobby':
                            soundManager.playLobbyMusic();
                            break;
                        case 'battle':
                            soundManager.playBattleMusic();
                            break;
                        case 'rogue':
                            soundManager.playRogueMusic();
                            break;
                    }
                }, 100); // 100ms延迟，让视觉切换先完成
            } else if (!targetMusicType && currentMusicType) {
                // 目标场景不需要音乐时才停止
                // 延迟停止音乐，确保场景切换的视觉效果先完成
                setTimeout(() => {
                    soundManager.stopAllMusic();
                }, 100); // 100ms延迟，让视觉切换先完成
            }
        }
        
        // 激活肉鸽模式背景
        function activateRogueBackground() {
            const rogueBackground = document.getElementById('rogue-dynamic-background');
            const mainBackground = document.getElementById('dynamic-background');
            
            if (rogueBackground) {
                rogueBackground.classList.add('active');
                // 初始化肉鸽模式背景效果
                initRogueDynamicBackground();
            }
            
            if (mainBackground) {
                mainBackground.style.opacity = '0.3';
            }
        }
        
        // 停用肉鸽模式背景
        function deactivateRogueBackground() {
            const rogueBackground = document.getElementById('rogue-dynamic-background');
            const mainBackground = document.getElementById('dynamic-background');
            
            if (rogueBackground) {
                rogueBackground.classList.remove('active');
                // 清空所有粒子和光效
                rogueBackground.innerHTML = '';
            }
            
            if (mainBackground) {
                mainBackground.style.opacity = '1';
            }
        }
        
        // 初始化肉鸽模式动态背景
        function initRogueDynamicBackground() {
            const container = document.getElementById('rogue-dynamic-background');
            if (!container) return;
            
            // 创建肉鸽模式专属粒子
            for (let i = 0; i < 20; i++) {
                createRogueParticle(container);
            }
            
            // 创建肉鸽模式背景光效
            for (let i = 0; i < 3; i++) {
                createRogueLightEffect(container);
            }
        }
        
        // 创建肉鸽模式专属粒子
        function createRogueParticle(container) {
            const particle = document.createElement('div');
            particle.className = 'rogue-particle';
            
            // 随机大小
            const size = Math.random() * 8 + 4;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            // 随机位置
            particle.style.left = `${Math.random() * 100}vw`;
            particle.style.bottom = `-20px`;
            
            // 随机动画持续时间
            const duration = Math.random() * 15 + 8;
            particle.style.animationDuration = `${duration}s`;
            
            // 随机动画延迟
            particle.style.animationDelay = `${Math.random() * 3}s`;
            
            container.appendChild(particle);
            
            // 动画结束后移除粒子
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, (duration + 3) * 1000);
        }
        
        // 创建肉鸽模式背景光效
        function createRogueLightEffect(container) {
            const light = document.createElement('div');
            light.className = 'rogue-light-effect';
            
            // 随机初始位置
            light.style.left = `${Math.random() * 100}vw`;
            light.style.top = `${Math.random() * 100}vh`;
            
            // 随机动画持续时间
            const duration = Math.random() * 10 + 6;
            light.style.animationDuration = `${duration}s`;
            
            // 随机动画延迟
            light.style.animationDelay = `${Math.random() * 4}s`;
            
            container.appendChild(light);
            
            // 动画结束后移除光效
            setTimeout(() => {
                if (light.parentNode) {
                    light.parentNode.removeChild(light);
                }
            }, (duration + 4) * 1000);
        }

        function showTutorial() {
            soundManager.playButtonSound('menu');
            switchScreen('tutorial-screen');
        }

        function showRogueMainScreen() {
            soundManager.playButtonSound('select');
            switchScreen('rogue-screen-main');
        }

        // 显示肉鸽模式职业选择
        function showRogueClassSelection() {
            soundManager.playButtonSound('select');
            switchScreen('rogue-screen-menu');
        }

        // 显示肉鸽模式设置
        function showRogueSettings() {
            soundManager.playButtonSound('menu');
            switchScreen('rogue-settings-screen');
        }

        // 显示肉鸽模式关于
        function showRogueAbout() {
            soundManager.playButtonSound('menu');
            switchScreen('rogue-about-screen');
        }

        function showSettings() {
            soundManager.playButtonSound('menu');
            switchScreen('settings-screen');
            loadSettingsToUI();
        }

        function showMainMenu() {
            soundManager.playButtonSound('cancel');
            
            if (gameManager.gameStarted) {
                gameManager.gameStarted = false;
                if (gameManager.timerInterval) {
                    clearInterval(gameManager.timerInterval);
                    gameManager.timerInterval = null;
                }
            }
            
            switchScreen('main-menu');
        }

        // ==================== 多人游戏函数 ====================
        function createRoom() {
            const roomName = document.getElementById('room-name').value || '道具大战房间';
            const password = document.getElementById('room-password').value;
            const maxPlayers = document.getElementById('max-players').value;
            
            if (!roomName.trim()) {
                multiplayerManager.showNotification('请输入房间名称', 'error');
                return;
            }
            
            soundManager.playButtonSound();
            
            const roomId = multiplayerManager.createRoom(roomName, password, maxPlayers);
            if (roomId) {
                // 切换到职业选择界面
                setTimeout(() => {
                    gameManager.isMultiplayer = true;
                    gameManager.multiplayerManager = multiplayerManager;
                    gameManager.playerName = multiplayerManager.playerName;
                    gameManager.showClassSelection();
                }, 1000);
            }
        }

        function joinRoom() {
            const roomId = document.getElementById('room-id').value.trim();
            const password = document.getElementById('join-room-password').value;
            
            if (!roomId) {
                multiplayerManager.showNotification('请输入房间ID', 'error');
                return;
            }
            
            soundManager.playButtonSound();
            
            multiplayerManager.joinRoom(roomId, password);
        }

        function refreshRooms() {
            soundManager.playButtonSound();
            multiplayerManager.updatePublicRoomsList();
            multiplayerManager.showNotification('房间列表已刷新', 'info');
        }

        function sendChatMessage() {
            const input = document.getElementById('chat-input');
            const message = input.value.trim();
            
            if (!message) return;
            
            multiplayerManager.sendChatMessage(message);
            input.value = '';
            input.focus();
        }

        function startMultiplayerGame() {
            soundManager.playButtonSound();
            multiplayerManager.startMultiplayerGame();
        }

        function leaveRoom() {
            soundManager.playButtonSound();
            multiplayerManager.leaveRoom();
        }

        // ==================== 设置相关函数 ====================
        function saveSettings() {
            const settings = {
                playerCount: document.getElementById('player-count').value,
                aiDifficulty: document.getElementById('ai-difficulty').value,
                initialCards: document.getElementById('initial-cards').value,
                showAnimations: document.getElementById('show-animations').checked,
                cardHints: document.getElementById('card-hints').checked,
                uiScale: document.getElementById('ui-scale').value,
                musicVolume: document.getElementById('music-volume').value,
                battleMusicVolume: document.getElementById('battle-music-volume').value,
                lobbyMusicVolume: document.getElementById('lobby-music-volume').value,
                sfxVolume: document.getElementById('sfx-volume').value
            };
            
            localStorage.setItem('gameSettings', JSON.stringify(settings));
            Object.assign(gameManager.settings, settings);
            
            soundManager.playButtonSound();
            multiplayerManager.showNotification('设置已保存！', 'success');
            showMainMenu();
        }

        function loadSettingsToUI() {
            const settings = JSON.parse(localStorage.getItem('gameSettings')) || gameManager.settings;
            
            document.getElementById('player-count').value = settings.playerCount || 4;
            document.getElementById('ai-difficulty').value = settings.aiDifficulty || 'medium';
            document.getElementById('initial-cards').value = settings.initialCards || 15;
            document.getElementById('show-animations').checked = settings.showAnimations !== false;
            document.getElementById('card-hints').checked = settings.cardHints !== false;
            document.getElementById('ui-scale').value = settings.uiScale || 100;
            document.getElementById('music-volume').value = settings.musicVolume || 70;
            document.getElementById('battle-music-volume').value = settings.battleMusicVolume || 70;
            document.getElementById('lobby-music-volume').value = settings.lobbyMusicVolume || 70;
            document.getElementById('sfx-volume').value = settings.sfxVolume || 80;
            
            document.getElementById('initial-cards-value').textContent = `${settings.initialCards || 15}张`;
            document.getElementById('ui-scale-value').textContent = `${settings.uiScale || 100}%`;
            document.getElementById('music-volume-value').textContent = `${settings.musicVolume || 70}%`;
            document.getElementById('battle-music-volume-value').textContent = `${settings.battleMusicVolume || 70}%`;
            document.getElementById('lobby-music-volume-value').textContent = `${settings.lobbyMusicVolume || 70}%`;
            document.getElementById('sfx-volume-value').textContent = `${settings.sfxVolume || 80}%`;
            
            // 更新音效管理器音量
            if (soundManager) {
                soundManager.setMusicVolume((settings.musicVolume || 70) / 100);
                soundManager.setBattleMusicVolume((settings.battleMusicVolume || 70) / 100);
                soundManager.setLobbyMusicVolume((settings.lobbyMusicVolume || 70) / 100);
                soundManager.setSFXVolume((settings.sfxVolume || 80) / 100);
            }
        }

        function loadSettings() {
            const savedSettings = localStorage.getItem('gameSettings');
            if (savedSettings) {
                try {
                    gameManager.settings = JSON.parse(savedSettings);
                } catch (e) {
                    console.error('加载设置失败:', e);
                }
            }
        }

        function resetSettings() {
            if (confirm('确定要恢复默认设置吗？')) {
                localStorage.removeItem('gameSettings');
                gameManager.settings = {
                    playerCount: 4,
                    aiDifficulty: 'medium',
                    initialCards: 15,
                    musicVolume: 70,
                    sfxVolume: 80,
                    showAnimations: true,
                    cardHints: true,
                    uiScale: 100
                };
                
                soundManager.playButtonSound();
                loadSettingsToUI();
                multiplayerManager.showNotification('设置已恢复为默认值！', 'success');
            }
        }

        function exitGame() {
            soundManager.playButtonSound();
            if (confirm('确定要退出游戏吗？')) {
                console.log('退出游戏');
                alert('感谢游玩！');
            }
        }

        // ==================== 游戏内操作函数 ====================
        function drawCardAction() {
            if (!gameManager.gameStarted) return;
            
            const currentPlayer = gameManager.getCurrentPlayer();
            if (currentPlayer.type !== 'human' || gameManager.phase !== 'action') {
                return;
            }
            
            const card = gameManager.drawCardFromDeck();
            if (card) {
                currentPlayer.hand.push(card);
                gameManager.logGameEvent('你摸了一张牌');
                gameManager.updateGameUI();
            } else {
                gameManager.logGameEvent('牌堆已空！');
            }
        }

        function showDiscardPile() {
            if (gameManager.discardPile.length === 0) {
                gameManager.logGameEvent('弃牌堆是空的');
                return;
            }
            
            // 弃牌堆点击不再显示卡牌详情
        }



        function closeModal() {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.remove('active');
            });
        }

        function pauseGame() {
            soundManager.playButtonSound();
            
            if (gameManager.gameStarted) {
                gameManager.gameStarted = false;
                if (gameManager.timerInterval) {
                    clearInterval(gameManager.timerInterval);
                    gameManager.timerInterval = null;
                }
            }
            
            document.getElementById('pause-menu').classList.add('active');
        }

        function resumeGame() {
            soundManager.playButtonSound();
            
            if (!gameManager.gameStarted && gameManager.players.length > 0) {
                gameManager.gameStarted = true;
                gameManager.updateTurnTimer();
            }
            
            closeModal();
        }

        function restartGame() {
            soundManager.playButtonSound();
            
            if (confirm('确定要重新开始游戏吗？当前进度将会丢失。')) {
                closeModal();
                gameManager.selectedClass = null;
                gameManager.initializeNewGame();
            }
        }

        function backToMenuFromGame() {
            soundManager.playButtonSound();
            
            if (confirm('确定要返回主菜单吗？当前游戏进度将会丢失。')) {
                closeModal();
                showMainMenu();
            }
        }

        function showSettingsFromGame() {
            soundManager.playButtonSound();
            closeModal();
            showSettings();
        }

        function playAgain() {
            soundManager.playButtonSound();
            closeModal();
            gameManager.selectedClass = null;
            gameManager.initializeNewGame();
        }

        function backToMenuFromResult() {
            soundManager.playButtonSound();
            closeModal();
            showMainMenu();
        }

        function quitGame() {
            soundManager.playButtonSound();
            
            if (confirm('确定要退出当前游戏吗？进度将会丢失。')) {
                showMainMenu();
            }
        }

        function toggleGameLog() {
            const gameLog = document.getElementById('game-log');
            const toggleBtn = document.getElementById('toggle-log');
            
            if (gameLog.style.display === 'none') {
                gameLog.style.display = 'flex';
                toggleBtn.textContent = '隐藏';
            } else {
                gameLog.style.display = 'none';
                toggleBtn.textContent = '显示';
            }
            
            soundManager.playButtonSound();
        }

        function clearGameLog() {
            const logContent = document.querySelector('.log-content');
            if (logContent) {
                logContent.innerHTML = '';
                gameManager.logGameEvent('日志已清空');
            }
            soundManager.playButtonSound();
        }

        function showGameHelp() {
            soundManager.playButtonSound();
            alert('游戏帮助：\n1. 在出牌阶段点击卡牌使用\n2. 有些卡牌需要选择目标\n3. 击败所有对手获得胜利！\n4. 职业能力会在特定情况下自动触发\n5. 手牌为0时被淘汰\n6. 牌堆为空时会重新洗混弃牌堆\n\n多人游戏：\n1. 创建房间或加入房间\n2. 等待所有玩家准备就绪\n3. 房主开始游戏\n4. 实时同步游戏状态');
        }

        // ==================== 音效控制函数 ====================
        function toggleMusic() {
            soundManager.toggleMusic();
        }

        function toggleSFX() {
            soundManager.toggleSFX();
        }

        // ==================== 肉鸽模式 ====================
        // 肉鸽模式数据
        const ROGUE_CARDS_DB = {
            // 基础牌
            'attack': { name: '攻击', cost: 1, type: 'atk', val: 6, desc: '造成 6 点伤害' },
            'defend': { name: '防御', cost: 1, type: 'skill', val: 5, desc: '获得 5 点护盾' },
            
            // 道具改编牌
            'pig_heart': { name: '杀人猪心', cost: 2, type: 'atk', val: 15, desc: '[源:1] 造成15点伤害，削弱敌人3点力量' },
            'exchange': { name: '互换', cost: 1, type: 'skill', val: 0, desc: '[源:2] 抽3张牌，敌人下回合伤害-5' },
            'white_flag': { name: '白旗', cost: 2, type: 'skill', val: 20, desc: '[源:3] 获得20点护盾，本回合免疫负面状态' },
            'green_hat': { name: '绿帽', cost: 1, type: 'power', val: 0, desc: '[源:4] 获得状态:若致死，保留1点血(限1次)' },
            'niu_niu': { name: '牛牛弹', cost: 2, type: 'atk', val: 25, desc: '[源:5] 造成25点伤害，自己受到5点伤害' },
            'poison': { name: '毒药', cost: 1, type: 'skill', val: 0, desc: '[源:6] 给予敌人 6 层中毒(每回合扣血)' },
            'antidote': { name: '解药', cost: 1, type: 'skill', val: 5, desc: '[源:7] 回复 5 点生命，抽 2 张牌' },
            'cross': { name: '十字架', cost: 0, type: 'skill', val: 0, desc: '[源:8] 从弃牌堆随机拿回2张攻击牌' },
            'provoke': { name: '引战', cost: 1, type: 'skill', val: 0, desc: '[源:9] 敌人下回合意图变为全力攻击(2倍伤)，但你获得反伤状态' },
            'bad_hand': { name: '开摆', cost: 3, type: 'power', val: 0, desc: '[源:10] 3回合内，每回合开始获得15点护盾' },
            'thunder': { name: '雷电', cost: 2, type: 'atk', val: 0, desc: '[源:15] 50%概率造成当前血量50%的伤害，50%概率造成10点伤害' },
            'ban_pass': { name: '禁止通行', cost: 2, type: 'skill', val: 0, desc: '[源:17] 敌人下回合眩晕(无法行动)' },
            'eat_feast': { name: '吃席', cost: 1, type: 'skill', val: 0, desc: '[源:23] 抽 2 张牌。若本局有击杀过，额外抽2张' },
            
            // 新卡牌
            'fireball': { name: '火球术', cost: 2, type: 'atk', val: 12, desc: '造成12点伤害，有50%概率烧伤敌人' },
            'lightning': { name: '闪电链', cost: 3, type: 'atk', val: 8, desc: '造成8点伤害，可攻击3个目标' },
            'stealth': { name: '潜行', cost: 1, type: 'skill', val: 0, desc: '获得潜行状态，下次攻击造成双倍伤害' },
            'backstab': { name: '背刺', cost: 2, type: 'atk', val: 10, desc: '对生命值高于50%的敌人造成双倍伤害' },
            'holy_light': { name: '圣光术', cost: 2, type: 'skill', val: 8, desc: '回复8点生命值，清除所有负面状态' },
            'holy_strike': { name: '神圣打击', cost: 3, type: 'atk', val: 15, desc: '造成15点伤害，对恶魔敌人造成额外伤害' },
            
            // 新增通用卡牌
            'slash': { name: '横斩', cost: 1, type: 'atk', val: 8, desc: '造成8点伤害，有25%概率造成额外伤害' },
            'shield_block': { name: '盾牌格挡', cost: 1, type: 'skill', val: 8, desc: '获得8点护盾，若本回合未受到伤害，抽1张牌' },
            'power_strike': { name: '强力攻击', cost: 2, type: 'atk', val: 12, desc: '造成12点伤害，消耗1点能量，获得1点力量' },
            'regeneration': { name: '再生', cost: 2, type: 'skill', val: 6, desc: '回复6点生命值，每回合额外回复2点，持续3回合' },
            'haste': { name: '急速', cost: 1, type: 'power', val: 0, desc: '本回合获得1点额外能量，抽1张牌' },
            'precision': { name: '精准', cost: 1, type: 'skill', val: 0, desc: '下次攻击必定暴击' },
            'vampiric_strike': { name: '吸血攻击', cost: 2, type: 'atk', val: 10, desc: '造成10点伤害，回复5点生命值' },
            'meteor_shower': { name: '流星雨', cost: 4, type: 'atk', val: 20, desc: '造成20点伤害，对所有敌人造成5点伤害' },
            
            // 新增高级通用卡牌
            'whirlwind': { name: '旋风斩', cost: 3, type: 'atk', val: 15, desc: '造成15点伤害，对所有敌人造成8点伤害' },
            'iron_will': { name: '钢铁意志', cost: 2, type: 'power', val: 0, desc: '获得5点护盾，每回合开始获得2点护盾，持续2回合' },
            'arcane_power': { name: '奥术能量', cost: 2, type: 'power', val: 0, desc: '本回合获得2点额外能量，抽2张牌' },
            'vitality_boost': { name: '活力提升', cost: 2, type: 'skill', val: 10, desc: '回复10点生命值，获得2点最大生命值' },
            'critical_strike': { name: '暴击', cost: 2, type: 'atk', val: 15, desc: '造成15点伤害，有50%概率造成双倍伤害' },
            'shield_wall': { name: '盾墙', cost: 3, type: 'skill', val: 25, desc: '获得25点护盾，本回合受到的伤害减少50%' },
            'energy_flow': { name: '能量流动', cost: 1, type: 'skill', val: 0, desc: '获得1点能量，抽1张牌，弃1张牌' },
            'death_blow': { name: '致命一击', cost: 3, type: 'atk', val: 20, desc: '对生命值低于30%的敌人造成双倍伤害' },
            
            // 新职业卡牌
            // 恶魔职业
            'demonic_power': { name: '恶魔之力', cost: 2, type: 'power', val: 0, desc: '每回合开始获得2点力量，持续3回合' },
            'soul_steal': { name: '灵魂窃取', cost: 1, type: 'atk', val: 8, desc: '造成8点伤害，若击杀敌人，回复10点生命值' },
            'demonic_blast': { name: '恶魔冲击', cost: 3, type: 'atk', val: 20, desc: '造成20点伤害，消耗所有力量，每点力量额外造成2点伤害' },
            'demonic_aura': { name: '恶魔光环', cost: 2, type: 'power', val: 0, desc: '每击杀一个敌人，获得1点力量和1点护盾' },
            'hellfire': { name: '地狱火', cost: 3, type: 'atk', val: 15, desc: '造成15点伤害，对敌人造成3层烧伤' },
            'demonic_transformation': { name: '恶魔变形', cost: 4, type: 'power', val: 0, desc: '获得5点力量，失去10点最大生命值，每回合回复3点生命值，持续3回合' },
            'soul_contract': { name: '灵魂契约', cost: 2, type: 'skill', val: 0, desc: '失去8点生命值，获得15点护盾和3点力量' },
            'infernal_gate': { name: '地狱之门', cost: 5, type: 'atk', val: 30, desc: '造成30点伤害，对所有敌人造成15点伤害，自己受到10点伤害' },
            
            // 天使职业
            'angelic_blessing': { name: '天使祝福', cost: 1, type: 'skill', val: 10, desc: '回复10点生命值，获得2点力量' },
            'holy_aura': { name: '神圣光环', cost: 2, type: 'power', val: 0, desc: '每回合开始获得5点护盾，持续2回合' },
            'smite': { name: '天谴', cost: 3, type: 'atk', val: 15, desc: '造成15点伤害，对邪恶敌人造成双倍伤害' },
            'divine_shield': { name: '神圣护盾', cost: 2, type: 'skill', val: 15, desc: '获得15点护盾，免疫所有负面状态，持续1回合' },
            'heavenly_light': { name: '天堂之光', cost: 3, type: 'skill', val: 15, desc: '回复15点生命值，清除所有负面状态，获得5点护盾' },
            'angelic_wings': { name: '天使之翼', cost: 3, type: 'power', val: 0, desc: '获得3点力量，每回合开始回复5点生命值，持续2回合' },
            'holy_wrath': { name: '神圣愤怒', cost: 4, type: 'atk', val: 25, desc: '造成25点伤害，对所有邪恶敌人造成15点伤害' },
            'divine_intervention': { name: '神圣干预', cost: 4, type: 'skill', val: 20, desc: '回复20点生命值，获得20点护盾，清除所有负面状态' },
            
            // 乐子人职业
            'troll_face': { name: '乐子人嘴脸', cost: 1, type: 'skill', val: 0, desc: '抽2张牌，敌人下回合伤害-3' },
            'mischief': { name: '恶作剧', cost: 2, type: 'skill', val: 0, desc: '敌人本回合技能失效，你获得5点护盾' },
            'chaos_bolt': { name: '混乱之箭', cost: 3, type: 'atk', val: 0, desc: '随机造成5-30点伤害' },
            'troll_king': { name: '乐子王', cost: 3, type: 'power', val: 0, desc: '每使用一张卡牌，有50%概率获得1点能量' },
            'random_mischief': { name: '随机恶作剧', cost: 1, type: 'skill', val: 0, desc: '随机触发一个效果：抽牌、获得护盾、或造成伤害' },
            'chaos_orb': { name: '混乱宝珠', cost: 2, type: 'skill', val: 0, desc: '随机触发一个强大的效果：大量伤害、大量护盾、或大量抽牌' },
            'troll_army': { name: '乐子大军', cost: 4, type: 'skill', val: 0, desc: '抽5张牌，敌人下回合伤害-10，你获得10点护盾' },
            'chaos_mastery': { name: '混乱掌握', cost: 3, type: 'power', val: 0, desc: '每使用一张卡牌，有30%概率获得1点能量，30%概率抽1张牌，30%概率获得5点护盾' },
            
            // 傻子职业
            'reckless_attack': { name: '鲁莽攻击', cost: 1, type: 'atk', val: 10, desc: '造成10点伤害，自己受到5点伤害' },
            'berserk': { name: '狂怒', cost: 2, type: 'power', val: 0, desc: '获得3点力量，失去5点最大生命值' },
            'unstoppable': { name: '不可阻挡', cost: 3, type: 'skill', val: 0, desc: '本回合免疫所有伤害，获得5点力量' },
            'bloodlust': { name: '嗜血', cost: 1, type: 'power', val: 0, desc: '每失去1点生命值，获得0.5点力量' },
            'suicide_attack': { name: '自杀攻击', cost: 3, type: 'atk', val: 30, desc: '造成30点伤害，自己受到15点伤害' },
            'rampage': { name: '暴怒', cost: 2, type: 'power', val: 0, desc: '获得4点力量，失去8点最大生命值，每回合回复2点生命值，持续2回合' },
            'last_stand': { name: '背水一战', cost: 3, type: 'atk', val: 25, desc: '造成25点伤害，自己受到10点伤害，若生命值低于20%，造成双倍伤害' },
            'berserker_rage': { name: '狂战士之怒', cost: 4, type: 'power', val: 0, desc: '获得8点力量，失去15点最大生命值，本回合免疫所有伤害' },
            
            // 恐怖分子职业
            'explosion': { name: '爆炸', cost: 2, type: 'atk', val: 18, desc: '造成18点伤害，自己受到8点伤害' },
            'suicide_bomb': { name: '自杀袭击', cost: 3, type: 'atk', val: 30, desc: '造成30点伤害，自己受到15点伤害' },
            'terror': { name: '恐惧', cost: 1, type: 'skill', val: 0, desc: '敌人下回合眩晕，你获得5点护盾' },
            'landmine': { name: '地雷', cost: 2, type: 'skill', val: 0, desc: '敌人下回合攻击时受到20点伤害，你获得10点护盾' },
            'car_bomb': { name: '汽车炸弹', cost: 4, type: 'atk', val: 40, desc: '造成40点伤害，自己受到20点伤害，对所有敌人造成15点伤害' },
            'terrorist_cell': { name: '恐怖分子细胞', cost: 3, type: 'power', val: 0, desc: '每回合结束时，敌人受到10点伤害，你受到5点伤害，持续3回合' },
            
            // 燃烧者职业
            'inferno': { name: '地狱火', cost: 2, type: 'atk', val: 12, desc: '造成12点伤害，烧伤敌人3层' },
            'fire_shield': { name: '火焰护盾', cost: 2, type: 'skill', val: 8, desc: '获得8点护盾，敌人攻击你时受到5点伤害' },
            'immolation': { name: '自焚', cost: 3, type: 'power', val: 0, desc: '每回合结束时，你受到5点伤害，敌人受到10点伤害，持续3回合' },
            'fire_storm': { name: '火焰风暴', cost: 4, type: 'atk', val: 20, desc: '造成20点伤害，对所有敌人造成10点伤害，烧伤敌人2层' },
            'flame_armor': { name: '火焰护甲', cost: 2, type: 'power', val: 0, desc: '获得10点护盾，敌人攻击你时受到8点伤害，持续2回合' },
            'incinerate': { name: '焚烧', cost: 3, type: 'atk', val: 18, desc: '造成18点伤害，对烧伤的敌人造成双倍伤害' },
            'fire_elemental': { name: '火元素', cost: 5, type: 'power', val: 0, desc: '每回合结束时，敌人受到15点伤害，你受到5点伤害，持续4回合' },
            
            // 异教主职业
            'cultist_call': { name: '教徒召唤', cost: 1, type: 'skill', val: 0, desc: '抽3张牌，若手牌超过8张，获得5点力量' },
            'dark_ritual': { name: '黑暗仪式', cost: 2, type: 'skill', val: 0, desc: '失去5点生命值，获得10点护盾和2点力量' },
            'apocalypse': { name: '启示录', cost: 4, type: 'atk', val: 25, desc: '造成25点伤害，消耗所有力量，每点力量额外造成3点伤害' },
            'dark_pact': { name: '黑暗契约', cost: 3, type: 'skill', val: 0, desc: '失去10点生命值，获得20点护盾和4点力量' },
            'cultist_sacrifice': { name: '教徒献祭', cost: 2, type: 'power', val: 0, desc: '每回合开始失去5点生命值，获得3点力量，持续3回合' },
            'eldritch_abomination': { name: ' eldritch_abomination', cost: 5, type: 'atk', val: 35, desc: '造成35点伤害，失去15点生命值，对所有敌人造成10点伤害' },
            'dark_ascension': { name: '黑暗升华', cost: 4, type: 'power', val: 0, desc: '获得5点力量，失去12点最大生命值，每回合回复4点生命值，持续3回合' }
        };

        const ROGUE_CLASSES = {
            'soldier': {
                name: '士兵',
                hp: 80,
                money: 150,
                deck: ['attack', 'attack', 'attack', 'defend', 'defend', 'pig_heart', 'niu_niu']
            },
            'alchemist': {
                name: '炼金术师',
                hp: 70,
                money: 150,
                deck: ['attack', 'defend', 'defend', 'poison', 'poison', 'antidote', 'exchange']
            },
            'merchant': {
                name: '商人',
                hp: 60,
                money: 150,
                deck: ['attack', 'defend', 'exchange', 'eat_feast', 'cross', 'thunder']
            },
            'mage': {
                name: '魔法师',
                hp: 65,
                money: 150,
                deck: ['attack', 'defend', 'thunder', 'exchange', 'ban_pass', 'white_flag', 'fireball', 'lightning']
            },
            'thief': {
                name: '盗贼',
                hp: 75,
                money: 150,
                deck: ['attack', 'attack', 'defend', 'eat_feast', 'cross', 'niu_niu', 'stealth', 'backstab']
            },
            'paladin': {
                name: '圣骑士',
                hp: 85,
                money: 150,
                deck: ['attack', 'defend', 'defend', 'defend', 'white_flag', 'cross', 'holy_light', 'holy_strike']
            },
            
            // 新职业
            'demon': {
                name: '恶魔',
                hp: 75,
                money: 150,
                deck: ['attack', 'defend', 'demonic_power', 'soul_steal', 'demonic_blast', 'green_hat']
            },
            'angel': {
                name: '天使',
                hp: 80,
                money: 150,
                deck: ['attack', 'defend', 'angelic_blessing', 'holy_aura', 'smite', 'white_flag']
            },
            'troll': {
                name: '乐子人',
                hp: 65,
                money: 150,
                deck: ['attack', 'defend', 'troll_face', 'mischief', 'chaos_bolt', 'exchange']
            },
            'fool': {
                name: '傻子',
                hp: 90,
                money: 150,
                deck: ['attack', 'defend', 'reckless_attack', 'berserk', 'unstoppable', 'niu_niu']
            },
            'terrorist': {
                name: '恐怖分子',
                hp: 70,
                money: 150,
                deck: ['attack', 'defend', 'explosion', 'suicide_bomb', 'terror', 'green_hat']
            },
            'burner': {
                name: '燃烧者',
                hp: 65,
                money: 150,
                deck: ['attack', 'defend', 'inferno', 'fire_shield', 'immolation', 'fireball']
            },
            'cultist': {
                name: '异教主',
                hp: 60,
                money: 150,
                deck: ['attack', 'defend', 'cultist_call', 'dark_ritual', 'apocalypse', 'cross']
            }
        };

        const ROGUE_ENEMIES = [
            // 基础敌人
            { name: '迷途赌徒', hp: 40, dmg: 6, pattern: ['atk', 'buff', 'atk'] },
            { name: '暴躁老哥', hp: 60, dmg: 10, pattern: ['atk', 'atk', 'strong_atk'] },
            { name: '偷牌贼', hp: 50, dmg: 5, pattern: ['atk', 'debuff', 'atk'] },
            { name: '剧毒蜘蛛', hp: 45, dmg: 8, pattern: ['atk', 'poison', 'atk'] },
            { name: '骷髅战士', hp: 70, dmg: 7, pattern: ['atk', 'defend', 'strong_atk'] },
            { name: '魔法学徒', hp: 55, dmg: 9, pattern: ['atk', 'debuff', 'buff'] },
            
            // 新普通敌人
            { name: '暗影刺客', hp: 50, dmg: 12, pattern: ['atk', 'strong_atk', 'defend'] },
            { name: '元素法师', hp: 65, dmg: 8, pattern: ['atk', 'buff', 'strong_atk'] },
            { name: '骷髅弓箭手', hp: 40, dmg: 9, pattern: ['atk', 'debuff', 'atk'] },
            { name: '恶魔仆从', hp: 80, dmg: 6, pattern: ['atk', 'buff', 'atk'] },
            { name: '天使守卫', hp: 75, dmg: 7, pattern: ['atk', 'defend', 'buff'] },
            { name: '燃烧骷髅', hp: 55, dmg: 10, pattern: ['atk', 'poison', 'strong_atk'] },
            { name: '冰冻元素', hp: 60, dmg: 8, pattern: ['atk', 'debuff', 'defend'] },
            { name: '雷元素', hp: 45, dmg: 11, pattern: ['atk', 'strong_atk', 'atk'] },
            // 新增敌人
            { name: '地狱犬', hp: 65, dmg: 10, pattern: ['atk', 'poison', 'strong_atk'] },
            { name: '石像鬼', hp: 90, dmg: 8, pattern: ['defend', 'atk', 'strong_atk'] },
            { name: '吸血鬼', hp: 70, dmg: 9, pattern: ['atk', 'buff', 'strong_atk'] },
            { name: '狼人', hp: 85, dmg: 11, pattern: ['atk', 'strong_atk', 'buff'] },
            { name: '巫师', hp: 55, dmg: 12, pattern: ['debuff', 'buff', 'strong_atk'] },
            { name: '僵尸', hp: 95, dmg: 7, pattern: ['atk', 'atk', 'defend'] },
            { name: '地精工程师', hp: 45, dmg: 8, pattern: ['debuff', 'strong_atk', 'defend'] },
            { name: '龙裔', hp: 100, dmg: 10, pattern: ['buff', 'strong_atk', 'defend'] },
            
            // 高级普通敌人
            { name: '死亡骑士', hp: 110, dmg: 12, pattern: ['atk', 'strong_atk', 'defend', 'buff'] },
            { name: '巫妖', hp: 80, dmg: 14, pattern: ['debuff', 'poison', 'strong_atk', 'buff'] },
            { name: '森林守护者', hp: 95, dmg: 10, pattern: ['defend', 'buff', 'strong_atk', 'atk'] },
            { name: '熔岩巨人', hp: 120, dmg: 13, pattern: ['atk', 'strong_atk', 'poison', 'defend'] },
            { name: '风暴元素', hp: 75, dmg: 15, pattern: ['strong_atk', 'debuff', 'atk', 'buff'] },
            { name: '暗影领主', hp: 105, dmg: 14, pattern: ['atk', 'debuff', 'strong_atk', 'defend'] },
            { name: '光明使者', hp: 90, dmg: 11, pattern: ['buff', 'defend', 'strong_atk', 'atk'] },
            { name: '混沌巨兽', hp: 115, dmg: 12, pattern: ['strong_atk', 'poison', 'debuff', 'defend'] },
            
            // Boss敌人
            { name: '绝境魔王', hp: 150, dmg: 15, pattern: ['atk', 'strong_atk', 'buff', 'strong_atk'], isBoss: true },
            { name: '黑暗领主', hp: 200, dmg: 20, pattern: ['atk', 'strong_atk', 'buff', 'poison', 'strong_atk'], isBoss: true },
            
            // 新Boss敌人
            { name: '元素领主', hp: 220, dmg: 18, pattern: ['atk', 'strong_atk', 'buff', 'poison', 'strong_atk'], isBoss: true },
            { name: '死亡之神', hp: 250, dmg: 22, pattern: ['atk', 'strong_atk', 'debuff', 'poison', 'strong_atk', 'defend'], isBoss: true },
            { name: '光明女神', hp: 230, dmg: 19, pattern: ['buff', 'defend', 'strong_atk', 'atk', 'strong_atk'], isBoss: true },
            { name: '混沌主宰', hp: 280, dmg: 25, pattern: ['strong_atk', 'debuff', 'poison', 'buff', 'strong_atk', 'defend'], isBoss: true },
            { name: '龙王', hp: 300, dmg: 28, pattern: ['buff', 'strong_atk', 'poison', 'strong_atk', 'defend', 'strong_atk'], isBoss: true },
            { name: '死亡骑士', hp: 250, dmg: 22, pattern: ['atk', 'strong_atk', 'defend', 'debuff', 'strong_atk'], isBoss: true },
            { name: '天使长', hp: 180, dmg: 16, pattern: ['atk', 'defend', 'buff', 'strong_atk'], isBoss: true },
            { name: '混沌之神', hp: 280, dmg: 25, pattern: ['atk', 'strong_atk', 'buff', 'poison', 'debuff', 'strong_atk'], isBoss: true }
        ];

        const ROGUE_ROOM_TYPES = {
            COMBAT: 'combat',
            SHOP: 'shop',
            EVENT: 'event',
            TREASURE: 'treasure',
            REST: 'rest',
            BOSS: 'boss',
            // 新增房间类型
            MINIBOSS: 'miniboss',
            SHrine: 'shrine',
            LIBRARY: 'library',
            SMITHY: 'smithy',
            ALCHEMY: 'alchemy',
            ARENA: 'arena',
            HIDDEN: 'hidden'
        };

        const ROGUE_ROOM_CONFIG = {
            [ROGUE_ROOM_TYPES.COMBAT]: {
                name: '战斗房间',
                description: '你遇到了敌人！',
                icon: '⚔️'
            },
            [ROGUE_ROOM_TYPES.SHOP]: {
                name: '商店',
                description: '你可以在这里购买物品。',
                icon: '💰'
            },
            [ROGUE_ROOM_TYPES.EVENT]: {
                name: '事件房间',
                description: '你遇到了一个神秘的事件。',
                icon: '🎲'
            },
            [ROGUE_ROOM_TYPES.TREASURE]: {
                name: '宝藏房间',
                description: '你发现了一个宝箱！',
                icon: '💎'
            },
            [ROGUE_ROOM_TYPES.REST]: {
                name: '休息房间',
                description: '你可以在这里休息恢复生命值。',
                icon: '🛏️'
            },
            [ROGUE_ROOM_TYPES.BOSS]: {
                name: 'BOSS房间',
                description: '你遇到了最终BOSS！',
                icon: '👑'
            },
            // 新增房间配置
            [ROGUE_ROOM_TYPES.MINIBOSS]: {
                name: '小BOSS房间',
                description: '你遇到了一个强大的小BOSS！',
                icon: '🐉'
            },
            [ROGUE_ROOM_TYPES.Shrine]: {
                name: '神殿',
                description: '你可以在这里获得祝福或诅咒。',
                icon: '🏛️'
            },
            [ROGUE_ROOM_TYPES.LIBRARY]: {
                name: '图书馆',
                description: '你可以在这里学习新技能或法术。',
                icon: '📚'
            },
            [ROGUE_ROOM_TYPES.SMITHY]: {
                name: '铁匠铺',
                description: '你可以在这里强化装备。',
                icon: '🔨'
            },
            [ROGUE_ROOM_TYPES.ALCHEMY]: {
                name: '炼金室',
                description: '你可以在这里制作药水或材料。',
                icon: '⚗️'
            },
            [ROGUE_ROOM_TYPES.ARENA]: {
                name: '竞技场',
                description: '你可以在这里挑战强大的对手获得奖励。',
                icon: '🏟️'
            },
            [ROGUE_ROOM_TYPES.HIDDEN]: {
                name: '隐藏房间',
                description: '你发现了一个隐藏的房间！',
                icon: '🔍'
            }
        };

        // 新增：事件系统
        const ROGUE_EVENTS = [
            {
                id: 'mysterious_stranger',
                name: '神秘陌生人',
                description: '一个神秘的陌生人出现在你面前，他似乎有话要对你说。',
                choices: [
                    {
                        text: '与他交谈',
                        outcome: '你与神秘陌生人交谈，他给了你一些金币作为礼物。',
                        effects: { gold: 50 }
                    },
                    {
                        text: '无视他',
                        outcome: '你无视了神秘陌生人，他默默地离开了。',
                        effects: {}
                    },
                    {
                        text: '攻击他',
                        outcome: '你攻击了神秘陌生人，但他消失了，只留下一些金币。',
                        effects: { gold: 30, hp: -10 }
                    }
                ]
            },
            {
                id: 'haunted_house',
                name: '闹鬼的房子',
                description: '你发现了一座闹鬼的房子，里面似乎有宝藏。',
                choices: [
                    {
                        text: '进入房子',
                        outcome: '你进入了闹鬼的房子，找到了一些宝藏，但也受到了惊吓。',
                        effects: { gold: 70, hp: -15 }
                    },
                    {
                        text: '离开',
                        outcome: '你决定不冒险，离开了闹鬼的房子。',
                        effects: {}
                    }
                ]
            },
            {
                id: 'fountain_of_wishes',
                name: '许愿喷泉',
                description: '你发现了一个许愿喷泉，据说它可以实现一个愿望。',
                choices: [
                    {
                        text: '许愿获得力量',
                        outcome: '你许愿获得力量，喷泉赐予了你一些力量。',
                        effects: { stats: { strength: 2 } }
                    },
                    {
                        text: '许愿获得财富',
                        outcome: '你许愿获得财富，喷泉赐予了你一些金币。',
                        effects: { gold: 100 }
                    },
                    {
                        text: '许愿获得健康',
                        outcome: '你许愿获得健康，喷泉回复了你的生命值。',
                        effects: { hp: 30 }
                    }
                ]
            },
            {
                id: 'crossroads',
                name: '十字路口',
                description: '你来到了一个十字路口，有三条路可以选择。',
                choices: [
                    {
                        text: '左边的路',
                        outcome: '你选择了左边的路，遇到了一些敌人，但也获得了一些经验。',
                        effects: { exp: 50, hp: -10 }
                    },
                    {
                        text: '中间的路',
                        outcome: '你选择了中间的路，发现了一些金币。',
                        effects: { gold: 60 }
                    },
                    {
                        text: '右边的路',
                        outcome: '你选择了右边的路，找到了一个休息的地方，回复了生命值。',
                        effects: { hp: 25 }
                    }
                ]
            },
            {
                id: 'abandoned_camp',
                name: '废弃的营地',
                description: '你发现了一个废弃的营地，里面似乎有一些有用的物品。',
                choices: [
                    {
                        text: '搜索营地',
                        outcome: '你搜索了废弃的营地，找到了一些金币和药水。',
                        effects: { gold: 40, hp: 15 }
                    },
                    {
                        text: '离开',
                        outcome: '你决定不冒险，离开了废弃的营地。',
                        effects: {}
                    }
                ]
            },
            {
                id: 'ancient_temple',
                name: '古代神庙',
                description: '你发现了一座古代神庙，里面可能有宝藏，但也可能有危险。',
                choices: [
                    {
                        text: '探索神庙',
                        outcome: '你探索了神庙，找到了一些珍贵的宝物，但也触发了陷阱。',
                        effects: { gold: 120, hp: -20, relic: 'artifact_of_power' }
                    },
                    {
                        text: '在神庙外祈祷',
                        outcome: '你在神庙外祈祷，获得了神灵的祝福。',
                        effects: { blessing: 'blessing_of_the_gods' }
                    },
                    {
                        text: '离开',
                        outcome: '你决定不冒险，离开了古代神庙。',
                        effects: {}
                    }
                ]
            },
            {
                id: 'merchant_caravan',
                name: '商队',
                description: '你遇到了一个商队，他们正在出售各种商品。',
                choices: [
                    {
                        text: '购买商品',
                        outcome: '你购买了一些有用的商品，花费了一些金币。',
                        effects: { gold: -50, hp: 30 }
                    },
                    {
                        text: '与商人交谈',
                        outcome: '你与商人交谈，获得了一些关于附近区域的信息。',
                        effects: { stats: { luck: 1 } }
                    },
                    {
                        text: '离开',
                        outcome: '你决定不购买任何东西，离开了商队。',
                        effects: {}
                    }
                ]
            },
            {
                id: 'wild_animal',
                name: '野生动物',
                description: '你遇到了一只野生动物，它看起来又饿又危险。',
                choices: [
                    {
                        text: '喂食动物',
                        outcome: '你喂食了动物，它变得友好并给了你一些宝藏。',
                        effects: { gold: 60, stats: { luck: 1 } }
                    },
                    {
                        text: '攻击动物',
                        outcome: '你攻击了动物，它反击并伤害了你，但你获得了一些肉。',
                        effects: { hp: -15, gold: 30 }
                    },
                    {
                        text: '避开动物',
                        outcome: '你成功避开了动物，没有发生任何事情。',
                        effects: {}
                    }
                ]
            },
            {
                id: 'magical_forest',
                name: '魔法森林',
                description: '你进入了一片魔法森林，这里的植物和动物都有着神奇的力量。',
                choices: [
                    {
                        text: '探索森林',
                        outcome: '你探索了森林，发现了一些魔法草药和宝藏。',
                        effects: { gold: 80, hp: 25, stats: { intelligence: 1 } }
                    },
                    {
                        text: '采集草药',
                        outcome: '你采集了一些魔法草药，回复了生命值。',
                        effects: { hp: 40 }
                    },
                    {
                        text: '离开森林',
                        outcome: '你决定不冒险，离开了魔法森林。',
                        effects: {}
                    }
                ]
            },
            {
                id: 'bandit_camp',
                name: '强盗营地',
                description: '你发现了一个强盗营地，里面有很多金币，但也有很多强盗。',
                choices: [
                    {
                        text: '攻击营地',
                        outcome: '你攻击了强盗营地，击败了强盗，获得了他们的财宝，但也受到了伤害。',
                        effects: { gold: 150, hp: -25 }
                    },
                    {
                        text: '偷偷进入营地',
                        outcome: '你偷偷进入了营地，拿走了一些金币，但被发现并受到了攻击。',
                        effects: { gold: 80, hp: -10 }
                    },
                    {
                        text: '离开',
                        outcome: '你决定不冒险，离开了强盗营地。',
                        effects: {}
                    }
                ]
            }
        ];

        // 新增：宝藏系统
        const ROGUE_TREASURES = [
            {
                id: 'gold_chest',
                name: '金币宝箱',
                description: '一个装满金币的宝箱。',
                effects: { gold: 100 }
            },
            {
                id: 'health_potion',
                name: '生命药水',
                description: '一瓶可以回复生命值的药水。',
                effects: { hp: 50 }
            },
            {
                id: 'strength_potion',
                name: '力量药水',
                description: '一瓶可以增加力量的药水。',
                effects: { stats: { strength: 3 } }
            },
            {
                id: 'agility_potion',
                name: '敏捷药水',
                description: '一瓶可以增加敏捷的药水。',
                effects: { stats: { agility: 3 } }
            },
            {
                id: 'intelligence_potion',
                name: '智力药水',
                description: '一瓶可以增加智力的药水。',
                effects: { stats: { intelligence: 3 } }
            },
            {
                id: 'vitality_potion',
                name: '活力药水',
                description: '一瓶可以增加活力的药水。',
                effects: { stats: { vitality: 3 } }
            },
            {
                id: 'luck_potion',
                name: '幸运药水',
                description: '一瓶可以增加幸运的药水。',
                effects: { stats: { luck: 3 } }
            },
            {
                id: 'rare_card',
                name: '稀有卡牌',
                description: '一张稀有的卡牌。',
                effects: { card: 'meteor_shower' }
            },
            {
                id: 'artifact',
                name: '神器',
                description: '一件强大的神器。',
                effects: { relic: 'artifact_of_power' }
            },
            {
                id: 'blessing',
                name: '祝福',
                description: '一个强大的祝福。',
                effects: { blessing: 'blessing_of_the_gods' }
            },
            {
                id: 'large_gold_chest',
                name: '大型金币宝箱',
                description: '一个装满大量金币的宝箱。',
                effects: { gold: 200 }
            },
            {
                id: 'elixir_of_life',
                name: '生命 elixir',
                description: '一瓶强大的生命 elixir，可以回复大量生命值。',
                effects: { hp: 100 }
            },
            {
                id: 'potion_of_all_stats',
                name: '全属性药水',
                description: '一瓶可以提升所有属性的药水。',
                effects: { stats: { strength: 1, agility: 1, intelligence: 1, vitality: 1, luck: 1 } }
            },
            {
                id: 'legendary_card',
                name: '传说卡牌',
                description: '一张传说级别的卡牌。',
                effects: { card: 'infernal_gate' }
            },
            {
                id: 'epic_artifact',
                name: '史诗神器',
                description: '一件史诗级别的神器。',
                effects: { relic: 'shield_of_protection' }
            },
            {
                id: 'greater_blessing',
                name: '高级祝福',
                description: '一个更强大的祝福。',
                effects: { blessing: 'blessing_of_strength' }
            },
            {
                id: 'treasure_map',
                name: '藏宝图',
                description: '一张藏宝图，标记着附近的宝藏位置。',
                effects: { gold: 50, stats: { luck: 2 } }
            },
            {
                id: 'ancient_scroll',
                name: '古代卷轴',
                description: '一张古代卷轴，记载着强大的法术。',
                effects: { stats: { intelligence: 4 } }
            },
            {
                id: 'holy_relic',
                name: '圣物',
                description: '一件神圣的 relic，可以提升你的所有属性。',
                effects: { stats: { strength: 2, agility: 2, intelligence: 2, vitality: 2 } }
            },
            {
                id: 'potion_of_immortality',
                name: '不朽药水',
                description: '一瓶不朽药水，可以暂时提升你的生命力。',
                effects: { hp: 80, stats: { vitality: 2 } }
            }
        ];

        // 新增：祝福系统
        const ROGUE_BLESSINGS = [
            {
                id: 'blessing_of_the_gods',
                name: '众神的祝福',
                description: '你受到了众神的祝福，所有属性都得到了提升。',
                effects: { stats: { strength: 1, agility: 1, intelligence: 1, vitality: 1, luck: 1 } }
            },
            {
                id: 'blessing_of_strength',
                name: '力量的祝福',
                description: '你受到了力量的祝福，力量得到了提升。',
                effects: { stats: { strength: 3 } }
            },
            {
                id: 'blessing_of_agility',
                name: '敏捷的祝福',
                description: '你受到了敏捷的祝福，敏捷得到了提升。',
                effects: { stats: { agility: 3 } }
            },
            {
                id: 'blessing_of_intelligence',
                name: '智力的祝福',
                description: '你受到了智力的祝福，智力得到了提升。',
                effects: { stats: { intelligence: 3 } }
            },
            {
                id: 'blessing_of_vitality',
                name: '活力的祝福',
                description: '你受到了活力的祝福，活力得到了提升。',
                effects: { stats: { vitality: 3 } }
            },
            {
                id: 'blessing_of_luck',
                name: '幸运的祝福',
                description: '你受到了幸运的祝福，幸运得到了提升。',
                effects: { stats: { luck: 3 } }
            },
            {
                id: 'blessing_of_protection',
                name: '保护的祝福',
                description: '你受到了保护的祝福，获得了额外的护盾。',
                effects: { block: 20 }
            },
            {
                id: 'blessing_of_wealth',
                name: '财富的祝福',
                description: '你受到了财富的祝福，获得了额外的金币。',
                effects: { gold: 150 }
            },
            {
                id: 'blessing_of_health',
                name: '健康的祝福',
                description: '你受到了健康的祝福，回复了生命值。',
                effects: { hp: 100 }
            },
            {
                id: 'blessing_of_power',
                name: '力量的祝福',
                description: '你受到了强大的祝福，所有攻击都将造成额外伤害。',
                effects: { stats: { strength: 2, intelligence: 2 } }
            }
        ];

        // 新增：诅咒系统
        const ROGUE_CURSES = [
            {
                id: 'curse_of_weakness',
                name: '虚弱诅咒',
                description: '你受到了虚弱诅咒，力量得到了削弱。',
                effects: { stats: { strength: -2 } }
            },
            {
                id: 'curse_of_slow',
                name: '迟缓诅咒',
                description: '你受到了迟缓诅咒，敏捷得到了削弱。',
                effects: { stats: { agility: -2 } }
            },
            {
                id: 'curse_of_stupidity',
                name: '愚蠢诅咒',
                description: '你受到了愚蠢诅咒，智力得到了削弱。',
                effects: { stats: { intelligence: -2 } }
            },
            {
                id: 'curse_of_fragility',
                name: '脆弱诅咒',
                description: '你受到了脆弱诅咒，活力得到了削弱。',
                effects: { stats: { vitality: -2 } }
            },
            {
                id: 'curse_of_bad_luck',
                name: '厄运诅咒',
                description: '你受到了厄运诅咒，幸运得到了削弱。',
                effects: { stats: { luck: -2 } }
            },
            {
                id: 'curse_of_poverty',
                name: '贫穷诅咒',
                description: '你受到了贫穷诅咒，失去了一些金币。',
                effects: { gold: -50 }
            },
            {
                id: 'curse_of_pain',
                name: '痛苦诅咒',
                description: '你受到了痛苦诅咒，生命值得到了削弱。',
                effects: { hp: -20 }
            },
            {
                id: 'curse_of_general_weakness',
                name: '全面虚弱诅咒',
                description: '你受到了全面虚弱诅咒，所有属性都得到了削弱。',
                effects: { stats: { strength: -1, agility: -1, intelligence: -1, vitality: -1, luck: -1 } }
            },
            {
                id: 'curse_of_darkness',
                name: '黑暗诅咒',
                description: '你受到了黑暗诅咒，视野受到了限制。',
                effects: { stats: { luck: -3 } }
            },
            {
                id: 'curse_of_death',
                name: '死亡诅咒',
                description: '你受到了死亡诅咒，生命值和活力都得到了削弱。',
                effects: { hp: -30, stats: { vitality: -2 } }
            }
        ];

        // 新增：遗物系统
        const ROGUE_RELICS = [
            {
                id: 'artifact_of_power',
                name: '力量 artifact',
                description: '一件强大的 artifact，可以增加你的力量。',
                effects: { stats: { strength: 5 } }
            },
            {
                id: 'shield_of_protection',
                name: '保护之盾',
                description: '一面强大的盾牌，可以增加你的防御力。',
                effects: { block: 10 }
            },
            {
                id: 'ring_of_wealth',
                name: '财富之戒',
                description: '一枚可以增加你获得金币的戒指。',
                effects: { goldMultiplier: 1.5 }
            },
            {
                id: 'amulet_of_health',
                name: '健康护身符',
                description: '一个可以增加你生命值的护身符。',
                effects: { maxHp: 20 }
            },
            {
                id: 'staff_of_magic',
                name: '魔法法杖',
                description: '一根可以增加你魔法能力的法杖。',
                effects: { stats: { intelligence: 5 } }
            },
            {
                id: 'boots_of_speed',
                name: '速度之靴',
                description: '一双可以增加你敏捷的靴子。',
                effects: { stats: { agility: 5 } }
            },
            {
                id: 'cloak_of_shadows',
                name: '暗影披风',
                description: '一件可以增加你闪避能力的披风。',
                effects: { stats: { luck: 3 } }
            },
            {
                id: 'helmet_of_wisdom',
                name: '智慧头盔',
                description: '一顶可以增加你智慧的头盔。',
                effects: { stats: { wisdom: 4 } }
            },
            {
                id: 'belt_of_endurance',
                name: '耐力腰带',
                description: '一条可以增加你耐力的腰带。',
                effects: { stats: { endurance: 4 } }
            },
            {
                id: 'gloves_of_strength',
                name: '力量手套',
                description: '一副可以增加你力量的手套。',
                effects: { stats: { strength: 4 } }
            },
            {
                id: 'ring_of_intelligence',
                name: '智力之戒',
                description: '一枚可以增加你智力的戒指。',
                effects: { stats: { intelligence: 4 } }
            },
            {
                id: 'amulet_of_vitality',
                name: '活力护身符',
                description: '一个可以增加你活力的护身符。',
                effects: { stats: { vitality: 4 } }
            }
        ];

        let rogueGameSettings = {
            soundVolume: 80,
            musicVolume: 60,
            difficulty: 'normal',
            gameSpeed: 'normal'
        };

        let rogueState = {
            player: {
                class: null,
                maxHp: 100,
                hp: 100,
                energy: 3,
                maxEnergy: 3,
                block: 0,
                gold: 0,
                keys: 0,
                deck: [],
                hand: [],
                discard: [],
                drawPile: [],
                buffs: {},
                debuffs: {},
                kills: 0,
                // 新增：遗物系统
                relics: [],
                // 新增：祝福系统
                blessings: [],
                // 新增：诅咒系统
                curses: [],
                // 新增：属性系统
                stats: {
                    strength: 0, // 力量：增加攻击力
                    agility: 0, // 敏捷：增加闪避和暴击
                    intelligence: 0, // 智力：增加技能效果
                    vitality: 0, // 活力：增加最大生命值
                    luck: 0, // 幸运：增加掉落和事件成功率
                    wisdom: 0, // 智慧：增加经验获取和技能冷却减少
                    endurance: 0, // 耐力：增加能量上限和恢复速度
                    charisma: 0, // 魅力：增加声望获取和交易折扣
                    // 新增属性
                    perception: 0, // 感知：增加发现隐藏房间和秘密
                    willpower: 0, // 意志力：减少负面效果持续时间
                    creativity: 0, // 创造力：增加卡牌效果多样性
                    discipline: 0 // 纪律：减少技能冷却时间
                },
                // 新增：专精系统
                specializations: {
                    combat: 0, // 战斗专精
                    magic: 0, // 魔法专精
                    stealth: 0, //  stealth专精
                    survival: 0, // 生存专精
                    // 新增专精
                    crafting: 0, //  crafting专精
                    exploration: 0, // 探索专精
                    social: 0 // 社交专精
                },
                // 新增：天赋树
                talents: {
                    combat: [], // 战斗天赋
                    magic: [], // 魔法天赋
                    utility: [], // 通用天赋
                    // 新增天赋分支
                    survival: [], // 生存天赋
                    exploration: [] // 探索天赋
                },
                // 新增：成就系统
                achievements: [],
                // 新增：声望系统
                reputation: {
                    merchants: 0, // 商人声望
                    church: 0, // 教会声望
                    underworld: 0, //  underworld声望
                    guild: 0, //  guild声望
                    academia: 0, // 学术声望
                    // 新增声望派系
                    adventurers: 0, // 冒险者公会声望
                    craftsmen: 0, // 工匠协会声望
                    nomads: 0 // 游牧民族声望
                },
                // 新增：装备系统
                equipment: {
                    weapon: null, // 武器
                    armor: null, //  armor
                    accessory1: null, // 饰品1
                    accessory2: null, // 饰品2
                    artifact: null, // 神器
                    // 新增装备槽
                    ring1: null, // 戒指1
                    ring2: null, // 戒指2
                    necklace: null // 项链
                },
                // 新增：装备强化系统
                equipmentEnhancement: {
                    weaponLevel: 0,
                    armorLevel: 0,
                    accessory1Level: 0,
                    accessory2Level: 0,
                    artifactLevel: 0
                },
                // 新增：技能系统
                skills: [],
                skillLevels: {}, // 技能等级
                // 新增：任务系统
                quests: [],
                activeQuests: [],
                completedQuests: [],
                // 新增：挑战系统
                challenges: [],
                // 新增：经验和等级系统
                experience: 0,
                level: 1,
                skillPoints: 0,
                // 新增：收藏系统
                collection: {
                    cards: [],
                    relics: [],
                    equipment: [],
                    // 新增收藏类别
                    artifacts: [],
                    recipes: [],
                    cosmetic: []
                },
                // 新增：声望奖励系统
                reputationRewards: {
                    merchants: [],
                    church: [],
                    underworld: [],
                    guild: [],
                    academia: [],
                    adventurers: [],
                    craftsmen: [],
                    nomads: []
                },
                // 新增：专精奖励系统
                specializationRewards: {
                    combat: [],
                    magic: [],
                    stealth: [],
                    survival: [],
                    crafting: [],
                    exploration: [],
                    social: []
                },
                // 新增：成就奖励系统
                achievementRewards: [],
                // 新增：幸运值系统
                luckBonus: 0,
                // 新增：经验倍率系统
                expMultiplier: 1.0,
                // 新增：金币倍率系统
                goldMultiplier: 1.0,
                // 新增：声望倍率系统
                reputationMultiplier: 1.0
            },
            enemy: null,
            floor: 1,
            turn: 1,
            log: [],
            rooms: [],
            currentRoom: null,
            selectedRoomIndex: -1,
            gameStarted: false,
            // 新增：全局游戏状态
            gameStats: {
                totalKills: 0,
                totalGold: 0,
                totalDamage: 0,
                totalHealing: 0,
                maxFloorReached: 0,
                totalQuestsCompleted: 0,
                totalRelicsFound: 0,
                totalCardsCollected: 0,
                // 新增统计
                totalEquipmentEnhanced: 0,
                totalSkillsUpgraded: 0,
                totalAchievementsUnlocked: 0,
                totalSecretsFound: 0,
                totalBossesDefeated: 0,
                totalChallengesCompleted: 0
            },
            // 新增：游戏难度和挑战模式
            difficulty: 'normal',
            challengeMode: false,
            activeChallenges: [],
            // 新增：进度系统
            progress: {
                floorsCleared: 0,
                bossesDefeated: 0,
                secretsDiscovered: 0,
                // 新增进度
                achievementsUnlocked: 0,
                collectionsCompleted: 0,
                reputationsMaxed: 0
            },
            // 新增：装备强化系统
            enhancementSystem: {
                materials: {
                    iron: 0,
                    crystal: 0,
                    essence: 0,
                    rareMetal: 0,
                    mythicShard: 0
                },
                recipes: []
            },
            // 新增：技能系统
            skillSystem: {
                skillPoints: 0,
                skillTree: {
                    combat: [],
                    magic: [],
                    utility: []
                }
            },
            // 新增：声望系统
            factionSystem: {
                factions: {
                    merchants: {
                        name: "商人协会",
                        level: 0,
                        maxLevel: 10,
                        rewards: []
                    },
                    church: {
                        name: "圣光教会",
                        level: 0,
                        maxLevel: 10,
                        rewards: []
                    },
                    underworld: {
                        name: "地下组织",
                        level: 0,
                        maxLevel: 10,
                        rewards: []
                    },
                    guild: {
                        name: "冒险者公会",
                        level: 0,
                        maxLevel: 10,
                        rewards: []
                    },
                    academia: {
                        name: "学术学院",
                        level: 0,
                        maxLevel: 10,
                        rewards: []
                    }
                }
            }
        };

        function rogueLog(msg) {
            const logEl = document.getElementById('rogue-game-log');
            if (!logEl) return;
            
            const p = document.createElement('div');
            p.className = 'log-entry';
            p.innerText = `> ${msg}`;
            logEl.prepend(p);
            if(logEl.children.length > 10) logEl.lastChild.remove();
        }

        function rogueRandInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        function startRogueGame(className) {
            const cls = ROGUE_CLASSES[className];
            rogueState.player.class = className;
            rogueState.player.maxHp = cls.hp;
            rogueState.player.hp = cls.hp;
            rogueState.player.gold = cls.money;
            rogueState.player.keys = 0;
            rogueState.player.deck = [...cls.deck];
            rogueState.player.kills = 0;
            // 初始化新系统
            rogueState.player.relics = [];
            rogueState.player.blessings = [];
            rogueState.player.curses = [];
            rogueState.player.stats = {
                strength: 0,
                agility: 0,
                intelligence: 0,
                vitality: 0,
                luck: 0,
                wisdom: 0,
                endurance: 0,
                charisma: 0,
                perception: 0,
                willpower: 0,
                creativity: 0,
                discipline: 0
            };
            rogueState.player.specializations = {
                combat: 0,
                magic: 0,
                stealth: 0,
                survival: 0,
                crafting: 0,
                exploration: 0,
                social: 0
            };
            rogueState.player.talents = {
                combat: [],
                magic: [],
                utility: [],
                survival: [],
                exploration: []
            };
            rogueState.player.achievements = [];
            rogueState.player.reputation = {
                merchants: 0,
                church: 0,
                underworld: 0,
                guild: 0,
                academia: 0,
                adventurers: 0,
                craftsmen: 0,
                nomads: 0
            };
            rogueState.player.equipment = {
                weapon: null,
                armor: null,
                accessory1: null,
                accessory2: null,
                artifact: null,
                ring1: null,
                ring2: null,
                necklace: null
            };
            rogueState.player.equipmentEnhancement = {
                weaponLevel: 0,
                armorLevel: 0,
                accessory1Level: 0,
                accessory2Level: 0,
                artifactLevel: 0
            };
            rogueState.player.skills = [];
            rogueState.player.skillLevels = {};
            rogueState.player.quests = [];
            rogueState.player.activeQuests = [];
            rogueState.player.completedQuests = [];
            rogueState.player.challenges = [];
            rogueState.player.experience = 0;
            rogueState.player.level = 1;
            rogueState.player.skillPoints = 0;
            rogueState.player.collection = {
                cards: [],
                relics: [],
                equipment: [],
                artifacts: [],
                recipes: [],
                cosmetic: []
            };
            rogueState.player.reputationRewards = {
                merchants: [],
                church: [],
                underworld: [],
                guild: [],
                academia: [],
                adventurers: [],
                craftsmen: [],
                nomads: []
            };
            rogueState.player.specializationRewards = {
                combat: [],
                magic: [],
                stealth: [],
                survival: [],
                crafting: [],
                exploration: [],
                social: []
            };
            rogueState.player.achievementRewards = [];
            rogueState.player.luckBonus = 0;
            rogueState.player.expMultiplier = 1.0;
            rogueState.player.goldMultiplier = 1.0;
            rogueState.player.reputationMultiplier = 1.0;
            
            rogueState.floor = 1;
            rogueState.turn = 1;
            rogueState.gameStarted = true;
            
            // 初始化游戏统计
            rogueState.gameStats = {
                totalKills: 0,
                totalGold: 0,
                totalDamage: 0,
                totalHealing: 0,
                maxFloorReached: 0,
                totalQuestsCompleted: 0,
                totalRelicsFound: 0,
                totalCardsCollected: 0,
                totalEquipmentEnhanced: 0,
                totalSkillsUpgraded: 0,
                totalAchievementsUnlocked: 0,
                totalSecretsFound: 0,
                totalBossesDefeated: 0,
                totalChallengesCompleted: 0
            };
            
            // 初始化游戏难度和挑战
            rogueState.difficulty = 'normal';
            rogueState.challengeMode = false;
            rogueState.activeChallenges = [];
            rogueState.progress = {
                floorsCleared: 0,
                bossesDefeated: 0,
                secretsDiscovered: 0,
                achievementsUnlocked: 0,
                collectionsCompleted: 0,
                reputationsMaxed: 0
            };
            
            // 初始化装备强化系统
            rogueState.enhancementSystem = {
                materials: {
                    iron: 0,
                    crystal: 0,
                    essence: 0,
                    rareMetal: 0,
                    mythicShard: 0
                },
                recipes: []
            };
            
            // 初始化技能系统
            rogueState.skillSystem = {
                skillPoints: 0,
                skillTree: {
                    combat: [],
                    magic: [],
                    utility: []
                }
            };
            
            // 初始化声望系统
            rogueState.factionSystem = {
                factions: {
                    merchants: {
                        name: "商人协会",
                        level: 0,
                        maxLevel: 10,
                        rewards: []
                    },
                    church: {
                        name: "圣光教会",
                        level: 0,
                        maxLevel: 10,
                        rewards: []
                    },
                    underworld: {
                        name: "地下组织",
                        level: 0,
                        maxLevel: 10,
                        rewards: []
                    },
                    guild: {
                        name: "冒险者公会",
                        level: 0,
                        maxLevel: 10,
                        rewards: []
                    },
                    academia: {
                        name: "学术学院",
                        level: 0,
                        maxLevel: 10,
                        rewards: []
                    }
                }
            };

            // 根据职业给予初始遗物和祝福
            giveClassStartingBonus(className);
            
            // 生成第一层的房间
            rogueGenerateRooms();
            
            // 显示地图界面
            rogueShowMap();
        }
        
        // 经验和等级系统
        function gainExperience(amount) {
            const baseAmount = amount;
            const wisdomBonus = Math.floor(amount * (rogueState.player.stats.wisdom * 0.1));
            const totalExp = baseAmount + wisdomBonus;
            
            rogueState.player.experience += totalExp;
            rogueLog(`获得 ${totalExp} 经验值（智慧加成: +${wisdomBonus}）`);
            
            checkLevelUp();
        }
        
        function checkLevelUp() {
            const requiredExp = calculateRequiredExp(rogueState.player.level);
            
            if (rogueState.player.experience >= requiredExp) {
                rogueState.player.experience -= requiredExp;
                rogueState.player.level++;
                rogueState.player.skillPoints++;
                
                // 每级提升基础属性
                rogueState.player.stats.strength += 1;
                rogueState.player.stats.agility += 1;
                rogueState.player.stats.intelligence += 1;
                rogueState.player.stats.vitality += 1;
                rogueState.player.stats.luck += 0.5;
                
                // 每5级提升能量上限
                if (rogueState.player.level % 5 === 0) {
                    rogueState.player.maxEnergy++;
                    rogueLog(`能量上限提升至 ${rogueState.player.maxEnergy}`);
                }
                
                // 每3级提升生命值
                if (rogueState.player.level % 3 === 0) {
                    const hpIncrease = Math.floor(rogueState.player.stats.vitality * 2);
                    rogueState.player.maxHp += hpIncrease;
                    rogueState.player.hp += hpIncrease;
                    rogueLog(`生命值上限提升 ${hpIncrease} 点`);
                }
                
                soundManager.playButtonSound('levelup');
                rogueLog(`升级了！现在是 ${rogueState.player.level} 级，获得 1 点技能点`);
                showLevelUpModal();
                
                // 递归检查是否可以连续升级
                checkLevelUp();
            }
        }
        
        function calculateRequiredExp(level) {
            return Math.floor(100 * Math.pow(1.5, level - 1));
        }
        
        function showLevelUpModal() {
            // 这里可以添加升级弹窗逻辑
            rogueLog('升级了！可以在技能界面分配技能点');
        }
        
        // 天赋系统
        function learnTalent(talentType, talentName) {
            if (rogueState.player.skillPoints <= 0) {
                rogueLog('技能点不足');
                return false;
            }
            
            const talent = getTalentByTypeAndName(talentType, talentName);
            if (!talent) {
                rogueLog('天赋不存在');
                return false;
            }
            
            // 检查天赋前置条件
            if (!checkTalentPrerequisites(talent)) {
                rogueLog('天赋前置条件未满足');
                return false;
            }
            
            rogueState.player.talents[talentType].push(talent);
            rogueState.player.skillPoints--;
            
            // 应用天赋效果
            applyTalentEffect(talent);
            
            rogueLog(`学习了天赋：${talent.name}`);
            return true;
        }
        
        // 天赋定义
        const TALENTS = {
            combat: [
                {
                    name: '基础攻击训练',
                    description: '攻击力 +5',
                    prerequisites: [],
                    effects: [
                        { type: 'stat', stat: 'strength', value: 2 }
                    ]
                },
                {
                    name: '战斗专精',
                    description: '所有攻击伤害 +10%',
                    prerequisites: ['基础攻击训练'],
                    effects: [
                        { type: 'damage_bonus', value: 0.1 }
                    ]
                },
                {
                    name: '暴击精通',
                    description: '暴击率 +5%',
                    prerequisites: ['战斗专精'],
                    effects: [
                        { type: 'crit_chance', value: 0.05 }
                    ]
                },
                {
                    name: '致命打击',
                    description: '暴击伤害 +20%',
                    prerequisites: ['暴击精通'],
                    effects: [
                        { type: 'crit_damage', value: 0.2 }
                    ]
                },
                {
                    name: '战斗本能',
                    description: '每回合开始获得1点额外能量',
                    prerequisites: ['致命打击'],
                    effects: [
                        { type: 'energy_per_turn', value: 1 }
                    ]
                }
            ],
            magic: [
                {
                    name: '魔力掌控',
                    description: '智力 +2，最大能量 +1',
                    prerequisites: [],
                    effects: [
                        { type: 'stat', stat: 'intelligence', value: 2 },
                        { type: 'max_energy', value: 1 }
                    ]
                },
                {
                    name: '法术专精',
                    description: '所有技能效果 +15%',
                    prerequisites: ['魔力掌控'],
                    effects: [
                        { type: 'skill_bonus', value: 0.15 }
                    ]
                },
                {
                    name: '元素精通',
                    description: '元素伤害 +20%',
                    prerequisites: ['法术专精'],
                    effects: [
                        { type: 'elemental_damage', value: 0.2 }
                    ]
                },
                {
                    name: '魔力回复',
                    description: '每回合额外回复1点能量',
                    prerequisites: ['元素精通'],
                    effects: [
                        { type: 'energy_regen', value: 1 }
                    ]
                },
                {
                    name: '奥术大师',
                    description: '所有法术消耗减少1点能量',
                    prerequisites: ['魔力回复'],
                    effects: [
                        { type: 'spell_cost_reduction', value: 1 }
                    ]
                }
            ],
            utility: [
                {
                    name: '幸运祝福',
                    description: '幸运 +2',
                    prerequisites: [],
                    effects: [
                        { type: 'stat', stat: 'luck', value: 2 }
                    ]
                },
                {
                    name: '智慧之光',
                    description: '智慧 +2，经验获取 +10%',
                    prerequisites: ['幸运祝福'],
                    effects: [
                        { type: 'stat', stat: 'wisdom', value: 2 },
                        { type: 'exp_bonus', value: 0.1 }
                    ]
                },
                {
                    name: '耐力训练',
                    description: '耐力 +2，最大生命值 +10',
                    prerequisites: ['智慧之光'],
                    effects: [
                        { type: 'stat', stat: 'endurance', value: 2 },
                        { type: 'max_hp', value: 10 }
                    ]
                },
                {
                    name: '魅力提升',
                    description: '魅力 +2，声望获取 +15%',
                    prerequisites: ['耐力训练'],
                    effects: [
                        { type: 'stat', stat: 'charisma', value: 2 },
                        { type: 'reputation_bonus', value: 0.15 }
                    ]
                },
                {
                    name: '全能大师',
                    description: '所有属性 +1，所有专精 +5',
                    prerequisites: ['魅力提升'],
                    effects: [
                        { type: 'all_stats', value: 1 },
                        { type: 'all_specializations', value: 5 }
                    ]
                }
            ]
        };
        
        function getTalentByTypeAndName(type, name) {
            return TALENTS[type]?.find(talent => talent.name === name) || null;
        }
        
        function checkTalentPrerequisites(talent) {
            // 检查天赋前置条件
            if (!talent.prerequisites || talent.prerequisites.length === 0) {
                return true;
            }
            
            const learnedTalents = rogueState.player.talents[talent.type].map(t => t.name);
            return talent.prerequisites.every(prereq => learnedTalents.includes(prereq));
        }
        
        function applyTalentEffect(talent) {
            // 应用天赋效果
            talent.effects.forEach(effect => {
                switch(effect.type) {
                    case 'stat':
                        rogueState.player.stats[effect.stat] += effect.value;
                        rogueLog(`${talent.name}：${effect.stat} +${effect.value}`);
                        break;
                    case 'max_energy':
                        rogueState.player.maxEnergy += effect.value;
                        rogueLog(`${talent.name}：能量上限 +${effect.value}`);
                        break;
                    case 'max_hp':
                        rogueState.player.maxHp += effect.value;
                        rogueState.player.hp += effect.value;
                        rogueLog(`${talent.name}：最大生命值 +${effect.value}`);
                        break;
                    case 'damage_bonus':
                        // 这里可以添加伤害加成的全局效果
                        rogueLog(`${talent.name}：所有攻击伤害 +${effect.value * 100}%`);
                        break;
                    case 'skill_bonus':
                        // 这里可以添加技能效果加成的全局效果
                        rogueLog(`${talent.name}：所有技能效果 +${effect.value * 100}%`);
                        break;
                    case 'elemental_damage':
                        // 这里可以添加元素伤害加成的全局效果
                        rogueLog(`${talent.name}：元素伤害 +${effect.value * 100}%`);
                        break;
                    case 'crit_chance':
                        // 这里可以添加暴击率加成的全局效果
                        rogueLog(`${talent.name}：暴击率 +${effect.value * 100}%`);
                        break;
                    case 'crit_damage':
                        // 这里可以添加暴击伤害加成的全局效果
                        rogueLog(`${talent.name}：暴击伤害 +${effect.value * 100}%`);
                        break;
                    case 'energy_per_turn':
                        // 这里可以添加每回合能量加成的全局效果
                        rogueLog(`${talent.name}：每回合开始获得 ${effect.value} 点额外能量`);
                        break;
                    case 'energy_regen':
                        // 这里可以添加能量回复加成的全局效果
                        rogueLog(`${talent.name}：每回合额外回复 ${effect.value} 点能量`);
                        break;
                    case 'spell_cost_reduction':
                        // 这里可以添加法术消耗减少的全局效果
                        rogueLog(`${talent.name}：所有法术消耗减少 ${effect.value} 点能量`);
                        break;
                    case 'exp_bonus':
                        // 这里可以添加经验获取加成的全局效果
                        rogueLog(`${talent.name}：经验获取 +${effect.value * 100}%`);
                        break;
                    case 'reputation_bonus':
                        // 这里可以添加声望获取加成的全局效果
                        rogueLog(`${talent.name}：声望获取 +${effect.value * 100}%`);
                        break;
                    case 'all_stats':
                        Object.keys(rogueState.player.stats).forEach(stat => {
                            rogueState.player.stats[stat] += effect.value;
                        });
                        rogueLog(`${talent.name}：所有属性 +${effect.value}`);
                        break;
                    case 'all_specializations':
                        Object.keys(rogueState.player.specializations).forEach(spec => {
                            rogueState.player.specializations[spec] += effect.value;
                        });
                        rogueLog(`${talent.name}：所有专精 +${effect.value}`);
                        break;
                }
            });
        }
        
        // 专精系统
        function gainSpecialization(specialization, amount) {
            rogueState.player.specializations[specialization] += amount;
            rogueLog(`获得 ${amount} 点 ${getSpecializationName(specialization)} 专精`);
        }
        
        function getSpecializationName(specialization) {
            const names = {
                combat: '战斗',
                magic: '魔法',
                stealth: ' stealth',
                survival: '生存'
            };
            return names[specialization] || specialization;
        }
        
        // 检查专精等级奖励
        function checkSpecializationRewards(specialization) {
            const level = rogueState.player.specializations[specialization];
            const thresholds = [10, 25, 50, 75, 100];
            
            for (const threshold of thresholds) {
                if (level >= threshold && !hasReceivedSpecializationReward(specialization, threshold)) {
                    grantSpecializationReward(specialization, threshold);
                }
            }
        }
        
        function hasReceivedSpecializationReward(specialization, threshold) {
            // 检查是否已经获得过该专精等级的奖励
            // 这里可以添加存储逻辑
            return false;
        }
        
        // 应用诅咒效果
        function applyCurseEffect(curse) {
            if (!curse.effect) return;
            
            switch(curse.effect.type) {
                case 'max_energy_reduction':
                    rogueState.player.maxEnergy = Math.max(1, rogueState.player.maxEnergy - curse.effect.value);
                    break;
                case 'max_hp_reduction':
                    rogueState.player.maxHp -= curse.effect.value;
                    rogueState.player.hp = Math.min(rogueState.player.hp, rogueState.player.maxHp);
                    break;
                case 'all_stats_reduction':
                    Object.keys(rogueState.player.stats).forEach(stat => {
                        rogueState.player.stats[stat] = Math.max(0, rogueState.player.stats[stat] - curse.effect.value);
                    });
                    break;
                // 其他诅咒效果可以在这里添加
            }
        }
        
        function grantSpecializationReward(specialization, threshold) {
            switch(specialization) {
                case 'combat':
                    switch(threshold) {
                        case 10:
                            rogueState.player.relics.push({ id: 'combat_10', name: '战斗新手', description: '力量 +1，攻击力 +5%' });
                            rogueState.player.stats.strength += 1;
                            rogueLog('战斗专精达到10级：获得战斗新手称号，力量 +1');
                            break;
                        case 25:
                            rogueState.player.relics.push({ id: 'combat_25', name: '战斗老手', description: '力量 +2，攻击力 +10%' });
                            rogueState.player.stats.strength += 2;
                            rogueLog('战斗专精达到25级：获得战斗老手称号，力量 +2');
                            break;
                        case 50:
                            rogueState.player.relics.push({ id: 'combat_50', name: '战斗大师', description: '力量 +3，攻击力 +15%，暴击率 +5%' });
                            rogueState.player.stats.strength += 3;
                            rogueLog('战斗专精达到50级：获得战斗大师称号，力量 +3');
                            break;
                        case 75:
                            rogueState.player.relics.push({ id: 'combat_75', name: '战斗宗师', description: '力量 +4，攻击力 +20%，暴击率 +10%' });
                            rogueState.player.stats.strength += 4;
                            rogueLog('战斗专精达到75级：获得战斗宗师称号，力量 +4');
                            break;
                        case 100:
                            rogueState.player.relics.push({ id: 'combat_100', name: '战斗之神', description: '力量 +5，攻击力 +25%，暴击率 +15%，暴击伤害 +20%' });
                            rogueState.player.stats.strength += 5;
                            rogueLog('战斗专精达到100级：获得战斗之神称号，力量 +5');
                            break;
                    }
                    break;
                case 'magic':
                    switch(threshold) {
                        case 10:
                            rogueState.player.relics.push({ id: 'magic_10', name: '魔法学徒', description: '智力 +1，技能效果 +5%' });
                            rogueState.player.stats.intelligence += 1;
                            rogueLog('魔法专精达到10级：获得魔法学徒称号，智力 +1');
                            break;
                        case 25:
                            rogueState.player.relics.push({ id: 'magic_25', name: '魔法师', description: '智力 +2，技能效果 +10%' });
                            rogueState.player.stats.intelligence += 2;
                            rogueLog('魔法专精达到25级：获得魔法师称号，智力 +2');
                            break;
                        case 50:
                            rogueState.player.relics.push({ id: 'magic_50', name: '魔法大师', description: '智力 +3，技能效果 +15%，能量上限 +1' });
                            rogueState.player.stats.intelligence += 3;
                            rogueState.player.maxEnergy += 1;
                            rogueLog('魔法专精达到50级：获得魔法大师称号，智力 +3，能量上限 +1');
                            break;
                        case 75:
                            rogueState.player.relics.push({ id: 'magic_75', name: '魔法宗师', description: '智力 +4，技能效果 +20%，能量上限 +1' });
                            rogueState.player.stats.intelligence += 4;
                            rogueState.player.maxEnergy += 1;
                            rogueLog('魔法专精达到75级：获得魔法宗师称号，智力 +4，能量上限 +1');
                            break;
                        case 100:
                            rogueState.player.relics.push({ id: 'magic_100', name: '魔法之神', description: '智力 +5，技能效果 +25%，能量上限 +2，法术消耗 -1' });
                            rogueState.player.stats.intelligence += 5;
                            rogueState.player.maxEnergy += 2;
                            rogueLog('魔法专精达到100级：获得魔法之神称号，智力 +5，能量上限 +2');
                            break;
                    }
                    break;
                case 'stealth':
                    switch(threshold) {
                        case 10:
                            rogueState.player.relics.push({ id: 'stealth_10', name: '潜行新手', description: '敏捷 +1，暴击率 +3%' });
                            rogueState.player.stats.agility += 1;
                            rogueLog(' stealth专精达到10级：获得潜行新手称号，敏捷 +1');
                            break;
                        case 25:
                            rogueState.player.relics.push({ id: 'stealth_25', name: '潜行专家', description: '敏捷 +2，暴击率 +6%' });
                            rogueState.player.stats.agility += 2;
                            rogueLog(' stealth专精达到25级：获得潜行专家称号，敏捷 +2');
                            break;
                        case 50:
                            rogueState.player.relics.push({ id: 'stealth_50', name: '潜行大师', description: '敏捷 +3，暴击率 +9%，闪避率 +5%' });
                            rogueState.player.stats.agility += 3;
                            rogueLog(' stealth专精达到50级：获得潜行大师称号，敏捷 +3');
                            break;
                        case 75:
                            rogueState.player.relics.push({ id: 'stealth_75', name: '潜行宗师', description: '敏捷 +4，暴击率 +12%，闪避率 +10%' });
                            rogueState.player.stats.agility += 4;
                            rogueLog(' stealth专精达到75级：获得潜行宗师称号，敏捷 +4');
                            break;
                        case 100:
                            rogueState.player.relics.push({ id: 'stealth_100', name: '暗影之神', description: '敏捷 +5，暴击率 +15%，闪避率 +15%，暴击伤害 +15%' });
                            rogueState.player.stats.agility += 5;
                            rogueLog(' stealth专精达到100级：获得暗影之神称号，敏捷 +5');
                            break;
                    }
                    break;
                case 'survival':
                    switch(threshold) {
                        case 10:
                            rogueState.player.relics.push({ id: 'survival_10', name: '生存新手', description: '活力 +1，最大生命值 +5' });
                            rogueState.player.stats.vitality += 1;
                            rogueState.player.maxHp += 5;
                            rogueState.player.hp += 5;
                            rogueLog('生存专精达到10级：获得生存新手称号，活力 +1，最大生命值 +5');
                            break;
                        case 25:
                            rogueState.player.relics.push({ id: 'survival_25', name: '生存专家', description: '活力 +2，最大生命值 +10' });
                            rogueState.player.stats.vitality += 2;
                            rogueState.player.maxHp += 10;
                            rogueState.player.hp += 10;
                            rogueLog('生存专精达到25级：获得生存专家称号，活力 +2，最大生命值 +10');
                            break;
                        case 50:
                            rogueState.player.relics.push({ id: 'survival_50', name: '生存大师', description: '活力 +3，最大生命值 +15，耐力 +2' });
                            rogueState.player.stats.vitality += 3;
                            rogueState.player.stats.endurance += 2;
                            rogueState.player.maxHp += 15;
                            rogueState.player.hp += 15;
                            rogueLog('生存专精达到50级：获得生存大师称号，活力 +3，耐力 +2，最大生命值 +15');
                            break;
                        case 75:
                            rogueState.player.relics.push({ id: 'survival_75', name: '生存宗师', description: '活力 +4，最大生命值 +20，耐力 +3' });
                            rogueState.player.stats.vitality += 4;
                            rogueState.player.stats.endurance += 3;
                            rogueState.player.maxHp += 20;
                            rogueState.player.hp += 20;
                            rogueLog('生存专精达到75级：获得生存宗师称号，活力 +4，耐力 +3，最大生命值 +20');
                            break;
                        case 100:
                            rogueState.player.relics.push({ id: 'survival_100', name: '生命之神', description: '活力 +5，最大生命值 +25，耐力 +4，所有伤害减免 +10%' });
                            rogueState.player.stats.vitality += 5;
                            rogueState.player.stats.endurance += 4;
                            rogueState.player.maxHp += 25;
                            rogueState.player.hp += 25;
                            rogueLog('生存专精达到100级：获得生命之神称号，活力 +5，耐力 +4，最大生命值 +25');
                            break;
                    }
                    break;
            }
        }
        
        // 声望系统
        function gainReputation(faction, amount) {
            rogueState.player.reputation[faction] += amount;
            rogueLog(`获得 ${amount} 点 ${getFactionName(faction)} 声望`);
            
            checkReputationRewards(faction);
        }
        
        function getFactionName(faction) {
            const names = {
                merchants: '商人',
                church: '教会',
                underworld: ' underworld',
                guild: ' guild',
                academia: '学术'
            };
            return names[faction] || faction;
        }
        
        function checkReputationRewards(faction) {
            const reputation = rogueState.player.reputation[faction];
            const thresholds = [50, 100, 200, 300, 500];
            
            for (const threshold of thresholds) {
                if (reputation >= threshold && !hasReceivedReputationReward(faction, threshold)) {
                    grantReputationReward(faction, threshold);
                }
            }
        }
        
        function hasReceivedReputationReward(faction, threshold) {
            // 检查是否已经获得过该声望等级的奖励
            return false;
        }
        
        function grantReputationReward(faction, threshold) {
            switch(faction) {
                case 'merchants':
                    switch(threshold) {
                        case 50:
                            rogueState.player.relics.push({ id: 'merchant_50', name: '商人之友', description: '所有商店商品价格降低10%' });
                            rogueLog('商人声望达到50级：获得商人之友称号，商店商品价格降低10%');
                            break;
                        case 100:
                            rogueState.player.relics.push({ id: 'merchant_100', name: '商业伙伴', description: '所有商店商品价格降低20%，购买时有机率获得额外物品' });
                            rogueLog('商人声望达到100级：获得商业伙伴称号，商店商品价格降低20%');
                            break;
                        case 200:
                            rogueState.player.relics.push({ id: 'merchant_200', name: '商业大师', description: '所有商店商品价格降低30%，购买时必获得额外物品' });
                            rogueLog('商人声望达到200级：获得商业大师称号，商店商品价格降低30%');
                            break;
                        case 300:
                            rogueState.player.relics.push({ id: 'merchant_300', name: '商业之神', description: '所有商店商品价格降低40%，购买时获得双倍物品' });
                            rogueLog('商人声望达到300级：获得商业之神称号，商店商品价格降低40%');
                            break;
                        case 500:
                            rogueState.player.relics.push({ id: 'merchant_500', name: '商业传奇', description: '所有商店商品价格降低50%，购买时获得三倍物品' });
                            rogueLog('商人声望达到500级：获得商业传奇称号，商店商品价格降低50%');
                            break;
                    }
                    break;
                case 'church':
                    switch(threshold) {
                        case 50:
                            rogueState.player.relics.push({ id: 'church_50', name: '虔诚信徒', description: '所有治疗效果提升10%' });
                            rogueLog('教会声望达到50级：获得虔诚信徒称号，所有治疗效果提升10%');
                            break;
                        case 100:
                            rogueState.player.relics.push({ id: 'church_100', name: '教会执事', description: '所有治疗效果提升20%，每回合额外恢复1点生命值' });
                            rogueLog('教会声望达到100级：获得教会执事称号，所有治疗效果提升20%');
                            break;
                        case 200:
                            rogueState.player.relics.push({ id: 'church_200', name: '教会牧师', description: '所有治疗效果提升30%，每回合额外恢复2点生命值' });
                            rogueLog('教会声望达到200级：获得教会牧师称号，所有治疗效果提升30%');
                            break;
                        case 300:
                            rogueState.player.relics.push({ id: 'church_300', name: '教会主教', description: '所有治疗效果提升40%，每回合额外恢复3点生命值，受到的伤害降低10%' });
                            rogueLog('教会声望达到300级：获得教会主教称号，所有治疗效果提升40%');
                            break;
                        case 500:
                            rogueState.player.relics.push({ id: 'church_500', name: '神圣教皇', description: '所有治疗效果提升50%，每回合额外恢复5点生命值，受到的伤害降低20%' });
                            rogueLog('教会声望达到500级：获得神圣教皇称号，所有治疗效果提升50%');
                            break;
                    }
                    break;
                case 'underworld':
                    switch(threshold) {
                        case 50:
                            rogueState.player.relics.push({ id: 'underworld_50', name: '地下新手', description: '暴击率提升5%' });
                            rogueLog(' underworld声望达到50级：获得地下新手称号，暴击率提升5%');
                            break;
                        case 100:
                            rogueState.player.relics.push({ id: 'underworld_100', name: '地下成员', description: '暴击率提升10%，暴击伤害提升15%' });
                            rogueLog(' underworld声望达到100级：获得地下成员称号，暴击率提升10%');
                            break;
                        case 200:
                            rogueState.player.relics.push({ id: 'underworld_200', name: '地下头目', description: '暴击率提升15%，暴击伤害提升25%' });
                            rogueLog(' underworld声望达到200级：获得地下头目称号，暴击率提升15%');
                            break;
                        case 300:
                            rogueState.player.relics.push({ id: 'underworld_300', name: '地下领主', description: '暴击率提升20%，暴击伤害提升35%，攻击力提升10%' });
                            rogueLog(' underworld声望达到300级：获得地下领主称号，暴击率提升20%');
                            break;
                        case 500:
                            rogueState.player.relics.push({ id: 'underworld_500', name: '地下之王', description: '暴击率提升25%，暴击伤害提升50%，攻击力提升20%' });
                            rogueLog(' underworld声望达到500级：获得地下之王称号，暴击率提升25%');
                            break;
                    }
                    break;
                case 'guild':
                    switch(threshold) {
                        case 50:
                            rogueState.player.relics.push({ id: 'guild_50', name: '行会新手', description: '所有技能冷却减少10%' });
                            rogueLog(' guild声望达到50级：获得行会新手称号，所有技能冷却减少10%');
                            break;
                        case 100:
                            rogueState.player.relics.push({ id: 'guild_100', name: '行会成员', description: '所有技能冷却减少20%，技能效果提升5%' });
                            rogueLog(' guild声望达到100级：获得行会成员称号，所有技能冷却减少20%');
                            break;
                        case 200:
                            rogueState.player.relics.push({ id: 'guild_200', name: '行会大师', description: '所有技能冷却减少30%，技能效果提升10%' });
                            rogueLog(' guild声望达到200级：获得行会大师称号，所有技能冷却减少30%');
                            break;
                        case 300:
                            rogueState.player.relics.push({ id: 'guild_300', name: '行会宗师', description: '所有技能冷却减少40%，技能效果提升15%，能量恢复速度提升10%' });
                            rogueLog(' guild声望达到300级：获得行会宗师称号，所有技能冷却减少40%');
                            break;
                        case 500:
                            rogueState.player.relics.push({ id: 'guild_500', name: '行会传奇', description: '所有技能冷却减少50%，技能效果提升20%，能量恢复速度提升20%' });
                            rogueLog(' guild声望达到500级：获得行会传奇称号，所有技能冷却减少50%');
                            break;
                    }
                    break;
                case 'academia':
                    switch(threshold) {
                        case 50:
                            rogueState.player.relics.push({ id: 'academia_50', name: '学术新手', description: '经验获取提升10%' });
                            rogueLog('学术声望达到50级：获得学术新手称号，经验获取提升10%');
                            break;
                        case 100:
                            rogueState.player.relics.push({ id: 'academia_100', name: '学术研究者', description: '经验获取提升20%，智力 +1' });
                            rogueState.player.stats.intelligence += 1;
                            rogueLog('学术声望达到100级：获得学术研究者称号，经验获取提升20%，智力 +1');
                            break;
                        case 200:
                            rogueState.player.relics.push({ id: 'academia_200', name: '学术教授', description: '经验获取提升30%，智力 +2' });
                            rogueState.player.stats.intelligence += 2;
                            rogueLog('学术声望达到200级：获得学术教授称号，经验获取提升30%，智力 +2');
                            break;
                        case 300:
                            rogueState.player.relics.push({ id: 'academia_300', name: '学术大师', description: '经验获取提升40%，智力 +3，所有技能效果提升10%' });
                            rogueState.player.stats.intelligence += 3;
                            rogueLog('学术声望达到300级：获得学术大师称号，经验获取提升40%，智力 +3');
                            break;
                        case 500:
                            rogueState.player.relics.push({ id: 'academia_500', name: '学术传奇', description: '经验获取提升50%，智力 +5，所有技能效果提升20%' });
                            rogueState.player.stats.intelligence += 5;
                            rogueLog('学术声望达到500级：获得学术传奇称号，经验获取提升50%，智力 +5');
                            break;
                    }
                    break;
            }
        }

        // 给予职业初始奖励
        function giveClassStartingBonus(className) {
            switch (className) {
                case 'soldier':
                    // 士兵初始奖励
                    rogueState.player.relics.push({ id: 'warrior_badge', name: '战士徽章', desc: '力量 +2，每次攻击额外造成2点伤害' });
                    rogueState.player.stats.strength += 2;
                    // 初始装备
                    rogueState.player.equipment.weapon = {
                        id: 'iron_sword',
                        name: '铁剑',
                        description: '攻击力 +10',
                        type: 'weapon',
                        rarity: 'common',
                        stats: {
                            attack: 10
                        }
                    };
                    rogueLog('获得战士徽章：力量 +2');
                    break;
                case 'alchemist':
                    // 炼金术师初始奖励
                    rogueState.player.relics.push({ id: 'alchemist_vial', name: '炼金术士的瓶子', desc: '智力 +2，每次使用技能额外获得1点能量' });
                    rogueState.player.stats.intelligence += 2;
                    // 初始装备
                    rogueState.player.equipment.weapon = {
                        id: 'alchemist_staff',
                        name: '炼金术士法杖',
                        description: '智力 +2，技能效果提升10%',
                        type: 'weapon',
                        rarity: 'common',
                        stats: {
                            intelligence: 2,
                            skillPower: 10
                        }
                    };
                    rogueLog('获得炼金术士的瓶子：智力 +2');
                    break;
                case 'merchant':
                    // 商人初始奖励
                    rogueState.player.relics.push({ id: 'merchant_ring', name: '商人之戒', desc: '幸运 +3，购买物品时享受8折优惠' });
                    rogueState.player.stats.luck += 3;
                    rogueState.player.gold += 50; // 商人初始金币更多
                    // 初始装备
                    rogueState.player.equipment.ring1 = {
                        id: 'gold_ring',
                        name: '金戒指',
                        description: '幸运 +1，金币获取 +5%',
                        type: 'ring',
                        rarity: 'common',
                        stats: {
                            luck: 1,
                            goldBonus: 5
                        }
                    };
                    rogueLog('获得商人之戒：幸运 +3，金币 +50');
                    break;
                case 'mage':
                    // 魔法师初始奖励
                    rogueState.player.relics.push({ id: 'mage_staff', name: '魔法法杖', desc: '智力 +3，法术伤害 +20%' });
                    rogueState.player.stats.intelligence += 3;
                    // 初始装备
                    rogueState.player.equipment.weapon = {
                        id: 'magic_wand',
                        name: '魔法魔杖',
                        description: '智力 +3，能量上限 +1',
                        type: 'weapon',
                        rarity: 'common',
                        stats: {
                            intelligence: 3,
                            maxEnergy: 1
                        }
                    };
                    rogueLog('获得魔法法杖：智力 +3');
                    break;
                case 'thief':
                    // 盗贼初始奖励
                    rogueState.player.relics.push({ id: 'thief_hood', name: '盗贼头巾', desc: '敏捷 +3，暴击率 +10%' });
                    rogueState.player.stats.agility += 3;
                    // 初始装备
                    rogueState.player.equipment.weapon = {
                        id: 'dagger',
                        name: '匕首',
                        description: '敏捷 +2，暴击率 +5%',
                        type: 'weapon',
                        rarity: 'common',
                        stats: {
                            agility: 2,
                            critChance: 5
                        }
                    };
                    rogueLog('获得盗贼头巾：敏捷 +3');
                    break;
                case 'paladin':
                    // 圣骑士初始奖励
                    rogueState.player.relics.push({ id: 'holy_medal', name: '神圣勋章', desc: '活力 +3，最大生命值 +15' });
                    rogueState.player.stats.vitality += 3;
                    rogueState.player.maxHp += 15;
                    rogueState.player.hp += 15;
                    // 初始装备
                    rogueState.player.equipment.armor = {
                        id: 'holy_armor',
                        name: '神圣护甲',
                        description: '活力 +2，受到伤害减少10%',
                        type: 'armor',
                        rarity: 'common',
                        stats: {
                            vitality: 2,
                            damageReduction: 10
                        }
                    };
                    rogueLog('获得神圣勋章：活力 +3，最大生命值 +15');
                    break;
            }
        }

        // 遗物效果系统
        function applyRelicEffects() {
            const relics = rogueState.player.relics;
            
            // 战士徽章效果
            const warriorBadge = relics.find(r => r.id === 'warrior_badge');
            if (warriorBadge) {
                // 已在stats中体现
            }
            
            // 炼金术士的瓶子效果
            const alchemistVial = relics.find(r => r.id === 'alchemist_vial');
            if (alchemistVial) {
                // 已在stats中体现
            }
            
            // 商人之戒效果
            const merchantRing = relics.find(r => r.id === 'merchant_ring');
            if (merchantRing) {
                // 已在stats中体现
            }
            
            // 魔法法杖效果
            const mageStaff = relics.find(r => r.id === 'mage_staff');
            if (mageStaff) {
                // 已在stats中体现
            }
            
            // 盗贼头巾效果
            const thiefHood = relics.find(r => r.id === 'thief_hood');
            if (thiefHood) {
                // 已在stats中体现
            }
            
            // 神圣勋章效果
            const holyMedal = relics.find(r => r.id === 'holy_medal');
            if (holyMedal) {
                // 已在stats中体现
            }
        }

        // 装备强化系统
        function enhanceEquipment(equipmentType) {
            const enhancement = rogueState.player.equipmentEnhancement;
            const equipment = rogueState.player.equipment[equipmentType];
            
            if (!equipment) {
                rogueLog('没有装备可以强化');
                return false;
            }
            
            // 计算强化成本
            const currentLevel = enhancement[`${equipmentType}Level`];
            const nextLevel = currentLevel + 1;
            const goldCost = Math.floor(100 * Math.pow(1.5, nextLevel - 1));
            const materialCost = {
                iron: Math.floor(nextLevel * 2),
                crystal: Math.floor(nextLevel * 1)
            };
            
            // 检查资源是否足够
            if (rogueState.player.gold < goldCost) {
                rogueLog('金币不足');
                return false;
            }
            
            if (rogueState.enhancementSystem.materials.iron < materialCost.iron) {
                rogueLog('铁矿石不足');
                return false;
            }
            
            if (rogueState.enhancementSystem.materials.crystal < materialCost.crystal) {
                rogueLog('水晶不足');
                return false;
            }
            
            // 扣除资源
            rogueState.player.gold -= goldCost;
            rogueState.enhancementSystem.materials.iron -= materialCost.iron;
            rogueState.enhancementSystem.materials.crystal -= materialCost.crystal;
            
            // 提升强化等级
            enhancement[`${equipmentType}Level`] = nextLevel;
            
            // 提升装备属性
            const statBoost = nextLevel * 2;
            if (equipment.stats) {
                Object.keys(equipment.stats).forEach(stat => {
                    equipment.stats[stat] += statBoost;
                });
            }
            
            // 更新装备描述
            equipment.description = `${equipment.name} +${nextLevel} - 属性提升`;
            
            // 记录强化次数
            rogueState.gameStats.totalEquipmentEnhanced++;
            
            rogueLog(`成功强化 ${equipment.name} 到 +${nextLevel}`);
            return true;
        }

        // 装备掉落系统
        function generateEquipmentDrop(monsterLevel) {
            const rarityChances = {
                common: 60,
                rare: 30,
                epic: 8,
                legendary: 2
            };
            
            let totalChance = 0;
            const random = Math.random() * 100;
            let rarity = 'common';
            
            for (const [r, chance] of Object.entries(rarityChances)) {
                totalChance += chance;
                if (random < totalChance) {
                    rarity = r;
                    break;
                }
            }
            
            const equipmentTypes = ['weapon', 'armor', 'accessory1', 'accessory2', 'ring1', 'ring2', 'necklace'];
            const equipmentType = equipmentTypes[Math.floor(Math.random() * equipmentTypes.length)];
            
            const equipmentNames = {
                weapon: ['剑', '斧', '锤', '杖', '弓', '匕首'],
                armor: ['板甲', '锁甲', '皮甲', '布甲', '盾牌'],
                accessory1: ['项链', '护符', '徽章', '戒指'],
                accessory2: ['手镯', '腰带', '披风', '靴子'],
                ring1: ['金戒指', '银戒指', '铜戒指', '铁戒指'],
                ring2: ['魔法戒指', '幸运戒指', '力量戒指', '智力戒指'],
                necklace: ['钻石项链', '珍珠项链', '琥珀项链', '翡翠项链']
            };
            
            const rarityPrefixes = {
                common: '',
                rare: '优质的',
                epic: '史诗的',
                legendary: '传说的'
            };
            
            const name = `${rarityPrefixes[rarity]}${equipmentNames[equipmentType][Math.floor(Math.random() * equipmentNames[equipmentType].length)]}`;
            const baseStats = {
                attack: 5,
                defense: 5,
                intelligence: 2,
                strength: 2,
                agility: 2,
                vitality: 2,
                luck: 1
            };
            
            const rarityMultiplier = {
                common: 1,
                rare: 1.5,
                epic: 2,
                legendary: 3
            };
            
            const stats = {};
            const statKeys = Object.keys(baseStats);
            const statCount = Math.floor(Math.random() * 3) + 1;
            
            for (let i = 0; i < statCount; i++) {
                const stat = statKeys[Math.floor(Math.random() * statKeys.length)];
                stats[stat] = Math.floor(baseStats[stat] * rarityMultiplier[rarity] * (monsterLevel * 0.5 + 1));
            }
            
            const equipment = {
                id: `equipment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: name,
                description: `${rarity}装备，属性提升`,
                type: equipmentType,
                rarity: rarity,
                stats: stats
            };
            
            return equipment;
        }

        // 掉落装备
        function dropEquipment(monsterLevel) {
            const dropChance = 30; // 30% 掉落几率
            if (Math.random() * 100 < dropChance) {
                const equipment = generateEquipmentDrop(monsterLevel);
                rogueState.player.equipment[equipment.type] = equipment;
                rogueLog(`获得了 ${equipment.rarity} 装备：${equipment.name}`);
                return equipment;
            }
            return null;
        }

        // 材料掉落系统
        function dropMaterials(monsterLevel) {
            const materialTypes = ['iron', 'crystal', 'essence'];
            const dropChance = 60; // 60% 掉落几率
            
            if (Math.random() * 100 < dropChance) {
                const materialType = materialTypes[Math.floor(Math.random() * materialTypes.length)];
                const amount = Math.floor(Math.random() * 3) + 1 + Math.floor(monsterLevel * 0.5);
                
                rogueState.enhancementSystem.materials[materialType] += amount;
                rogueLog(`获得了 ${amount} 个 ${getMaterialName(materialType)}`);
                return { type: materialType, amount: amount };
            }
            return null;
        }

        function getMaterialName(materialType) {
            const names = {
                iron: '铁矿石',
                crystal: '水晶',
                essence: '精华',
                rareMetal: '稀有金属',
                mythicShard: '神话碎片'
            };
            return names[materialType] || materialType;
        }

        // 应用装备效果
        function applyEquipmentEffects() {
            const equipment = rogueState.player.equipment;
            
            // 重置装备效果
            rogueState.player.equipmentEffects = {};
            
            // 应用武器效果
            if (equipment.weapon) {
                if (equipment.weapon.stats) {
                    Object.keys(equipment.weapon.stats).forEach(stat => {
                        if (!rogueState.player.equipmentEffects[stat]) {
                            rogueState.player.equipmentEffects[stat] = 0;
                        }
                        rogueState.player.equipmentEffects[stat] += equipment.weapon.stats[stat];
                    });
                }
            }
            
            // 应用护甲效果
            if (equipment.armor) {
                if (equipment.armor.stats) {
                    Object.keys(equipment.armor.stats).forEach(stat => {
                        if (!rogueState.player.equipmentEffects[stat]) {
                            rogueState.player.equipmentEffects[stat] = 0;
                        }
                        rogueState.player.equipmentEffects[stat] += equipment.armor.stats[stat];
                    });
                }
            }
            
            // 应用饰品效果
            for (let i = 1; i <= 2; i++) {
                const accessory = equipment[`accessory${i}`];
                if (accessory && accessory.stats) {
                    Object.keys(accessory.stats).forEach(stat => {
                        if (!rogueState.player.equipmentEffects[stat]) {
                            rogueState.player.equipmentEffects[stat] = 0;
                        }
                        rogueState.player.equipmentEffects[stat] += accessory.stats[stat];
                    });
                }
            }
            
            // 应用戒指效果
            for (let i = 1; i <= 2; i++) {
                const ring = equipment[`ring${i}`];
                if (ring && ring.stats) {
                    Object.keys(ring.stats).forEach(stat => {
                        if (!rogueState.player.equipmentEffects[stat]) {
                            rogueState.player.equipmentEffects[stat] = 0;
                        }
                        rogueState.player.equipmentEffects[stat] += ring.stats[stat];
                    });
                }
            }
            
            // 应用项链效果
            if (equipment.necklace) {
                if (equipment.necklace.stats) {
                    Object.keys(equipment.necklace.stats).forEach(stat => {
                        if (!rogueState.player.equipmentEffects[stat]) {
                            rogueState.player.equipmentEffects[stat] = 0;
                        }
                        rogueState.player.equipmentEffects[stat] += equipment.necklace.stats[stat];
                    });
                }
            }
        }

        function applyStartingChallenges() {
            // 随机选择1-2个挑战
            const challengeCount = Math.random() < 0.5 ? 1 : 2;
            const availableChallenges = [
                {
                    id: 'no_rest_challenge',
                    name: '永不停歇',
                    description: '无法在休息房间恢复生命值',
                    effect: 'rest_disabled'
                },
                {
                    id: 'low_energy_challenge',
                    name: '能量危机',
                    description: '初始能量上限减少1点',
                    effect: 'energy_reduction'
                },
                {
                    id: 'curse_challenge',
                    name: '诅咒缠身',
                    description: '开始游戏时获得一个随机诅咒',
                    effect: 'start_with_curse'
                },
                {
                    id: 'elite_enemies_challenge',
                    name: '精英敌袭',
                    description: '所有普通敌人变为精英版本',
                    effect: 'elite_enemies'
                },
                {
                    id: 'no_shop_challenge',
                    name: '无商可寻',
                    description: '商店房间数量减少50%',
                    effect: 'shop_reduction'
                },
                {
                    id: 'glass_cannon_challenge',
                    name: '玻璃大炮',
                    description: '伤害增加25%，但最大生命值减少20%',
                    effect: 'glass_cannon'
                },
                {
                    id: 'energy_drain_challenge',
                    name: '能量汲取',
                    description: '每使用一张卡牌消耗额外1点能量',
                    effect: 'energy_drain'
                },
                {
                    id: 'curse_collection_challenge',
                    name: '诅咒收藏家',
                    description: '开始游戏时获得两个随机诅咒，但每有一个诅咒就获得5%伤害加成',
                    effect: 'curse_collection'
                },
                {
                    id: 'hardcore_challenge',
                    name: '硬核模式',
                    description: '无法获得任何祝福，所有敌人伤害增加15%',
                    effect: 'hardcore'
                },
                {
                    id: 'speed_run_challenge',
                    name: '速通挑战',
                    description: '每5层必须在10回合内完成，否则受到惩罚',
                    effect: 'speed_run'
                }
            ];
            
            // 随机选择挑战
            for (let i = 0; i < challengeCount; i++) {
                if (availableChallenges.length > 0) {
                    const randomIndex = Math.floor(Math.random() * availableChallenges.length);
                    const challenge = availableChallenges.splice(randomIndex, 1)[0];
                    rogueState.player.challenges.push(challenge);
                    
                    // 应用挑战效果
                    applyChallengeEffect(challenge);
                    
                    rogueLog(`挑战激活：${challenge.name} - ${challenge.description}`);
                }
            }
        }

        function applyChallengeEffect(challenge) {
            switch(challenge.effect) {
                case 'rest_disabled':
                    // 无法在休息房间恢复生命值
                    rogueState.restDisabled = true;
                    break;
                case 'energy_reduction':
                    // 初始能量上限减少1点
                    rogueState.player.maxEnergy = Math.max(1, rogueState.player.maxEnergy - 1);
                    break;
                case 'start_with_curse':
                    // 开始游戏时获得一个随机诅咒
                    const curses = [
                        { id: 'weakness_curse', name: '虚弱诅咒', description: '伤害降低15%', effect: { type: 'damage_reduction', value: 0.15 } },
                        { id: 'fatigue_curse', name: '疲劳诅咒', description: '能量上限降低1点', effect: { type: 'max_energy_reduction', value: 1 } },
                        { id: 'misfortune_curse', name: '不幸诅咒', description: '金币获取减少20%', effect: { type: 'gold_reduction', value: 0.2 } },
                        { id: 'fragility_curse', name: '脆弱诅咒', description: '受到伤害增加15%', effect: { type: 'damage_increase', value: 0.15 } },
                        { id: 'blindness_curse', name: '盲目诅咒', description: '暴击率降低10%', effect: { type: 'crit_reduction', value: 0.1 } },
                        { id: 'slowness_curse', name: '迟缓诅咒', description: '能量恢复速度降低20%', effect: { type: 'energy_reduction', value: 0.2 } },
                        { id: 'hunger_curse', name: '饥饿诅咒', description: '每回合结束时失去1点生命值', effect: { type: 'hp_per_turn', value: -1 } },
                        { id: 'confusion_curse', name: '混乱诅咒', description: '技能效果降低15%', effect: { type: 'skill_reduction', value: 0.15 } },
                        { id: 'fear_curse', name: '恐惧诅咒', description: '所有属性降低1点', effect: { type: 'all_stats_reduction', value: 1 } },
                        { id: 'decay_curse', name: '衰变诅咒', description: '最大生命值降低10点', effect: { type: 'max_hp_reduction', value: 10 } }
                    ];
                    const randomCurse = curses[Math.floor(Math.random() * curses.length)];
                    rogueState.player.curses.push(randomCurse);
                    applyCurseEffect(randomCurse);
                    rogueLog(`获得诅咒：${randomCurse.name} - ${randomCurse.description}`);
                    break;
                case 'elite_enemies':
                    // 所有普通敌人变为精英版本
                    rogueState.eliteEnemies = true;
                    break;
                case 'shop_reduction':
                    // 商店房间数量减少50%
                    rogueState.shopReduction = true;
                    break;
            }
        }

        function giveClassStartingBonus(className) {
            // 职业初始奖励
            switch(className) {
                case 'soldier':
                    // 士兵：力量和防御
                    rogueState.player.relics.push({
                        id: 'soldier_shield',
                        name: '士兵之盾',
                        description: '每次战斗开始获得5点格挡',
                        type: 'combat',
                        rarity: 'common'
                    });
                    rogueState.player.stats.strength += 2;
                    break;
                case 'alchemist':
                    // 炼金术师：智力和药剂
                    rogueState.player.relics.push({
                        id: 'alchemist_kit',
                        name: '炼金术士工具箱',
                        description: '药剂效果提升20%',
                        type: 'skill',
                        rarity: 'common'
                    });
                    rogueState.player.stats.intelligence += 2;
                    break;
                case 'merchant':
                    // 商人：金币和幸运
                    rogueState.player.relics.push({
                        id: 'merchant_coin',
                        name: '商人金币',
                        description: '所有商店商品价格降低10%',
                        type: 'shop',
                        rarity: 'common'
                    });
                    rogueState.player.stats.luck += 2;
                    rogueState.player.gold += 50;
                    break;
                case 'mage':
                    // 魔法师：智力和能量
                    rogueState.player.relics.push({
                        id: 'mage_wand',
                        name: '魔法师魔杖',
                        description: '每次战斗开始获得1点额外能量',
                        type: 'combat',
                        rarity: 'common'
                    });
                    rogueState.player.stats.intelligence += 3;
                    break;
                case 'thief':
                    // 盗贼：敏捷和暴击
                    rogueState.player.relics.push({
                        id: 'thief_dagger',
                        name: '盗贼匕首',
                        description: '暴击率提升10%',
                        type: 'combat',
                        rarity: 'common'
                    });
                    rogueState.player.stats.agility += 3;
                    break;
                case 'paladin':
                    // 圣骑士：活力和祝福
                    rogueState.player.relics.push({
                        id: 'paladin_amulet',
                        name: '圣骑士护符',
                        description: '每次休息恢复额外10点生命值',
                        type: 'rest',
                        rarity: 'common'
                    });
                    rogueState.player.stats.vitality += 2;
                    rogueState.player.blessings.push({
                        id: 'holy_blessing',
                        name: '神圣祝福',
                        description: '所有治疗效果提升15%',
                        duration: 'permanent'
                    });
                    break;
                case 'demon':
                    // 恶魔：力量和黑暗能量
                    rogueState.player.relics.push({
                        id: 'demon_horn',
                        name: '恶魔之角',
                        description: '每杀死一个敌人获得1点力量，持续到战斗结束',
                        type: 'combat',
                        rarity: 'rare'
                    });
                    rogueState.player.stats.strength += 3;
                    rogueState.player.reputation.underworld += 10;
                    break;
                case 'angel':
                    // 天使：活力和神圣祝福
                    rogueState.player.relics.push({
                        id: 'angel_wing',
                        name: '天使之翼',
                        description: '每次战斗开始获得3点格挡和3点生命值恢复',
                        type: 'combat',
                        rarity: 'rare'
                    });
                    rogueState.player.stats.vitality += 3;
                    rogueState.player.reputation.church += 10;
                    break;
                case 'troll':
                    // 乐子人：幸运和混乱
                    rogueState.player.relics.push({
                        id: 'troll_mask',
                        name: '乐子人面具',
                        description: '所有随机效果的范围扩大20%',
                        type: 'universal',
                        rarity: 'rare'
                    });
                    rogueState.player.stats.luck += 3;
                    break;
                case 'fool':
                    // 傻子：活力和鲁莽
                    rogueState.player.relics.push({
                        id: 'fool_hat',
                        name: '傻子帽子',
                        description: '生命值低于30%时，攻击力提升30%',
                        type: 'combat',
                        rarity: 'common'
                    });
                    rogueState.player.stats.vitality += 4;
                    break;
                case 'terrorist':
                    // 恐怖分子：力量和爆炸
                    rogueState.player.relics.push({
                        id: 'terrorist_bomb',
                        name: '恐怖分子炸弹',
                        description: '每次使用自残技能时，伤害提升25%',
                        type: 'combat',
                        rarity: 'rare'
                    });
                    rogueState.player.stats.strength += 3;
                    rogueState.player.reputation.underworld += 15;
                    break;
                case 'burner':
                    // 燃烧者：智力和火焰
                    rogueState.player.relics.push({
                        id: 'burner_candle',
                        name: '燃烧者蜡烛',
                        description: '所有火焰伤害提升20%',
                        type: 'combat',
                        rarity: 'common'
                    });
                    rogueState.player.stats.intelligence += 3;
                    break;
                case 'cultist':
                    // 异教主：智力和信徒
                    rogueState.player.relics.push({
                        id: 'cultist_book',
                        name: '异教经书',
                        description: '每次使用技能卡时，有20%几率获得1点额外能量',
                        type: 'combat',
                        rarity: 'rare'
                    });
                    rogueState.player.stats.intelligence += 3;
                    rogueState.player.reputation.underworld += 10;
                    break;
            }
        }

        function rogueGenerateRooms() {
            rogueState.rooms = [];
            const roomCount = 7; // 增加房间数量，使地图更复杂
            
            for (let i = 0; i < roomCount; i++) {
                let roomType;
                const random = Math.random();
                
                if (rogueState.floor === 10) {
                    // 第10层只生成BOSS战斗，没有其他对战
                    if (i === Math.floor(roomCount / 2)) {
                        // 中间房间设为BOSS房间
                        roomType = ROGUE_ROOM_TYPES.BOSS;
                    } else {
                        // 其他房间设为非战斗房间
                        let shopChance = 0.3;
                        
                        // 应用"无商可寻"挑战效果
                        if (rogueState.shopReduction) {
                            shopChance *= 0.5;
                        }
                        
                        if (random < shopChance) {
                            roomType = ROGUE_ROOM_TYPES.SHOP;
                        } else if (random < shopChance + 0.3) {
                            roomType = ROGUE_ROOM_TYPES.EVENT;
                        } else if (random < shopChance + 0.5) {
                            roomType = ROGUE_ROOM_TYPES.TREASURE;
                        } else {
                            roomType = ROGUE_ROOM_TYPES.REST;
                        }
                    }
                } else {
                    // 非第10层的正常房间生成
                    if (rogueState.floor % 5 === 0 && i === Math.floor(roomCount / 2)) {
                        // 每5层的中间房间设为BOSS房间
                        roomType = ROGUE_ROOM_TYPES.BOSS;
                    } else if (random < 0.4) {
                        roomType = ROGUE_ROOM_TYPES.COMBAT;
                    } else {
                        let shopChance = 0.2;
                        
                        // 应用"无商可寻"挑战效果
                        if (rogueState.shopReduction) {
                            shopChance *= 0.5;
                        }
                        
                        if (random < 0.4 + shopChance) {
                            roomType = ROGUE_ROOM_TYPES.SHOP;
                        } else if (random < 0.4 + shopChance + 0.2) {
                            roomType = ROGUE_ROOM_TYPES.EVENT;
                        } else if (random < 0.4 + shopChance + 0.3) {
                            roomType = ROGUE_ROOM_TYPES.TREASURE;
                        } else {
                            roomType = ROGUE_ROOM_TYPES.REST;
                        }
                    }
                }
                
                rogueState.rooms.push({
                    type: roomType,
                    visited: false,
                    completed: false,
                    // 添加房间难度等级，根据楼层增加
                    difficulty: Math.min(5, Math.floor(rogueState.floor / 2) + 1)
                });
            }
        }

        function rogueShowMap() {
            const roomGrid = document.getElementById('rogue-room-grid');
            roomGrid.innerHTML = '';
            
            // 更新当前楼层显示
            document.getElementById('current-floor-display').innerText = rogueState.floor;
            
            // 更新楼层敌人信息
            updateFloorEnemiesInfo();
            
            rogueState.rooms.forEach((room, index) => {
                const roomConfig = ROGUE_ROOM_CONFIG[room.type];
                const roomElement = document.createElement('div');
                roomElement.style.cssText = `
                    padding: 30px;
                    background: ${room.visited ? 'rgba(68, 68, 68, 0.8)' : 'rgba(51, 51, 51, 0.8)'};
                    backdrop-filter: blur(10px);
                    border: 2px solid ${room.completed ? 'rgba(85, 85, 85, 0.8)' : 'rgba(102, 102, 102, 0.8)'};
                    border-radius: 15px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                `;
                
                roomElement.onclick = () => rogueSelectRoom(index);
                roomElement.onmouseenter = () => {
                    roomElement.style.background = 'rgba(85, 85, 85, 0.9)';
                    roomElement.style.transform = 'translateY(-10px) scale(1.05)';
                    roomElement.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.4)';
                };
                roomElement.onmouseleave = () => {
                    roomElement.style.background = room.visited ? 'rgba(68, 68, 68, 0.8)' : 'rgba(51, 51, 51, 0.8)';
                    roomElement.style.transform = 'translateY(0) scale(1)';
                    roomElement.style.boxShadow = 'none';
                };
                
                roomElement.innerHTML = `
                    <div style="font-size:3em; margin-bottom: 15px; transition: transform 0.3s ease;">${roomConfig.icon}</div>
                    <div style="font-size: 1.1em; font-weight: 600; color: var(--text-main);">${roomConfig.name}</div>
                `;
                
                if (index === rogueState.selectedRoomIndex) {
                    roomElement.style.borderColor = 'var(--gold)';
                    roomElement.style.boxShadow = '0 0 20px var(--gold)';
                }
                
                roomGrid.appendChild(roomElement);
            });
            
            switchScreen('rogue-map-screen');
        }
        
        function updateFloorEnemiesInfo() {
            const floor = rogueState.floor;
            const enemiesInfoElement = document.getElementById('floor-enemies-info');
            
            if (floor === 10) {
                enemiesInfoElement.innerText = '本楼层只有BOSS战斗: 绝境魔王、黑暗领主';
            } else if (floor >= 7) {
                enemiesInfoElement.innerText = '本楼层可能出现的敌人: 魔法学徒、剧毒蜘蛛、骷髅战士';
            } else if (floor >= 4) {
                enemiesInfoElement.innerText = '本楼层可能出现的敌人: 暴躁老哥、偷牌贼、剧毒蜘蛛';
            } else {
                enemiesInfoElement.innerText = '本楼层可能出现的敌人: 迷途赌徒、暴躁老哥、偷牌贼';
            }
        }

        function rogueSelectRoom(index) {
            rogueState.selectedRoomIndex = index;
            rogueShowMap();
        }

        function leaveRogueMap() {
            // 如果玩家正在战斗中，返回战斗场景
            if (rogueState.enemy) {
                switchScreen('rogue-battle-scene');
            } else {
                // 否则返回肉鸽模式主界面
                switchScreen('rogue-screen-main');
            }
        }

        function enterRogueSelectedRoom() {
            if (rogueState.selectedRoomIndex === -1) {
                alert('请选择一个房间');
                return;
            }
            
            const room = rogueState.rooms[rogueState.selectedRoomIndex];
            room.visited = true;
            rogueState.currentRoom = room;
            
            switch (room.type) {
                case ROGUE_ROOM_TYPES.COMBAT:
                    rogueStartBattle();
                    break;
                case ROGUE_ROOM_TYPES.SHOP:
                    rogueShowShop();
                    break;
                case ROGUE_ROOM_TYPES.EVENT:
                    rogueShowEvent();
                    break;
                case ROGUE_ROOM_TYPES.TREASURE:
                    rogueShowTreasure();
                    break;
                case ROGUE_ROOM_TYPES.REST:
                    rogueShowRest();
                    break;
                case ROGUE_ROOM_TYPES.BOSS:
                    rogueShowBoss();
                    break;
            }
        }

        function openRogueMap() {
            rogueShowMap();
        }

        function rogueStartBattle() {
            let enemyTemplate;
            if (rogueState.floor % 5 === 0) {
                const bosses = ROGUE_ENEMIES.filter(e => e.isBoss);
                enemyTemplate = bosses[rogueRandInt(0, bosses.length - 1)];
            } else {
                const normalEnemies = ROGUE_ENEMIES.filter(e => !e.isBoss);
                enemyTemplate = normalEnemies[rogueRandInt(0, normalEnemies.length - 1)];
            }

            // 创建敌人实例
            let enemy = {
                ...enemyTemplate,
                maxHp: enemyTemplate.hp,
                currentPatternIdx: 0,
                poison: 0,
                weak: 0,
                stun: false,
                burn: 0,
                defense: 0
            };

            // 应用"精英敌袭"挑战效果（只对普通敌人生效）
            if (rogueState.eliteEnemies && !enemy.isBoss) {
                enemy = makeEnemyElite(enemy);
            }

            rogueState.enemy = enemy;

            rogueState.player.drawPile = rogueShuffle([...rogueState.player.deck]);
            rogueState.player.discard = [];
            rogueState.player.hand = [];
            rogueState.player.block = 0;
            rogueState.player.energy = rogueState.player.maxEnergy;
            rogueState.player.buffs = {};

            // 应用战斗开始时的遗物效果
            applyRelicEffects(0, 'combat_start');

            rogueUpdateUI();
            rogueUpdateEnemyIntent();
            rogueDrawCards(5);
            rogueLog(`遭遇了 ${rogueState.enemy.name}!`);
            switchScreen('rogue-battle-scene');
        }

        function makeEnemyElite(enemy) {
            // 将敌人升级为精英版本
            return {
                ...enemy,
                name: `精英 ${enemy.name}`,
                hp: Math.floor(enemy.hp * 1.5),
                maxHp: Math.floor(enemy.hp * 1.5),
                dmg: Math.floor(enemy.dmg * 1.3),
                // 精英敌人获得额外技能
                pattern: [...enemy.pattern, 'buff'], // 额外增加一个buff技能
                defense: 2, // 初始防御
                isElite: true
            };
        }

        function rogueShuffle(array) {
            return array.sort(() => Math.random() - 0.5);
        }

        function rogueDrawCards(num) {
            for (let i = 0; i < num; i++) {
                if (rogueState.player.drawPile.length === 0) {
                    if (rogueState.player.discard.length === 0) break;
                    rogueState.player.drawPile = rogueShuffle([...rogueState.player.discard]);
                    rogueState.player.discard = [];
                    rogueLog("重新洗牌。");
                }
                if (rogueState.player.hand.length >= 15) {
                    rogueLog("手牌已满！");
                    rogueState.player.discard.push(rogueState.player.drawPile.pop());
                } else {
                    rogueState.player.hand.push(rogueState.player.drawPile.pop());
                }
            }
            rogueRenderHand();
        }

        function rogueRenderHand() {
            const container = document.getElementById('rogue-player-hand');
            container.innerHTML = '';
            
            // 对卡牌进行排序，相同名称的卡牌自动整理到一起
            const sortedHand = [...rogueState.player.hand].sort((a, b) => {
                const cardA = ROGUE_CARDS_DB[a];
                const cardB = ROGUE_CARDS_DB[b];
                
                // 首先按卡牌名称排序
                if (cardA.name !== cardB.name) {
                    return cardA.name.localeCompare(cardB.name);
                }
                // 然后按卡牌类型排序
                return cardA.type.localeCompare(cardB.type);
            });
            
            sortedHand.forEach((cardKey, index) => {
                const cardData = ROGUE_CARDS_DB[cardKey];
                const el = document.createElement('div');
                el.className = `card type-${cardData.type}`;
                el.innerHTML = `
                    <div class="card-cost">${cardData.cost}</div>
                    <div class="card-title">${cardData.name}</div>
                    <div class="card-desc">${cardData.desc}</div>
                    <div class="card-type">${cardData.type}</div>
                `;
                
                // 找到原始手牌中的索引，因为排序后索引会变化
                const originalIndex = rogueState.player.hand.indexOf(cardKey);
                el.onclick = () => roguePlayCard(originalIndex);
                container.appendChild(el);
            });
            
            document.getElementById('player-hp').innerText = rogueState.player.hp;
            document.getElementById('player-max-hp').innerText = rogueState.player.maxHp;
            document.getElementById('player-energy').innerText = rogueState.player.energy;
            document.getElementById('player-block').innerText = rogueState.player.block;
            document.getElementById('game-floor').innerText = rogueState.floor;
            document.getElementById('game-gold').innerText = rogueState.player.gold;
            document.getElementById('game-keys').innerText = rogueState.player.keys;
        }

        function rogueUpdateUI() {
            rogueRenderHand();
            rogueUpdateEnemyUI();
        }

        function rogueUpdateEnemyUI() {
            const e = rogueState.enemy;
            if (!e) return;
            
            document.getElementById('rogue-enemy-name').innerText = e.name;
            document.getElementById('rogue-enemy-hp').innerText = e.hp;
            document.getElementById('rogue-enemy-max-hp').innerText = e.maxHp;
            
            const pct = (e.hp / e.maxHp) * 100;
            document.getElementById('rogue-enemy-hp-bar').style.width = `${pct}%`;

            let buffText = "";
            if (e.poison > 0) buffText += `☠️中毒${e.poison} `;
            if (e.weak > 0) buffText += `📉虚弱${e.weak} `;
            if (e.stun) buffText += `💫眩晕 `;
            if (e.burn > 0) buffText += `🔥烧伤${e.burn} `;
            if (e.defense > 0) buffText += `🛡️防御${e.defense} `;
            document.getElementById('rogue-enemy-buffs').innerText = buffText;
        }

        function rogueUpdateEnemyIntent() {
            const e = rogueState.enemy;
            if (!e) return;
            
            const action = e.pattern[e.currentPatternIdx % e.pattern.length];
            let icon = "", text = "";
            let dmg = e.dmg;
            if (e.weak > 0) dmg = Math.floor(dmg * 0.5);

            if (e.stun) {
                icon = "💫"; text = "无法行动";
            } else if (action === 'atk') {
                icon = "🗡️"; text = `攻击 ${dmg}`;
            } else if (action === 'strong_atk') {
                icon = "👹"; text = `重击 ${Math.floor(dmg * 1.5)}`;
            } else if (action === 'buff') {
                icon = "💪"; text = "强化自身";
            } else if (action === 'debuff') {
                icon = "🕸️"; text = "干扰";
            } else if (action === 'poison') {
                icon = "☠️"; text = "下毒";
            } else if (action === 'defend') {
                icon = "🛡️"; text = "防御";
            }
            
            document.getElementById('rogue-enemy-intent').innerText = `${icon} ${text}`;
            rogueUpdateEnemyUI();
        }

        function roguePlayCard(index) {
            const cardKey = rogueState.player.hand[index];
            const card = ROGUE_CARDS_DB[cardKey];

            if (rogueState.player.energy < card.cost) {
                rogueLog("能量不足！");
                return;
            }

            rogueState.player.energy -= card.cost;
            rogueState.player.hand.splice(index, 1);
            rogueState.player.discard.push(cardKey);

            soundManager.playAttackSound();
            
            rogueLog(`你使用了 [${card.name}]`);
            rogueResolveEffect(card);
            rogueRenderHand();
            rogueCheckWinCondition();
        }

        function rogueResolveEffect(card) {
            const e = rogueState.enemy;
            const p = rogueState.player;

            if (card.type === 'atk') {
                const enemySprite = document.getElementById('rogue-enemy-sprite');
                if (enemySprite) {
                    enemySprite.classList.add('shake');
                    setTimeout(() => enemySprite.classList.remove('shake'), 500);
                }
            }

            switch (card.name) {
                case '攻击':
                    rogueDamageEnemy(card.val);
                    break;
                case '防御':
                    p.block += card.val;
                    rogueLog(`获得了 ${card.val} 点护盾`);
                    break;
                case '杀人猪心':
                    rogueDamageEnemy(card.val);
                    e.weak += 3;
                    rogueLog("敌人变得虚弱了！");
                    break;
                case '互换':
                    rogueDrawCards(3);
                    e.weak += 1;
                    rogueLog("敌人攻击力下降了！");
                    break;
                case '白旗':
                    p.block += 20;
                    rogueLog("获得了 20 点护盾！");
                    break;
                case '绿帽':
                    p.buffs['survive'] = true;
                    rogueLog("获得了免死金牌(一次性)");
                    break;
                case '牛牛弹':
                    rogueDamageEnemy(25);
                    rogueTakeDamage(5);
                    rogueLog("你受到了 5 点伤害！");
                    break;
                case '毒药':
                    e.poison += 6;
                    rogueLog("敌人中毒了！");
                    break;
                case '解药':
                    p.hp = Math.min(p.hp + 5, p.maxHp);
                    rogueDrawCards(2);
                    rogueLog("回复了 5 点生命值！");
                    rogueLog("抽了 2 张牌！");
                    break;
                case '十字架':
                    const attackCards = rogueState.player.discard.filter(key => ROGUE_CARDS_DB[key].type === 'atk');
                    if (attackCards.length > 0) {
                        const cardToRecover = attackCards[rogueRandInt(0, attackCards.length - 1)];
                        rogueState.player.hand.push(cardToRecover);
                        rogueState.player.discard = rogueState.player.discard.filter(key => key !== cardToRecover);
                        rogueLog(`收回了 [${ROGUE_CARDS_DB[cardToRecover].name}]`);
                    } else {
                        rogueLog("没有攻击牌可以收回！");
                    }
                    break;
                case '雷电':
                    if (Math.random() > 0.5) {
                        const damage = Math.floor(e.hp * 0.5);
                        rogueDamageEnemy(damage);
                        rogueLog("雷击！敌人失去一半生命！");
                    } else {
                        rogueDamageEnemy(10);
                        rogueLog("普通电击。");
                    }
                    break;
                case '禁止通行':
                    e.stun = true;
                    rogueLog("敌人被眩晕了！");
                    break;
                case '吃席':
                    rogueDrawCards(2);
                    if (p.kills > 0) {
                        rogueDrawCards(2);
                        rogueLog("额外抽了 2 张牌！");
                    }
                    rogueLog("抽了 2 张牌！");
                    break;
                case '火球术':
                    rogueDamageEnemy(12);
                    if (Math.random() > 0.5) {
                        e.burn = 3;
                        rogueLog("敌人被烧伤了！");
                    }
                    break;
                case '闪电链':
                    rogueDamageEnemy(8);
                    rogueLog("闪电链击中了敌人！");
                    break;
                case '潜行':
                    p.buffs['stealth'] = true;
                    rogueLog("进入潜行状态！");
                    break;
                case '背刺':
                    let backstabDamage = card.val;
                    if (e.hp > e.maxHp * 0.5) {
                        backstabDamage *= 2;
                        rogueLog("背刺暴击！");
                    }
                    rogueDamageEnemy(backstabDamage);
                    break;
                case '圣光术':
                    p.hp = Math.min(p.hp + 8, p.maxHp);
                    p.buffs = {};
                    rogueLog("回复了 8 点生命值！");
                    rogueLog("清除了所有负面状态！");
                    break;
                case '神圣打击':
                    let holyDamage = card.val;
                    if (e.isBoss) {
                        holyDamage += 5;
                        rogueLog("神圣伤害对BOSS造成了额外伤害！");
                    }
                    rogueDamageEnemy(holyDamage);
                    break;
            }
            rogueUpdateEnemyUI();
        }

        function rogueDamageEnemy(amount) {
            const e = rogueState.enemy;
            const p = rogueState.player;
            
            // 计算力量加成
            let strengthBonus = p.stats.strength * 0.5;
            
            // 计算敏捷带来的暴击
            let critChance = p.stats.agility * 0.05; // 每点敏捷增加5%暴击率
            // 应用诅咒效果
            critChance = applyCurseEffects(critChance, 'crit_chance');
            critChance = Math.max(0, critChance);
            let isCrit = Math.random() < critChance;
            
            // 基础伤害
            let finalDamage = amount;
            
            // 应用力量加成
            finalDamage += strengthBonus;
            
            // 应用暴击
            if (isCrit) {
                finalDamage *= 1.5;
                rogueLog("暴击！");
            }
            
            // 应用敌人防御
            finalDamage = Math.max(1, finalDamage - e.defense);
            
            // 应用遗物效果
            finalDamage = applyRelicEffects(finalDamage, 'damage');
            
            // 应用祝福效果
            finalDamage = applyBlessingEffects(finalDamage, 'damage');
            
            // 应用诅咒效果
            finalDamage = applyCurseEffects(finalDamage, 'damage');
            
            // 计算最终伤害
            finalDamage = Math.floor(finalDamage);
            
            // 减少敌人生命值
            e.hp -= finalDamage;
            
            // 确保敌人的血量不会变成负数
            if (e.hp < 0) {
                e.hp = 0;
            }
            
            // 记录伤害统计
            rogueState.gameStats.totalDamage += finalDamage;
            
            const dmgText = document.createElement('div');
            dmgText.className = 'damage-number';
            dmgText.innerText = `-${finalDamage}`;
            dmgText.style.left = '50%';
            dmgText.style.top = '20%';
            
            // 暴击伤害显示不同颜色
            if (isCrit) {
                dmgText.style.color = '#ff6b6b';
                dmgText.style.fontSize = '1.5em';
            }
            
            const enemyContainer = document.querySelector('.enemy-container');
            if (enemyContainer) {
                enemyContainer.appendChild(dmgText);
                setTimeout(() => dmgText.remove(), 1000);
            }
        }

        function applyRelicEffects(value, type) {
            let result = value;
            const relics = rogueState.player.relics;
            
            relics.forEach(relic => {
                switch(relic.id) {
                    case 'soldier_shield':
                        // 士兵之盾：战斗开始获得5点格挡
                        if (type === 'combat_start') {
                            rogueState.player.block += 5;
                        }
                        break;
                    case 'alchemist_kit':
                        // 炼金术士工具箱：药剂效果提升20%
                        if (type === 'healing') {
                            result *= 1.2;
                        }
                        break;
                    case 'merchant_coin':
                        // 商人金币：商店商品价格降低10%
                        if (type === 'shop_price') {
                            result *= 0.9;
                        }
                        break;
                    case 'mage_wand':
                        // 魔法师魔杖：战斗开始获得1点额外能量
                        if (type === 'combat_start') {
                            rogueState.player.energy += 1;
                        }
                        break;
                    case 'thief_dagger':
                        // 盗贼匕首：暴击率提升10%
                        if (type === 'crit_chance') {
                            result += 0.1;
                        }
                        break;
                    case 'paladin_amulet':
                        // 圣骑士护符：休息恢复额外10点生命值
                        if (type === 'rest_heal') {
                            result += 10;
                        }
                        break;
                    case 'demon_horn':
                        // 恶魔之角：杀死敌人获得1点力量
                        if (type === 'enemy_killed') {
                            rogueState.player.stats.strength += 1;
                        }
                        break;
                    case 'angel_wing':
                        // 天使之翼：战斗开始获得3点格挡和3点生命值恢复
                        if (type === 'combat_start') {
                            rogueState.player.block += 3;
                            rogueState.player.hp = Math.min(rogueState.player.hp + 3, rogueState.player.maxHp);
                        }
                        break;
                    case 'troll_mask':
                        // 乐子人面具：随机效果范围扩大20%
                        if (type === 'random_range') {
                            result *= 1.2;
                        }
                        break;
                    case 'fool_hat':
                        // 傻子帽子：生命值低于30%时攻击力提升30%
                        if (type === 'damage' && rogueState.player.hp < rogueState.player.maxHp * 0.3) {
                            result *= 1.3;
                        }
                        break;
                    case 'terrorist_bomb':
                        // 恐怖分子炸弹：使用自残技能时伤害提升25%
                        if (type === 'suicide_damage') {
                            result *= 1.25;
                        }
                        break;
                    case 'burner_candle':
                        // 燃烧者蜡烛：火焰伤害提升20%
                        if (type === 'fire_damage') {
                            result *= 1.2;
                        }
                        break;
                    case 'cultist_book':
                        // 异教经书：使用技能卡时有20%几率获得1点额外能量
                        if (type === 'skill_used') {
                            if (Math.random() < 0.2) {
                                rogueState.player.energy = Math.min(rogueState.player.energy + 1, rogueState.player.maxEnergy);
                                rogueLog("获得了1点额外能量！");
                            }
                        }
                        break;
                }
            });
            
            return result;
        }

        function applyBlessingEffects(value, type) {
            let result = value;
            const blessings = rogueState.player.blessings;
            
            blessings.forEach(blessing => {
                switch(blessing.id) {
                    case 'holy_blessing':
                        // 神圣祝福：治疗效果提升15%
                        if (type === 'healing') {
                            result *= 1.15;
                        }
                        break;
                    case 'dark_blessing':
                        // 黑暗祝福：伤害提升10%
                        if (type === 'damage') {
                            result *= 1.1;
                        }
                        break;
                    case 'arcane_blessing':
                        // 奥术祝福：技能效果提升20%
                        if (type === 'skill') {
                            result *= 1.2;
                        }
                        break;
                }
            });
            
            return result;
        }

        function applyCurseEffects(value, type) {
            let result = value;
            const curses = rogueState.player.curses;
            
            curses.forEach(curse => {
                switch(curse.id) {
                    case 'weakness_curse':
                        // 虚弱诅咒：伤害降低15%
                        if (type === 'damage') {
                            result *= 0.85;
                        }
                        break;
                    case 'fatigue_curse':
                        // 疲劳诅咒：能量上限降低1点
                        if (type === 'energy_max') {
                            result -= 1;
                        }
                        break;
                    case 'misfortune_curse':
                        // 不幸诅咒：金币获取减少20%
                        if (type === 'gold_gain') {
                            result *= 0.8;
                        }
                        break;
                    case 'fragility_curse':
                        // 脆弱诅咒：受到伤害增加15%
                        if (type === 'damage_taken') {
                            result *= 1.15;
                        }
                        break;
                    case 'blindness_curse':
                        // 盲目诅咒：暴击率降低10%
                        if (type === 'crit_chance') {
                            result -= 0.1;
                        }
                        break;
                }
            });
            
            return result;
        }

        function checkAchievements(eventType) {
            const p = rogueState.player;
            const stats = rogueState.gameStats;
            
            // 检查各种成就
            switch(eventType) {
                case 'enemy_killed':
                    // 杀死敌人成就
                    if (p.kills >= 10) {
                        unlockAchievement('killer_10', '新手杀手', '杀死10个敌人');
                    }
                    if (p.kills >= 50) {
                        unlockAchievement('killer_50', '连环杀手', '杀死50个敌人');
                    }
                    if (p.kills >= 100) {
                        unlockAchievement('killer_100', '死神', '杀死100个敌人');
                    }
                    break;
                case 'floor_reached':
                    // 到达楼层成就
                    if (rogueState.floor >= 5) {
                        unlockAchievement('explorer_5', '勇敢探索者', '到达第5层');
                    }
                    if (rogueState.floor >= 10) {
                        unlockAchievement('explorer_10', '深渊探索者', '到达第10层');
                    }
                    break;
                case 'gold_collected':
                    // 收集金币成就
                    if (stats.totalGold >= 500) {
                        unlockAchievement('wealthy_500', '小有积蓄', '收集500金币');
                    }
                    if (stats.totalGold >= 1000) {
                        unlockAchievement('wealthy_1000', '富甲一方', '收集1000金币');
                    }
                    break;
            }
        }

        function unlockAchievement(id, name, description) {
            const p = rogueState.player;
            
            // 检查成就是否已经解锁
            if (!p.achievements.some(achievement => achievement.id === id)) {
                p.achievements.push({
                    id: id,
                    name: name,
                    description: description,
                    unlockedAt: new Date().toISOString()
                });
                
                rogueLog(`成就解锁：${name} - ${description}`);
            }
        }

        function checkReputation(eventType) {
            const p = rogueState.player;
            
            switch(eventType) {
                case 'enemy_killed':
                    // 杀死敌人增加underworld声望
                    p.reputation.underworld += 1;
                    break;
                case 'shop_purchase':
                    // 在商店购买增加merchants声望
                    p.reputation.merchants += 2;
                    break;
                case 'rest':
                    // 休息增加church声望
                    p.reputation.church += 1;
                    break;
                case 'event_blessing':
                    // 接受祝福增加church声望
                    p.reputation.church += 3;
                    break;
                case 'event_curse':
                    // 接受诅咒增加underworld声望，但减少church声望
                    p.reputation.underworld += 2;
                    p.reputation.church -= 2;
                    break;
            }
            
            // 确保声望值不会为负数
            p.reputation.merchants = Math.max(0, p.reputation.merchants);
            p.reputation.church = Math.max(0, p.reputation.church);
            p.reputation.underworld = Math.max(0, p.reputation.underworld);
        }

        function rogueTakeDamage(amount) {
            const p = rogueState.player;
            let actual = amount;
            
            // 计算敏捷带来的闪避
            let dodgeChance = p.stats.agility * 0.03; // 每点敏捷增加3%闪避率
            let isDodged = Math.random() < dodgeChance;
            
            if (isDodged) {
                rogueLog("闪避成功！");
                return;
            }
            
            // 应用格挡
            if (p.block > 0) {
                if (p.block >= actual) {
                    p.block -= actual;
                    actual = 0;
                } else {
                    actual -= p.block;
                    p.block = 0;
                }
            }
            
            // 应用遗物效果
            actual = applyRelicEffects(actual, 'damage_taken');
            
            // 应用祝福效果
            actual = applyBlessingEffects(actual, 'damage_taken');
            
            // 应用诅咒效果
            actual = applyCurseEffects(actual, 'damage_taken');
            
            // 减少生命值
            p.hp -= actual;
            
            // 记录伤害统计
            rogueState.gameStats.totalDamage += actual;
            
            // 检查死亡
            rogueRenderHand();
            rogueCheckDeath();
        }

        function rogueCheckWinCondition() {
            if (rogueState.enemy.hp <= 0) {
                rogueState.player.kills++;
                
                // 标记当前房间为已完成
                if (rogueState.currentRoom) {
                    rogueState.currentRoom.completed = true;
                }
                
                let rewardGold = rogueRandInt(15, 30);
                
                // 应用诅咒效果到金币获取
                rewardGold = Math.floor(applyCurseEffects(rewardGold, 'gold_gain'));
                rewardGold = Math.max(1, rewardGold);
                
                document.getElementById('rogue-reward-gold').innerText = rewardGold;
                rogueState.player.gold += rewardGold;
                rogueState.player.hp = Math.min(rogueState.player.hp + 10, rogueState.player.maxHp);
                
                // 记录统计信息
                rogueState.gameStats.totalKills++;
                rogueState.gameStats.totalGold += rewardGold;
                rogueState.gameStats.totalHealing += 10;
                
                // 应用敌人死亡时的遗物效果
                applyRelicEffects(0, 'enemy_killed');
                
                // 应用敌人死亡时的祝福效果
                applyBlessingEffects(0, 'enemy_killed');
                
                // 检查成就
                checkAchievements('enemy_killed');
                
                // 检查声望
                checkReputation('enemy_killed');
                
                soundManager.playVictorySound();
                soundManager.playButtonSound('reward');
                
                switchScreen('rogue-screen-reward');
            }
        }

        function rogueCheckDeath() {
            if (rogueState.player.hp <= 0) {
                if (rogueState.player.buffs['survive']) {
                    rogueState.player.hp = 1;
                    rogueState.player.buffs['survive'] = false;
                    rogueLog("绿帽生效！你苟活了下来！");
                    rogueRenderHand();
                    return;
                }
                soundManager.playDefeatSound();
                switchScreen('rogue-screen-gameover');
            }
        }

        function endRogueTurn() {
            const e = rogueState.enemy;
            
            if (e.poison > 0) {
                rogueDamageEnemy(e.poison);
                e.poison--;
                rogueLog(`敌人受到 ${e.poison + 1} 点毒伤`);
                if(e.hp <= 0) { rogueCheckWinCondition(); return; }
            }
            
            if (e.burn > 0) {
                rogueDamageEnemy(2);
                e.burn--;
                rogueLog(`敌人受到 2 点烧伤`);
                if(e.hp <= 0) { rogueCheckWinCondition(); return; }
            }

            if (!e.stun) {
                const action = e.pattern[e.currentPatternIdx % e.pattern.length];
                let dmg = e.dmg;
                if (e.weak > 0) {
                    dmg = Math.floor(dmg * 0.5);
                    e.weak--;
                }

                switch (action) {
                    case 'atk':
                    case 'strong_atk':
                        let finalDmg = action === 'strong_atk' ? Math.floor(dmg * 1.5) : dmg;
                        rogueLog(`敌人造成了 ${finalDmg} 点伤害`);
                        rogueTakeDamage(finalDmg);
                        break;
                    case 'buff':
                        e.dmg += 3;
                        rogueLog("敌人磨利了刀刃 (攻击力+3)");
                        break;
                    case 'debuff':
                        rogueState.player.energy = Math.max(0, rogueState.player.energy - 1);
                        rogueLog("敌人干扰了你的行动");
                        break;
                    case 'poison':
                        rogueState.player.hp = Math.max(1, rogueState.player.hp - 3);
                        rogueLog("你中毒了！");
                        break;
                    case 'defend':
                        e.defense += 2;
                        rogueLog("敌人防御力提升了！");
                        break;
                }
                e.currentPatternIdx++;
            } else {
                rogueLog("敌人处于眩晕状态，无法行动！");
                e.stun = false;
            }

            rogueState.player.energy = rogueState.player.maxEnergy;
            rogueState.player.block = 0;
            
            e.defense = 0;
            
            rogueState.player.discard.push(...rogueState.player.hand);
            rogueState.player.hand = [];
            
            rogueDrawCards(5);
            rogueUpdateEnemyIntent();
            
            if(rogueState.player.class === 'soldier' && rogueState.player.hp < 30) {
                rogueLog("士兵愤怒了！攻击力提升！");
            }
        }

        function rogueShowShop() {
            document.getElementById('rogue-shop-gold').innerText = rogueState.player.gold;
            const shopItems = document.getElementById('rogue-shop-items');
            shopItems.innerHTML = '';
            
            const items = [
                { id: 'health_potion', name: '生命药剂', price: 20, description: '恢复20点生命值' },
                { id: 'strength_boost', name: '力量增强', price: 40, description: '永久提升8%伤害' },
                { id: 'defense_boost', name: '防御增强', price: 35, description: '永久提升8%防御' },
                { id: 'energy_boost', name: '能量增强', price: 30, description: '永久提升1点能量上限' },
                { id: 'card_pack', name: '卡牌包', price: 50, description: '获得2张随机卡牌' },
                { id: 'key', name: '钥匙', price: 25, description: '打开宝藏房间的宝箱' }
            ];
            
            items.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.style.cssText = `
                    padding: 25px;
                    background: rgba(30, 30, 30, 0.8);
                    backdrop-filter: blur(10px);
                    border-radius: 15px;
                    border: 2px solid rgba(255, 255, 255, 0.1);
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                `;
                
                itemElement.onclick = () => rogueBuyItem(item);
                itemElement.onmouseenter = () => {
                    itemElement.style.background = 'rgba(40, 40, 40, 0.9)';
                    itemElement.style.transform = 'translateY(-10px) scale(1.02)';
                    itemElement.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.3)';
                    itemElement.style.borderColor = 'var(--gold)';
                };
                itemElement.onmouseleave = () => {
                    itemElement.style.background = 'rgba(30, 30, 30, 0.8)';
                    itemElement.style.transform = 'translateY(0) scale(1)';
                    itemElement.style.boxShadow = 'none';
                    itemElement.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                };
                
                itemElement.innerHTML = `
                    <h3 style="margin-bottom: 10px; color: var(--text-main);">${item.name}</h3>
                    <p style="margin-bottom: 15px; color: var(--text-secondary); font-size: 0.9em;">${item.description}</p>
                    <p style="color: var(--gold); font-weight: bold; font-size: 1.1em;">价格: ${item.price}金币</p>
                `;
                
                shopItems.appendChild(itemElement);
            });
            
            switchScreen('rogue-shop-screen');
        }

        function rogueBuyItem(item) {
            if (rogueState.player.gold < item.price) {
                rogueLog('金币不足！');
                soundManager.playButtonSound('error');
                return;
            }
            
            soundManager.playButtonSound('purchase');
            rogueState.player.gold -= item.price;
            
            switch (item.id) {
                case 'health_potion':
                    rogueState.player.hp = Math.min(rogueState.player.hp + 20, rogueState.player.maxHp);
                    rogueLog('你使用了生命药剂，恢复了20点生命值！');
                    break;
                case 'strength_boost':
                    rogueLog('你永久提升了8%的伤害！');
                    break;
                case 'defense_boost':
                    rogueLog('你永久提升了8%的防御！');
                    break;
                case 'energy_boost':
                    rogueState.player.maxEnergy += 1;
                    rogueLog('你永久提升了1点能量上限！');
                    break;
                case 'card_pack':
                    const rewards = ['pig_heart', 'niu_niu', 'poison', 'thunder', 'ban_pass', 'white_flag', 'fireball', 'lightning', 'stealth', 'backstab', 'holy_light', 'holy_strike'];
                    const newCard1 = rewards[rogueRandInt(0, rewards.length-1)];
                    const newCard2 = rewards[rogueRandInt(0, rewards.length-1)];
                    rogueState.player.deck.push(newCard1, newCard2);
                    rogueLog(`获得新卡牌: ${ROGUE_CARDS_DB[newCard1].name} 和 ${ROGUE_CARDS_DB[newCard2].name}`);
                    break;
                case 'key':
                    rogueState.player.keys += 1;
                    rogueLog('你获得了1把钥匙！');
                    break;
            }
            
            rogueShowShop();
        }

        function leaveRogueShop() {
            rogueState.currentRoom.completed = true;
            rogueShowMap();
        }

        function rogueShowEvent() {
            const events = [
                {
                    title: '神秘的陌生人',
                    description: '你遇到了一个神秘的陌生人，他向你提供了一个交易。',
                    options: [
                        { text: '接受交易（支付20金币，获得1张稀有卡牌）', condition: () => rogueState.player.gold >= 20, result: () => {
                            rogueState.player.gold -= 20;
                            const rareCards = ['pig_heart', 'niu_niu', 'thunder', 'fireball', 'holy_strike', 'demonic_power', 'angelic_blessing'];
                            const newCard = rareCards[rogueRandInt(0, rareCards.length-1)];
                            rogueState.player.deck.push(newCard);
                            alert(`你获得了稀有卡牌: ${ROGUE_CARDS_DB[newCard].name}`);
                            leaveRogueEvent();
                        }},
                        { text: '拒绝交易', result: () => {
                            alert('你拒绝了交易，陌生人消失了。');
                            leaveRogueEvent();
                        }}
                    ]
                },
                {
                    title: '古老的祭坛',
                    description: '你发现了一个古老的祭坛，它散发着神秘的光芒。',
                    options: [
                        { text: '献上祭品（10金币）', condition: () => rogueState.player.gold >= 10, result: () => {
                            rogueState.player.gold -= 10;
                            rogueState.player.hp = rogueState.player.maxHp;
                            alert('你的生命值完全恢复了！');
                            leaveRogueEvent();
                        }},
                        { text: '离开', result: () => {
                            alert('你离开了祭坛。');
                            leaveRogueEvent();
                        }}
                    ]
                },
                {
                    title: '宝藏地图',
                    description: '你找到了一张宝藏地图，上面标记着一个隐藏的宝藏。',
                    options: [
                        { text: '跟随地图（消耗1把钥匙）', condition: () => rogueState.player.keys >= 1, result: () => {
                            rogueState.player.keys -= 1;
                            const goldGain = rogueRandInt(50, 100);
                            rogueState.player.gold += goldGain;
                            alert(`你找到了宝藏，获得了${goldGain}金币！`);
                            leaveRogueEvent();
                        }},
                        { text: '放弃', result: () => {
                            alert('你放弃了寻找宝藏。');
                            leaveRogueEvent();
                        }}
                    ]
                },
                {
                    title: '神秘的洞穴',
                    description: '你发现了一个神秘的洞穴，里面传来奇怪的声音。',
                    options: [
                        { text: '进入洞穴', result: () => {
                            const randomEvent = rogueRandInt(1, 4);
                            if (randomEvent === 1) {
                                rogueState.player.hp = Math.max(1, rogueState.player.hp - 15);
                                alert('你在洞穴中遇到了陷阱，受到了15点伤害！');
                            } else if (randomEvent === 2) {
                                const goldGain = rogueRandInt(20, 40);
                                rogueState.player.gold += goldGain;
                                alert(`你在洞穴中找到了${goldGain}金币！`);
                            } else if (randomEvent === 3) {
                                const rareCards = ['pig_heart', 'niu_niu', 'thunder', 'fireball', 'holy_strike'];
                                const newCard = rareCards[rogueRandInt(0, rareCards.length-1)];
                                rogueState.player.deck.push(newCard);
                                alert(`你在洞穴中找到了稀有卡牌: ${ROGUE_CARDS_DB[newCard].name}`);
                            } else {
                                rogueState.player.keys += 1;
                                alert('你在洞穴中找到了一把钥匙！');
                            }
                            leaveRogueEvent();
                        }},
                        { text: '离开', result: () => {
                            alert('你离开了洞穴。');
                            leaveRogueEvent();
                        }}
                    ]
                },
                // 新事件
                {
                    title: '废弃的图书馆',
                    description: '你发现了一个废弃的图书馆，里面堆满了古老的书籍。',
                    options: [
                        { text: '搜索书籍', result: () => {
                            const randomEvent = rogueRandInt(1, 3);
                            if (randomEvent === 1) {
                                const spellCards = ['fireball', 'lightning', 'thunder'];
                                const newCard = spellCards[rogueRandInt(0, spellCards.length-1)];
                                rogueState.player.deck.push(newCard);
                                alert(`你找到了一本魔法书，学会了新法术: ${ROGUE_CARDS_DB[newCard].name}`);
                            } else if (randomEvent === 2) {
                                rogueState.player.hp = Math.max(1, rogueState.player.hp - 10);
                                alert('你被一本书中的陷阱击中，受到了10点伤害！');
                            } else {
                                const goldGain = rogueRandInt(30, 60);
                                rogueState.player.gold += goldGain;
                                alert(`你在书中找到了${goldGain}金币！`);
                            }
                            leaveRogueEvent();
                        }},
                        { text: '离开', result: () => {
                            alert('你离开了图书馆。');
                            leaveRogueEvent();
                        }}
                    ]
                },
                {
                    title: '神圣的泉水',
                    description: '你发现了一处神圣的泉水，泉水散发着治愈的光芒。',
                    options: [
                        { text: '饮用泉水', result: () => {
                            const healAmount = rogueRandInt(20, 30);
                            rogueState.player.hp = Math.min(rogueState.player.hp + healAmount, rogueState.player.maxHp);
                            alert(`你饮用了神圣的泉水，恢复了${healAmount}点生命值！`);
                            leaveRogueEvent();
                        }},
                        { text: '装满水瓶（支付5金币）', condition: () => rogueState.player.gold >= 5, result: () => {
                            rogueState.player.gold -= 5;
                            alert('你装满了水瓶，可以在需要时使用它恢复生命值。');
                            // 这里可以添加一个可使用的物品
                            leaveRogueEvent();
                        }},
                        { text: '离开', result: () => {
                            alert('你离开了神圣的泉水。');
                            leaveRogueEvent();
                        }}
                    ]
                },
                {
                    title: '魔鬼的契约',
                    description: '一个魔鬼出现在你面前，向你提出了一个契约。',
                    options: [
                        { text: '接受契约（失去10点最大生命值，获得3点力量）', result: () => {
                            rogueState.player.maxHp -= 10;
                            rogueState.player.hp = Math.min(rogueState.player.hp, rogueState.player.maxHp);
                            // 这里可以添加力量增益
                            alert('你接受了魔鬼的契约，获得了强大的力量，但失去了一些生命力。');
                            leaveRogueEvent();
                        }},
                        { text: '拒绝契约', result: () => {
                            alert('你拒绝了魔鬼的契约，魔鬼愤怒地消失了。');
                            leaveRogueEvent();
                        }}
                    ]
                },
                {
                    title: '天使的祝福',
                    description: '一个天使出现在你面前，向你提供祝福。',
                    options: [
                        { text: '接受祝福（获得10点最大生命值）', result: () => {
                            rogueState.player.maxHp += 10;
                            rogueState.player.hp += 10;
                            alert('你接受了天使的祝福，获得了更多的生命力。');
                            leaveRogueEvent();
                        }},
                        { text: '请求其他祝福', result: () => {
                            const randomBlessing = rogueRandInt(1, 2);
                            if (randomBlessing === 1) {
                                rogueState.player.gold += 50;
                                alert('天使赐予了你50金币！');
                            } else {
                                const blessingCards = ['angelic_blessing', 'holy_light', 'holy_strike'];
                                const newCard = blessingCards[rogueRandInt(0, blessingCards.length-1)];
                                rogueState.player.deck.push(newCard);
                                alert(`天使赐予了你一张神圣卡牌: ${ROGUE_CARDS_DB[newCard].name}`);
                            }
                            leaveRogueEvent();
                        }},
                        { text: '感谢并离开', result: () => {
                            alert('你感谢了天使的好意，继续你的旅程。');
                            leaveRogueEvent();
                        }}
                    ]
                },
                {
                    title: '商人的货车',
                    description: '你遇到了一个商人的货车，他正在出售各种物品。',
                    options: [
                        { text: '购买物品（支付30金币，获得1张随机卡牌）', condition: () => rogueState.player.gold >= 30, result: () => {
                            rogueState.player.gold -= 30;
                            const allCards = Object.keys(ROGUE_CARDS_DB);
                            const newCard = allCards[rogueRandInt(0, allCards.length-1)];
                            rogueState.player.deck.push(newCard);
                            alert(`你购买了一张卡牌: ${ROGUE_CARDS_DB[newCard].name}`);
                            leaveRogueEvent();
                        }},
                        { text: '讨价还价（支付15金币，获得1张随机卡牌）', condition: () => rogueState.player.gold >= 15, result: () => {
                            rogueState.player.gold -= 15;
                            const commonCards = ['attack', 'defend', 'exchange'];
                            const newCard = commonCards[rogueRandInt(0, commonCards.length-1)];
                            rogueState.player.deck.push(newCard);
                            alert(`你讨价还价成功，以低价购买了一张卡牌: ${ROGUE_CARDS_DB[newCard].name}`);
                            leaveRogueEvent();
                        }},
                        { text: '离开', result: () => {
                            alert('你离开了商人的货车。');
                            leaveRogueEvent();
                        }}
                    ]
                },
                {
                    title: '神秘的传送门',
                    description: '你发现了一个神秘的传送门，它散发着诡异的光芒。',
                    options: [
                        { text: '进入传送门', result: () => {
                            const randomEvent = rogueRandInt(1, 4);
                            if (randomEvent === 1) {
                                rogueState.player.gold += 100;
                                alert('传送门将你带到了一个宝藏房间，你获得了100金币！');
                            } else if (randomEvent === 2) {
                                rogueState.player.hp = Math.max(1, rogueState.player.hp - 20);
                                alert('传送门将你带到了一个陷阱房间，受到了20点伤害！');
                            } else if (randomEvent === 3) {
                                const rareCards = ['demonic_power', 'angelic_blessing', 'chaos_bolt', 'apocalypse'];
                                const newCard = rareCards[rogueRandInt(0, rareCards.length-1)];
                                rogueState.player.deck.push(newCard);
                                alert(`传送门将你带到了一个卡牌房间，你获得了稀有卡牌: ${ROGUE_CARDS_DB[newCard].name}`);
                            } else {
                                rogueState.player.keys += 2;
                                alert('传送门将你带到了一个钥匙房间，你获得了2把钥匙！');
                            }
                            leaveRogueEvent();
                        }},
                        { text: '离开', result: () => {
                            alert('你离开了传送门。');
                            leaveRogueEvent();
                        }}
                    ]
                }
            ];
            
            const randomEvent = events[rogueRandInt(0, events.length-1)];
            document.getElementById('rogue-event-title').innerText = randomEvent.title;
            document.getElementById('rogue-event-description').innerText = randomEvent.description;
            
            const eventOptions = document.getElementById('rogue-event-options');
            eventOptions.innerHTML = '';
            
            randomEvent.options.forEach(option => {
                const button = document.createElement('button');
                button.className = 'btn';
                button.innerText = option.text;
                
                if (option.condition && !option.condition()) {
                    button.disabled = true;
                    button.style.opacity = 0.5;
                }
                
                button.onclick = option.result;
                eventOptions.appendChild(button);
            });
            
            switchScreen('rogue-event-screen');
        }

        function leaveRogueEvent() {
            rogueState.currentRoom.completed = true;
            rogueShowMap();
        }

        function rogueShowTreasure() {
            const treasureItems = document.getElementById('rogue-treasure-items');
            treasureItems.innerHTML = '';
            
            if (rogueState.player.keys === 0) {
                treasureItems.innerHTML = '<p style="color: var(--text-secondary);">你需要一把钥匙来打开宝箱！</p>';
            } else {
                const rewards = [
                    { name: '金币', value: rogueRandInt(30, 60) },
                    { name: '卡牌', value: ROGUE_CARDS_DB[[ 'pig_heart', 'niu_niu', 'thunder', 'fireball', 'lightning', 'stealth', 'backstab', 'holy_light', 'holy_strike' ][rogueRandInt(0, 8)]].name },
                    { name: '生命值', value: 30 }
                ];
                
                rewards.forEach(reward => {
                    const rewardElement = document.createElement('div');
                    rewardElement.style.cssText = `
                        padding: 25px;
                        background: linear-gradient(135deg, var(--gold), #ffd700);
                        border-radius: 15px;
                        margin: 15px 0;
                        text-align: center;
                        color: #000;
                        font-weight: bold;
                        box-shadow: 0 10px 30px rgba(255, 165, 2, 0.4);
                        transition: all 0.3s ease;
                    `;
                    
                    rewardElement.onmouseenter = () => {
                        rewardElement.style.transform = 'scale(1.05) translateY(-5px)';
                        rewardElement.style.boxShadow = '0 15px 40px rgba(255, 165, 2, 0.6)';
                    };
                    
                    rewardElement.onmouseleave = () => {
                        rewardElement.style.transform = 'scale(1) translateY(0)';
                        rewardElement.style.boxShadow = '0 10px 30px rgba(255, 165, 2, 0.4)';
                    };
                    
                    rewardElement.innerHTML = `
                        <h3>获得${reward.name}:</h3>
                        <p style="font-size: 1.2em;">${reward.value}</p>
                    `;
                    treasureItems.appendChild(rewardElement);
                    
                    switch (reward.name) {
                        case '金币':
                            rogueState.player.gold += reward.value;
                            break;
                        case '卡牌':
                            const cardKey = Object.keys(ROGUE_CARDS_DB).find(key => ROGUE_CARDS_DB[key].name === reward.value);
                            if (cardKey) {
                                rogueState.player.deck.push(cardKey);
                            }
                            break;
                        case '生命值':
                            rogueState.player.hp = Math.min(rogueState.player.hp + reward.value, rogueState.player.maxHp);
                            break;
                    }
                });
                
                rogueState.player.keys -= 1;
            }
            
            switchScreen('rogue-treasure-screen');
        }

        function leaveRogueTreasure() {
            rogueState.currentRoom.completed = true;
            rogueShowMap();
        }

        function rogueShowRest() {
            document.getElementById('rogue-rest-hp').innerText = rogueState.player.hp;
            document.getElementById('rogue-rest-max-hp').innerText = rogueState.player.maxHp;
            switchScreen('rogue-rest-screen');
        }

        function rogueRest() {
            if (rogueState.restDisabled) {
                alert('你受到了"永不停歇"挑战的影响，无法在休息房间恢复生命值！');
                leaveRogueRest();
                return;
            }
            
            let healAmount = 20;
            
            // 应用圣骑士护符效果
            healAmount = applyRelicEffects(healAmount, 'rest_heal');
            
            // 应用祝福效果
            healAmount = applyBlessingEffects(healAmount, 'healing');
            
            // 应用诅咒效果
            healAmount = Math.floor(applyCurseEffects(healAmount, 'healing'));
            healAmount = Math.max(1, healAmount);
            
            rogueState.player.hp = Math.min(rogueState.player.hp + healAmount, rogueState.player.maxHp);
            alert(`你休息了一会儿，恢复了${healAmount}点生命值！`);
            
            // 检查声望
            checkReputation('rest');
            
            leaveRogueRest();
        }

        function leaveRogueRest() {
            rogueState.currentRoom.completed = true;
            rogueShowMap();
        }

        function rogueShowBoss() {
            const bossInfo = document.getElementById('rogue-boss-info');
            bossInfo.innerHTML = '';
            
            const bosses = ROGUE_ENEMIES.filter(e => e.isBoss);
            const boss = bosses[rogueRandInt(0, bosses.length - 1)];
            
            const bossElement = document.createElement('div');
            bossElement.style.cssText = `
                padding: 30px;
                background: rgba(30, 30, 30, 0.9);
                backdrop-filter: blur(10px);
                border-radius: 20px;
                text-align: center;
                border: 2px solid var(--highlight);
                box-shadow: 0 0 30px rgba(255, 71, 87, 0.3);
            `;
            
            bossElement.innerHTML = `
                <div style="font-size:4em; margin-bottom: 20px; filter: drop-shadow(0 0 20px var(--highlight));">👹</div>
                <h3 style="margin-bottom: 15px; color: var(--text-main);">${boss.name}</h3>
                <p style="margin-bottom: 20px; color: var(--text-secondary);">最终BOSS，拥有强大的攻击力和多种技能。</p>
                <p style="margin-bottom: 10px; color: var(--text-secondary);">生命值: ${boss.hp}</p>
                <p style="margin-bottom: 10px; color: var(--text-secondary);">攻击力: ${boss.dmg}</p>
            `;
            
            bossInfo.appendChild(bossElement);
            
            switchScreen('rogue-boss-screen');
        }

        function startRogueBossBattle() {
            const bosses = ROGUE_ENEMIES.filter(e => e.isBoss);
            const bossTemplate = bosses[rogueRandInt(0, bosses.length - 1)];
            
            rogueState.enemy = {
                ...bossTemplate,
                maxHp: bossTemplate.hp,
                currentPatternIdx: 0,
                poison: 0,
                weak: 0,
                stun: false,
                burn: 0,
                defense: 0
            };
            
            rogueState.player.drawPile = rogueShuffle([...rogueState.player.deck]);
            rogueState.player.discard = [];
            rogueState.player.hand = [];
            rogueState.player.block = 0;
            rogueState.player.energy = rogueState.player.maxEnergy;
            rogueState.player.buffs = {};

            rogueUpdateUI();
            rogueUpdateEnemyIntent();
            rogueDrawCards(5);
            rogueLog(`遭遇了 ${rogueState.enemy.name}!`);
            
            switchScreen('rogue-battle-scene');
        }

        function leaveRogueBoss() {
            rogueState.player.gold = 0;
            alert('你逃跑了，失去了所有金币！');
            rogueState.currentRoom.completed = true;
            rogueShowMap();
        }

        function rogueNextFloor() {
            // 检查当前楼层的所有房间是否都已完成
            const allRoomsCompleted = rogueState.rooms.every(room => room.completed);
            
            if (!allRoomsCompleted) {
                alert('你需要完成当前楼层的所有房间才能继续前进！');
                document.getElementById('rogue-screen-reward').classList.add('hidden');
                rogueShowMap();
                return;
            }
            
            rogueState.floor++;
            if (rogueState.floor > 10) {
                switchScreen('rogue-screen-win');
                return;
            }
            
            const rewards = ['pig_heart', 'niu_niu', 'poison', 'thunder', 'ban_pass', 'white_flag', 'fireball', 'lightning', 'stealth', 'backstab', 'holy_light', 'holy_strike'];
            const newCard = rewards[rogueRandInt(0, rewards.length-1)];
            rogueState.player.deck.push(newCard);
            alert(`获得新卡牌: ${ROGUE_CARDS_DB[newCard].name}`);

            document.getElementById('rogue-screen-reward').classList.add('hidden');
            
            rogueGenerateRooms();
            rogueShowMap();
        }

        function restartRogueGame() {
            location.reload();
        }
        
        function rogueReturnToMap() {
            document.getElementById('rogue-screen-reward').classList.add('hidden');
            rogueShowMap();
        }
        
        function rogueSkipFloor() {
            if (rogueState.floor === 10) {
                alert('最后一层不能跳关，你必须面对最终BOSS！');
                return;
            }
            
            if (confirm('确定要跳过当前楼层吗？这将直接进入下一层。')) {
                rogueState.floor++;
                if (rogueState.floor > 10) {
                    switchScreen('rogue-screen-win');
                    return;
                }
                
                const rewards = ['pig_heart', 'niu_niu', 'poison', 'thunder', 'ban_pass', 'white_flag', 'fireball', 'lightning', 'stealth', 'backstab', 'holy_light', 'holy_strike'];
                const newCard = rewards[rogueRandInt(0, rewards.length-1)];
                rogueState.player.deck.push(newCard);
                alert(`获得新卡牌: ${ROGUE_CARDS_DB[newCard].name}`);

                document.getElementById('rogue-screen-reward').classList.add('hidden');
                
                rogueGenerateRooms();
                rogueShowMap();
            }
        }
        
        function saveRogueSettings() {
            const soundVolume = document.getElementById('rogue-sound-volume').value;
            const musicVolume = document.getElementById('rogue-music-volume').value;
            const difficulty = document.getElementById('rogue-game-difficulty').value;
            const gameSpeed = document.getElementById('rogue-game-speed').value;
            
            // 保存设置到localStorage
            localStorage.setItem('rogueSoundVolume', soundVolume);
            localStorage.setItem('rogueMusicVolume', musicVolume);
            localStorage.setItem('rogueDifficulty', difficulty);
            localStorage.setItem('rogueGameSpeed', gameSpeed);
            
            // 更新游戏设置
            gameSettings.soundVolume = parseInt(soundVolume);
            gameSettings.musicVolume = parseInt(musicVolume);
            gameSettings.difficulty = difficulty;
            gameSettings.gameSpeed = gameSpeed;
            
            alert('设置保存成功！');
            soundManager.playButtonSound();
        }

        // ==================== 横屏检测功能 ====================
        function checkOrientation() {
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const isPortrait = window.innerHeight > window.innerWidth;
            const landscapePrompt = document.getElementById('landscape-prompt');
            
            if (isMobile && isPortrait && landscapePrompt) {
                landscapePrompt.style.display = 'flex';
            } else if (landscapePrompt) {
                landscapePrompt.style.display = 'none';
            }
        }
        
        // 初始化横屏检测
        window.addEventListener('resize', checkOrientation);
        window.addEventListener('orientationchange', checkOrientation);
        
        // 点击继续按钮关闭提示
        document.addEventListener('DOMContentLoaded', function() {
            const dismissBtn = document.getElementById('dismiss-landscape');
            if (dismissBtn) {
                dismissBtn.addEventListener('click', function() {
                    const landscapePrompt = document.getElementById('landscape-prompt');
                    if (landscapePrompt) {
                        landscapePrompt.style.display = 'none';
                    }
                });
            }
            // 初始检查
            setTimeout(checkOrientation, 100);
        });

        // ==================== 页面加载完成 ====================
        window.addEventListener('load', function() {
            console.log('页面加载完成，初始化游戏...');
            
            // 无论如何都要隐藏加载屏幕并显示游戏容器
            try {
                const loadingScreen = document.getElementById('loading-screen');
                if (loadingScreen) {
                    loadingScreen.style.display = 'none';
                }
                
                const gameContainer = document.getElementById('game-container');
                if (gameContainer) {
                    gameContainer.style.display = 'block';
                }
                console.log('加载屏幕已隐藏，游戏容器已显示');
            } catch (err) {
                console.error('显示游戏界面失败:', err);
            }
            
            // 初始化游戏系统
            try {
                initGame();
                console.log('游戏准备就绪！');
            } catch (error) {
                console.error('游戏初始化过程中出现严重错误:', error);
                // 即使初始化失败，也要确保游戏界面是可见的
                try {
                    const loadingScreen = document.getElementById('loading-screen');
                    if (loadingScreen) {
                        loadingScreen.style.display = 'none';
                    }
                    
                    const gameContainer = document.getElementById('game-container');
                    if (gameContainer) {
                        gameContainer.style.display = 'block';
                    }
                } catch (err) {
                    console.error('最终显示游戏界面失败:', err);
                }
            }
        });
