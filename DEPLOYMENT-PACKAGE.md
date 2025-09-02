# 🚀 部署包说明

## 📦 部署包内容

本部署包包含完整的容器化应用，支持在任何支持 Docker 的平台上部署。

### 必需文件
- ✅ `Dockerfile` - 生产环境容器配置
- ✅ `Dockerfile.dev` - 开发环境容器配置
- ✅ `docker-compose.yml` - Docker Compose 配置
- ✅ `nginx.conf` - Nginx 服务器配置
- ✅ `.dockerignore` - Docker 构建优化
- ✅ `package.json` - 项目依赖和脚本
- ✅ `tailwind.config.js` - Tailwind CSS 配置
- ✅ `css/input.css` - CSS 源文件
- ✅ `css/style.css` - 自定义样式
- ✅ `index.html` - 主页面
- ✅ `js/` - JavaScript 源代码
- ✅ `assets/` - 静态资源
- ✅ `DOCKER-DEPLOYMENT.md` - 详细部署指南

## 🎯 快速部署

### 方法 1：Docker 直接部署
```bash
# 构建镜像
docker build -t lctmr-app .

# 运行容器
docker run -d -p 8080:80 --name lctmr-app lctmr-app

# 访问应用
# 浏览器打开: http://localhost:8080
```

### 方法 2：Docker Compose 部署
```bash
# 生产环境
docker-compose up -d app

# 开发环境
docker-compose --profile dev up -d dev
```

### 方法 3：使用 npm 脚本
```bash
# 构建并运行
npm run docker:build
npm run docker:run

# 或使用 Docker Compose
npm run docker:prod
```

## 🔧 环境要求

- Docker 20.10+ 
- Docker Compose 2.0+
- 8GB+ 可用内存
- 2GB+ 可用磁盘空间

## 📋 部署检查清单

- [ ] Docker 已安装并运行
- [ ] 端口 8080 未被占用
- [ ] 网络连接正常
- [ ] 磁盘空间充足

## 🚨 常见问题

1. **端口冲突**：使用 `-p 8081:80` 指定其他端口
2. **构建失败**：检查网络连接，确保能访问 Docker Hub
3. **容器无法启动**：检查 Docker 服务状态

## 📞 技术支持

如遇问题，请提供：
- Docker 版本信息：`docker --version`
- 错误日志：`docker logs <container-name>`
- 系统信息：`docker info`

---
**部署包版本**: v1.1.0  
**创建时间**: 2025-09-02  
**支持平台**: 所有支持 Docker 的平台
