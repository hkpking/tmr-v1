@echo off
echo 🧪 测试新容器配置是否正确
echo.

echo 📋 停止当前容器...
docker-compose down

echo.
echo 🏗️ 重新构建应用镜像...
docker-compose build --no-cache app

echo.
echo 🚀 启动新容器...
docker-compose up -d

echo.
echo ⏳ 等待服务启动...
timeout /t 15 /nobreak > nul

echo.
echo 🔍 检查容器状态...
docker-compose ps

echo.
echo 📊 检查数据库配置...
docker exec lctmr-app-remote sh -c "node -e \"
const config = require('./config/database-config.js');
const dbConfig = config.getCurrentDatabaseConfig();
console.log('🔗 数据库配置:');
console.log('- 主机:', dbConfig.host);
console.log('- 端口:', dbConfig.port);
console.log('- 用户:', dbConfig.user);
console.log('- 数据库:', dbConfig.database);
console.log('- 环境:', dbConfig.environment);
\""

echo.
echo 🌐 检查CORS配置...
docker exec lctmr-app-remote sh -c "grep -A 10 'CORS配置' /app/server/server.js"

echo.
echo 🧪 测试API连接...
curl -I http://localhost/api/health

echo.
echo 🧪 测试CORS预检...
curl -X OPTIONS http://localhost/api/auth/signin -H "Origin: http://localhost" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: Content-Type" -v

echo.
echo ✅ 测试完成！
pause
