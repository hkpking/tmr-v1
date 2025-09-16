@echo off
echo 启动生产环境服务器...

REM 设置环境变量
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
set PORT=3001

echo 环境变量已设置
echo NODE_ENV=%NODE_ENV%
echo DB_HOST=%DB_HOST%
echo DB_NAME=%DB_NAME%

cd server
node server.js
