const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

const JWT_SECRET = 'shijianbu-secret-key-2024';
const SALT_ROUNDS = 10;

const users = new Map();
const rooms = new Map();
const matchmakingQueue = [];
const onlineUsers = new Map();

app.get('/', (req, res) => {
    res.json({ 
        message: '时间部游戏平台服务器运行中',
        onlineUsers: onlineUsers.size,
        activeRooms: rooms.size
    });
});

app.post('/api/register', async (req, res) => {
    try {
        const { username, password, nickname } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: '用户名和密码不能为空' });
        }
        
        if (users.has(username)) {
            return res.status(400).json({ error: '用户名已存在' });
        }
        
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const userId = uuidv4();
        
        const user = {
            id: userId,
            username,
            password: hashedPassword,
            nickname: nickname || username,
            avatar: null,
            stats: {
                games: 0,
                wins: 0,
                losses: 0,
                score: 1000
            },
            friends: [],
            createdAt: new Date().toISOString()
        };
        
        users.set(username, user);
        
        const token = jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: '7d' });
        
        res.json({
            success: true,
            token,
            user: {
                id: userId,
                username,
                nickname: user.nickname,
                stats: user.stats
            }
        });
    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: '用户名和密码不能为空' });
        }
        
        const user = users.get(username);
        if (!user) {
            return res.status(401).json({ error: '用户名或密码错误' });
        }
        
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: '用户名或密码错误' });
        }
        
        const token = jwt.sign({ userId: user.id, username }, JWT_SECRET, { expiresIn: '7d' });
        
        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username,
                nickname: user.nickname,
                avatar: user.avatar,
                stats: user.stats
            }
        });
    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

