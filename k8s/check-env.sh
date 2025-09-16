#!/bin/bash

# Kubernetes 环境变量检查脚本

NAMESPACE="czl-test"

echo "🔍 检查 Kubernetes 环境变量配置..."

echo ""
echo "📋 ConfigMap 内容:"
kubectl get configmap lctmr-config -n $NAMESPACE -o yaml

echo ""
echo "🔐 Secret 内容:"
kubectl get secret lctmr-secret -n $NAMESPACE -o yaml

echo ""
echo "🧪 测试环境变量注入..."

# 测试后端环境变量
echo "后端环境变量:"
kubectl run test-env-backend --image=curlimages/curl:latest --rm -i --restart=Never -n $NAMESPACE -- \
  sh -c 'env | grep -E "(API_URL|FRONTEND_URL|DB_HOST|NODE_ENV)"'

# 测试前端环境变量
echo "前端环境变量:"
kubectl run test-env-frontend --image=curlimages/curl:latest --rm -i --restart=Never -n $NAMESPACE -- \
  sh -c 'env | grep -E "(API_URL|FRONTEND_URL|KUBERNETES_ENV)"'

echo ""
echo "✅ 环境变量检查完成！"
