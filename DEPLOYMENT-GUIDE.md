# 流程天命人 - 生产环境部署指南

## 🚀 快速部署

### 方法一：使用启动脚本（推荐）

#### Windows 用户：
```bash
# 双击运行或在命令行执行
start-production.bat
```

#### Linux/Mac 用户：
```bash
# 给脚本执行权限
chmod +x start-production.sh

# 运行脚本
./start-production.sh
```

### 方法二：手动部署

#### 1. 安装依赖
```bash
# 安装服务器依赖
cd server
npm install

# 安装前端依赖
cd ..
npm install
```

#### 2. 设置环境变量
```bash
# Windows (PowerShell)
$env:NODE_ENV="production"
$env:DB_HOST="101.32.59.153"
$env:DB_PORT="5432"
$env:DB_USER="web_app"
$env:DB_PASSWORD="Dslr*2025#app"
$env:DB_NAME="lctmr_production"
$env:DB_SSL="false"
$env:JWT_SECRET="7YtYAMJUa4LaqChbkV0iN5IMSHvaBCVtBmUktZX3E8JOG0i+4TShH5vXl2HhleUMNITi4thFiYv8UFbdiazkqA=="
$env:JWT_EXPIRES_IN="24h"
$env:FRONTEND_URL="http://localhost:5500"
$env:API_URL="http://localhost:3001/api"
$env:PORT="3001"

# Linux/Mac
export NODE_ENV=production
export DB_HOST=101.32.59.153
export DB_PORT=5432
export DB_USER=web_app
export DB_PASSWORD='Dslr*2025#app'
export DB_NAME=lctmr_production
export DB_SSL=false
export JWT_SECRET='7YtYAMJUa4LaqChbkV0iN5IMSHvaBCVtBmUktZX3E8JOG0i+4TShH5vXl2HhleUMNITi4thFiYv8UFbdiazkqA=='
export JWT_EXPIRES_IN=24h
export FRONTEND_URL=http://localhost:5500
export API_URL=http://localhost:3001/api
export PORT=3001
```

#### 3. 测试数据库连接
```bash
node test-database.js
```

#### 4. 启动服务器
```bash
cd server
node server.js
```

## 🔧 配置说明

### 数据库配置
- **主机**: 101.32.59.153
- **端口**: 5432
- **数据库**: lctmr_production
- **用户**: web_app
- **SSL**: 关闭

### 服务器配置
- **端口**: 3001 (可通过 PORT 环境变量修改)
- **CORS**: 已配置支持本地开发和生产域名

### 安全配置
- **JWT密钥**: 已设置强密钥
- **限流**: 已启用API限流保护
- **Helmet**: 已启用安全头保护

## 📊 验证部署

### 1. 检查服务器状态
访问: `http://localhost:3001/api/health`

### 2. 检查数据库连接
运行: `node test-database.js`

### 3. 检查前端连接
确保前端应用可以正常访问API

## 🛠️ 故障排除

### 常见问题

#### 1. 数据库连接失败
```bash
# 检查网络连接
ping 101.32.59.153

# 检查端口是否开放
telnet 101.32.59.153 5432
```

#### 2. 端口被占用
```bash
# Windows
netstat -ano | findstr :3001

# Linux/Mac
lsof -i :3001
```

#### 3. 依赖安装失败
```bash
# 清理缓存重新安装
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 📝 日志监控

服务器启动后会显示详细的日志信息：
- 数据库连接状态
- API请求日志
- 错误信息

## 🔄 更新部署

1. 拉取最新代码
2. 重新安装依赖（如有变化）
3. 重启服务器

## 📞 技术支持

如遇到问题，请检查：
1. Node.js 版本 >= 18.0.0
2. 网络连接正常
3. 数据库服务可用
4. 端口未被占用
