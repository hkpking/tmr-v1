# 流程天命人 - Kubernetes 部署配置

## 概述

本目录包含用于在Kubernetes集群中部署流程天命人应用的YAML配置文件。应用采用前后端分离架构，支持水平扩展和自动扩缩容。

## 文件说明

### 核心配置文件

- `namespace.yaml` - 定义命名空间
- `configmap.yaml` - 应用配置（非敏感信息）
- `secret.yaml` - 敏感配置（数据库密码、JWT密钥）
- `backend-deployment.yaml` - 后端API服务部署
- `frontend-deployment.yaml` - 前端服务部署
- `services.yaml` - 服务定义
- `ingress.yaml` - 入口配置
- `hpa.yaml` - 水平自动扩缩容配置
- `kustomization.yaml` - Kustomize配置文件

## 部署步骤

### 1. 构建镜像

首先需要构建Docker镜像：

```bash
# 构建前端镜像
docker build -f frontend/Dockerfile -t lctmr-frontend:latest .

# 构建后端镜像
docker build -f backend/Dockerfile -t lctmr-backend:latest .
```

### 2. 推送到镜像仓库

```bash
# 推送到您的镜像仓库
docker tag lctmr-frontend:latest your-registry/lctmr-frontend:latest
docker tag lctmr-backend:latest your-registry/lctmr-backend:latest

docker push your-registry/lctmr-frontend:latest
docker push your-registry/lctmr-backend:latest
```

### 3. 修改镜像地址

编辑 `backend-deployment.yaml` 和 `frontend-deployment.yaml` 中的镜像地址：

```yaml
# 将
image: lctmr-backend:latest
# 修改为
image: your-registry/lctmr-backend:latest
```

### 4. 配置环境变量

根据您的环境修改 `configmap.yaml` 和 `secret.yaml`：

```yaml
# configmap.yaml
data:
  DB_HOST: "your-db-host"
  DB_PORT: "5432"
  # ... 其他配置

# secret.yaml
data:
  DB_PASSWORD: "base64-encoded-password"
  JWT_SECRET: "base64-encoded-jwt-secret"
```

### 5. 部署到K8s

#### 使用kubectl直接部署

```bash
# 创建命名空间
kubectl apply -f namespace.yaml

# 创建配置
kubectl apply -f configmap.yaml
kubectl apply -f secret.yaml

# 部署应用
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f services.yaml
kubectl apply -f ingress.yaml
kubectl apply -f hpa.yaml
```

#### 使用Kustomize部署

```bash
# 一键部署所有资源
kubectl apply -k .
```

### 6. 验证部署

```bash
# 查看Pod状态
kubectl get pods -n lctmr

# 查看服务状态
kubectl get svc -n lctmr

# 查看Ingress状态
kubectl get ingress -n lctmr

# 查看HPA状态
kubectl get hpa -n lctmr
```

## 配置说明

### 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| NODE_ENV | 运行环境 | production |
| DB_HOST | 数据库主机 | 101.32.59.153 |
| DB_PORT | 数据库端口 | 5432 |
| DB_USER | 数据库用户名 | web_app |
| DB_NAME | 数据库名称 | lctmr_production |
| JWT_EXPIRES_IN | JWT过期时间 | 24h |
| API_URL | API服务地址 | http://lctmr-frontend-service:80/api |
| FRONTEND_URL | 前端地址 | http://lctmr-frontend-service:80 |

### 资源限制

- **后端服务**: CPU 250m-500m, 内存 256Mi-512Mi
- **前端服务**: CPU 100m-200m, 内存 128Mi-256Mi
- **副本数**: 后端2-10个，前端2-8个（根据负载自动调整）

### 健康检查

- **后端**: `/health` 端点
- **前端**: `/health` 端点
- **检查间隔**: 10秒
- **超时时间**: 3-5秒

## 访问应用

### 通过Ingress访问

如果配置了Ingress，可以通过以下方式访问：

```bash
# 添加hosts记录（如果使用lctmr.local）
echo "your-ingress-ip lctmr.local" >> /etc/hosts

# 访问应用
curl http://lctmr.local
```

### 通过端口转发访问

```bash
# 转发前端服务
kubectl port-forward svc/lctmr-frontend-service 3000:80 -n lctmr

# 转发后端服务
kubectl port-forward svc/lctmr-backend-service 3001:3001 -n lctmr

# 访问应用
# 前端: http://localhost:3000
# 后端: http://localhost:3001/api
```

## 监控和维护

### 查看日志

```bash
# 查看后端日志
kubectl logs -f deployment/lctmr-backend -n lctmr

# 查看前端日志
kubectl logs -f deployment/lctmr-frontend -n lctmr
```

### 扩缩容

```bash
# 手动扩缩容
kubectl scale deployment lctmr-backend --replicas=5 -n lctmr

# 查看HPA状态
kubectl get hpa -n lctmr
```

### 更新应用

```bash
# 更新镜像
kubectl set image deployment/lctmr-backend backend=your-registry/lctmr-backend:v2.0 -n lctmr
kubectl set image deployment/lctmr-frontend frontend=your-registry/lctmr-frontend:v2.0 -n lctmr

# 查看更新状态
kubectl rollout status deployment/lctmr-backend -n lctmr
```

## 故障排除

### 常见问题

1. **Pod启动失败**
   ```bash
   kubectl describe pod <pod-name> -n lctmr
   kubectl logs <pod-name> -n lctmr
   ```

2. **服务无法访问**
   ```bash
   kubectl get svc -n lctmr
   kubectl describe svc <service-name> -n lctmr
   ```

3. **Ingress配置问题**
   ```bash
   kubectl get ingress -n lctmr
   kubectl describe ingress lctmr-ingress -n lctmr
   ```

### 清理资源

```bash
# 删除所有资源
kubectl delete -k .

# 或者逐个删除
kubectl delete -f hpa.yaml
kubectl delete -f ingress.yaml
kubectl delete -f services.yaml
kubectl delete -f frontend-deployment.yaml
kubectl delete -f backend-deployment.yaml
kubectl delete -f secret.yaml
kubectl delete -f configmap.yaml
kubectl delete -f namespace.yaml
```

## 安全建议

1. **使用私有镜像仓库**
2. **定期更新镜像**
3. **使用网络策略限制Pod间通信**
4. **启用RBAC权限控制**
5. **使用TLS加密Ingress流量**
6. **定期轮换密钥和密码**
