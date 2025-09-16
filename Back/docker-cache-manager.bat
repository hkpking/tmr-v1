@echo off
echo 🗂️ Docker 缓存管理器

:menu
echo.
echo 请选择操作:
echo 1. 查看本地镜像
echo 2. 清理未使用的镜像
echo 3. 清理所有缓存
echo 4. 导出镜像到文件
echo 5. 从文件导入镜像
echo 6. 查看镜像大小
echo 0. 退出

set /p choice=请输入选择 (0-6): 

if "%choice%"=="1" goto show_images
if "%choice%"=="2" goto clean_unused
if "%choice%"=="3" goto clean_all
if "%choice%"=="4" goto export_image
if "%choice%"=="5" goto import_image
if "%choice%"=="6" goto show_sizes
if "%choice%"=="0" goto exit
goto menu

:show_images
echo 📊 本地镜像列表:
docker images
goto menu

:clean_unused
echo 🧹 清理未使用的镜像...
docker image prune -f
echo ✅ 清理完成
goto menu

:clean_all
echo 🧹 清理所有缓存...
docker system prune -a -f
echo ✅ 清理完成
goto menu

:export_image
echo 📦 导出镜像到文件...
docker save -o lctmr-remote.tar lctmr-remote:latest
echo ✅ 镜像已导出到 lctmr-remote.tar
goto menu

:import_image
echo 📥 从文件导入镜像...
if exist lctmr-remote.tar (
    docker load -i lctmr-remote.tar
    echo ✅ 镜像导入成功
) else (
    echo ❌ 文件 lctmr-remote.tar 不存在
)
goto menu

:show_sizes
echo 📏 镜像大小统计:
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
echo.
echo 💾 磁盘使用情况:
docker system df
goto menu

:exit
echo 👋 再见！
exit /b 0
