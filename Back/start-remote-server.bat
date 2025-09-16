@echo off
echo 启动远程数据库服务器...
echo 设置环境变量...

set NODE_ENV=development
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
set PORT=3001

echo 环境变量设置完成:
echo NODE_ENV=%NODE_ENV%
echo DB_HOST=%DB_HOST%
echo DB_PORT=%DB_PORT%
echo DB_USER=%DB_USER%
echo DB_NAME=%DB_NAME%

echo 启动服务器...
cd server
node server.js
