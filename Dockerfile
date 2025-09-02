# 多阶段构建 - 构建阶段
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖（包括开发依赖，因为需要 tailwindcss）
RUN npm ci

# 复制源代码
COPY . .

# 构建 CSS
RUN npm run build-css-prod

# 验证构建结果
RUN ls -la dist/ && test -f dist/output.css

# 生产阶段 - 使用 Nginx 提供静态文件服务
FROM nginx:alpine AS production

# 复制自定义 Nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

# 从构建阶段复制构建产物
COPY --from=builder /app /usr/share/nginx/html

# 创建必要的目录
RUN mkdir -p /usr/share/nginx/html/dist

# 确保 dist 目录存在且包含 output.css
RUN ls -la /usr/share/nginx/html/dist/ && \
    test -f /usr/share/nginx/html/dist/output.css && \
    echo "✅ CSS 文件构建成功"

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
