# Docker 镜像本地化说明

## 📦 已保存的镜像文件

| 镜像名称 | 文件名 | 大小 | 用途 |
|---------|--------|------|------|
| `node:18-alpine` | `node-18-alpine.tar` | 43MB | Node.js 运行环境 |
| `nginx:alpine` | `nginx-alpine.tar` | 22MB | Web 服务器 |
| `postgres:15` | `postgres-15.tar` | 629MB | 数据库（备用） |
| `lctmr-remote:latest` | `lctmr-remote.tar` | 538MB | 应用镜像 |

## 🚀 使用方法

### 1. 加载所有镜像
```bash
# Windows
load-images.bat

# Linux/macOS
chmod +x load-images.sh
./load-images.sh
```

### 2. 手动加载单个镜像
```bash
# 加载应用镜像
docker load -i docker-images/lctmr-remote.tar

# 加载基础镜像
docker load -i docker-images/node-18-alpine.tar
docker load -i docker-images/nginx-alpine.tar
```

### 3. 启动服务
```bash
docker-compose up -d
```

## 💡 优势

1. **离线部署**: 不需要网络连接即可部署
2. **快速启动**: 避免重复下载和构建
3. **版本固定**: 确保使用相同版本的镜像
4. **便携性**: 可以复制到其他机器使用

## 📋 部署流程

1. 复制整个项目目录到目标机器
2. 确保目标机器已安装 Docker
3. 运行 `load-images.bat` 或 `load-images.sh`
4. 运行 `docker-compose up -d`
5. 访问 http://localhost

## 🔧 网络切换说明

由于数据库不允许VPN访问，请按以下步骤操作：

1. **构建阶段**: 保持VPN连接，下载和构建镜像
2. **部署阶段**: 关闭VPN，使用本地镜像部署
3. **测试阶段**: 在无VPN环境下测试数据库连接

## 📁 文件结构

```
lctmr-v2.0/
├── docker-images/           # 镜像文件目录
│   ├── lctmr-remote.tar     # 应用镜像
│   ├── node-18-alpine.tar   # Node.js 基础镜像
│   ├── nginx-alpine.tar     # Nginx 镜像
│   └── postgres-15.tar      # PostgreSQL 镜像
├── load-images.bat          # Windows 加载脚本
├── load-images.sh           # Linux/macOS 加载脚本
└── docker-compose.yml       # Docker Compose 配置
```
