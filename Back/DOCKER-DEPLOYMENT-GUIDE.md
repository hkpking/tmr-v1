# Docker 容器化部署指南

## 📋 概述

本项目支持两种容器化部署方式：
1. **本地数据库部署** - 包含 PostgreSQL 数据库容器
2. **远程数据库部署** - 连接外部远程数据库

## 🏗️ 项目结构

```
lctmr-v1.1/
├── Dockerfile                    # Docker 镜像构建文件
├── docker-compose.local.yml      # 本地数据库部署配置
├── docker-compose.remote.yml     # 远程数据库部署配置
├── docker-deploy-local.bat       # Windows 本地部署脚本
├── docker-deploy-remote.bat      # Windows 远程部署脚本
├── docker-deploy-local.sh        # Linux/Mac 本地部署脚本
├── docker-deploy-remote.sh       # Linux/Mac 远程部署脚本
├── nginx/                        # Nginx 配置
│   ├── nginx.conf
│   └── conf.d/default.conf
└── .dockerignore                 # Docker 忽略文件
```

## 🚀 快速部署

### 方法一：使用部署脚本（推荐）

#### Windows 用户
```bash
# 部署本地数据库版本
docker-deploy-local.bat

# 部署远程数据库版本
docker-deploy-remote.bat
```

#### Linux/Mac 用户
```bash
# 给脚本执行权限
chmod +x docker-deploy-*.sh

# 部署本地数据库版本
./docker-deploy-local.sh

# 部署远程数据库版本
./docker-deploy-remote.sh
```

### 方法二：手动部署

#### 本地数据库部署
```bash
# 构建并启动服务
docker-compose -f docker-compose.local.yml up -d --build

# 查看服务状态
docker-compose -f docker-compose.local.yml ps

# 查看日志
docker-compose -f docker-compose.local.yml logs -f
```

#### 远程数据库部署
```bash
# 构建并启动服务
docker-compose -f docker-compose.remote.yml up -d --build

# 查看服务状态
docker-compose -f docker-compose.remote.yml ps

# 查看日志
docker-compose -f docker-compose.remote.yml logs -f
```

## 📊 服务配置对比

| 配置项 | 本地数据库部署 | 远程数据库部署 |
|--------|----------------|----------------|
| 数据库 | PostgreSQL 容器 | 外部远程数据库 |
| 数据库主机 | postgres | 101.32.59.153 |
| 数据库端口 | 5432 | 5432 |
| 数据库名 | lctmr_local | lctmr_production |
| 数据库用户 | postgres | web_app |
| 环境 | development | production |
| 数据持久化 | Docker Volume | 外部数据库 |

## 🔧 服务组件

### 1. 应用服务 (app)
- **镜像**: 基于 Node.js 18 Alpine
- **端口**: 3001
- **健康检查**: `/health` 端点
- **环境变量**: 根据部署类型自动配置

### 2. 数据库服务 (postgres) - 仅本地部署
- **镜像**: PostgreSQL 15 Alpine
- **端口**: 5432
- **数据持久化**: Docker Volume
- **初始化**: 支持 SQL 脚本自动执行

### 3. Nginx 服务 (nginx)
- **镜像**: Nginx Alpine
- **端口**: 80, 443
- **功能**: 反向代理、静态文件服务、负载均衡

## 🌐 访问地址

部署成功后，可以通过以下地址访问：

- **前端应用**: http://localhost
- **API 接口**: http://localhost:3001/api
- **健康检查**: http://localhost:3001/health
- **数据库** (仅本地): localhost:5432

## 📝 常用命令

### 服务管理
```bash
# 启动服务
docker-compose -f docker-compose.local.yml up -d

# 停止服务
docker-compose -f docker-compose.local.yml down

# 重启服务
docker-compose -f docker-compose.local.yml restart

# 查看服务状态
docker-compose -f docker-compose.local.yml ps
```

### 日志查看
```bash
# 查看所有服务日志
docker-compose -f docker-compose.local.yml logs -f

# 查看特定服务日志
docker-compose -f docker-compose.local.yml logs -f app
docker-compose -f docker-compose.local.yml logs -f postgres
docker-compose -f docker-compose.local.yml logs -f nginx
```

### 容器管理
```bash
# 进入应用容器
docker exec -it lctmr-app-local sh

# 进入数据库容器 (仅本地部署)
docker exec -it lctmr-postgres-local psql -U postgres -d lctmr_local

# 查看容器资源使用
docker stats
```

### 数据管理
```bash
# 备份数据库 (仅本地部署)
docker exec lctmr-postgres-local pg_dump -U postgres lctmr_local > backup.sql

# 恢复数据库 (仅本地部署)
docker exec -i lctmr-postgres-local psql -U postgres lctmr_local < backup.sql
```

## 🔍 故障排除

### 1. 服务启动失败
```bash
# 查看详细日志
docker-compose -f docker-compose.local.yml logs app

# 检查容器状态
docker-compose -f docker-compose.local.yml ps

# 重新构建镜像
docker-compose -f docker-compose.local.yml build --no-cache
```

### 2. 数据库连接失败
```bash
# 检查数据库容器状态
docker-compose -f docker-compose.local.yml logs postgres

# 测试数据库连接
docker exec -it lctmr-postgres-local pg_isready -U postgres
```

### 3. 端口冲突
```bash
# 检查端口占用
netstat -tulpn | grep :3001
netstat -tulpn | grep :5432

# 修改端口映射
# 编辑 docker-compose.local.yml 文件
```

### 4. 内存不足
```bash
# 清理未使用的镜像
docker image prune -a

# 清理未使用的容器
docker container prune

# 清理未使用的卷
docker volume prune
```

## 🔒 安全配置

### 1. 环境变量安全
- 生产环境使用 `.env` 文件管理敏感信息
- 不要在代码中硬编码密码和密钥
- 定期轮换 JWT 密钥

### 2. 网络安全
- 使用 Docker 网络隔离服务
- 配置防火墙规则
- 启用 HTTPS (需要 SSL 证书)

### 3. 数据安全
- 定期备份数据库
- 使用强密码
- 限制数据库访问权限

## 📈 性能优化

### 1. 资源限制
```yaml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
```

### 2. 缓存配置
- 启用 Nginx 静态文件缓存
- 配置数据库连接池
- 使用 Redis 缓存 (可选)

### 3. 监控
- 配置健康检查
- 使用 Docker 监控工具
- 设置日志轮转

## 🚀 生产环境部署

### 1. 环境准备
```bash
# 安装 Docker 和 Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. 配置修改
- 修改环境变量为生产环境值
- 配置域名和 SSL 证书
- 设置日志轮转和监控

### 3. 部署步骤
```bash
# 克隆代码
git clone <repository-url>
cd lctmr-v1.1

# 选择部署方式
./docker-deploy-remote.sh  # 推荐使用远程数据库
```

## 📞 技术支持

如果遇到问题，请：
1. 查看本文档的故障排除部分
2. 检查 Docker 和 Docker Compose 版本
3. 查看服务日志获取详细错误信息
4. 联系技术支持团队

---

**注意**: 生产环境部署前，请确保：
- 已备份重要数据
- 已测试所有功能
- 已配置监控和日志
- 已设置安全策略
