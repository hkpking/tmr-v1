# Kubernetes 部署配置顺序

## 🎯 部署顺序（按顺序执行）

### 第一阶段：基础环境
1. **`namespace.yaml`** - 创建命名空间
2. **`configmap.yaml`** - 应用配置
3. **`secret.yaml`** - 敏感信息

### 第二阶段：应用部署
4. **`backend-deployment.yaml`** - 后端应用
5. **`frontend-deployment.yaml`** - 前端应用

### 第三阶段：服务暴露
6. **`services.yaml`** - 服务配置（NodePort）
7. **`ingress.yaml`** - 入口配置

### 第四阶段：扩展功能（可选）
8. **`hpa.yaml`** - 自动扩缩容

## 📝 配置检查清单

### ✅ 必须配置的文件
- [ ] `namespace.yaml` - 命名空间
- [ ] `configmap.yaml` - 配置映射
- [ ] `secret.yaml` - 密钥
- [ ] `backend-deployment.yaml` - 后端部署
- [ ] `frontend-deployment.yaml` - 前端部署
- [ ] `services.yaml` - 服务配置
- [ ] `ingress.yaml` - 入口配置

### 🔧 可选配置的文件
- [ ] `hpa.yaml` - 水平扩缩容
- [ ] `ingress-simple.yaml` - 简化入口配置

## 🚨 重要注意事项

1. **必须先配置基础资源**（namespace, configmap, secret）
2. **再配置应用部署**（deployment）
3. **最后配置服务暴露**（services, ingress）
4. **确保镜像地址正确**：`harbor.cosmo-lady.com/lctmr-*`
5. **检查端口配置**：后端 3001，前端 80

## 🔍 配置验证

部署完成后，验证以下访问方式：
- 前端：`http://10.10.250.251:30002`
- 后端：`http://10.10.250.251:30001`
- Ingress：`http://10.10.250.251/`
