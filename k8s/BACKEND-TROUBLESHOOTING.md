# 后端服务故障排除指南

## 🔍 问题诊断

### 当前状态：
- ✅ 前端正常加载
- ✅ Ingress 路由正常
- ❌ 后端 API 返回 404 错误
- ❌ 所有 `/api/*` 端点都不可用

### 可能原因：
1. **后端 Pod 没有启动**
2. **后端应用启动失败**
3. **数据库连接问题**
4. **环境变量配置错误**
5. **镜像问题**

## 🛠️ 解决步骤

### 步骤 1: 检查 Pod 状态
在 Kuboard 管理界面中：
1. 进入命名空间 `czl-test`
2. 查看 "工作负载" -> "Deployment"
3. 检查 `lctmr-backend` 状态
4. 查看 Pod 详情和日志

### 步骤 2: 检查应用日志
在 Pod 详情页面查看日志，寻找错误信息：
- 数据库连接错误
- 环境变量缺失
- 应用启动失败

### 步骤 3: 检查环境变量
确认以下环境变量正确配置：
- `DB_HOST`: 101.32.59.153
- `DB_PORT`: 5432
- `DB_USER`: web_app
- `DB_NAME`: lctmr_production
- `DB_PASSWORD`: Dslr*2025#app
- `JWT_SECRET`: 已配置
- `NODE_ENV`: production

### 步骤 4: 检查数据库连接
测试数据库连接是否正常：
```bash
# 测试数据库连接
telnet 101.32.59.153 5432
```

### 步骤 5: 重启后端服务
如果配置正确，尝试重启后端服务：
1. 在 Kuboard 中删除后端 Deployment
2. 重新创建后端 Deployment
3. 等待 Pod 启动完成

## 🔧 快速修复

### 方法一：重新部署后端服务
1. 删除现有的后端 Deployment
2. 重新应用 `backend-deployment.yaml`
3. 检查 Pod 启动状态

### 方法二：检查镜像
确认镜像地址正确：
- `harbor.cosmo-lady.com/lctmr-backend/lctmr-backend:latest`

### 方法三：简化配置
临时移除健康检查，让应用先启动：
```yaml
# 注释掉健康检查
# livenessProbe:
#   httpGet:
#     path: /health
#     port: 3001
```

## 📋 检查清单

- [ ] Pod 状态为 "运行中"
- [ ] 应用日志无错误
- [ ] 数据库连接正常
- [ ] 环境变量配置正确
- [ ] 镜像拉取成功
- [ ] 端口 3001 监听正常

## 🎯 预期结果

修复后应该看到：
- `/api` 返回 API 信息
- `/api/auth/signin` 可以处理登录请求
- 前端登录功能正常
