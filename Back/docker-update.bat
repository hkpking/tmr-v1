@echo off
echo 🔄 Docker 增量更新工具

echo 📋 检查 Docker 环境...
docker --version
if %errorlevel% neq 0 (
    echo ❌ Docker 未安装或未启动
    pause
    exit /b 1
)

echo.
echo 请选择更新类型:
echo 1. 仅更新应用代码 (快速)
echo 2. 更新依赖包 (中等)
echo 3. 完全重建 (慢速)
echo 4. 仅更新配置文件
echo 0. 退出

set /p choice=请输入选择 (0-4): 

if "%choice%"=="1" goto update_code
if "%choice%"=="2" goto update_deps
if "%choice%"=="3" goto full_rebuild
if "%choice%"=="4" goto update_config
if "%choice%"=="0" goto exit
goto menu

:update_code
echo 🚀 快速更新应用代码...
docker-compose down
docker build --target production -t lctmr-remote:latest .
docker-compose up -d
echo ✅ 代码更新完成
goto end

:update_deps
echo 📦 更新依赖包...
docker-compose down
docker build --no-cache --target deps -t lctmr-deps:latest .
docker build --target production -t lctmr-remote:latest .
docker-compose up -d
echo ✅ 依赖更新完成
goto end

:full_rebuild
echo 🔨 完全重建镜像...
docker-compose down
docker build --no-cache --target production -t lctmr-remote:latest .
docker-compose up -d
echo ✅ 完全重建完成
goto end

:update_config
echo ⚙️ 更新配置文件...
docker-compose down
docker build --target production -t lctmr-remote:latest .
docker-compose up -d
echo ✅ 配置更新完成
goto end

:end
echo.
echo 🔍 检查服务状态...
docker-compose ps
echo.
echo 📝 查看日志: docker-compose logs -f
goto exit

:exit
echo 👋 再见！
exit /b 0
