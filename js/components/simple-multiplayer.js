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
                        isHost: true
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
            case 'gameStart':
                this.handleGameStartRequest(data, senderId);
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
            isHost: false
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
    }

    handlePlayerLeft(data) {
        this.players.delete(data.playerId);
        this.updatePlayerList();
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

    handleGameStartRequest(data, senderId) {
        if (this.isHost) {
            let playerCount = this.players.size;
            
            if (playerCount < 2) {
                this.showNotification('至少需要2名玩家才能开始游戏', 'error');
                return;
            }
            
            this.broadcast({
                type: 'gameStart'
            });
            
            this.handleGameStart({});
        } else {
            this.handleGameStart({});
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
            
            playerDiv.innerHTML = `
                <div class="player-avatar-small">👤</div>
                <div style="flex: 1;">
                    <div style="font-weight: bold;">${player.name} ${player.isHost ? '👑' : ''} ${isLocalPlayer ? '(你)' : ''}</div>
                </div>
            `;
            playerListContainer.appendChild(playerDiv);
        });

        this.updateStartButton();
    }

    updateStartButton() {
        const startButton = document.getElementById('start-multiplayer-game');
        if (!startButton) return;
        
        let playerCount = this.players.size;
        
        if (playerCount < 2) {
            startButton.innerHTML = '<i class="fas fa-play"></i> 等待更多玩家...';
            startButton.disabled = true;
        } else {
            startButton.innerHTML = '<i class="fas fa-play"></i> 开始游戏';
            startButton.disabled = false;
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
        let playerCount = this.players.size;
        
        if (playerCount < 2) {
            this.showNotification('至少需要2名玩家才能开始游戏', 'error');
            return;
        }

        if (this.isHost) {
            this.broadcast({
                type: 'gameStart'
            });
        } else {
            this.sendToHost({
                type: 'gameStart'
            });
        }

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
`;
document.head.appendChild(style);
