# 多阶段构建 - 基础镜像阶段
FROM node:18-alpine AS base

# 设置工作目录
WORKDIR /app

# 安装系统依赖（如果需要）
# RUN apk add --no-cache wget curl

# 多阶段构建 - 依赖安装阶段
FROM base AS deps

# 复制 package.json 和 package-lock.json
COPY package*.json ./
COPY server/package*.json ./server/

# 安装依赖（使用缓存）
RUN npm ci --only=production --silent && \
    cd server && npm ci --only=production --silent

# 多阶段构建 - 构建阶段
FROM base AS builder

# 复制 package.json 和 package-lock.json
COPY package*.json ./
COPY server/package*.json ./server/

# 安装所有依赖（包括开发依赖）
RUN npm ci --silent && \
    cd server && npm ci --silent

# 复制源代码
COPY . .

# 多阶段构建 - 生产镜像阶段
FROM base AS production

# 从依赖阶段复制 node_modules
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/server/node_modules ./server/node_modules

# 复制应用代码
COPY . .

# 创建非root用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# 设置文件权限
RUN chown -R nextjs:nodejs /app

# 切换到非root用户
USER nextjs

# 暴露端口
EXPOSE 3001

# 健康检查（使用wget替代curl）
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# 启动命令
CMD ["node", "server/server.js"]
