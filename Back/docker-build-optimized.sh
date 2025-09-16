#!/bin/bash

echo "🐳 优化构建Docker镜像（使用本地缓存）..."

echo "📋 检查 Docker 环境..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装或未启动"
    exit 1
fi

echo "🧹 清理旧镜像和容器..."
docker-compose down 2>/dev/null
docker image prune -f

echo "🏗️ 构建优化镜像（多阶段构建）..."
docker build --target production -t lctmr-remote:latest .

if [ $? -ne 0 ]; then
    echo "❌ 镜像构建失败"
    exit 1
fi

echo "✅ 镜像构建成功！"
echo "📊 镜像信息:"
docker images lctmr-remote:latest

echo ""
echo "🚀 启动容器..."
docker-compose up -d

echo "⏳ 等待服务启动..."
sleep 10

echo "🔍 检查服务状态..."
docker-compose ps

echo "🏥 健康检查..."
if curl -f http://localhost:3001/health >/dev/null 2>&1; then
    echo "✅ 应用启动成功！"
    echo "🌐 访问地址: http://localhost"
    echo "📊 API地址: http://localhost:3001/api"
    echo "🗄️ 数据库: 101.32.59.153:5432/lctmr_production"
else
    echo "❌ 应用启动失败，请检查日志"
    docker-compose logs app
fi

echo ""
echo "📝 常用命令:"
echo "  查看日志: docker-compose logs -f"
echo "  停止服务: docker-compose down"
echo "  重启服务: docker-compose restart"
echo "  进入容器: docker exec -it lctmr-app-remote sh"
echo "  查看镜像: docker images lctmr-remote"
