# 🚀 工程师部署指南

## 📋 部署前检查清单

### 环境要求
- [ ] Docker 20.10+ 已安装
- [ ] Docker Compose 2.0+ 已安装
- [ ] 网络可以访问远程数据库 (101.32.59.153:5432)
- [ ] 端口 80 和 3001 未被占用

### 文件检查
- [ ] 所有项目文件已下载
- [ ] `docker-compose.yml` 存在
- [ ] `Dockerfile` 存在
- [ ] `nginx/` 目录存在
- [ ] `server/` 目录存在
- [ ] `config/` 目录存在

## 🚀 一键部署

### Windows 用户
```cmd
# 1. 打开命令提示符
# 2. 进入项目目录
cd /path/to/lctmr-v2.0

# 3. 运行部署脚本
docker-deploy.bat
```

### Linux/Mac 用户
```bash
# 1. 打开终端
# 2. 进入项目目录
cd /path/to/lctmr-v2.0

# 3. 给脚本执行权限
chmod +x docker-deploy.sh

# 4. 运行部署脚本
./docker-deploy.sh
```

## 🔍 部署验证

### 1. 检查容器状态
```bash
docker-compose ps
```
**期望结果**: 两个容器都显示 `Up` 状态

### 2. 测试前端访问
```bash
curl -I http://localhost
```
**期望结果**: 返回 200 OK，Content-Length: 25689

### 3. 测试API访问
```bash
curl -I http://localhost/api/health
```
**期望结果**: 返回 200 OK

### 4. 测试CORS配置
```bash
curl -X OPTIONS http://localhost/api/auth/signin -H "Origin: http://localhost" -H "Access-Control-Request-Method: POST" -v
```
**期望结果**: 返回 204 No Content，包含 CORS 头

## 🌐 访问应用

部署成功后，可以通过以下地址访问：

- **前端应用**: http://localhost
- **API接口**: http://localhost/api/
- **健康检查**: http://localhost/api/health

## 🛠️ 故障排除

### 问题1: 容器启动失败
```bash
# 查看详细日志
docker-compose logs

# 重新构建
docker-compose build --no-cache
docker-compose up -d
```

### 问题2: 数据库连接失败
```bash
# 检查网络连接
ping 101.32.59.153

# 检查数据库配置
docker exec lctmr-app-remote node -e "console.log(require('./config/database-config.js').getCurrentDatabaseConfig())"
```

### 问题3: 前端显示Nginx默认页面
```bash
# 检查文件挂载
docker exec lctmr-nginx-remote ls -la /app

# 重启Nginx
docker-compose restart nginx
```

### 问题4: CORS错误
```bash
# 检查CORS配置
docker exec lctmr-app-remote grep -A 10 "CORS配置" /app/server/server.js

# 重启应用
docker-compose restart app
```

## 📞 技术支持

如果遇到问题，请提供以下信息：
1. 操作系统版本
2. Docker版本 (`docker --version`)
3. 错误日志 (`docker-compose logs`)
4. 容器状态 (`docker-compose ps`)

---

**部署包版本**: v2.0-final  
**支持状态**: ✅ 完整支持
