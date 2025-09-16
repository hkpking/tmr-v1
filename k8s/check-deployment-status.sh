#!/bin/bash

echo "=== Kubernetes 部署状态全面检测 ==="
echo ""

CLUSTER_IP="10.10.250.251"
KUBOARD_URL="http://10.10.250.251:8080"
NAMESPACE="czl-test"

echo "集群地址: $CLUSTER_IP"
echo "Kuboard 地址: $KUBOARD_URL"
echo "命名空间: $NAMESPACE"
echo ""

# 1. 检查基本网络连接
echo "=== 1. 检查基本网络连接 ==="
if curl -s --connect-timeout 5 $KUBOARD_URL > /dev/null; then
    echo "✅ Kuboard 管理界面可访问"
else
    echo "❌ Kuboard 管理界面不可访问"
    exit 1
fi

# 2. 检查 NodePort 服务
echo ""
echo "=== 2. 检查 NodePort 服务 ==="
echo "检查后端服务 (端口 30011)..."
if curl -s --connect-timeout 5 http://$CLUSTER_IP:30011 > /dev/null; then
    echo "✅ 后端服务可访问: http://$CLUSTER_IP:30011"
    
    # 检查后端健康状态
    if curl -s --connect-timeout 5 http://$CLUSTER_IP:30011/health > /dev/null; then
        echo "✅ 后端健康检查通过"
    else
        echo "⚠️  后端健康检查失败"
    fi
else
    echo "❌ 后端服务不可访问"
fi

echo "检查前端服务 (端口 30012)..."
if curl -s --connect-timeout 5 http://$CLUSTER_IP:30012 > /dev/null; then
    echo "✅ 前端服务可访问: http://$CLUSTER_IP:30012"
else
    echo "❌ 前端服务不可访问"
fi

# 3. 检查 Ingress 访问
echo ""
echo "=== 3. 检查 Ingress 访问 ==="
echo "检查根路径..."
if curl -s --connect-timeout 5 http://$CLUSTER_IP/ > /dev/null; then
    echo "✅ Ingress 根路径可访问: http://$CLUSTER_IP/"
    
    # 检查响应内容
    response=$(curl -s --connect-timeout 5 http://$CLUSTER_IP/ 2>/dev/null)
    if [[ $response == *"html"* ]] || [[ $response == *"<!DOCTYPE"* ]]; then
        echo "✅ 前端页面响应正常"
    else
        echo "⚠️  前端页面响应异常"
    fi
else
    echo "❌ Ingress 根路径不可访问"
fi

echo "检查 API 路径..."
if curl -s --connect-timeout 5 http://$CLUSTER_IP/api > /dev/null; then
    echo "✅ Ingress API 路径可访问: http://$CLUSTER_IP/api"
else
    echo "❌ Ingress API 路径不可访问"
fi

# 4. 检查端口状态
echo ""
echo "=== 4. 检查端口状态 ==="
PORTS=(80 3001 30011 30012 8080)

for port in "${PORTS[@]}"; do
    if timeout 3 bash -c "echo >/dev/tcp/$CLUSTER_IP/$port" 2>/dev/null; then
        echo "✅ 端口 $port 开放"
    else
        echo "❌ 端口 $port 关闭"
    fi
done

# 5. 检查服务响应内容
echo ""
echo "=== 5. 检查服务响应内容 ==="

echo "后端服务响应:"
backend_response=$(curl -s --connect-timeout 5 http://$CLUSTER_IP:30011 2>/dev/null)
if [ -n "$backend_response" ]; then
    echo "✅ 后端响应: ${backend_response:0:100}..."
else
    echo "❌ 后端无响应"
fi

echo "前端服务响应:"
frontend_response=$(curl -s --connect-timeout 5 http://$CLUSTER_IP:30012 2>/dev/null)
if [ -n "$frontend_response" ]; then
    echo "✅ 前端响应: ${frontend_response:0:100}..."
else
    echo "❌ 前端无响应"
fi

# 6. 检查 API 端点
echo ""
echo "=== 6. 检查 API 端点 ==="
API_ENDPOINTS=("/api" "/api/health" "/api/status" "/health" "/status")

for endpoint in "${API_ENDPOINTS[@]}"; do
    echo "检查端点: $endpoint"
    if curl -s --connect-timeout 5 http://$CLUSTER_IP:30011$endpoint > /dev/null; then
        echo "  ✅ 后端 $endpoint 可访问"
    else
        echo "  ❌ 后端 $endpoint 不可访问"
    fi
    
    if curl -s --connect-timeout 5 http://$CLUSTER_IP$endpoint > /dev/null; then
        echo "  ✅ Ingress $endpoint 可访问"
    else
        echo "  ❌ Ingress $endpoint 不可访问"
    fi
done

# 7. 生成检测报告
echo ""
echo "=== 7. 检测报告 ==="
echo ""

# 统计结果
total_checks=0
passed_checks=0

# 检查基本连接
total_checks=$((total_checks + 1))
if curl -s --connect-timeout 5 $KUBOARD_URL > /dev/null; then
    passed_checks=$((passed_checks + 1))
fi

# 检查后端服务
total_checks=$((total_checks + 1))
if curl -s --connect-timeout 5 http://$CLUSTER_IP:30011 > /dev/null; then
    passed_checks=$((passed_checks + 1))
fi

# 检查前端服务
total_checks=$((total_checks + 1))
if curl -s --connect-timeout 5 http://$CLUSTER_IP:30012 > /dev/null; then
    passed_checks=$((passed_checks + 1))
fi

# 检查 Ingress
total_checks=$((total_checks + 1))
if curl -s --connect-timeout 5 http://$CLUSTER_IP/ > /dev/null; then
    passed_checks=$((passed_checks + 1))
fi

echo "检测结果: $passed_checks/$total_checks 通过"

if [ $passed_checks -eq $total_checks ]; then
    echo "🎉 恭喜！所有检测都通过了！"
    echo ""
    echo "✅ 可用的访问方式:"
    echo "  - 前端: http://$CLUSTER_IP:30012"
    echo "  - 后端: http://$CLUSTER_IP:30011"
    echo "  - Ingress: http://$CLUSTER_IP/"
    echo "  - API: http://$CLUSTER_IP/api"
else
    echo "⚠️  部分检测未通过，请检查上述问题"
fi

echo ""
echo "=== 检测完成 ==="
