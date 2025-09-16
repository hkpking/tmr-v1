@echo off
echo ========================================
echo 流程天命人 v2.0 - K8s 环境设置
echo ========================================

echo.
echo [1/4] 检查 Docker 状态...
docker --version
if %errorlevel% neq 0 (
    echo 错误: Docker 未安装或未运行
    pause
    exit /b 1
)

echo.
echo [2/4] 检查 kubectl...
kubectl version --client
if %errorlevel% neq 0 (
    echo 错误: kubectl 未安装
    echo 请先安装 kubectl: https://kubernetes.io/docs/tasks/tools/install-kubectl/
    pause
    exit /b 1
)

echo.
echo [3/4] 检查 K8s 集群...
kubectl get nodes
if %errorlevel% neq 0 (
    echo 警告: 无法连接到 K8s 集群
    echo 请确保 Docker Desktop 中已启用 Kubernetes
    echo 或使用 Minikube: minikube start
    pause
    exit /b 1
)

echo.
echo [4/4] 部署应用...
kubectl create namespace lctmr --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -f k8s/ -n lctmr

echo.
echo ========================================
echo 部署完成！
echo ========================================
echo.
echo 查看状态: kubectl get all -n lctmr
echo 端口转发: kubectl port-forward svc/lctmr-nginx-service 8080:80 -n lctmr
echo 访问应用: http://localhost:8080
echo.
pause
