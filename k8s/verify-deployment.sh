#!/bin/bash

# 部署验证脚本
# 用于验证前后端服务是否正常通信

echo "🔍 开始验证部署..."

# 设置命名空间
NAMESPACE="czl-test"

# 检查 Pod 状态
echo "📋 检查 Pod 状态..."
kubectl get pods -n $NAMESPACE

echo ""
echo "🔗 检查服务状态..."
kubectl get services -n $NAMESPACE

echo ""
echo "🌐 检查 Ingress 状态..."
kubectl get ingress -n $NAMESPACE

echo ""
echo "🔧 检查 ConfigMap..."
kubectl get configmap lctmr-config -n $NAMESPACE -o yaml

echo ""
echo "🔐 检查 Secret..."
kubectl get secret lctmr-secret -n $NAMESPACE

echo ""
echo "🧪 测试后端服务健康检查..."
kubectl run test-backend --image=curlimages/curl:latest --rm -i --restart=Never -- \
  curl -f http://lctmr-backend-service:3001/health

echo ""
echo "🧪 测试前端服务健康检查..."
kubectl run test-frontend --image=curlimages/curl:latest --rm -i --restart=Never -- \
  curl -f http://lctmr-frontend-service:80/health

echo ""
echo "🔍 检查 Pod 日志..."
echo "后端日志:"
kubectl logs -l app=lctmr-backend -n $NAMESPACE --tail=20

echo ""
echo "前端日志:"
kubectl logs -l app=lctmr-frontend -n $NAMESPACE --tail=20

echo ""
echo "✅ 验证完成！"
