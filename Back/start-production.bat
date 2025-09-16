@echo off
echo ========================================
echo 流程天命人 - 生产环境启动脚本
echo ========================================

REM 设置生产环境变量
set NODE_ENV=production
set DB_HOST=101.32.59.153
set DB_PORT=5432
set DB_USER=web_app
set DB_PASSWORD=Dslr*2025#app
set DB_NAME=lctmr_production
set DB_SSL=false

REM JWT配置
set JWT_SECRET=7YtYAMJUa4LaqChbkV0iN5IMSHvaBCVtBmUktZX3E8JOG0i+4TShH5vXl2HhleUMNITi4thFiYv8UFbdiazkqA==
set JWT_EXPIRES_IN=24h

REM 前端配置（请根据实际域名修改）
set FRONTEND_URL=http://localhost:5500
set API_URL=http://localhost:3001/api

REM 端口配置
set PORT=3001

echo 环境变量已设置...
echo 数据库: %DB_USER%@%DB_HOST%:%DB_PORT%/%DB_NAME%
echo 端口: %PORT%
echo.

REM 检查Node.js是否安装
node --version >nul 2>&1
if errorlevel 1 (
    echo 错误: 未找到Node.js，请先安装Node.js
    pause
    exit /b 1
)

REM 检查依赖是否安装
if not exist "server\node_modules" (
    echo 正在安装服务器依赖...
    cd server
    npm install
    cd ..
)

if not exist "node_modules" (
    echo 正在安装前端依赖...
    npm install
)

echo 启动生产服务器...
echo 按 Ctrl+C 停止服务器
echo.

REM 启动服务器
cd server
node server.js

pause
