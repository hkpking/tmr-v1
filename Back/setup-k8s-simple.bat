@echo off
echo ========================================
echo 流程天命人 v2.0 - K8s 环境快速搭建
echo ========================================

echo.
echo [步骤 1/4] 检查 Docker Desktop...
docker --version
if %errorlevel% neq 0 (
    echo 错误: Docker Desktop 未运行
    echo 请先启动 Docker Desktop
    pause
    exit /b 1
)

echo.
echo [步骤 2/4] 检查 kubectl...
kubectl version --client >nul 2>&1
if %errorlevel% neq 0 (
    echo kubectl 未安装，正在安装...
    call install-kubectl.bat
    if %errorlevel% neq 0 (
        echo kubectl 安装失败
        pause
        exit /b 1
    )
)

echo.
echo [步骤 3/4] 检查 K8s 集群...
kubectl get nodes >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo 请按以下步骤启用 Kubernetes：
    echo ========================================
    echo 1. 打开 Docker Desktop
    echo 2. 点击右上角设置图标 ⚙️
    echo 3. 选择 "Kubernetes"
    echo 4. 勾选 "Enable Kubernetes"
    echo 5. 点击 "Apply & Restart"
    echo 6. 等待重启完成
    echo.
    echo 完成后按任意键继续...
    pause
    goto :check_cluster
)

:check_cluster
kubectl get nodes
if %errorlevel% neq 0 (
    echo 错误: 无法连接到 K8s 集群
    echo 请确保 Docker Desktop 中已启用 Kubernetes
    pause
    exit /b 1
)

echo.
echo [步骤 4/4] 部署应用...
echo 创建命名空间...
kubectl create namespace lctmr --dry-run=client -o yaml | kubectl apply -f -

echo 部署应用配置...
kubectl apply -f k8s/ -n lctmr

echo.
echo ========================================
echo K8s 环境搭建完成！
echo ========================================
echo.
echo 查看状态: kubectl get all -n lctmr
echo 端口转发: kubectl port-forward svc/lctmr-nginx-service 8080:80 -n lctmr
echo 访问应用: http://localhost:8080
echo.
echo 按任意键查看应用状态...
pause

echo.
echo 当前应用状态:
kubectl get all -n lctmr

echo.
echo 如需端口转发访问，请运行：
echo kubectl port-forward svc/lctmr-nginx-service 8080:80 -n lctmr
echo.
pause
