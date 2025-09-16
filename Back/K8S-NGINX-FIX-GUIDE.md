# Kubernetes Nginx 权限问题修复指南

## 🔍 问题分析

您遇到的错误：
```
[warn] the "user" directive makes sense only if the master process runs with super-user privileges
[emerg] bind() to 0.0.0.0:80 failed (13: Permission denied)
```

**原因：**
1. Nginx 容器以非特权用户运行，无法绑定到 80 端口
2. `user` 指令在非特权模式下被忽略
3. 安全上下文配置过于严格

## 🛠️ 解决方案

### 方案一：使用非特权端口（推荐）

**优点：** 安全性高，符合最佳实践
**缺点：** 需要通过 Service 进行端口映射

#### 1. 更新 Nginx 配置

```yaml
# nginx-sites/default.conf
server {
    listen 8080;  # 改为非特权端口
    server_name _;
    # ... 其他配置
}
```

#### 2. 更新部署配置

```yaml
# nginx-deployment.yaml
ports:
- containerPort: 8080  # 容器内端口
  name: http
- containerPort: 8443  # HTTPS 端口
  name: https
```

#### 3. 更新服务配置

```yaml
# services.yaml
ports:
- name: http
  port: 80        # 外部访问端口
  targetPort: 8080  # 容器内端口
```

### 方案二：使用特权模式

**优点：** 可以直接使用 80 端口
**缺点：** 安全性较低

```yaml
# nginx-deployment.yaml
securityContext:
  runAsUser: 0  # 以 root 用户运行
  privileged: true
  capabilities:
    add:
    - NET_BIND_SERVICE
```

### 方案三：使用 initContainer 设置权限

```yaml
# nginx-deployment.yaml
initContainers:
- name: init-nginx
  image: busybox
  command:
  - sh
  - -c
  - |
    chown -R 101:101 /var/cache/nginx
    chown -R 101:101 /var/run
  volumeMounts:
  - name: nginx-cache
    mountPath: /var/cache/nginx
  - name: nginx-run
    mountPath: /var/run
```

## 🚀 快速修复步骤

### 1. 应用修复配置

```bash
# 删除现有部署
kubectl delete -f k8s/nginx-deployment.yaml
kubectl delete -f k8s/nginx-configmap.yaml
kubectl delete -f k8s/services.yaml

# 应用修复后的配置
kubectl apply -f k8s/nginx-configmap-fixed.yaml
kubectl apply -f k8s/nginx-deployment-fixed.yaml
kubectl apply -f k8s/services-fixed.yaml
```

### 2. 验证修复

```bash
# 查看 Pod 状态
kubectl get pods -n lctmr

# 查看日志
kubectl logs -f deployment/lctmr-nginx -n lctmr

# 测试访问
kubectl port-forward svc/lctmr-nginx-service 8080:80 -n lctmr
```

### 3. 访问应用

```bash
# 本地测试
curl http://localhost:8080

# 或通过 LoadBalancer IP
kubectl get svc lctmr-nginx-service -n lctmr
```

## 🔧 详细配置说明

### 修复后的 Nginx 配置

```nginx
# 移除 user 指令
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    # ... 其他配置
    server {
        listen 8080;  # 非特权端口
        # ... 其他配置
    }
}
```

### 修复后的安全上下文

```yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 101
  allowPrivilegeEscalation: false
  readOnlyRootFilesystem: false  # Nginx 需要写入权限
  capabilities:
    drop:
    - ALL
```

## 📊 端口映射说明

| 服务 | 外部端口 | 容器端口 | 说明 |
|------|----------|----------|------|
| HTTP | 80 | 8080 | 通过 Service 映射 |
| HTTPS | 443 | 8443 | 通过 Service 映射 |
| API | 3001 | 3001 | 直接访问 |

## 🔍 故障排除

### 1. 检查 Pod 状态

```bash
kubectl describe pod <pod-name> -n lctmr
```

### 2. 查看详细日志

```bash
kubectl logs <pod-name> -n lctmr --previous
```

### 3. 进入容器调试

```bash
kubectl exec -it <pod-name> -n lctmr -- /bin/sh
```

### 4. 检查端口绑定

```bash
kubectl exec -it <pod-name> -n lctmr -- netstat -tlnp
```

## ✅ 验证清单

- [ ] Nginx 容器成功启动
- [ ] 没有权限错误日志
- [ ] 端口 8080 正常监听
- [ ] 服务端口映射正确
- [ ] 应用可以正常访问
- [ ] 健康检查通过

## 🚨 注意事项

1. **安全性**: 使用非特权端口更安全
2. **端口映射**: 确保 Service 端口映射正确
3. **日志监控**: 持续监控应用日志
4. **资源限制**: 保持合理的资源限制
5. **备份配置**: 修改前备份原始配置

## 📞 技术支持

如果问题仍然存在，请提供：
1. 完整的 Pod 日志
2. 事件信息 (`kubectl get events`)
3. 资源描述 (`kubectl describe`)
4. 集群版本信息
