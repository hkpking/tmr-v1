# 📦 部署包使用说明

## 🎯 给部署工程师的完整指南

### 📋 部署包内容

本部署包包含以下文件：

#### 核心文件
- `Dockerfile` - 生产环境容器配置
- `Dockerfile.dev` - 开发环境容器配置  
- `docker-compose.yml` - Docker Compose 配置
- `nginx.conf` - Nginx 服务器配置
- `.dockerignore` - Docker 构建优化

#### 应用文件
- `index.html` - 主页面
- `package.json` - 项目配置和依赖
- `tailwind.config.js` - Tailwind CSS 配置
- `css/` - 样式文件目录
- `js/` - JavaScript 源代码目录
- `assets/` - 静态资源目录

#### 部署工具
- `deploy.sh` - Linux/macOS 自动部署脚本
- `deploy.bat` - Windows 自动部署脚本
- `DEPLOYMENT-PACKAGE.md` - 部署包说明
- `DEPLOYMENT-CHECKLIST.md` - 部署检查清单
- `DOCKER-DEPLOYMENT.md` - 详细部署指南

## 🚀 快速开始

### 1. 解压部署包
```bash
# 解压到目标目录
unzip lctmr-v1.1-deployment.zip
cd lctmr-v1.1-deployment
```

### 2. 一键部署 (推荐)

#### Linux/macOS:
```bash
./deploy.sh
```

#### Windows:
```cmd
deploy.bat
```

### 3. 验证部署
- 打开浏览器访问: http://localhost:8080
- 检查健康状态: http://localhost:8080/health

## 🔧 环境要求

- **Docker**: 20.10+ 版本
- **内存**: 至少 4GB 可用内存
- **磁盘**: 至少 2GB 可用空间
- **网络**: 能够访问 Docker Hub

## 📋 部署检查清单

部署前请确认：
- [ ] Docker 已安装并运行
- [ ] 端口 8080 未被占用
- [ ] 网络连接正常
- [ ] 磁盘空间充足

## 🆘 常见问题解决

### 问题 1: 端口被占用
```bash
# 使用其他端口
./deploy.sh -p 8081
```

### 问题 2: Docker 服务未启动
```bash
# 启动 Docker Desktop (Windows/macOS)
# 或启动 Docker 服务 (Linux)
sudo systemctl start docker
```

### 问题 3: 构建失败
```bash
# 检查网络连接
docker pull node:18-alpine

# 重新构建
docker build --no-cache -t lctmr-app .
```

## 📞 技术支持

如遇问题，请提供：
- 错误信息截图
- 系统环境信息
- Docker 版本信息

---

**部署包版本**: v1.1.0  
**创建时间**: 2025-09-02  
**适用平台**: 所有支持 Docker 的平台
