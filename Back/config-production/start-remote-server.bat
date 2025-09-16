@echo off
echo 🚀 启动远程数据库服务器...
echo 📊 数据库: 101.32.59.153:5432/lctmr_production
echo 👤 用户: web_app
echo 🌍 环境: production

cd server
set NODE_ENV=production
set DB_HOST=101.32.59.153
set DB_PORT=5432
set DB_USER=web_app
set DB_PASSWORD=Dslr*2025#app
set DB_NAME=lctmr_production
set DB_SSL=false
set JWT_SECRET=7YtYAMJUa4LaqChbkV0iN5IMSHvaBCVtBmUktZX3E8JOG0i+4TShH5vXl2HhleUMNITi4thFiYv8UFbdiazkqA==
set JWT_EXPIRES_IN=24h
set FRONTEND_URL=http://localhost:5500
set API_URL=http://localhost:3001/api

echo ✅ 环境变量已设置
echo 🔗 启动服务器...
node server.js
