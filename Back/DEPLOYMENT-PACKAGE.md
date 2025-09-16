# 流程天命人 v2.0 - 部署包说明

## 📦 部署包概述

本部署包已完全移除本地数据库配置，仅支持远程数据库部署。所有配置已简化为单一远程数据库配置。

## 🗂️ 文件结构

```
lctmr-v2.0/
├── 📁 assets/                    # 静态资源
├── 📁 config/                    # 主配置文件
│   └── database-config.js        # 统一数据库配置（支持环境变量）
├── 📁 config-production/         # 生产环境配置
│   ├── database-config.js        # 生产环境数据库配置
│   ├── env.production            # 生产环境变量
│   ├── start-remote-server.bat   # Windows启动脚本
│   └── start-remote-server.sh    # Linux启动脚本
├── 📁 css/                       # 样式文件
├── 📁 js/                        # 前端JavaScript
├── 📁 nginx/                     # Nginx配置
├── 📁 server/                    # 后端服务器
├── 📄 docker-compose.yml         # Docker Compose配置
├── 📄 docker-deploy.bat          # Windows Docker部署脚本
├── 📄 docker-deploy.sh           # Linux Docker部署脚本
├── 📄 Dockerfile                 # Docker镜像构建文件
└── 📄 各种文档.md                # 项目文档
```

## 🚀 快速部署

### 方法一：Docker部署（推荐）

**Windows:**
```bash
docker-deploy.bat
```

**Linux/macOS:**
```bash
chmod +x docker-deploy.sh
./docker-deploy.sh
```

### 方法二：直接启动

**Windows:**
```bash
start-remote-server.bat
```

**Linux/macOS:**
```bash
chmod +x start-remote-server.sh
./start-remote-server.sh
```

## ⚙️ 环境变量配置

应用支持以下环境变量配置：

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `NODE_ENV` | `development` | 运行环境 |
| `DB_HOST` | `101.32.59.153` | 数据库主机 |
| `DB_PORT` | `5432` | 数据库端口 |
| `DB_USER` | `web_app` | 数据库用户名 |
| `DB_PASSWORD` | `Dslr*2025#app` | 数据库密码 |
| `DB_NAME` | `lctmr_production` | 数据库名称 |
| `DB_SSL` | `false` | 是否使用SSL |
| `JWT_SECRET` | 默认密钥 | JWT密钥 |
| `JWT_EXPIRES_IN` | `24h` | JWT过期时间 |
| `FRONTEND_URL` | `http://localhost:5500` | 前端URL |
| `API_URL` | `http://localhost:3001/api` | API URL |
| `PORT` | `3001` | 服务器端口 |

## 🔧 配置说明

### 数据库配置
- **类型**: PostgreSQL
- **主机**: 101.32.59.153
- **端口**: 5432
- **数据库**: lctmr_production
- **用户**: web_app
- **密码**: Dslr*2025#app

### 服务端口
- **应用服务**: 3001
- **Nginx**: 80, 443

## 📋 部署检查清单

- [ ] Docker环境已安装并运行
- [ ] 远程数据库连接正常
- [ ] 环境变量配置正确
- [ ] 端口3001和80未被占用
- [ ] 防火墙允许相应端口访问

## 🛠️ 常用命令

```bash
# 启动服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 进入容器
docker exec -it lctmr-app-remote sh
```

## 🔍 故障排除

### 数据库连接失败
1. 检查网络连接
2. 验证数据库凭据
3. 确认防火墙设置

### 端口冲突
1. 检查端口占用：`netstat -tulpn | grep :3001`
2. 修改docker-compose.yml中的端口映射

### 容器启动失败
1. 查看容器日志：`docker logs lctmr-app-remote`
2. 检查环境变量配置
3. 验证配置文件语法

## 📞 技术支持

如遇到问题，请检查：
1. 日志文件
2. 网络连接
3. 配置文件
4. 环境变量

---

**注意**: 本部署包已移除所有本地数据库相关配置，仅支持远程数据库部署。
