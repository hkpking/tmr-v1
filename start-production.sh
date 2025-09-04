#!/bin/bash

echo "========================================"
echo "流程天命人 - 生产环境启动脚本"
echo "========================================"

# 设置生产环境变量
export NODE_ENV=production
export DB_HOST=101.32.59.153
export DB_PORT=5432
export DB_USER=web_app
export DB_PASSWORD='Dslr*2025#app'
export DB_NAME=lctmr_production
export DB_SSL=false

# JWT配置
export JWT_SECRET='7YtYAMJUa4LaqChbkV0iN5IMSHvaBCVtBmUktZX3E8JOG0i+4TShH5vXl2HhleUMNITi4thFiYv8UFbdiazkqA=='
export JWT_EXPIRES_IN=24h

# 前端配置（请根据实际域名修改）
export FRONTEND_URL=http://localhost:5500
export API_URL=http://localhost:3001/api

# 端口配置
export PORT=3001

echo "环境变量已设置..."
echo "数据库: $DB_USER@$DB_HOST:$DB_PORT/$DB_NAME"
echo "端口: $PORT"
echo ""

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "错误: 未找到Node.js，请先安装Node.js"
    exit 1
fi

# 检查依赖是否安装
if [ ! -d "server/node_modules" ]; then
    echo "正在安装服务器依赖..."
    cd server
    npm install
    cd ..
fi

if [ ! -d "node_modules" ]; then
    echo "正在安装前端依赖..."
    npm install
fi

echo "启动生产服务器..."
echo "按 Ctrl+C 停止服务器"
echo ""

# 启动服务器
cd server
node server.js