app.get('/api/leaderboard', (req, res) => {
    try {
        const leaderboard = Array.from(users.values())
            .map(user => ({
                id: user.id,
                username: user.username,
                nickname: user.nickname,
                stats: user.stats
            }))
            .sort((a, b) => b.stats.score - a.stats.score)
            .slice(0, 100);
        
        res.json({ leaderboard });
    } catch (error) {
        console.error('排行榜错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

app.get('/api/rooms', (req, res) => {
    try {
        const publicRooms = Array.from(rooms.values())
            .filter(room => room.isPublic)
            .map(room => ({
                id: room.id,
                name: room.name,
                host: room.host,
                playerCount: room.players.length,
                maxPlayers: room.maxPlayers,
                status: room.status
            }));
        
        res.json({ rooms: publicRooms });
    } catch (error) {
        console.error('房间列表错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('认证失败'));
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
        return next(new Error('认证失败'));
    }
    
    socket.userId = decoded.userId;
    socket.username = decoded.username;
    next();
});

io.on('connection', (socket) => {
    console.log(`用户连接: ${socket.username}`);
    
    const user = users.get(socket.username);
    if (user) {
        onlineUsers.set(socket.userId, {
            socketId: socket.id,
            username: socket.username,
            nickname: user.nickname
        });
        
        io.emit('userOnline', { userId: socket.userId, username: socket.username });
    }
    
    socket.emit('init', {
        user: {
            id: user?.id,
            username: socket.username,
            nickname: user?.nickname,
            stats: user?.stats
        },
        onlineUsers: Array.from(onlineUsers.values())
    });
    
    socket.on('createRoom', (data) => {
        const roomId = uuidv4().substring(0, 6).toUpperCase();
        const room = {
            id: roomId,
            name: data.name || `${socket.username}的房间`,
            host: socket.username,
            hostId: socket.userId,
            players: [{
                id: socket.userId,
                username: socket.username,
                nickname: user?.nickname,
                isHost: true,
                isReady: true
            }],
            maxPlayers: data.maxPlayers || 6,
            isPublic: data.isPublic !== false,
            status: 'waiting'
        };
        
        rooms.set(roomId, room);
        socket.join(roomId);
        socket.currentRoom = roomId;
        
        socket.emit('roomCreated', { room });
        io.emit('roomListUpdate', { rooms: Array.from(rooms.values()).filter(r => r.isPublic) });
    });
    
    socket.on('joinRoom', (data) => {
        const room = rooms.get(data.roomId);
        if (!room) {
            socket.emit('error', { message: '房间不存在' });
            return;
        }
        
        if (room.players.length >= room.maxPlayers) {
            socket.emit('error', { message: '房间已满' });
            return;
        }
        
        room.players.push({
            id: socket.userId,
            username: socket.username,
            nickname: user?.nickname,
            isHost: false,
            isReady: false
        });
        
        socket.join(data.roomId);
        socket.currentRoom = data.roomId;
        
        io.to(data.roomId).emit('playerJoined', { 
            player: room.players[room.players.length - 1],
            room 
        });
        io.emit('roomListUpdate', { rooms: Array.from(rooms.values()).filter(r => r.isPublic) });
    });
    
    socket.on('toggleReady', () => {
        const roomId = socket.currentRoom;
        if (!roomId) return;
        
        const room = rooms.get(roomId);
        if (!room) return;
        
        const player = room.players.find(p => p.id === socket.userId);
        if (player && !player.isHost) {
            player.isReady = !player.isReady;
            io.to(roomId).emit('playerReady', { 
                playerId: socket.userId, 
                isReady: player.isReady,
                room 
            });
        }
    });
    
    socket.on('startGame', () => {
        const roomId = socket.currentRoom;
        if (!roomId) return;
        
        const room = rooms.get(roomId);
        if (!room) return;
        
        if (room.hostId !== socket.userId) {
            socket.emit('error', { message: '只有房主才能开始游戏' });
            return;
        }
        
        const allReady = room.players.every(p => p.isReady);
        if (!allReady) {
            socket.emit('error', { message: '请等待所有玩家准备' });
            return;
        }
        
        room.status = 'playing';
        io.to(roomId).emit('gameStart', { room });
    });
    
    socket.on('leaveRoom', () => {
        handleLeaveRoom(socket);
    });
    
    socket.on('quickMatch', () => {
        const user = users.get(socket.username);
        const playerScore = user?.stats?.score || 1000;
        
        const matchIndex = matchmakingQueue.findIndex(p => {
            const scoreDiff = Math.abs(p.score - playerScore);
            return scoreDiff <= 200;
        });
        
        if (matchIndex !== -1) {
            const matchedPlayer = matchmakingQueue.splice(matchIndex, 1)[1];
            
            const roomId = uuidv4().substring(0, 6).toUpperCase();
            const room = {
                id: roomId,
                name: '匹配房间',
                host: matchedPlayer.username,
                hostId: matchedPlayer.userId,
                players: [
                    {
                        id: matchedPlayer.userId,
                        username: matchedPlayer.username,
                        isHost: true,
                        isReady: true
                    }
                ],
                maxPlayers: 6,
                isPublic: true,
                status: 'waiting'
            };
            
            rooms.set(roomId, room);
            
            io.to(matchedPlayer.socketId).emit('matchFound', { room });
            socket.emit('matchFound', { room });
            
            socket.join(roomId);
            socket.currentRoom = roomId;
            
            room.players.push({
                id: socket.userId,
                username: socket.username,
                isHost: false,
                isReady: false
            });
            
            io.to(roomId).emit('playerJoined', { 
                player: room.players[room.players.length - 1],
                room 
            });
        } else {
            matchmakingQueue.push({
                userId: socket.userId,
                username: socket.username,
                socketId: socket.id,
                score: playerScore
            });
            
            socket.emit('matchmaking', { status: 'waiting' });
        }
    });
    
    socket.on('cancelMatch', () => {
        const index = matchmakingQueue.findIndex(p => p.userId === socket.userId);
        if (index !== -1) {
            matchmakingQueue.splice(index, 1);
            socket.emit('matchCancelled');
        }
    });
    
    socket.on('addFriend', (data) => {
        const targetUser = users.get(data.username);
        if (!targetUser) {
            socket.emit('error', { message: '用户不存在' });
            return;
        }
        
        const currentUser = users.get(socket.username);
        if (currentUser.friends.includes(data.username)) {
            socket.emit('error', { message: '已经是好友了' });
            return;
        }
        
        currentUser.friends.push(data.username);
        targetUser.friends.push(socket.username);
        
        socket.emit('friendAdded', { username: data.username });
        
        const targetOnline = onlineUsers.get(targetUser.id);
        if (targetOnline) {
            io.to(targetOnline.socketId).emit('friendAdded', { username: socket.username });
        }
    });
    
    socket.on('chat', (data) => {
        const roomId = socket.currentRoom;
        if (!roomId) return;
        
        io.to(roomId).emit('chat', {
            username: socket.username,
            message: data.message,
            timestamp: new Date().toISOString()
        });
    });
    
    socket.on('disconnect', () => {
        console.log(`用户断开连接: ${socket.username}`);
        
        onlineUsers.delete(socket.userId);
        
        const matchIndex = matchmakingQueue.findIndex(p => p.userId === socket.userId);
        if (matchIndex !== -1) {
            matchmakingQueue.splice(matchIndex, 1);
        }
        
        handleLeaveRoom(socket);
        
        io.emit('userOffline', { userId: socket.userId });
    });
});

function handleLeaveRoom(socket) {
    const roomId = socket.currentRoom;
    if (!roomId) return;
    
    const room = rooms.get(roomId);
    if (!room) return;
    
    const playerIndex = room.players.findIndex(p => p.id === socket.userId);
    if (playerIndex === -1) return;
    
    const player = room.players.splice(playerIndex, 1)[1];
    socket.leave(roomId);
    socket.currentRoom = null;
    
    if (room.players.length === 0) {
        rooms.delete(roomId);
    } else {
        if (player.isHost && room.players.length > 0) {
            room.players[0].isHost = true;
            room.host = room.players[0].username;
            room.hostId = room.players[0].id;
        }
        
        io.to(roomId).emit('playerLeft', { 
            playerId: socket.userId,
            room 
        });
    }
    
    io.emit('roomListUpdate', { rooms: Array.from(rooms.values()).filter(r => r.isPublic) });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
});
