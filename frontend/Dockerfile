# 前端容器化部署
FROM nginx:alpine

# 设置工作目录
WORKDIR /usr/share/nginx/html

# 复制前端静态文件
COPY index.html .
COPY assets ./assets
COPY css ./css
COPY dist ./dist
COPY js ./js

# 复制nginx配置模板
COPY frontend/nginx.conf /etc/nginx/nginx.conf.template

# 创建环境变量配置脚本
RUN echo '#!/bin/sh' > /docker-entrypoint.d/30-envsubst-on-templates.sh && \
    echo 'envsubst < /usr/share/nginx/html/config.js.template > /usr/share/nginx/html/config.js' >> /docker-entrypoint.d/30-envsubst-on-templates.sh && \
    echo 'envsubst < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf' >> /docker-entrypoint.d/30-envsubst-on-templates.sh && \
    chmod +x /docker-entrypoint.d/30-envsubst-on-templates.sh

# 创建环境变量配置模板
RUN echo 'window.API_URL = "${API_URL}";' > /usr/share/nginx/html/config.js.template && \
    echo 'window.FRONTEND_URL = "${FRONTEND_URL}";' >> /usr/share/nginx/html/config.js.template && \
    echo 'window.BACKEND_URL = "${BACKEND_URL}";' >> /usr/share/nginx/html/config.js.template && \
    echo 'window.NODE_ENV = "${NODE_ENV}";' >> /usr/share/nginx/html/config.js.template

# 设置默认环境变量（Kubernetes 环境）
ENV API_URL=/api
ENV FRONTEND_URL=http://lctmr-frontend-service:80
ENV BACKEND_URL=http://lctmr-backend-service:3001
ENV NODE_ENV=production

# 暴露端口
EXPOSE 80

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]
