# 流程天命人 - 前后端分离容器化部署

## 项目概述

本项目是一个基于Web的学习管理系统，采用前后端分离架构，支持容器化部署。前端使用原生HTML/CSS/JavaScript，后端使用Node.js + Express + PostgreSQL。

## 项目结构

```
lctmr-v2.0/
├── frontend/                 # 前端相关文件
│   ├── Dockerfile           # 前端容器配置
│   ├── nginx.conf           # Nginx配置
│   └── .dockerignore        # Docker忽略文件
├── backend/                  # 后端相关文件
│   ├── Dockerfile           # 后端容器配置
│   ├── server.js            # 后端主服务文件
│   ├── package.json         # 后端依赖配置
│   ├── config/              # 后端配置文件
│   ├── routes/              # API路由
│   └── .dockerignore        # Docker忽略文件
├── assets/                   # 静态资源
├── css/                      # 样式文件
├── js/                       # 前端JavaScript
├── dist/                     # 构建输出
├── docker-compose.yml        # 生产环境Docker Compose
├── docker-compose.dev.yml    # 开发环境Docker Compose
├── env.example              # 环境变量示例
├── env.development          # 开发环境配置
├── env.production           # 生产环境配置
├── deploy.sh                # Linux/Mac部署脚本
├── deploy.bat               # Windows部署脚本
└── Back/                    # 备份的旧文件
```

## 环境要求

- Docker 20.10+
- Docker Compose 2.0+
- Node.js 18+ (仅开发环境需要)

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd lctmr-v2.0
```

### 2. 配置环境变量

复制环境变量示例文件并根据需要修改：

```bash
cp env.example .env
```

编辑 `.env` 文件，配置数据库连接等信息。

### 3. 启动服务

#### 生产环境

```bash
# Linux/Mac
./deploy.sh start production

# Windows
deploy.bat start production
```

#### 开发环境

```bash
# Linux/Mac
./deploy.sh start development

# Windows
deploy.bat start development
```

### 4. 访问应用

- 前端: http://localhost:3000
- 后端API: http://localhost:3001/api
- 健康检查: http://localhost:3001/health

## 部署命令

### Linux/Mac

```bash
# 构建镜像
./deploy.sh build [development|production]

# 启动服务
./deploy.sh start [development|production]

# 停止服务
./deploy.sh stop [development|production]

# 重启服务
./deploy.sh restart [development|production]

# 查看状态
./deploy.sh status [development|production]

# 查看日志
./deploy.sh logs [development|production] [service]

# 清理资源
./deploy.sh cleanup

# 显示帮助
./deploy.sh help
```

### Windows

```cmd
# 构建镜像
deploy.bat build [development|production]

# 启动服务
deploy.bat start [development|production]

# 停止服务
deploy.bat stop [development|production]

# 重启服务
deploy.bat restart [development|production]

# 查看状态
deploy.bat status [development|production]

# 查看日志
deploy.bat logs [development|production] [service]

# 清理资源
deploy.bat cleanup

# 显示帮助
deploy.bat help
```

## 环境配置

### 环境变量说明

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| NODE_ENV | 运行环境 | development |
| DB_HOST | 数据库主机 | localhost |
| DB_PORT | 数据库端口 | 5432 |
| DB_USER | 数据库用户名 | postgres |
| DB_PASSWORD | 数据库密码 | postgres |
| DB_NAME | 数据库名称 | lctmr_development |
| DB_SSL | 是否使用SSL | false |
| JWT_SECRET | JWT密钥 | - |
| JWT_EXPIRES_IN | JWT过期时间 | 24h |
| API_URL | API服务地址 | http://localhost:3001/api |
| FRONTEND_URL | 前端地址 | http://localhost:3000 |
| PORT | 后端服务端口 | 3001 |

### 数据库配置

项目支持PostgreSQL数据库，需要预先创建数据库：

```sql
CREATE DATABASE lctmr_development;
CREATE DATABASE lctmr_production;
```

## 开发指南

### 本地开发

1. 启动数据库服务
2. 配置环境变量
3. 安装依赖并启动服务：

```bash
# 后端
cd backend
npm install
npm run dev

# 前端
# 使用Live Server或其他静态文件服务器
```

### 容器开发

```bash
# 启动开发环境
./deploy.sh start development

# 查看日志
./deploy.sh logs development

# 停止服务
./deploy.sh stop development
```

## 生产部署

### 1. 准备环境

- 确保服务器已安装Docker和Docker Compose
- 配置生产环境变量
- 准备PostgreSQL数据库

### 2. 部署应用

```bash
# 构建生产镜像
./deploy.sh build production

# 启动生产服务
./deploy.sh start production
```

### 3. 配置反向代理

建议使用Nginx作为反向代理，配置示例：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 监控和维护

### 健康检查

- 前端健康检查: http://localhost:3000/health
- 后端健康检查: http://localhost:3001/health

### 日志查看

```bash
# 查看所有服务日志
./deploy.sh logs production

# 查看特定服务日志
./deploy.sh logs production backend
./deploy.sh logs production frontend
```

### 服务状态

```bash
# 查看服务状态
./deploy.sh status production
```

## 故障排除

### 常见问题

1. **端口冲突**
   - 检查3000和3001端口是否被占用
   - 修改docker-compose.yml中的端口映射

2. **数据库连接失败**
   - 检查数据库服务是否启动
   - 验证环境变量配置
   - 检查网络连接

3. **容器启动失败**
   - 查看容器日志: `docker logs <container_name>`
   - 检查镜像构建是否成功
   - 验证配置文件语法

### 清理和重置

```bash
# 清理所有资源
./deploy.sh cleanup

# 重新构建和启动
./deploy.sh build production
./deploy.sh start production
```

## 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+), TailwindCSS
- **后端**: Node.js, Express.js, PostgreSQL
- **容器化**: Docker, Docker Compose
- **反向代理**: Nginx
- **认证**: JWT

## 许可证

本项目采用 MIT 许可证。

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 联系方式

如有问题或建议，请通过以下方式联系：

- 项目Issues: [GitHub Issues](https://github.com/your-repo/issues)
- 邮箱: your-email@example.com
