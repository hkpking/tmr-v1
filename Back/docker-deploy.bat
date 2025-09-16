@echo off
echo 🐳 部署远程数据库容器化应用...

echo 📋 检查 Docker 环境...
docker --version
if %errorlevel% neq 0 (
    echo ❌ Docker 未安装或未启动
    pause
    exit /b 1
)

echo 🔧 停止现有容器...
docker-compose down

echo 🧹 清理旧镜像...
docker image prune -f

echo 🏗️ 构建应用镜像...
docker-compose build --no-cache

echo 🚀 启动服务...
docker-compose up -d

echo ⏳ 等待服务启动...
timeout /t 10 /nobreak >nul

echo 🔍 检查服务状态...
docker-compose ps

echo 🏥 健康检查...
curl -f http://localhost:3001/health
if %errorlevel% equ 0 (
    echo ✅ 应用启动成功！
    echo 🌐 访问地址: http://localhost
    echo 📊 API地址: http://localhost:3001/api
    echo 🗄️ 数据库: 101.32.59.153:5432/lctmr_production
) else (
    echo ❌ 应用启动失败，请检查日志
    docker-compose logs app
)

echo.
echo 📝 常用命令:
echo   查看日志: docker-compose logs -f
echo   停止服务: docker-compose down
echo   重启服务: docker-compose restart
echo   进入容器: docker exec -it lctmr-app-remote sh
