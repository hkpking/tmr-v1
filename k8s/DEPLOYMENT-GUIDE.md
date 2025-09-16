# 流程天命人 - K8s部署指南

## 部署信息
- **K8s集群**: 10.10.250.251
- **用户名**: 88707
- **密码**: Dslr#2025
- **命名空间**: czl-test
- **管理界面**: http://10.10.250.251/kubernetes/k8s-test/namespace/czl-test

## 部署步骤

### 第一步：创建命名空间（如果不存在）
由于您已经创建了czl-test命名空间，可以跳过此步骤。

### 第二步：创建配置映射（ConfigMap）
1. 在K8s管理界面中，点击"从YAML创建"
2. 复制以下YAML内容：

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: lctmr-config
  namespace: czl-test
data:
  NODE_ENV: "production"
  DB_HOST: "101.32.59.153"
  DB_PORT: "5432"
  DB_USER: "web_app"
  DB_NAME: "lctmr_production"
  DB_SSL: "false"
  JWT_EXPIRES_IN: "24h"
  API_URL: "http://lctmr-frontend-service:80/api"
  FRONTEND_URL: "http://lctmr-frontend-service:80"
  PORT: "3001"
  DB_CONNECTION_LIMIT: "50"
  DB_IDLE_TIMEOUT: "30000"
  DB_CONNECTION_TIMEOUT: "2000"
```

3. 点击"创建"

### 第三步：创建密钥（Secret）
1. 在K8s管理界面中，点击"从YAML创建"
2. 复制以下YAML内容：

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: lctmr-secret
  namespace: czl-test
type: Opaque
data:
  # Base64编码的密码和密钥
  DB_PASSWORD: RGRzbHIqMjAyNSNhYXA=  # Dslr*2025#app
  JWT_SECRET: N1l0WUFNSlVhNExhcUNoYmtWMGlONUlNU0h2YUJDVnRCbVVrdFpYM0U4Sk9HMGkrNFRTaEg1dlhsMkhibGVVTU5JVGk0dGhGaVl2OFVGYmRpYXprcUE9PQ==  # 7YtYAMJUa4LaqChbkV0iN5IMSHvaBCVtBmUktZX3E8JOG0i+4TShH5vXl2HhleUMNITi4thFiYv8UFbdiazkqA==
```

3. 点击"创建"

### 第四步：部署后端服务
1. 在K8s管理界面中，点击"从YAML创建"
2. 复制以下YAML内容：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: lctmr-backend
  namespace: czl-test
  labels:
    app: lctmr-backend
    version: v1
spec:
  replicas: 2
  selector:
    matchLabels:
      app: lctmr-backend
  template:
    metadata:
      labels:
        app: lctmr-backend
        version: v1
    spec:
      containers:
      - name: backend
        image: harbor.cosmo-lady.com/lctmr-backend/lctmr-backend:latest
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 3001
          name: http
        env:
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: lctmr-config
              key: NODE_ENV
        - name: DB_HOST
          valueFrom:
            configMapKeyRef:
              name: lctmr-config
              key: DB_HOST
        - name: DB_PORT
          valueFrom:
            configMapKeyRef:
              name: lctmr-config
              key: DB_PORT
        - name: DB_USER
          valueFrom:
            configMapKeyRef:
              name: lctmr-config
              key: DB_USER
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: lctmr-secret
              key: DB_PASSWORD
        - name: DB_NAME
          valueFrom:
            configMapKeyRef:
              name: lctmr-config
              key: DB_NAME
        - name: DB_SSL
          valueFrom:
            configMapKeyRef:
              name: lctmr-config
              key: DB_SSL
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: lctmr-secret
              key: JWT_SECRET
        - name: JWT_EXPIRES_IN
          valueFrom:
            configMapKeyRef:
              name: lctmr-config
              key: JWT_EXPIRES_IN
        - name: API_URL
          valueFrom:
            configMapKeyRef:
              name: lctmr-config
              key: API_URL
        - name: FRONTEND_URL
          valueFrom:
            configMapKeyRef:
              name: lctmr-config
              key: FRONTEND_URL
        - name: PORT
          valueFrom:
            configMapKeyRef:
              name: lctmr-config
              key: PORT
        - name: DB_CONNECTION_LIMIT
          valueFrom:
            configMapKeyRef:
              name: lctmr-config
              key: DB_CONNECTION_LIMIT
        - name: DB_IDLE_TIMEOUT
          valueFrom:
            configMapKeyRef:
              name: lctmr-config
              key: DB_IDLE_TIMEOUT
        - name: DB_CONNECTION_TIMEOUT
          valueFrom:
            configMapKeyRef:
              name: lctmr-config
              key: DB_CONNECTION_TIMEOUT
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
      restartPolicy: Always
