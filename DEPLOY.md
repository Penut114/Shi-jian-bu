# GitHub Pages 部署指南

## 步骤 1: 创建 GitHub 仓库

1. 访问 [GitHub](https://github.com) 并登录
2. 点击右上角的 "+" 按钮，选择 "New repository"
3. 填写仓库名称（例如：`shijianbu-game`）
4. 选择 "Public" 或 "Private"
5. **不要**勾选 "Initialize this repository with a README"
6. 点击 "Create repository"

## 步骤 2: 连接本地仓库到 GitHub

在项目目录下运行以下命令（替换 `YOUR_USERNAME` 和 `REPO_NAME`）：

```bash
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git branch -M main
git push -u origin main
```

## 步骤 3: 启用 GitHub Pages

1. 进入你的 GitHub 仓库
2. 点击 "Settings" 标签
3. 在左侧菜单中找到 "Pages"
4. 在 "Build and deployment" 部分：
   - Source: 选择 "Deploy from a branch"
   - Branch: 选择 `main` 分支，文件夹选择 `/ (root)`
5. 点击 "Save"

## 步骤 4: 访问你的网站

等待 1-2 分钟后，你的网站将可以通过以下 URL 访问：

```
https://YOUR_USERNAME.github.io/REPO_NAME/
```

## 示例

如果你的用户名是 `zhangsan`，仓库名是 `shijianbu-game`，那么：

```bash
git remote add origin https://github.com/zhangsan/shijianbu-game.git
git branch -M main
git push -u origin main
```

访问地址：`https://zhangsan.github.io/shijianbu-game/`

## 更新网站

以后修改代码后，只需运行：

```bash
git add .
git commit -m "更新描述"
git push
```

GitHub Pages 会自动重新部署。
