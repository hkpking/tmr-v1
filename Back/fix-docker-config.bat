@echo off
echo 🔧 修复Docker容器数据库配置问题
echo.

echo 📋 检查当前容器状态...
docker-compose ps

echo.
echo 🔄 停止所有容器...
docker-compose down

echo.
echo 🏗️ 重新构建应用镜像（使用最新配置）...
docker-compose build --no-cache app

echo.
echo 🚀 启动所有服务...
docker-compose up -d

echo.
echo ⏳ 等待服务启动...
timeout /t 10 /nobreak > nul

echo.
echo 🔍 检查服务状态...
docker-compose ps

echo.
echo 🧪 测试数据库连接...
docker logs lctmr-app-remote --tail 5

echo.
echo ✅ 修复完成！
echo 🌐 前端访问: http://localhost
echo 🔗 API访问: http://localhost/api/health
pause
