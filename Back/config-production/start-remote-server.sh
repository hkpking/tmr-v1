#!/bin/bash
echo "🚀 启动远程数据库服务器..."
echo "📊 数据库: 101.32.59.153:5432/lctmr_production"
echo "👤 用户: web_app"
echo "🌍 环境: production"

cd server
export NODE_ENV=production
export DB_HOST=101.32.59.153
export DB_PORT=5432
export DB_USER=web_app
export DB_PASSWORD=Dslr*2025#app
export DB_NAME=lctmr_production
export DB_SSL=false
export JWT_SECRET=7YtYAMJUa4LaqChbkV0iN5IMSHvaBCVtBmUktZX3E8JOG0i+4TShH5vXl2HhleUMNITi4thFiYv8UFbdiazkqA==
export JWT_EXPIRES_IN=24h
export FRONTEND_URL=http://localhost:5500
export API_URL=http://localhost:3001/api

echo "✅ 环境变量已设置"
echo "🔗 启动服务器..."
node server.js
