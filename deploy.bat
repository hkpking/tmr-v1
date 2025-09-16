@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM 流程天命人 - 前后端分离部署脚本 (Windows)
REM 支持开发环境和生产环境部署

set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

:main
if "%1"=="" goto :help
if "%1"=="help" goto :help
if "%1"=="build" goto :build
if "%1"=="start" goto :start
if "%1"=="stop" goto :stop
if "%1"=="restart" goto :restart
if "%1"=="status" goto :status
if "%1"=="logs" goto :logs
if "%1"=="cleanup" goto :cleanup
goto :help

:help
echo ================================
echo  流程天命人 - 容器化部署脚本
echo ================================
echo.
echo 用法: %0 [命令] [选项]
echo.
echo 命令:
echo   build [env]     构建镜像 (env: development^|production, 默认: production)
echo   start [env]     启动服务 (env: development^|production, 默认: production)
echo   stop [env]      停止服务 (env: development^|production, 默认: production)
echo   restart [env]   重启服务 (env: development^|production, 默认: production)
echo   status [env]    查看服务状态 (env: development^|production, 默认: production)
echo   logs [env] [service]  查看日志 (env: development^|production, 默认: production)
echo   cleanup         清理Docker资源
echo   help            显示帮助信息
echo.
echo 示例:
echo   %0 build development    # 构建开发环境镜像
echo   %0 start production     # 启动生产环境服务
echo   %0 logs development backend  # 查看开发环境后端日志
echo   %0 cleanup             # 清理Docker资源
goto :end

:check_docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker 未安装，请先安装 Docker Desktop
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Compose 未安装，请先安装 Docker Compose
    exit /b 1
)

echo [INFO] Docker 环境检查通过
goto :eof

:build
call :check_docker
if errorlevel 1 exit /b 1

set "ENV=%~2"
if "%ENV%"=="" set "ENV=production"

echo [INFO] 开始构建镜像 (环境: %ENV%)

if "%ENV%"=="development" (
    docker-compose -f docker-compose.dev.yml build
) else (
    docker-compose build
)

if errorlevel 1 (
    echo [ERROR] 镜像构建失败
    exit /b 1
)

echo [INFO] 镜像构建完成
goto :end

:start
call :check_docker
if errorlevel 1 exit /b 1

set "ENV=%~2"
if "%ENV%"=="" set "ENV=production"

echo [INFO] 启动服务 (环境: %ENV%)

if "%ENV%"=="development" (
    docker-compose -f docker-compose.dev.yml up -d
) else (
    docker-compose up -d
)

if errorlevel 1 (
    echo [ERROR] 服务启动失败
    exit /b 1
)

echo [INFO] 服务启动完成
echo [INFO] 前端访问地址: http://localhost:3000
echo [INFO] 后端API地址: http://localhost:3001/api
goto :end

:stop
call :check_docker
if errorlevel 1 exit /b 1

set "ENV=%~2"
if "%ENV%"=="" set "ENV=production"

echo [INFO] 停止服务 (环境: %ENV%)

if "%ENV%"=="development" (
    docker-compose -f docker-compose.dev.yml down
) else (
    docker-compose down
)

echo [INFO] 服务已停止
goto :end

:restart
call :stop %2
call :start %2
goto :end

:status
call :check_docker
if errorlevel 1 exit /b 1

set "ENV=%~2"
if "%ENV%"=="" set "ENV=production"

echo [INFO] 服务状态 (环境: %ENV%)

if "%ENV%"=="development" (
    docker-compose -f docker-compose.dev.yml ps
) else (
    docker-compose ps
)
goto :end

:logs
call :check_docker
if errorlevel 1 exit /b 1

set "ENV=%~2"
set "SERVICE=%~3"
if "%ENV%"=="" set "ENV=production"

if "%SERVICE%"=="" (
    echo [INFO] 查看所有服务日志 (环境: %ENV%)
    if "%ENV%"=="development" (
        docker-compose -f docker-compose.dev.yml logs -f
    ) else (
        docker-compose logs -f
    )
) else (
    echo [INFO] 查看 %SERVICE% 服务日志 (环境: %ENV%)
    if "%ENV%"=="development" (
        docker-compose -f docker-compose.dev.yml logs -f %SERVICE%
    ) else (
        docker-compose logs -f %SERVICE%
    )
)
goto :end

:cleanup
echo [INFO] 清理Docker资源

REM 停止所有相关容器
docker-compose down >nul 2>&1
docker-compose -f docker-compose.dev.yml down >nul 2>&1

REM 删除未使用的镜像
docker image prune -f

echo [INFO] 清理完成
goto :end

:end
endlocal
