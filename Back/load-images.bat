@echo off
echo 📤 从本地文件加载Docker镜像...

echo 📋 检查 Docker 环境...
docker --version
if %errorlevel% neq 0 (
    echo ❌ Docker 未安装或未启动
    pause
    exit /b 1
)

echo 📁 检查镜像文件...
if not exist "docker-images" (
    echo ❌ docker-images 目录不存在
    echo 请先运行 download-images.bat 下载镜像
    pause
    exit /b 1
)

cd docker-images

echo 🐳 加载基础镜像...
if exist "node-18-alpine.tar" (
    echo 正在加载 node:18-alpine...
    docker load -i node-18-alpine.tar
) else (
    echo ⚠️ node-18-alpine.tar 不存在，跳过
)

if exist "nginx-alpine.tar" (
    echo 正在加载 nginx:alpine...
    docker load -i nginx-alpine.tar
) else (
    echo ⚠️ nginx-alpine.tar 不存在，跳过
)

if exist "postgres-15.tar" (
    echo 正在加载 postgres:15...
    docker load -i postgres-15.tar
) else (
    echo ⚠️ postgres-15.tar 不存在，跳过
)

if exist "lctmr-remote.tar" (
    echo 正在加载 lctmr-remote:latest...
    docker load -i lctmr-remote.tar
) else (
    echo ⚠️ lctmr-remote.tar 不存在，跳过
)

cd ..

echo 📊 当前镜像列表:
docker images

echo.
echo ✅ 镜像加载完成！
echo 🚀 现在可以运行: docker-compose up -d