```

3. 点击"创建"

### 第五步：部署前端服务
1. 在K8s管理界面中，点击"从YAML创建"
2. 复制以下YAML内容：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: lctmr-frontend
  namespace: czl-test
  labels:
    app: lctmr-frontend
    version: v1
spec:
  replicas: 2
  selector:
    matchLabels:
      app: lctmr-frontend
  template:
    metadata:
      labels:
        app: lctmr-frontend
        version: v1
    spec:
      containers:
      - name: frontend
        image: harbor.cosmo-lady.com/lctmr-frontend/lctmr-frontend:latest
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 80
          name: http
        env:
        - name: API_URL
          valueFrom:
            configMapKeyRef:
              name: lctmr-config
              key: API_URL
        - name: FRONTEND_URL
          valueFrom:
            configMapKeyRef:
              name: lctmr-config
              key: FRONTEND_URL
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: lctmr-config
              key: NODE_ENV
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 10
          periodSeconds: 10
          timeoutSeconds: 3
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
      restartPolicy: Always
```

3. 点击"创建"

### 第六步：创建服务（Services）
1. 在K8s管理界面中，点击"从YAML创建"
2. 复制以下YAML内容：

```yaml
apiVersion: v1
kind: Service
metadata:
  name: lctmr-backend-service
  namespace: czl-test
  labels:
    app: lctmr-backend
spec:
  selector:
    app: lctmr-backend
  ports:
  - name: http
    port: 3001
    targetPort: 3001
    protocol: TCP
  type: ClusterIP
---
apiVersion: v1
kind: Service
metadata:
  name: lctmr-frontend-service
  namespace: czl-test
  labels:
    app: lctmr-frontend
spec:
  selector:
    app: lctmr-frontend
  ports:
  - name: http
    port: 80
    targetPort: 80
    protocol: TCP
  type: ClusterIP
```

3. 点击"创建"

### 第七步：创建入口（Ingress）
1. 在K8s管理界面中，点击"从YAML创建"
2. 复制以下YAML内容：

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: lctmr-ingress
  namespace: czl-test
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "false"
    nginx.ingress.kubernetes.io/cors-allow-origin: "*"
    nginx.ingress.kubernetes.io/cors-allow-methods: "GET, POST, PUT, DELETE, OPTIONS"
    nginx.ingress.kubernetes.io/cors-allow-headers: "DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization"
spec:
  rules:
  - host: lctmr.local  # 修改为您的域名
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: lctmr-backend-service
            port:
              number: 3001
      - path: /
        pathType: Prefix
        backend:
          service:
            name: lctmr-frontend-service
            port:
              number: 80
```

3. 点击"创建"

## 验证部署

### 检查Pod状态
1. 在K8s管理界面中，进入"工作负载" -> "Deployment"
2. 确认 `lctmr-backend` 和 `lctmr-frontend` 的状态为"运行中"
3. 点击进入查看Pod详情，确认Pod状态为"运行中"

### 检查服务状态
1. 进入"工作负载" -> "Service"
2. 确认 `lctmr-backend-service` 和 `lctmr-frontend-service` 已创建

### 检查入口状态
1. 进入"工作负载" -> "Ingress"
2. 确认 `lctmr-ingress` 已创建并获取外部访问地址

## 访问应用

根据Ingress配置，您可以通过以下方式访问应用：
- 前端: http://lctmr.local (需要配置hosts)
- 后端API: http://lctmr.local/api

## 故障排除

### 查看Pod日志
1. 进入"工作负载" -> "Deployment"
2. 点击对应的Deployment
3. 点击Pod名称
4. 查看"日志"标签页

### 常见问题
1. **镜像拉取失败**: 检查Harbor仓库访问权限
2. **Pod启动失败**: 检查环境变量配置
3. **服务无法访问**: 检查Service和Ingress配置

## 更新应用

### 更新镜像版本
1. 在Harbor仓库中推送新版本镜像
2. 在K8s管理界面中，进入对应的Deployment
3. 点击"调整镜像版本"
4. 输入新的镜像标签
5. 点击"确定"

### 滚动更新
K8s会自动进行滚动更新，确保服务不中断。
