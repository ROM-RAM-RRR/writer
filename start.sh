#!/bin/bash

# 小说写作 Agent 一键启动脚本

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 启动小说写作 Agent..."

# 检查并激活虚拟环境
if [ -d "venv" ]; then
    echo "📦 激活虚拟环境..."
    source venv/bin/activate
else
    echo "❌ 虚拟环境不存在，请先运行 setup.sh"
    exit 1
fi

# 启动后端
echo "🌐 启动后端服务..."
python -m uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!

# 等待后端启动
sleep 2

# 启动前端
echo "📱 启动前端服务..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ 服务已启动！"
echo "   后端: http://localhost:8000"
echo "   前端: http://localhost:5173"
echo ""
echo "按 Ctrl+C 停止服务"

# 捕获 Ctrl+C 并清理
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

# 等待进程
wait