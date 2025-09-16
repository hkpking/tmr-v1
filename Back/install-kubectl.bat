@echo off
echo ========================================
echo 安装 kubectl 命令行工具
echo ========================================

echo.
echo [1/3] 检查是否已安装 kubectl...
kubectl version --client >nul 2>&1
if %errorlevel% equ 0 (
    echo kubectl 已安装
    kubectl version --client
    goto :verify
)

echo.
echo [2/3] 下载 kubectl...
echo 正在下载 kubectl v1.30.0...

powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://dl.k8s.io/release/v1.30.0/bin/windows/amd64/kubectl.exe' -OutFile 'kubectl.exe'}"

if not exist kubectl.exe (
    echo 下载失败，请手动下载：
    echo https://kubernetes.io/docs/tasks/tools/install-kubectl/
    pause
    exit /b 1
)

echo.
echo [3/3] 安装 kubectl...
move kubectl.exe C:\Windows\System32\kubectl.exe
if %errorlevel% neq 0 (
    echo 安装失败，请以管理员身份运行此脚本
    pause
    exit /b 1
)

:verify
echo.
echo 验证安装...
kubectl version --client
if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo kubectl 安装成功！
    echo ========================================
) else (
    echo.
    echo 安装失败，请检查网络连接或手动安装
)

echo.
pause
