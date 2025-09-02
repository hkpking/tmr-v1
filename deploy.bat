@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM 🚀 流程天命人 - Windows 自动部署脚本
REM 版本: v1.1.0
REM 作者: 数字化管理中心

set "APP_NAME=lctmr-app"
set "DEFAULT_PORT=8080"
set "CONTAINER_NAME=%APP_NAME%-%RANDOM%"

:main
echo.
echo 🚀 流程天命人 - 自动部署脚本
echo ================================
echo.

REM 检查参数
if "%1"=="-h" goto help
if "%1"=="--help" goto help
if "%1"=="-s" goto status
if "%1"=="--status" goto status
if "%1"=="-c" goto cleanup
if "%1"=="--cleanup" goto cleanup

REM 设置端口
set "PORT=%DEFAULT_PORT%"
if "%1"=="-p" set "PORT=%2"
if "%1"=="--port" set "PORT=%2"

goto deploy

:help
echo 用法: %0 [选项]
echo.
echo 选项:
echo   -p, --port PORT     指定端口 (默认: %DEFAULT_PORT%)
echo   -c, --cleanup       清理旧容器
echo   -s, --status        显示容器状态
echo   -h, --help          显示帮助信息
echo.
echo 示例:
echo   %0                  # 使用默认端口 %DEFAULT_PORT% 部署
echo   %0 -p 8081         # 使用端口 8081 部署
echo   %0 -c               # 清理旧容器
echo   %0 -s               # 查看状态
goto end

:status
echo 📊 容器状态:
docker ps --filter "ancestor=%APP_NAME%" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
goto end

:cleanup
echo 🧹 清理旧容器...
docker ps -a --filter "ancestor=%APP_NAME%" --format "{{.Names}}" | findstr /v "NAMES" | for /f "tokens=*" %%i in ('more') do (
    echo 删除容器: %%i
    docker rm -f %%i
)
echo ✅ 清理完成
goto end

:deploy
echo 🔍 检查 Docker 环境...

REM 检查 Docker 是否安装
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker 未安装，请先安装 Docker Desktop
    goto end
)

REM 检查 Docker 服务是否运行
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker 服务未运行，请启动 Docker Desktop
    goto end
)

echo ✅ Docker 环境检查通过

echo.
echo 🔨 开始构建 Docker 镜像...
docker build -t %APP_NAME% .
if errorlevel 1 (
    echo ❌ 镜像构建失败
    goto end
)
echo ✅ 镜像构建成功

echo.
echo 🚀 启动容器 (端口: %PORT%)...
docker run -d -p %PORT%:80 --name %CONTAINER_NAME% %APP_NAME%
if errorlevel 1 (
    echo ❌ 容器启动失败，可能端口被占用
    echo 💡 尝试使用其他端口: %0 -p 8081
    goto end
)

echo ✅ 容器启动成功
echo.
echo 🎉 部署完成！
echo.
echo 📱 应用访问地址: http://localhost:%PORT%
echo 🏥 健康检查地址: http://localhost:%PORT%/health
echo 📦 容器名称: %CONTAINER_NAME%
echo.
echo 常用命令:
echo   查看日志: docker logs %CONTAINER_NAME%
echo   停止容器: docker stop %CONTAINER_NAME%
echo   删除容器: docker rm %CONTAINER_NAME%
echo   查看状态: %0 -s
echo.

:end
pause
