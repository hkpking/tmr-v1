# 🚀 流程天命人 - 容器部署包

## 📦 部署包内容

### 核心文件
- `Dockerfile` - 多阶段构建配置
- `docker-compose.yml` - 容器编排配置
- `nginx/` - Nginx反向代理配置
- `server/` - 后端API服务
- `config/` - 数据库配置文件
- `js/` - 前端JavaScript文件
- `css/` - 样式文件
- `assets/` - 静态资源
- `index.html` - 前端入口文件

### 部署脚本
- `docker-deploy.bat` - Windows部署脚本
- `docker-deploy.sh` - Linux/Mac部署脚本
- `test-new-container.bat` - 配置验证脚本

## 🔧 部署步骤

### 1. 环境要求
- Docker 20.10+
- Docker Compose 2.0+
- 网络访问远程数据库

### 2. 快速部署
```bash
# Windows
docker-deploy.bat

# Linux/Mac
chmod +x docker-deploy.sh
./docker-deploy.sh
```

### 3. 验证部署
```bash
# 检查容器状态
docker-compose ps

# 测试前端访问
curl -I http://localhost

# 测试API访问
curl -I http://localhost/api/health

# 测试CORS
curl -X OPTIONS http://localhost/api/auth/signin -H "Origin: http://localhost" -H "Access-Control-Request-Method: POST"
```

## 🌐 访问地址
- **前端应用**: http://localhost
- **API服务**: http://localhost/api/
- **健康检查**: http://localhost/api/health

## ⚙️ 配置说明

### 数据库配置
- 使用远程PostgreSQL数据库
- 配置通过环境变量管理
- 支持动态配置更新

### 网络配置
- 前端通过Nginx代理访问
- API通过Nginx反向代理
- 支持CORS跨域请求

### 安全配置
- 非root用户运行
- 安全头配置
- 请求限流保护

## 🔍 故障排除

### 常见问题
1. **数据库连接失败**: 检查网络连接和数据库服务状态
2. **CORS错误**: 确认前端域名在CORS允许列表中
3. **API代理失败**: 检查Nginx配置和容器网络

### 日志查看
```bash
# 查看应用日志
docker logs lctmr-app-remote

# 查看Nginx日志
docker logs lctmr-nginx-remote

# 查看所有服务状态
docker-compose ps
```

## 📋 部署清单

- [x] Dockerfile配置正确
- [x] docker-compose.yml配置完整
- [x] Nginx代理配置正确
- [x] 数据库连接配置正确
- [x] CORS跨域配置正确
- [x] 环境变量配置完整
- [x] 部署脚本可用
- [x] 测试脚本可用

## 🎯 部署成功标志

1. 容器状态显示 `Up` 且健康
2. 前端页面正常显示（非Nginx默认页面）
3. API接口正常响应
4. 数据库连接成功
5. CORS预检请求通过

---

**部署包版本**: v2.0-final  
**创建时间**: 2025-09-05  
**配置状态**: ✅ 完整且正确
