class SimpleMultiplayer {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.peer = null;
        this.connections = new Map();
        this.localPeerId = null;
        this.roomCode = null;
        this.isHost = false;
        this.players = new Map();
        this.playerName = '玩家';
        this.maxPlayers = 6;
        
        this.init();
    }

    init() {
        console.log('初始化 SimpleMultiplayer 联机系统');
        
        const savedName = localStorage.getItem('playerName');
        if (savedName) {
            this.playerName = savedName;
            const nameInput = document.getElementById('player-name');
            const joinNameInput = document.getElementById('join-player-name');
            if (nameInput) nameInput.value = savedName;
            if (joinNameInput) joinNameInput.value = savedName;
        }
    }

    generateRoomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    createRoom(playerName = null) {
        return new Promise((resolve) => {
            try {
                this.isHost = true;
                this.roomCode = this.generateRoomCode();
                this.playerName = playerName || document.getElementById('player-name')?.value || '玩家';
                localStorage.setItem('playerName', this.playerName);

                this.peer = new Peer(this.roomCode + '_host', {
                    debug: 2
                });

                this.peer.on('open', (id) => {
                    this.localPeerId = id;
                    console.log('PeerJS 连接成功，房间码:', this.roomCode);
                    
                    this.players.set(this.localPeerId, {
                        id: this.localPeerId,
                        name: this.playerName,
                        isHost: true,
                        isReady: true
                    });

                    this.peer.on('connection', (conn) => {
                        console.log('新玩家连接:', conn.peer);
                        this.handleIncomingConnection(conn);
                    });

                    this.showNotification('房间创建成功！房间码: ' + this.roomCode, 'success');
                    this.updateRoomUI();
                    this.updatePlayerList();
                    
                    resolve(true);
                });

                this.peer.on('error', (err) => {
                    console.error('PeerJS 错误:', err);
                    this.showNotification('创建房间失败: ' + err.type, 'error');
                    resolve(false);
                });

            } catch (error) {
                console.error('创建房间失败:', error);
                this.showNotification('创建房间失败', 'error');
                resolve(false);
            }
        });
    }

    handleIncomingConnection(conn) {
        conn.on('open', () => {
            console.log('与玩家建立连接:', conn.peer);
            this.connections.set(conn.peer, conn);
            this.setupConnectionHandlers(conn);
        });
    }

    setupConnectionHandlers(conn) {
        conn.on('data', (data) => {
            this.handleMessage(data, conn.peer);
        });

        conn.on('close', () => {
            console.log('玩家断开连接:', conn.peer);
            this.connections.delete(conn.peer);
            const player = this.players.get(conn.peer);
            if (player) {
                this.players.delete(conn.peer);
                this.updatePlayerList();
                this.broadcast({
                    type: 'playerLeft',
                    playerId: conn.peer
                });
                this.addChatMessage('系统', `${player.name} 离开了房间`, true);
            }
        });

        conn.on('error', (err) => {
            console.error('连接错误:', err);
        });
    }

    joinRoom(roomCode, playerName = null) {
        return new Promise((resolve) => {
            try {
                this.isHost = false;
                this.roomCode = roomCode.toUpperCase();
                
                this.playerName = playerName || document.getElementById('join-player-name')?.value || '玩家';
                localStorage.setItem('playerName', this.playerName);

                this.peer = new Peer(undefined, {
                    debug: 2
                });

                this.peer.on('open', (id) => {
                    this.localPeerId = id;
                    console.log('PeerJS 连接成功，准备加入房间:', this.roomCode);

                    const hostId = this.roomCode + '_host';
                    const conn = this.peer.connect(hostId);

                    conn.on('open', () => {
                        console.log('成功连接到主机');
                        this.connections.set(hostId, conn);
                        this.setupConnectionHandlers(conn);

                        conn.send({
                            type: 'joinRequest',
                            playerId: this.localPeerId,
                            playerName: this.playerName
                        });

                        resolve(true);
                    });

                    conn.on('error', (err) => {
                        console.error('连接失败:', err);
                        this.showNotification('无法连接到房间', 'error');
                        resolve(false);
                    });
                });

                this.peer.on('error', (err) => {
                    console.error('PeerJS 错误:', err);
                    this.showNotification('连接失败: ' + err.type, 'error');
                    resolve(false);
                });

            } catch (error) {
                console.error('加入房间失败:', error);
                this.showNotification('加入房间失败', 'error');
                resolve(false);
            }
        });
    }

    handleMessage(data, senderId) {
        console.log('收到消息:', data.type, '来自:', senderId);

        switch (data.type) {
            case 'joinRequest':
                this.handleJoinRequest(data, senderId);
                break;
            case 'joinAccepted':
                this.handleJoinAccepted(data);
                break;
            case 'joinRejected':
                this.handleJoinRejected(data);
                break;
            case 'playerJoined':
                this.handlePlayerJoined(data);
                break;
            case 'playerLeft':
                this.handlePlayerLeft(data);
                break;
            case 'roomState':
                this.handleRoomState(data);
                break;
            case 'chatMessage':
                this.handleChatMessage(data, senderId);
                break;
            case 'playerReady':
                this.handlePlayerReady(data);
                break;
            case 'gameStart':
                this.handleGameStart(data);
                break;
            case 'kicked':
                this.handleKicked(data);
                break;
        }
    }

    handleJoinRequest(data, senderId) {
        if (!this.isHost) return;

        if (this.players.size >= this.maxPlayers) {
            const conn = this.connections.get(senderId);
            if (conn) {
                conn.send({
                    type: 'joinRejected',
                    reason: '房间已满'
                });
            }
            return;
        }

        const newPlayer = {
            id: data.playerId,
            name: data.playerName,
            isHost: false,
            isReady: false
        };

        this.players.set(data.playerId, newPlayer);

        const conn = this.connections.get(senderId);
        if (conn) {
            conn.send({
                type: 'joinAccepted',
                players: Array.from(this.players.values()),
                roomCode: this.roomCode
            });
        }

        this.broadcast({
            type: 'playerJoined',
            player: newPlayer
        });

        this.updatePlayerList();
        this.showNotification(data.playerName + ' 加入了房间', 'info');
        this.addChatMessage('系统', `${data.playerName} 加入了房间`, true);
    }

    handleJoinAccepted(data) {
        this.players.clear();
        data.players.forEach(player => {
            this.players.set(player.id, player);
        });

        this.updateRoomUI();
        this.updatePlayerList();
        this.showNotification('成功加入房间', 'success');
    }

    handleJoinRejected(data) {
        this.showNotification('加入失败: ' + data.reason, 'error');
        this.leaveRoom();
    }

    handlePlayerJoined(data) {
        this.players.set(data.player.id, data.player);
        this.updatePlayerList();
        this.showNotification(data.player.name + ' 加入了房间', 'info');
        this.addChatMessage('系统', `${data.player.name} 加入了房间`, true);
    }

    handlePlayerLeft(data) {
        const player = this.players.get(data.playerId);
        this.players.delete(data.playerId);
        this.updatePlayerList();
        if (player) {
            this.addChatMessage('系统', `${player.name} 离开了房间`, true);
        }
    }

    handleRoomState(data) {
        this.players.clear();
        data.players.forEach(player => {
            this.players.set(player.id, player);
        });
        this.updatePlayerList();
    }

    handleChatMessage(data, senderId) {
        this.addChatMessage(data.playerName, data.message, data.isSystem);
        
        if (this.isHost) {
            this.broadcast(data);
        }
    }

    handlePlayerReady(data) {
        const player = this.players.get(data.playerId);
        if (player) {
            player.isReady = data.isReady;
            this.updatePlayerList();
            
            const status = data.isReady ? '已准备' : '取消准备';
            this.addChatMessage('系统', `${player.name} ${status}`, true);
        }
        
        if (this.isHost) {
            this.broadcast(data);
        }
    }

    handleGameStart(data) {
        this.showNotification('游戏开始！', 'success');
        if (this.gameManager) {
            this.gameManager.isMultiplayer = true;
            this.gameManager.multiplayerManager = this;
        }
        
        if (typeof switchScreen === 'function') {
            switchScreen('class-selection-screen');
        }
    }

    handleKicked(data) {
        this.showNotification('你被房主踢出了房间', 'error');
        this.leaveRoom();
        if (typeof switchScreen === 'function') {
            switchScreen('main-menu');
        }
    }

    broadcast(data) {
        this.connections.forEach((conn) => {
            try {
                conn.send(data);
            } catch (e) {
                console.error('发送消息失败:', e);
            }
        });
    }

    sendToHost(data) {
        const hostId = this.roomCode + '_host';
        const conn = this.connections.get(hostId);
        if (conn) {
            conn.send(data);
        }
    }

    toggleReady() {
        const localPlayer = this.players.get(this.localPeerId);
        if (!localPlayer || localPlayer.isHost) return;
        
        localPlayer.isReady = !localPlayer.isReady;
        this.updatePlayerList();
        
        const status = localPlayer.isReady ? '已准备' : '取消准备';
        this.showNotification(`你${status}`, 'info');
        
        const readyData = {
            type: 'playerReady',
            playerId: this.localPeerId,
            isReady: localPlayer.isReady
        };
        
        this.sendToHost(readyData);
    }

    kickPlayer(playerId) {
        if (!this.isHost) return;
        
        const player = this.players.get(playerId);
        if (!player || player.isHost) return;
        
        const conn = this.connections.get(playerId);
        if (conn) {
            conn.send({
                type: 'kicked'
            });
            conn.close();
        }
        
        this.connections.delete(playerId);
        this.players.delete(playerId);
        this.updatePlayerList();
        
        this.broadcast({
            type: 'playerLeft',
            playerId: playerId
        });
        
        this.showNotification(`已踢出 ${player.name}`, 'info');
        this.addChatMessage('系统', `${player.name} 被踢出了房间`, true);
    }

    sendChatMessage(message) {
        const chatData = {
            type: 'chatMessage',
            playerId: this.localPeerId,
            playerName: this.playerName,
            message: message,
            isSystem: false
        };

        this.addChatMessage(this.playerName, message, false);
        
        if (this.isHost) {
            this.broadcast(chatData);
        } else {
            this.sendToHost(chatData);
        }
    }

    addChatMessage(playerName, message, isSystem = false) {
        const messagesContainer = document.getElementById('room-chat-messages');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message' + (isSystem ? ' system' : '');
        messageDiv.innerHTML = `<strong>${playerName}:</strong> ${message}`;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    updateRoomUI() {
        const roomIdInput = document.getElementById('room-id');
        if (roomIdInput) {
            roomIdInput.value = this.roomCode || '';
        }
    }

    updatePlayerList() {
        const playerListContainer = document.getElementById('room-players');
        if (!playerListContainer) return;

        playerListContainer.innerHTML = '';
        
        this.players.forEach((player) => {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player-list-item';
            
            const isLocalPlayer = player.id === this.localPeerId;
            
            let statusText = player.isReady ? '✓ 已准备' : '✗ 未准备';
            if (player.isHost) {
                statusText = '👑 房主';
            }
            
            let kickButton = '';
            if (this.isHost && !player.isHost && !isLocalPlayer) {
                kickButton = `<button class="kick-btn" onclick="simpleMultiplayer.kickPlayer('${player.id}')" style="margin-left: 10px; padding: 2px 8px; background: rgba(231, 76, 60, 0.3); border: none; border-radius: 4px; color: #e74c3c; cursor: pointer; font-size: 12px;">踢出</button>`;
            }
            
            playerDiv.innerHTML = `
                <div class="player-avatar-small">👤</div>
                <div style="flex: 1;">
                    <div style="font-weight: bold;">${player.name} ${isLocalPlayer ? '(你)' : ''}</div>
                    <div style="font-size: 0.8rem; color: #a5b1c2;">${statusText}</div>
                </div>
                ${kickButton}
            `;
            playerListContainer.appendChild(playerDiv);
        });

        this.updateStartButton();
        this.updateReadyButton();
    }

    updateStartButton() {
        const startButton = document.getElementById('start-multiplayer-game');
        if (!startButton) return;
        
        if (!this.isHost) {
            startButton.innerHTML = '<i class="fas fa-play"></i> 等待房主开始';
            startButton.disabled = true;
            startButton.style.display = 'block';
            return;
        }
        
        let allReady = true;
        let playerCount = 0;
        
        this.players.forEach(player => {
            playerCount++;
            if (!player.isReady) {
                allReady = false;
            }
        });
        
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
        
        startButton.style.display = 'block';
    }

    updateReadyButton() {
        const readyButton = document.getElementById('toggle-ready');
        if (!readyButton) return;
        
        const localPlayer = this.players.get(this.localPeerId);
        if (!localPlayer || localPlayer.isHost) {
            readyButton.style.display = 'none';
            return;
        }
        
        readyButton.style.display = 'block';
        
        if (localPlayer.isReady) {
            readyButton.innerHTML = '<i class="fas fa-times"></i> 取消准备';
            readyButton.style.background = 'rgba(231, 76, 60, 0.2)';
        } else {
            readyButton.innerHTML = '<i class="fas fa-check"></i> 准备';
            readyButton.style.background = 'rgba(46, 204, 113, 0.2)';
        }
    }

    leaveRoom() {
        this.connections.forEach((conn) => {
            conn.close();
        });
        this.connections.clear();
        this.players.clear();
        
        if (this.peer) {
            this.peer.destroy();
            this.peer = null;
        }

        this.roomCode = null;
        this.isHost = false;
        this.showNotification('已离开房间', 'info');
    }

    startGame() {
        if (!this.isHost) {
            this.showNotification('只有房主才能开始游戏', 'error');
            return;
        }
        
        let allReady = true;
        let playerCount = 0;
        
        this.players.forEach(player => {
            playerCount++;
            if (!player.isReady) {
                allReady = false;
            }
        });
        
        if (playerCount < 2) {
            this.showNotification('至少需要2名玩家才能开始游戏', 'error');
            return;
        }
        
        if (!allReady) {
            this.showNotification('请等待所有玩家准备就绪', 'error');
            return;
        }

        this.broadcast({
            type: 'gameStart'
        });

        this.handleGameStart({});
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

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .chat-message.system {
        color: #a5b1c2;
        font-style: italic;
    }
    .kick-btn:hover {
        background: rgba(231, 76, 60, 0.5) !important;
    }
`;
document.head.appendChild(style);

let simpleMultiplayer = null;
