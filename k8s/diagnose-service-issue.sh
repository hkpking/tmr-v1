#!/bin/bash

echo "=== 服务诊断脚本 ==="
echo ""

CLUSTER_IP="10.10.250.251"

echo "问题分析："
echo "1. 后端 Pod 运行正常 ✅"
echo "2. 后端应用启动正常 ✅"
echo "3. 但是服务无法访问 ❌"
echo ""

echo "=== 检查服务配置 ==="
echo ""

# 检查 NodePort 端口
echo "检查 NodePort 端口..."
PORTS=(30011 30012 30001 30002)

for port in "${PORTS[@]}"; do
    echo "检查端口 $port..."
    if timeout 3 bash -c "echo >/dev/tcp/$CLUSTER_IP/$port" 2>/dev/null; then
        echo "  ✅ 端口 $port 开放"
        
        # 测试 HTTP 响应
        response=$(curl -s --connect-timeout 3 http://$CLUSTER_IP:$port 2>/dev/null)
        if [ -n "$response" ]; then
            echo "    HTTP 响应: ${response:0:50}..."
        else
            echo "    HTTP 无响应"
        fi
    else
        echo "  ❌ 端口 $port 关闭"
    fi
done

echo ""
echo "=== 检查 Ingress 路由 ==="
echo ""

# 检查不同的 API 路径
API_PATHS=("/api" "/api/" "/api/health" "/api/auth/signin")

for path in "${API_PATHS[@]}"; do
    echo "检查路径: $path"
    response=$(curl -s --connect-timeout 5 http://$CLUSTER_IP$path 2>/dev/null)
    if [ -n "$response" ]; then
        echo "  ✅ 有响应: ${response:0:50}..."
        if [[ $response == *"404"* ]]; then
            echo "    ⚠️  返回 404 错误"
        fi
    else
        echo "  ❌ 无响应"
    fi
done

echo ""
echo "=== 问题分析 ==="
echo ""

# 分析问题
nodeport_accessible=false
ingress_accessible=false

# 检查 NodePort
if timeout 3 bash -c "echo >/dev/tcp/$CLUSTER_IP/30011" 2>/dev/null; then
    nodeport_accessible=true
fi

# 检查 Ingress
api_response=$(curl -s --connect-timeout 5 http://$CLUSTER_IP/api 2>/dev/null)
if [[ $api_response == *"API"* ]] || [[ $api_response == *"流程天命人"* ]]; then
    ingress_accessible=true
fi

echo "诊断结果："
if [ "$nodeport_accessible" = true ]; then
    echo "✅ NodePort 服务可访问"
else
    echo "❌ NodePort 服务不可访问"
fi

if [ "$ingress_accessible" = true ]; then
    echo "✅ Ingress 路由正常"
else
    echo "❌ Ingress 路由有问题"
fi

echo ""
echo "=== 解决方案建议 ==="
echo ""

if [ "$nodeport_accessible" = false ] && [ "$ingress_accessible" = false ]; then
    echo "🔧 问题：服务没有正确暴露"
    echo "解决方案："
    echo "1. 检查 Service 配置是否正确应用"
    echo "2. 检查 Pod 标签是否匹配 Service selector"
    echo "3. 重新创建 Service"
    echo "4. 检查防火墙设置"
elif [ "$nodeport_accessible" = true ] && [ "$ingress_accessible" = false ]; then
    echo "🔧 问题：Ingress 路由配置有问题"
    echo "解决方案："
    echo "1. 检查 Ingress 配置"
    echo "2. 检查 Ingress Controller 状态"
    echo "3. 重新创建 Ingress"
elif [ "$nodeport_accessible" = false ] && [ "$ingress_accessible" = true ]; then
    echo "🔧 问题：NodePort 服务有问题，但 Ingress 正常"
    echo "解决方案："
    echo "1. 检查 Service 类型配置"
    echo "2. 检查端口映射"
else
    echo "🎉 服务运行正常！"
fi

echo ""
echo "=== 诊断完成 ==="
