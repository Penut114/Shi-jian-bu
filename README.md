# 游戏项目

一个基于 HTML5 的多人对战游戏，包含账户系统、排位赛系统和成就系统。

## 项目结构

```
├── index.html          # 主游戏文件
├── css/                 # 样式文件
│   ├── main.css        # 主样式文件
│   └── components/     # 组件样式
│       ├── account.css
│       ├── ranked.css
│       └── achievements.css
├── js/                  # 脚本文件
│   ├── main.js         # 主脚本文件
│   └── components/     # 组件脚本
│       ├── account.js
│       ├── ranked.js
│       └── achievements.js
├── assets/              # 资源文件
│   ├── backgrounds/    # 背景资源
│   ├── effects/        # 特效资源
│   └── icons/          # 图标资源
├── tests/               # 测试文件
│   ├── account.spec.js
│   ├── ranked.spec.js
│   └── achievements.spec.js
├── package.json         # 项目依赖
├── playwright.config.js # 测试配置
└── README.md            # 项目说明
```

## 功能特性

- 账户系统：登录、注册、用户信息管理
- 排位赛系统：ELO 积分、段位系统、比赛历史
- 成就系统：成就解锁、奖励机制、进度追踪

## 开发

### 安装依赖

```bash
npm install
```

### 运行测试

```bash
npm test
```

## 部署

本项目支持 GitHub Pages 部署。

## License

MIT
