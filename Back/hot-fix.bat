@echo off
echo 🔥 Docker 热修复工具

echo 📋 检查当前容器状态...
docker-compose ps

echo.
echo 请选择修复类型:
echo 1. 仅重启应用容器
echo 2. 更新单个文件到运行中的容器
echo 3. 进入容器进行调试
echo 4. 查看实时日志
echo 5. 备份当前镜像
echo 0. 退出

set /p choice=请输入选择 (0-5): 

if "%choice%"=="1" goto restart_app
if "%choice%"=="2" goto update_file
if "%choice%"=="3" goto debug_container
if "%choice%"=="4" goto view_logs
if "%choice%"=="5" goto backup_image
if "%choice%"=="0" goto exit
goto menu

:restart_app
echo 🔄 重启应用容器...
docker-compose restart app
echo ✅ 应用容器已重启
goto end

:update_file
echo 📁 更新文件到容器...
set /p filepath=请输入文件路径 (相对于项目根目录): 
set /p containerpath=请输入容器内路径: 
docker cp %filepath% lctmr-app-remote:%containerpath%
echo ✅ 文件已更新
goto end

:debug_container
echo 🐛 进入容器调试...
docker exec -it lctmr-app-remote sh
goto end

:view_logs
echo 📊 查看实时日志...
docker-compose logs -f app
goto end

:backup_image
echo 💾 备份当前镜像...
docker save -o docker-images/lctmr-remote-backup-$(Get-Date -Format "yyyyMMdd-HHmmss").tar lctmr-remote:latest
echo ✅ 镜像已备份
goto end

:end
echo.
echo 🔍 当前容器状态:
docker-compose ps
goto exit

:exit
echo 👋 再见！
exit /b 0
