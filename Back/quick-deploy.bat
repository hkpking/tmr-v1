@echo off
echo 🚀 快速部署流程天命人应用...

echo 📦 构建镜像...
docker build -t lctmr-v20-app:latest .

if %errorlevel% neq 0 (
    echo ❌ 镜像构建失败
    pause
    exit /b 1
)

echo ✅ 镜像构建成功

echo 🔄 重启 K8s 部署...
kubectl rollout restart deployment/lctmr-app -n lctmr

echo ⏳ 等待部署完成...
kubectl rollout status deployment/lctmr-app -n lctmr

echo ✅ 部署完成！
echo 🌐 访问地址: http://localhost:8080
echo 🔧 直接API: http://localhost:3001

pause

