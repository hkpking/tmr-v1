#!/bin/bash

echo "=== 检查可用的 NodePort 端口 ==="
echo ""

CLUSTER_IP="10.10.250.251"
echo "检查集群: $CLUSTER_IP"
echo ""

# 检查常用端口范围
echo "检查端口 30000-30020..."
for port in {30000..30020}; do
    if timeout 2 bash -c "echo >/dev/tcp/$CLUSTER_IP/$port" 2>/dev/null; then
        echo "❌ 端口 $port 已被占用"
    else
        echo "✅ 端口 $port 可用"
    fi
done

echo ""
echo "检查端口 30080-30100..."
for port in {30080..30100}; do
    if timeout 2 bash -c "echo >/dev/tcp/$CLUSTER_IP/$port" 2>/dev/null; then
        echo "❌ 端口 $port 已被占用"
    else
        echo "✅ 端口 $port 可用"
    fi
done

echo ""
echo "=== 推荐端口 ==="
echo "建议使用以下端口："
echo "- 后端服务: 30011 (已设置)"
echo "- 前端服务: 30012 (已设置)"
echo ""
echo "如果这些端口也被占用，可以尝试："
echo "- 30021, 30022"
echo "- 30031, 30032"
echo "- 30041, 30042"
