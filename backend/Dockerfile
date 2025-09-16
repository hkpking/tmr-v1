# 后端API服务容器化部署
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 安装系统依赖
RUN apk update && apk add --no-cache \
    wget \
    curl \
    && rm -rf /var/cache/apk/*

# 复制package.json和package-lock.json
COPY backend/package*.json ./

# 安装生产依赖
RUN npm ci --only=production --silent

# 复制源代码
COPY backend/ .

# 创建非root用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 设置文件权限
RUN chown -R nodejs:nodejs /app

# 切换到非root用户
USER nodejs

# 暴露端口
EXPOSE 3001

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# 启动命令
CMD ["node", "server.js"]
