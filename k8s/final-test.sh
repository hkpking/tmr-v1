#!/bin/bash

echo "=== 最终功能测试 ==="
echo ""

CLUSTER_IP="10.10.250.251"

echo "测试时间: $(date)"
echo ""

# 1. 测试前端访问
echo "=== 1. 测试前端访问 ==="
echo "测试前端页面..."
frontend_response=$(curl -s --connect-timeout 10 http://$CLUSTER_IP/ 2>/dev/null)
if [[ $frontend_response == *"html"* ]] || [[ $frontend_response == *"<!DOCTYPE"* ]]; then
    echo "✅ 前端页面可访问"
    echo "   响应长度: ${#frontend_response} 字符"
else
    echo "❌ 前端页面不可访问"
    echo "   响应: $frontend_response"
fi

# 2. 测试后端 API
echo ""
echo "=== 2. 测试后端 API ==="
echo "测试 API 根路径..."
api_response=$(curl -s --connect-timeout 10 http://$CLUSTER_IP/api/ 2>/dev/null)
if [[ $api_response == *"API"* ]] || [[ $api_response == *"流程天命人"* ]]; then
    echo "✅ API 根路径可访问"
    echo "   响应: $api_response"
else
    echo "❌ API 根路径不可访问"
    echo "   响应: $api_response"
fi

# 3. 测试认证端点
echo ""
echo "=== 3. 测试认证端点 ==="
echo "测试登录端点..."
auth_response=$(curl -s --connect-timeout 10 -X POST http://$CLUSTER_IP/api/auth/signin \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"test"}' 2>/dev/null)
if [[ $auth_response == *"error"* ]] || [[ $auth_response == *"invalid"* ]] || [[ $auth_response == *"unauthorized"* ]]; then
    echo "✅ 认证端点可访问（返回错误是正常的）"
    echo "   响应: $auth_response"
elif [[ $auth_response == *"404"* ]]; then
    echo "❌ 认证端点不可访问（404错误）"
else
    echo "⚠️  认证端点响应异常"
    echo "   响应: $auth_response"
fi

# 4. 测试健康检查
echo ""
echo "=== 4. 测试健康检查 ==="
echo "测试健康检查端点..."
health_response=$(curl -s --connect-timeout 10 http://$CLUSTER_IP/api/health 2>/dev/null)
if [[ $health_response == *"ok"* ]] || [[ $health_response == *"healthy"* ]] || [[ $health_response == *"200"* ]]; then
    echo "✅ 健康检查可访问"
    echo "   响应: $health_response"
else
    echo "❌ 健康检查不可访问"
    echo "   响应: $health_response"
fi

# 5. 测试不同路径
echo ""
echo "=== 5. 测试不同路径 ==="
PATHS=("/" "/api" "/api/health" "/api/auth/signin")

for path in "${PATHS[@]}"; do
    echo "测试路径: $path"
    response=$(curl -s --connect-timeout 5 http://$CLUSTER_IP$path 2>/dev/null)
    if [ -n "$response" ]; then
        echo "  ✅ 有响应 (${#response} 字符)"
        if [[ $response == *"404"* ]]; then
            echo "    ⚠️  返回 404 错误"
        fi
    else
        echo "  ❌ 无响应"
    fi
done

# 6. 生成测试报告
echo ""
echo "=== 6. 测试报告 ==="
echo ""

# 统计结果
total_tests=0
passed_tests=0

# 前端测试
total_tests=$((total_tests + 1))
if [[ $frontend_response == *"html"* ]] || [[ $frontend_response == *"<!DOCTYPE"* ]]; then
    passed_tests=$((passed_tests + 1))
fi

# API 测试
total_tests=$((total_tests + 1))
if [[ $api_response == *"API"* ]] || [[ $api_response == *"流程天命人"* ]]; then
    passed_tests=$((passed_tests + 1))
fi

# 认证测试
total_tests=$((total_tests + 1))
if [[ $auth_response == *"error"* ]] || [[ $auth_response == *"invalid"* ]] || [[ $auth_response == *"unauthorized"* ]]; then
    passed_tests=$((passed_tests + 1))
fi

echo "测试结果: $passed_tests/$total_tests 通过"

if [ $passed_tests -eq $total_tests ]; then
    echo "🎉 恭喜！所有测试都通过了！"
    echo ""
    echo "✅ 您的应用现在可以正常使用："
    echo "  - 前端: http://$CLUSTER_IP/"
    echo "  - 后端 API: http://$CLUSTER_IP/api/"
    echo "  - 登录: http://$CLUSTER_IP/api/auth/signin"
else
    echo "⚠️  部分测试未通过，请检查上述问题"
    echo ""
    echo "建议："
    echo "1. 检查 Ingress 配置"
    echo "2. 检查后端服务状态"
    echo "3. 检查网络连接"
fi

echo ""
echo "=== 测试完成 ==="
