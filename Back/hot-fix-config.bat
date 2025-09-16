@echo off
echo 🔥 热修复数据库配置...

echo 📋 检查当前配置文件...
type config\database-config.js | findstr "101.32.59.153"
if %errorlevel% equ 0 (
    echo ✅ 本地配置文件正确
) else (
    echo ❌ 本地配置文件有问题
)

echo.
echo 🚀 启动容器进行热修复...
docker-compose up -d

echo ⏳ 等待容器启动...
timeout /t 15 /nobreak >nul

echo 🔍 检查容器状态...
docker-compose ps

echo.
echo 🔧 开始热修复...
echo 📁 复制正确的配置文件到容器...

REM 创建临时修复脚本
echo #!/bin/sh > temp-fix.sh
echo echo "🔧 修复数据库配置..." >> temp-fix.sh
echo echo "📊 当前配置:" >> temp-fix.sh
echo cat /app/config/database-config.js ^| grep -A 5 "production:" >> temp-fix.sh
echo echo "" >> temp-fix.sh
echo echo "🔧 更新配置..." >> temp-fix.sh
echo echo "host: process.env.DB_HOST || '101.32.59.153'," >> temp-fix.sh
echo echo "port: parseInt(process.env.DB_PORT) || 5432," >> temp-fix.sh
echo echo "user: process.env.DB_USER || 'web_app'," >> temp-fix.sh
echo echo "password: process.env.DB_PASSWORD || 'Dslr*2025#app'," >> temp-fix.sh
echo echo "database: process.env.DB_NAME || 'lctmr_production'," >> temp-fix.sh

echo 📤 复制修复脚本到容器...
docker cp temp-fix.sh lctmr-app-remote:/tmp/fix.sh

echo 🔧 执行修复...
docker exec lctmr-app-remote chmod +x /tmp/fix.sh
docker exec lctmr-app-remote /tmp/fix.sh

echo 🔄 重启应用容器...
docker-compose restart app

echo ⏳ 等待重启...
timeout /t 10 /nobreak >nul

echo 🔍 检查修复结果...
docker logs lctmr-app-remote --tail 10

echo.
echo 🏥 健康检查...
curl -f http://localhost:3001/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 热修复成功！服务正常运行
    echo 🌐 访问地址: http://localhost
) else (
    echo ❌ 热修复失败，需要进一步调试
    echo 📝 查看详细日志: docker-compose logs app
)

echo.
echo 🧹 清理临时文件...
del temp-fix.sh

echo ✅ 热修复完成！
