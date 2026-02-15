#!/bin/bash

# =============================================================================
# init.sh - HTML 项目初始化脚本
# =============================================================================
# 启动一个简单的 HTTP 服务器来预览 HTML 文件。
# =============================================================================

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}正在初始化 HTML 项目...${NC}"

# 检查当前目录下是否存在 index.html
if [ ! -f "index.html" ]; then
    echo -e "${YELLOW}警告: 当前目录下未找到 index.html 文件。${NC}"
    # 可以尝试查找其他 .html 文件
    HTML_FILE=$(ls *.html 2>/dev/null | head -n 1)
    if [ -z "$HTML_FILE" ]; then
        echo "错误: 没有找到任何 HTML 文件。"
        exit 1
    else
        echo "使用找到的第一个 HTML 文件: $HTML_FILE"
    fi
else
    HTML_FILE="index.html"
fi

echo "正在启动 HTTP 服务器，根目录为当前文件夹..."

# 使用 Python 3 启动 HTTP 服务器（端口 3000）
# 如果系统没有 python3，可以改用 python2 或其它工具
if command -v python3 &>/dev/null; then
    python3 -m http.server 3000 &
elif command -v python &>/dev/null; then
    python -m SimpleHTTPServer 3000 &   # Python 2 命令
else
    echo "错误: 未找到 Python，请安装 Python 或使用其他静态服务器（如 live-server）。"
    exit 1
fi

SERVER_PID=$!

# 等待服务器启动
sleep 2

echo -e "${GREEN}✓ 初始化完成！${NC}"
echo -e "${GREEN}✓ 服务器运行在 http://localhost:3000 (PID: $SERVER_PID)${NC}"
echo ""
echo "你现在可以开始开发或使用 AI 编程工具进行预览。"