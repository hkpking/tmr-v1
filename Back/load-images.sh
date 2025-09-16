#!/bin/bash

echo "📤 从本地文件加载Docker镜像..."

echo "📋 检查 Docker 环境..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装或未启动"
    exit 1
fi

echo "📁 检查镜像文件..."
if [ ! -d "docker-images" ]; then
    echo "❌ docker-images 目录不存在"
    echo "请先运行 download-images.sh 下载镜像"
    exit 1
fi

cd docker-images

echo "🐳 加载基础镜像..."
if [ -f "node-18-alpine.tar" ]; then
    echo "正在加载 node:18-alpine..."
    docker load -i node-18-alpine.tar
else
    echo "⚠️ node-18-alpine.tar 不存在，跳过"
fi

if [ -f "nginx-alpine.tar" ]; then
    echo "正在加载 nginx:alpine..."
    docker load -i nginx-alpine.tar
else
    echo "⚠️ nginx-alpine.tar 不存在，跳过"
fi

if [ -f "postgres-15.tar" ]; then
    echo "正在加载 postgres:15..."
    docker load -i postgres-15.tar
else
    echo "⚠️ postgres-15.tar 不存在，跳过"
fi

if [ -f "lctmr-remote.tar" ]; then
    echo "正在加载 lctmr-remote:latest..."
    docker load -i lctmr-remote.tar
else
    echo "⚠️ lctmr-remote.tar 不存在，跳过"
fi

cd ..

echo "📊 当前镜像列表:"
docker images

echo ""
echo "✅ 镜像加载完成！"
echo "🚀 现在可以运行: docker-compose up -d"
