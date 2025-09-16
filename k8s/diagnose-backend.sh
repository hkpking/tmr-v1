#!/bin/bash

echo "=== 后端服务诊断 ==="
echo ""

CLUSTER_IP="10.10.250.251"
NAMESPACE="czl-test"

echo "检查后端服务状态..."
echo ""

# 1. 检查后端健康端点
echo "=== 1. 检查后端健康端点 ==="
echo "检查 /health 端点..."
if curl -s --connect-timeout 5 http://$CLUSTER_IP/api/health > /dev/null; then
    echo "✅ /api/health 可访问"
    health_response=$(curl -s --connect-timeout 5 http://$CLUSTER_IP/api/health 2>/dev/null)
    echo "   响应: $health_response"
else
    echo "❌ /api/health 不可访问"
fi

# 2. 检查后端根路径
echo ""
echo "=== 2. 检查后端根路径 ==="
echo "检查 /api 根路径..."
if curl -s --connect-timeout 5 http://$CLUSTER_IP/api > /dev/null; then
    echo "✅ /api 可访问"
    api_response=$(curl -s --connect-timeout 5 http://$CLUSTER_IP/api 2>/dev/null)
    echo "   响应: $api_response"
else
    echo "❌ /api 不可访问"
fi

# 3. 检查认证端点
echo ""
echo "=== 3. 检查认证端点 ==="
echo "检查 /api/auth/signin 端点..."
if curl -s --connect-timeout 5 http://$CLUSTER_IP/api/auth/signin > /dev/null; then
    echo "✅ /api/auth/signin 可访问"
    auth_response=$(curl -s --connect-timeout 5 http://$CLUSTER_IP/api/auth/signin 2>/dev/null)
    echo "   响应: $auth_response"
else
    echo "❌ /api/auth/signin 不可访问"
fi

# 4. 检查其他可能的端点
echo ""
echo "=== 4. 检查其他端点 ==="
ENDPOINTS=("/api/status" "/api/info" "/api/version" "/api/ping" "/api/ready")

for endpoint in "${ENDPOINTS[@]}"; do
    echo "检查 $endpoint..."
    if curl -s --connect-timeout 5 http://$CLUSTER_IP$endpoint > /dev/null; then
        echo "  ✅ $endpoint 可访问"
        response=$(curl -s --connect-timeout 5 http://$CLUSTER_IP$endpoint 2>/dev/null)
        echo "     响应: $response"
    else
        echo "  ❌ $endpoint 不可访问"
    fi
done

# 5. 检查 HTTP 方法
echo ""
echo "=== 5. 检查 HTTP 方法 ==="
echo "检查 POST 方法到 /api/auth/signin..."
if curl -s -X POST --connect-timeout 5 http://$CLUSTER_IP/api/auth/signin > /dev/null; then
    echo "✅ POST /api/auth/signin 可访问"
    post_response=$(curl -s -X POST --connect-timeout 5 http://$CLUSTER_IP/api/auth/signin 2>/dev/null)
    echo "   响应: $post_response"
else
    echo "❌ POST /api/auth/signin 不可访问"
fi

# 6. 检查服务响应头
echo ""
echo "=== 6. 检查服务响应头 ==="
echo "检查 /api 响应头..."
headers=$(curl -I -s --connect-timeout 5 http://$CLUSTER_IP/api 2>/dev/null)
if [ -n "$headers" ]; then
    echo "✅ 响应头:"
    echo "$headers" | head -10
else
    echo "❌ 无法获取响应头"
fi

# 7. 生成诊断报告
echo ""
echo "=== 7. 诊断报告 ==="
echo ""

# 检查是否有任何 API 端点可访问
api_accessible=false
if curl -s --connect-timeout 5 http://$CLUSTER_IP/api/health > /dev/null; then
    api_accessible=true
fi

if [ "$api_accessible" = true ]; then
    echo "✅ 后端服务部分可访问"
    echo "   建议：检查路由配置和认证端点"
else
    echo "❌ 后端服务完全不可访问"
    echo "   建议："
    echo "   1. 检查 Pod 是否正常运行"
    echo "   2. 检查服务配置"
    echo "   3. 检查应用日志"
    echo "   4. 检查镜像是否正确"
fi

echo ""
echo "=== 诊断完成 ==="
