# 🐳 容器化部署指南

## 概述

本项目已完全容器化，确保在任何平台上部署都能保持完全一致的环境和体验。

## 🚀 快速开始

### 本地开发

```bash
# 启动开发环境（热重载）
npm run docker:dev

# 或者使用 Docker Compose
docker-compose --profile dev up dev
```

### 生产部署

```bash
# 构建并运行生产环境
npm run docker:prod

# 或者分步执行
npm run docker:build
npm run docker:run
```

## 📋 部署选项

### 1. 本地 Docker 部署

```bash
# 构建镜像
docker build -t lctmr-app .

# 运行容器
docker run -p 8080:80 lctmr-app

# 访问应用
open http://localhost:8080
```

### 2. Docker Compose 部署

```bash
# 生产环境
docker-compose up app

# 开发环境
docker-compose --profile dev up dev

# 停止服务
docker-compose down
```

### 3. 云平台部署

#### Netlify
```bash
# 构建镜像并推送到容器注册表
docker build -t your-registry/lctmr-app .
docker push your-registry/lctmr-app

# 在 Netlify 中配置容器部署
```

#### Vercel
```bash
# 使用 Vercel CLI 部署容器
vercel --prod
```

#### AWS ECS/Fargate
```bash
# 构建并推送镜像
docker build -t your-ecr-repo/lctmr-app .
docker push your-ecr-repo/lctmr-app

# 创建 ECS 任务定义和服务
```

#### Google Cloud Run
```bash
# 构建并推送镜像
docker build -t gcr.io/your-project/lctmr-app .
docker push gcr.io/your-project/lctmr-app

# 部署到 Cloud Run
gcloud run deploy --image gcr.io/your-project/lctmr-app
```

## 🔧 环境配置

### 环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| NODE_ENV | production | 运行环境 |
| PORT | 80 | 服务端口 |

### 健康检查

应用提供健康检查端点：
- URL: `http://localhost:8080/health`
- 返回: `healthy`

## 📁 项目结构

```
├── Dockerfile              # 生产环境镜像
├── Dockerfile.dev          # 开发环境镜像
├── docker-compose.yml      # Docker Compose 配置
├── nginx.conf              # Nginx 配置
├── .dockerignore           # Docker 忽略文件
└── DOCKER-DEPLOYMENT.md    # 本文档
```

## 🛠️ 开发工作流

### 1. 本地开发
```bash
# 启动开发环境
npm run docker:dev

# 修改代码，CSS 会自动重新构建
# 访问 http://localhost:3000
```

### 2. 测试生产构建
```bash
# 构建生产镜像
npm run docker:build

# 运行生产环境
npm run docker:run

# 访问 http://localhost:8080
```

### 3. 部署到生产
```bash
# 推送到容器注册表
docker tag lctmr-app your-registry/lctmr-app:latest
docker push your-registry/lctmr-app:latest

# 在目标平台部署
```

## 🔍 故障排除

### 常见问题

1. **CSS 文件 404 错误**
   ```bash
   # 检查构建是否成功
   docker run --rm lctmr-app ls -la /usr/share/nginx/html/dist/
   ```

2. **端口冲突**
   ```bash
   # 使用不同端口
   docker run -p 3000:80 lctmr-app
   ```

3. **构建失败**
   ```bash
   # 查看构建日志
   docker build --no-cache -t lctmr-app .
   ```

### 调试命令

```bash
# 进入容器调试
docker run -it --rm lctmr-app sh

# 查看容器日志
docker logs <container-id>

# 检查容器状态
docker ps
```

## 📊 性能优化

- ✅ 多阶段构建减少镜像大小
- ✅ Nginx 静态文件服务
- ✅ Gzip 压缩
- ✅ 静态资源缓存
- ✅ 健康检查
- ✅ 安全头配置

## 🔒 安全特性

- ✅ 非 root 用户运行
- ✅ 安全头配置
- ✅ 最小化攻击面
- ✅ 定期安全更新

## 📈 监控和日志

```bash
# 查看访问日志
docker exec <container-id> tail -f /var/log/nginx/access.log

# 查看错误日志
docker exec <container-id> tail -f /var/log/nginx/error.log
```

---

🎉 **现在您可以在任何支持 Docker 的平台上部署，确保完全一致的环境！**
