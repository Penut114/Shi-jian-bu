# 时间部游戏平台服务器

这是时间部游戏的 Node.js + Socket.io 后端服务器。

## 功能

- 用户注册和登录
- JWT 认证
- 实时房间系统
- 快速匹配
- 排行榜
- 好友系统
- 公共房间列表

## 安装

```bash
cd server
npm install
```

## 运行

```bash
# 生产环境
npm start

# 开发环境（自动重启）
npm run dev
```

## 环境变量

创建 `.env` 文件：

```
PORT=3000
JWT_SECRET=your-secret-key
```

## 部署

### Railway

1. 连接 GitHub 仓库
2. 设置根目录为 `server`
3. 自动部署

### Render

1. 创建新的 Web Service
2. 连接 GitHub 仓库
3. 设置构建命令: `npm install`
4. 设置启动命令: `npm start`

### Heroku

```bash
heroku create
git push heroku main
```

## API 端点

### 认证

- `POST /api/register` - 注册新用户
- `POST /api/login` - 登录

### 数据

- `GET /api/leaderboard` - 获取排行榜
- `GET /api/rooms` - 获取公共房间列表

## Socket.io 事件

### 客户端 -> 服务器

- `createRoom` - 创建房间
- `joinRoom` - 加入房间
- `leaveRoom` - 离开房间
- `toggleReady` - 切换准备状态
- `startGame` - 开始游戏
- `quickMatch` - 快速匹配
- `cancelMatch` - 取消匹配
- `chat` - 发送聊天消息
- `addFriend` - 添加好友

### 服务器 -> 客户端

- `init` - 初始化数据
- `roomCreated` - 房间创建成功
- `playerJoined` - 玩家加入
- `playerLeft` - 玩家离开
- `playerReady` - 玩家准备状态变化
- `gameStart` - 游戏开始
- `matchFound` - 匹配成功
- `matchmaking` - 匹配中
- `chat` - 聊天消息
- `error` - 错误消息
- `roomListUpdate` - 房间列表更新
- `userOnline` - 用户上线
- `userOffline` - 用户下线
