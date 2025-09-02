# 📋 部署工程师检查清单

## 🎯 部署前准备

### 环境检查
- [ ] Docker 已安装 (版本 20.10+)
- [ ] Docker 服务正在运行
- [ ] 网络连接正常
- [ ] 磁盘空间充足 (至少 2GB)
- [ ] 端口 8080 可用 (或准备其他端口)

### 文件检查
- [ ] 所有必需文件已下载
- [ ] 文件完整性验证通过
- [ ] 没有文件损坏或缺失

## 🚀 部署步骤

### 方法 1：使用自动部署脚本 (推荐)

#### Linux/macOS:
```bash
# 给脚本执行权限
chmod +x deploy.sh

# 部署到默认端口 8080
./deploy.sh

# 部署到指定端口
./deploy.sh -p 8081

# 查看帮助
./deploy.sh -h
```

#### Windows:
```cmd
# 部署到默认端口 8080
deploy.bat

# 部署到指定端口
deploy.bat -p 8081

# 查看帮助
deploy.bat -h
```

### 方法 2：手动部署

```bash
# 1. 构建镜像
docker build -t lctmr-app .

# 2. 运行容器
docker run -d -p 8080:80 --name lctmr-app lctmr-app

# 3. 验证部署
curl -I http://localhost:8080
```

### 方法 3：使用 Docker Compose

```bash
# 生产环境
docker-compose up -d app

# 开发环境
docker-compose --profile dev up -d dev
```

## ✅ 部署验证

### 基本检查
- [ ] 容器状态为 "Up" 和 "healthy"
- [ ] 端口映射正确
- [ ] 应用可以正常访问

### 功能测试
- [ ] 主页加载正常
- [ ] CSS 样式正确显示
- [ ] JavaScript 功能正常
- [ ] 健康检查端点响应正常

### 性能检查
- [ ] 页面加载速度正常
- [ ] 静态资源缓存配置正确
- [ ] Gzip 压缩生效

## 🔧 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 使用其他端口
   docker run -d -p 8081:80 --name lctmr-app lctmr-app
   ```

2. **构建失败**
   ```bash
   # 检查网络连接
   docker pull node:18-alpine
   
   # 重新构建
   docker build --no-cache -t lctmr-app .
   ```

3. **容器无法启动**
   ```bash
   # 查看容器日志
   docker logs <container-name>
   
   # 检查容器状态
   docker ps -a
   ```

4. **CSS 文件 404**
   ```bash
   # 检查文件是否存在
   docker exec <container-name> ls -la /usr/share/nginx/html/dist/
   ```

### 调试命令

```bash
# 查看容器状态
docker ps

# 查看容器日志
docker logs <container-name>

# 进入容器调试
docker exec -it <container-name> sh

# 检查网络连接
curl -I http://localhost:8080
curl -I http://localhost:8080/dist/output.css
```

## 📊 部署后监控

### 健康检查
- URL: `http://localhost:8080/health`
- 预期响应: `healthy`

### 日志监控
```bash
# 实时查看日志
docker logs -f <container-name>

# 查看访问日志
docker exec <container-name> tail -f /var/log/nginx/access.log
```

### 性能监控
- 响应时间 < 200ms
- 内存使用 < 100MB
- CPU 使用 < 10%

## 🚨 紧急处理

### 容器停止
```bash
# 重启容器
docker restart <container-name>

# 重新部署
docker stop <container-name>
docker rm <container-name>
docker run -d -p 8080:80 --name lctmr-app lctmr-app
```

### 回滚操作
```bash
# 停止当前容器
docker stop <container-name>

# 启动备份容器
docker run -d -p 8080:80 --name lctmr-app-backup <backup-image>
```

## 📞 技术支持

如遇问题，请提供以下信息：
- Docker 版本: `docker --version`
- 系统信息: `docker info`
- 错误日志: `docker logs <container-name>`
- 容器状态: `docker ps -a`

---
**部署包版本**: v1.1.0  
**支持平台**: Linux, macOS, Windows  
**最低要求**: Docker 20.10+
