#!/bin/bash

echo "📥 下载Docker镜像到本地文件..."

echo "📋 检查 Docker 环境..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装或未启动"
    exit 1
fi

echo "📁 创建镜像存储目录..."
mkdir -p docker-images
cd docker-images

echo "🐳 下载基础镜像..."
echo "正在下载 node:18-alpine..."
docker pull node:18-alpine
docker save -o node-18-alpine.tar node:18-alpine

echo "正在下载 nginx:alpine..."
docker pull nginx:alpine
docker save -o nginx-alpine.tar nginx:alpine

echo "正在下载 postgres:15..."
docker pull postgres:15
docker save -o postgres-15.tar postgres:15

echo "🏗️ 构建应用镜像..."
cd ..
docker build --target production -t lctmr-remote:latest .

echo "💾 保存应用镜像..."
docker save -o docker-images/lctmr-remote.tar lctmr-remote:latest

echo "📊 镜像文件列表:"
ls -lh docker-images/*.tar

echo ""
echo "✅ 所有镜像已下载并保存到 docker-images/ 目录"
echo "📁 文件位置: $(pwd)/docker-images/"
echo ""
echo "📝 使用方法:"
echo "  加载镜像: docker load -i docker-images/镜像名.tar"
echo "  查看镜像: docker images"
echo "  启动服务: docker-compose up -d"
