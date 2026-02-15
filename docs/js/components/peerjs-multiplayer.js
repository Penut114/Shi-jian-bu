class PeerJSMultiplayerManager {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.peer = null;
        this.connections = new Map();
        this.localPeerId = null;
        this.roomId = null;
        this.isHost = false;
        this.players = new Map();
        this.playerName = "玩家";
        this.roomName = "";
        this.roomPassword = "";
        this.maxPlayers = 4;
        this.aiCount = 0;
        
        this.init();
    }

    init() {
        console.log("初始化 PeerJS 联机系统");
        
        const savedName = localStorage.getItem('playerName');
        if (savedName) {
            this.playerName = savedName;
            const nameInput = document.getElementById('player-name');
            const joinNameInput = document.getElementById('join-player-name');
            if (nameInput) nameInput.value = savedName;
            if (joinNameInput) joinNameInput.value = savedName;
        }
    }

    generateRoomId() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    async createRoom(roomName, password = "", maxPlayers = 4, aiCount = 0, playerName = "玩家") {
        return new Promise((resolve) => {
            try {
                this.isHost = true;
                this.roomId = this.generateRoomId();
                this.roomName = roomName;
                this.roomPassword = password;
                this.maxPlayers = maxPlayers;
                this.aiCount = aiCount;
                
                this.playerName = playerName || document.getElementById('player-name')?.value || "玩家";
                localStorage.setItem('playerName', this.playerName);

                this.peer = new Peer(this.roomId + '_host', {
                    debug: 2
                });

                this.peer.on('open', (id) => {
                    this.localPeerId = id;
                    console.log("PeerJS 连接成功，房间 ID:", this.roomId);
                    
                    this.players.set(this.localPeerId, {
                        id: this.localPeerId,
                        name: this.playerName,
                        isHost: true,
                        isReady: false,
                        class: null
                    });

                    for (let i = 0; i < aiCount; i++) {
                        const aiId = 'ai_' + Math.random().toString(36).substring(2, 10);
                        this.players.set(aiId, {
                            id: aiId,
                            name: `AI${i + 1}`,
                            isHost: false,
                            isReady: true,
                            class: null,
                            isAI: true
                        });
                    }

                    this.peer.on('connection', (conn) => {
                        console.log("新玩家连接:", conn.peer);
                        this.handleIncomingConnection(conn);
                    });

                    this.showNotification("房间创建成功！房间 ID: " + this.roomId, "success");
                    this.updateRoomUI();
                    this.updatePlayerList();
                    
                    resolve(true);
                });

                this.peer.on('error', (err) => {
                    console.error("PeerJS 错误:", err);
                    this.showNotification("创建房间失败: " + err.type, "error");
                    resolve(false);
                });

            } catch (error) {
                console.error("创建房间失败:", error);
                this.showNotification("创建房间失败", "error");
                resolve(false);
            }
        });
    }

    handleIncomingConnection(conn) {
        conn.on('open', () => {
            console.log("与玩家建立连接:", conn.peer);
            this.connections.set(conn.peer, conn);
            this.setupConnectionHandlers(conn);
        });
    }

    setupConnectionHandlers(conn) {
        conn.on('data', (data) => {
            this.handleMessage(data, conn.peer);
        });

        conn.on('close', () => {
            console.log("玩家断开连接:", conn.peer);
            this.connections.delete(conn.peer);
            const player = this.players.get(conn.peer);
            if (player && !player.isAI) {
                this.players.delete(conn.peer);
                this.updatePlayerList();
                this.broadcast({
                    type: 'playerLeft',
                    playerId: conn.peer
                });
            }
        });

        conn.on('error', (err) => {
            console.error("连接错误:", err);
        });
    }

    async joinRoom(roomId, password = "", playerName = "玩家") {
        return new Promise((resolve) => {
            try {
                this.isHost = false;
                this.roomId = roomId.toUpperCase();
                
                this.playerName = playerName || document.getElementById('join-player-name')?.value || "玩家";
                localStorage.setItem('playerName', this.playerName);

                this.peer = new Peer(undefined, {
                    debug: 2
                });

                this.peer.on('open', (id) => {
                    this.localPeerId = id;
                    console.log("PeerJS 连接成功，准备加入房间:", this.roomId);

                    const hostId = this.roomId + '_host';
                    const conn = this.peer.connect(hostId);

                    conn.on('open', () => {
                        console.log("成功连接到房主");
                        this.connections.set(hostId, conn);
                        this.setupConnectionHandlers(conn);

                        conn.send({
                            type: 'joinRequest',
                            playerId: this.localPeerId,
                            playerName: this.playerName,
                            password: password
                        });

                        resolve(true);
                    });

                    conn.on('error', (err) => {
                        console.error("连接失败:", err);
                        this.showNotification("无法连接到房间", "error");
                        resolve(false);
                    });
                });

                this.peer.on('error', (err) => {
                    console.error("PeerJS 错误:", err);
                    this.showNotification("连接失败: " + err.type, "error");
                    resolve(false);
                });

            } catch (error) {
                console.error("加入房间失败:", error);
                this.showNotification("加入房间失败", "error");
                resolve(false);
            }
        });
    }

    handleMessage(data, senderId) {
        console.log("收到消息:", data.type, "来自:", senderId);

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
                this.handleChatMessage(data);
                break;
            case 'playerReady':
                this.handlePlayerReady(data);
                break;
            case 'gameStart':
                this.handleGameStart(data);
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

        if (this.roomPassword && data.password !== this.roomPassword) {
            const conn = this.connections.get(senderId);
            if (conn) {
                conn.send({
                    type: 'joinRejected',
                    reason: '密码错误'
                });
            }
            return;
        }

        const newPlayer = {
            id: data.playerId,
            name: data.playerName,
            isHost: false,
            isReady: false,
            class: null
        };

        this.players.set(data.playerId, newPlayer);

        const conn = this.connections.get(senderId);
        if (conn) {
            conn.send({
                type: 'joinAccepted',
                roomName: this.roomName,
                players: Array.from(this.players.values()),
                roomId: this.roomId
            });
        }

        this.broadcast({
            type: 'playerJoined',
            player: newPlayer
        });

        this.updatePlayerList();
        this.showNotification(data.playerName + " 加入了房间", "info");
    }

    handleJoinAccepted(data) {
        this.roomName = data.roomName;
        this.players.clear();
        data.players.forEach(player => {
            this.players.set(player.id, player);
        });

        this.updateRoomUI();
        this.updatePlayerList();
        this.showNotification("成功加入房间: " + this.roomName, "success");
    }

    handleJoinRejected(data) {
        this.showNotification("加入失败: " + data.reason, "error");
        this.leaveRoom();
    }

    handlePlayerJoined(data) {
        this.players.set(data.player.id, data.player);
        this.updatePlayerList();
        this.showNotification(data.player.name + " 加入了房间", "info");
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

    handleChatMessage(data) {
        this.addChatMessage(data.playerName, data.message, data.isSystem);
    }

    handlePlayerReady(data) {
        const player = this.players.get(data.playerId);
        if (player) {
            player.isReady = data.isReady;
            this.updatePlayerList();
        }
    }

    handleGameStart(data) {
        this.showNotification("游戏开始！", "success");
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
                console.error("发送消息失败:", e);
            }
        });
    }

    sendToHost(data) {
        const hostId = this.roomId + '_host';
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

    toggleReady() {
        const localPlayer = this.players.get(this.localPeerId);
        if (localPlayer) {
            localPlayer.isReady = !localPlayer.isReady;
            this.updatePlayerList();
            
            const status = localPlayer.isReady ? '已准备' : '取消准备';
            this.addChatMessage('系统', `${this.playerName} ${status}`, true);
            this.showNotification(`你已${status}`, 'info');
            
            const readyData = {
                type: 'playerReady',
                playerId: this.localPeerId,
                isReady: localPlayer.isReady
            };
            
            if (this.isHost) {
                this.broadcast(readyData);
            } else {
                this.sendToHost(readyData);
            }
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
        const roomIdDisplay = document.getElementById('room-id-display');
        if (roomIdDisplay) {
            roomIdDisplay.textContent = this.roomId || '-';
        }
        
        const roomIdInput = document.getElementById('room-id');
        if (roomIdInput) {
            roomIdInput.value = this.roomId || '';
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
                <div class="player-avatar-small">${player.isAI ? '🤖' : '👤'}</div>
                <div style="flex: 1;">
                    <div style="font-weight: bold;">${player.name} ${player.isHost ? '👑' : ''} ${isLocalPlayer ? '(你)' : ''}</div>
                    <div style="font-size: 0.8rem; color: #a5b1c2;">
                        ${player.isReady ? '✓ 已准备' : '✗ 未准备'}
                    </div>
                </div>
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
            startButton.disabled = true;
            startButton.innerHTML = '<i class="fas fa-play"></i> 等待房主开始';
            return;
        }
        
        let allReady = true;
        let playerCount = 0;
        
        this.players.forEach(player => {
            playerCount++;
            if (!player.isReady && !player.isAI) {
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
    }

    updateReadyButton() {
        const readyButton = document.getElementById('toggle-ready');
        if (!readyButton) return;
        
        const localPlayer = this.players.get(this.localPeerId);
        if (!localPlayer) {
            readyButton.style.display = 'none';
            return;
        }
        
        if (localPlayer.isAI) {
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

        this.roomId = null;
        this.isHost = false;
        this.showNotification("已离开房间", "info");
    }

    startGame() {
        if (!this.isHost) return;

        let allReady = true;
        let playerCount = 0;
        
        this.players.forEach(player => {
            playerCount++;
            if (!player.isReady && !player.isAI) {
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

    showNotification(message, type = "info") {
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
