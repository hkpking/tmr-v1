# Kubernetes 配置更新总结

## 已更新的文件

### 1. `services.yaml` ✅
**更新内容：**
- 后端服务：`type: ClusterIP` → `type: NodePort` + `nodePort: 30001`
- 前端服务：`type: ClusterIP` → `type: NodePort` + `nodePort: 30002`

**影响：**
- 现在可以通过外部端口访问服务
- 前端：`http://10.10.250.251:30002`
- 后端：`http://10.10.250.251:30001`

### 2. `ingress.yaml` ✅
**更新内容：**
- 添加 `host: 10.10.250.251`

**影响：**
- Ingress 现在可以正确路由到指定主机
- 通过 `http://10.10.250.251/` 访问应用

### 3. `ingress-simple.yaml` ✅
**更新内容：**
- 添加 `host: 10.10.250.251`

**影响：**
- 简化版 Ingress 也可以正确路由

## 不需要更新的文件

### `configmap.yaml` ✅
**原因：**
- 内部服务通信仍然使用服务名
- `FRONTEND_URL` 和 `BACKEND_URL` 保持内部服务名是正确的
- 应用内部不需要知道 NodePort 端口

### 其他文件 ✅
- `backend-deployment.yaml` - 无需更改
- `frontend-deployment.yaml` - 无需更改
- `secret.yaml` - 无需更改
- `namespace.yaml` - 无需更改
- `hpa.yaml` - 无需更改

## 访问方式

更新后，您可以通过以下方式访问应用：

### 1. 直接通过 NodePort
- **前端**：`http://10.10.250.251:30002`
- **后端 API**：`http://10.10.250.251:30001`

### 2. 通过 Ingress
- **前端**：`http://10.10.250.251/`
- **后端 API**：`http://10.10.250.251/api`

## 部署建议

1. **先部署 NodePort 服务**：确保直接端口访问正常
2. **再部署 Ingress**：提供更友好的访问方式
3. **测试两种访问方式**：确保都正常工作

## 注意事项

- NodePort 端口范围：30000-32767
- 确保防火墙允许 30001 和 30002 端口
- Ingress 需要 Ingress Controller 支持
