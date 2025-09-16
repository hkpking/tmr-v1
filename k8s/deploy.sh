#!/bin/bash

# Kubernetes 部署脚本
# 专门用于在 Kubernetes 环境中部署 LCTMR 应用

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
NAMESPACE="czl-test"
APP_NAME="lctmr"

echo -e "${BLUE}🚀 开始部署 LCTMR 应用到 Kubernetes...${NC}"

# 检查 kubectl 是否可用
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}❌ kubectl 未安装或不在 PATH 中${NC}"
    exit 1
fi

# 检查命名空间是否存在
if ! kubectl get namespace $NAMESPACE &> /dev/null; then
    echo -e "${YELLOW}📦 创建命名空间: $NAMESPACE${NC}"
    kubectl create namespace $NAMESPACE
fi

# 应用配置
echo -e "${BLUE}📋 应用 ConfigMap...${NC}"
kubectl apply -f configmap.yaml

echo -e "${BLUE}🔐 应用 Secret...${NC}"
kubectl apply -f secret.yaml

echo -e "${BLUE}🌐 应用 Services...${NC}"
kubectl apply -f services.yaml

echo -e "${BLUE}🚀 应用 Deployments...${NC}"
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml

echo -e "${BLUE}🌍 应用 Ingress...${NC}"
kubectl apply -f ingress.yaml

# 等待部署完成
echo -e "${YELLOW}⏳ 等待部署完成...${NC}"
kubectl rollout status deployment/lctmr-backend -n $NAMESPACE --timeout=300s
kubectl rollout status deployment/lctmr-frontend -n $NAMESPACE --timeout=300s

# 检查 Pod 状态
echo -e "${BLUE}📊 检查 Pod 状态...${NC}"
kubectl get pods -n $NAMESPACE

# 检查服务状态
echo -e "${BLUE}🔗 检查服务状态...${NC}"
kubectl get services -n $NAMESPACE

# 检查 Ingress 状态
echo -e "${BLUE}🌐 检查 Ingress 状态...${NC}"
kubectl get ingress -n $NAMESPACE

# 测试健康检查
echo -e "${BLUE}🧪 测试服务健康检查...${NC}"

# 测试后端健康检查
echo -e "${YELLOW}测试后端健康检查...${NC}"
kubectl run test-backend --image=curlimages/curl:latest --rm -i --restart=Never -n $NAMESPACE -- \
  curl -f http://lctmr-backend-service:3001/health || echo -e "${RED}后端健康检查失败${NC}"

# 测试前端健康检查
echo -e "${YELLOW}测试前端健康检查...${NC}"
kubectl run test-frontend --image=curlimages/curl:latest --rm -i --restart=Never -n $NAMESPACE -- \
  curl -f http://lctmr-frontend-service:80/health || echo -e "${RED}前端健康检查失败${NC}"

echo -e "${GREEN}✅ 部署完成！${NC}"
echo -e "${BLUE}📋 部署信息:${NC}"
echo -e "  命名空间: $NAMESPACE"
echo -e "  后端服务: lctmr-backend-service:3001"
echo -e "  前端服务: lctmr-frontend-service:80"
echo -e "  Ingress: 请检查 Ingress 配置获取外部访问地址"

echo -e "${BLUE}🔍 查看日志命令:${NC}"
echo -e "  后端日志: kubectl logs -l app=lctmr-backend -n $NAMESPACE"
echo -e "  前端日志: kubectl logs -l app=lctmr-frontend -n $NAMESPACE"

echo -e "${BLUE}🛠️ 管理命令:${NC}"
echo -e "  查看所有资源: kubectl get all -n $NAMESPACE"
echo -e "  删除部署: kubectl delete -f . -n $NAMESPACE"
