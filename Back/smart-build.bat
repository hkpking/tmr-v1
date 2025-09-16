@echo off
echo 🧠 智能Docker构建工具

echo 📊 分析项目变化...

REM 检查package.json是否变化
if exist "package.json" (
    echo 📦 检测到package.json，需要重新安装依赖
    set NEED_DEPS=1
) else (
    set NEED_DEPS=0
)

REM 检查server/package.json是否变化
if exist "server/package.json" (
    echo 📦 检测到server/package.json，需要重新安装服务器依赖
    set NEED_SERVER_DEPS=1
) else (
    set NEED_SERVER_DEPS=0
)

REM 检查配置文件是否变化
if exist "config/database-config.js" (
    echo ⚙️ 检测到配置文件变化
    set NEED_CONFIG=1
) else (
    set NEED_CONFIG=0
)

echo.
echo 📋 构建计划:
if %NEED_DEPS%==1 echo   - 重新安装前端依赖
if %NEED_SERVER_DEPS%==1 echo   - 重新安装服务器依赖
if %NEED_CONFIG%==1 echo   - 更新配置文件
echo   - 复制应用代码
echo   - 构建最终镜像

echo.
echo 🚀 开始智能构建...

docker-compose down

if %NEED_DEPS%==1 (
    echo 📦 重新安装依赖...
    docker build --no-cache --target deps -t lctmr-deps:latest .
) else (
    echo ⚡ 使用缓存的依赖层
)

echo 🏗️ 构建最终镜像...
docker build --target production -t lctmr-remote:latest .

echo 🚀 启动服务...
docker-compose up -d

echo ⏳ 等待服务启动...
timeout /t 10 /nobreak >nul

echo 🔍 检查服务状态...
docker-compose ps

echo 🏥 健康检查...
curl -f http://localhost:3001/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 服务启动成功！
    echo 🌐 访问地址: http://localhost
) else (
    echo ❌ 服务启动失败，请检查日志
    echo 📝 查看日志: docker-compose logs app
)

echo.
echo 📊 构建统计:
echo   - 构建时间: %time%
echo   - 镜像大小: 
docker images lctmr-remote:latest --format "table {{.Size}}"
