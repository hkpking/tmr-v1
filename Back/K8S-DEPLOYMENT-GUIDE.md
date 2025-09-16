# 流程天命人 v2.0 - Kubernetes 部署指南

## 📋 概述

本指南将帮助您在 Kubernetes 集群上部署流程天命人应用。应用采用微服务架构，包含：
- **前端服务**: 静态文件服务 (Nginx)
- **后端服务**: Node.js API 服务
- **外部数据库**: PostgreSQL (远程)

## 🏗️ 架构图

```
Internet
    ↓
[Ingress Controller]
    ↓
[Nginx Service] → [App Service]
    ↓              ↓
[Static Files]  [Node.js API]
    ↓              ↓
[Frontend]     [PostgreSQL DB]
```

## 📁 项目结构

```
k8s/
├── namespace.yaml              # 命名空间
├── configmap.yaml             # 配置映射
├── secret.yaml                # 敏感信息
├── app-deployment.yaml        # 应用部署
├── nginx-deployment.yaml      # Nginx 部署
├── services.yaml              # 服务定义
├── ingress.yaml               # 入口配置
├── nginx-configmap.yaml       # Nginx 配置
└── hpa.yaml                   # 水平扩缩容
```

## 🚀 快速部署

### 1. 环境准备

确保您有以下环境：
- Kubernetes 集群 (v1.20+)
- kubectl 命令行工具
- Docker 镜像仓库访问权限

### 2. 构建和推送镜像

```bash
# 构建应用镜像
docker build -t your-registry/lctmr-app:latest .

# 推送镜像到仓库
docker push your-registry/lctmr-app:latest
```

### 3. 部署应用

```bash
# 创建命名空间
kubectl apply -f k8s/namespace.yaml

# 创建配置和密钥
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/nginx-configmap.yaml

# 部署应用
kubectl apply -f k8s/app-deployment.yaml
kubectl apply -f k8s/nginx-deployment.yaml

# 创建服务
kubectl apply -f k8s/services.yaml

# 配置入口
kubectl apply -f k8s/ingress.yaml

# 可选：配置自动扩缩容
kubectl apply -f k8s/hpa.yaml
```

## 📊 配置说明

### 环境变量配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| NODE_ENV | 运行环境 | production |
| DB_HOST | 数据库主机 | 101.32.59.153 |
| DB_PORT | 数据库端口 | 5432 |
| DB_NAME | 数据库名 | lctmr_production |
| JWT_SECRET | JWT 密钥 | (从 Secret 获取) |
| FRONTEND_URL | 前端地址 | http://lctmr.example.com |

### 资源限制

| 组件 | CPU 请求 | CPU 限制 | 内存请求 | 内存限制 |
|------|----------|----------|----------|----------|
| App | 250m | 500m | 256Mi | 512Mi |
| Nginx | 50m | 100m | 64Mi | 128Mi |

## 🔧 详细配置

### 1. 命名空间 (namespace.yaml)

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: lctmr
  labels:
    name: lctmr
```

### 2. 配置映射 (configmap.yaml)

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: lctmr-config
  namespace: lctmr
data:
  NODE_ENV: "production"
  DB_HOST: "101.32.59.153"
  DB_PORT: "5432"
  DB_NAME: "lctmr_production"
  DB_SSL: "false"
  JWT_EXPIRES_IN: "24h"
  PORT: "3001"
  FRONTEND_URL: "http://lctmr.example.com"
  API_URL: "http://lctmr.example.com/api"
```

### 3. 密钥 (secret.yaml)

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: lctmr-secret
  namespace: lctmr
type: Opaque
data:
  # Base64 编码的敏感信息
  DB_USER: d2ViX2FwcA==  # web_app
  DB_PASSWORD: RHNscipyMjAyNSNhYXA=  # Dslr*2025#app
  JWT_SECRET: N1l0WUFNSlVhNExhcUNoYmtWMGlONUlNU0h2YUJDVnRCbVVrdFpYM0U4Sk9HMGkrNFRTaEg1dlhsMkhibGVVTU5JVGk0dGhGaVl2OFVGYmRpYXprcUE9PQ==
```

## 🌐 访问配置

### 1. 服务访问

- **前端应用**: `http://lctmr.example.com`
- **API 接口**: `http://lctmr.example.com/api`
- **健康检查**: `http://lctmr.example.com/health`

### 2. 域名配置

修改 `ingress.yaml` 中的域名：
```yaml
spec:
  rules:
  - host: your-domain.com  # 修改为您的域名
```

### 3. SSL 证书 (可选)

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: lctmr-ingress
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - lctmr.example.com
    secretName: lctmr-tls
```

## 📈 监控和扩缩容

### 1. 水平扩缩容 (HPA)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: lctmr-app-hpa
  namespace: lctmr
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: lctmr-app
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### 2. 监控配置

```yaml
apiVersion: v1
kind: ServiceMonitor
metadata:
  name: lctmr-app-monitor
  namespace: lctmr
spec:
  selector:
    matchLabels:
      app: lctmr-app
  endpoints:
  - port: http
    path: /metrics
```

## 🔍 故障排除

### 1. 检查部署状态

```bash
# 查看所有资源
kubectl get all -n lctmr

# 查看 Pod 状态
kubectl get pods -n lctmr

# 查看服务状态
kubectl get svc -n lctmr

# 查看入口状态
kubectl get ingress -n lctmr
```

### 2. 查看日志

```bash
# 查看应用日志
kubectl logs -f deployment/lctmr-app -n lctmr

# 查看 Nginx 日志
kubectl logs -f deployment/lctmr-nginx -n lctmr

# 查看特定 Pod 日志
kubectl logs -f <pod-name> -n lctmr
```

### 3. 调试命令

```bash
# 进入 Pod 调试
kubectl exec -it <pod-name> -n lctmr -- /bin/sh

# 查看事件
kubectl get events -n lctmr --sort-by='.lastTimestamp'

# 描述资源详情
kubectl describe pod <pod-name> -n lctmr
```

## 🔒 安全配置

### 1. 网络策略

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: lctmr-network-policy
  namespace: lctmr
spec:
  podSelector:
    matchLabels:
      app: lctmr-app
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: lctmr-nginx
    ports:
    - protocol: TCP
      port: 3001
  egress:
  - to: []
    ports:
    - protocol: TCP
      port: 5432  # 数据库端口
```

### 2. Pod 安全策略

```yaml
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: lctmr-psp
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
    - ALL
  volumes:
    - 'configMap'
    - 'emptyDir'
    - 'projected'
    - 'secret'
    - 'downwardAPI'
    - 'persistentVolumeClaim'
```

## 📊 性能优化

### 1. 资源优化

- 根据实际负载调整 CPU 和内存限制
- 使用 HPA 实现自动扩缩容
- 配置适当的副本数量

### 2. 网络优化

- 使用 Service Mesh (如 Istio)
- 配置适当的超时和重试策略
- 启用连接池

### 3. 存储优化

- 使用 SSD 存储类
- 配置适当的存储大小
- 启用存储快照

## 🚀 生产环境部署

### 1. 部署前检查

- [ ] 镜像已推送到生产仓库
- [ ] 域名 DNS 已配置
- [ ] SSL 证书已准备
- [ ] 数据库连接已测试
- [ ] 监控和日志已配置

### 2. 部署步骤

```bash
# 1. 创建生产命名空间
kubectl create namespace lctmr-prod

# 2. 应用生产配置
kubectl apply -f k8s/ -n lctmr-prod

# 3. 验证部署
kubectl get all -n lctmr-prod

# 4. 测试访问
curl -I http://your-domain.com
```

### 3. 回滚策略

```bash
# 查看部署历史
kubectl rollout history deployment/lctmr-app -n lctmr

# 回滚到上一版本
kubectl rollout undo deployment/lctmr-app -n lctmr

# 回滚到指定版本
kubectl rollout undo deployment/lctmr-app --to-revision=2 -n lctmr
```

## 📞 技术支持

如果遇到问题，请：

1. 查看本文档的故障排除部分
2. 检查 Kubernetes 集群状态
3. 查看应用日志获取详细错误信息
4. 联系技术支持团队

---

**注意**: 生产环境部署前，请确保：
- 已备份重要数据
- 已测试所有功能
- 已配置监控和日志
- 已设置安全策略
- 已准备回滚方案
