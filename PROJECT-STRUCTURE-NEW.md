# 流程天命人 - 新项目结构说明

## 项目重构完成

本项目已成功重构为前后端分离的容器化部署架构，所有不符合新架构的文件已移动到 `Back/` 文件夹中。

## 新项目结构

```
lctmr-v2.0/
├── frontend/                    # 前端容器化配置
│   ├── Dockerfile              # 前端Docker配置
│   ├── nginx.conf              # Nginx反向代理配置
│   └── .dockerignore           # Docker忽略文件
├── backend/                     # 后端容器化配置
│   ├── Dockerfile              # 后端Docker配置
│   ├── server.js               # 后端主服务文件
│   ├── package.json            # 后端依赖配置
│   ├── config/                 # 后端配置文件
│   │   └── database.js         # 数据库连接配置
│   ├── routes/                 # API路由
│   │   ├── auth.js            # 认证路由
│   │   ├── learning.js        # 学习相关路由
│   │   ├── user.js            # 用户相关路由
│   │   └── admin.js           # 管理相关路由
│   └── .dockerignore           # Docker忽略文件
├── assets/                      # 静态资源文件
│   ├── audio/                  # 音频文件
│   ├── fonts/                  # 字体文件
│   ├── images/                 # 图片文件
│   └── libs/                   # 第三方库文件
├── css/                         # 样式文件
│   ├── input.css               # TailwindCSS输入文件
│   ├── style.css               # 自定义样式
│   └── dist/                   # 构建输出
│       └── output.css          # 编译后的CSS
├── js/                          # 前端JavaScript
│   ├── app.js                  # 主应用文件
│   ├── state.js                # 状态管理
│   ├── ui.js                   # UI组件
│   ├── services/               # 服务层
│   │   └── api.js             # API服务
│   ├── views/                  # 视图组件
│   │   ├── auth.js            # 认证视图
│   │   ├── course.js          # 课程视图
│   │   ├── profile.js         # 个人资料视图
│   │   └── admin.js           # 管理视图
│   ├── components/             # 组件
│   │   └── factory.js         # 组件工厂
│   ├── config/                 # 前端配置
│   │   └── database-config.js # 数据库配置
│   └── constants.js            # 常量定义
├── config/                      # 全局配置文件
│   └── database-config.js      # 数据库配置
├── docker-compose.yml           # 生产环境Docker Compose
├── docker-compose.dev.yml       # 开发环境Docker Compose
├── env.example                  # 环境变量示例
├── env.development              # 开发环境配置
├── env.production               # 生产环境配置
├── deploy.sh                    # Linux/Mac部署脚本
├── deploy.bat                   # Windows部署脚本
├── test-deployment.sh           # 部署测试脚本
├── README.md                    # 项目说明文档
├── index.html                   # 前端入口文件
└── Back/                        # 备份的旧文件
    ├── k8s/                     # Kubernetes配置
    ├── nginx/                   # 旧Nginx配置
    ├── config-production/       # 旧生产配置
    ├── docker-images/           # Docker镜像文件
    ├── *.bat                    # 旧批处理脚本
    ├── *.sh                     # 旧Shell脚本
    └── *.md                     # 旧文档文件
```

## 主要改进

### 1. 前后端分离
- **前端**: 独立的Nginx容器，提供静态文件服务
- **后端**: 独立的Node.js容器，提供API服务
- **通信**: 通过HTTP API进行前后端通信

### 2. 环境变量支持
- **开发环境**: `env.development`
- **生产环境**: `env.production`
- **示例配置**: `env.example`
- **动态配置**: 支持通过环境变量动态配置服务

### 3. 容器化部署
- **前端容器**: 基于Nginx Alpine，轻量级
- **后端容器**: 基于Node.js Alpine，包含所有依赖
- **网络隔离**: 使用Docker网络进行服务间通信
- **健康检查**: 内置健康检查机制

### 4. 部署脚本
- **跨平台**: 支持Linux/Mac (Shell) 和 Windows (Batch)
- **多环境**: 支持开发环境和生产环境
- **自动化**: 一键构建、启动、停止、重启
- **监控**: 支持日志查看和状态检查

## 部署方式

### 快速开始
```bash
# 1. 配置环境变量
cp env.example .env

# 2. 启动生产环境
./deploy.sh start production

# 3. 访问应用
# 前端: http://localhost:3000
# 后端: http://localhost:3001/api
```

### 开发环境
```bash
# 启动开发环境
./deploy.sh start development

# 查看日志
./deploy.sh logs development

# 停止服务
./deploy.sh stop development
```

### 测试部署
```bash
# 运行部署测试
./test-deployment.sh
```

## 环境变量配置

### 必需配置
- `NODE_ENV`: 运行环境 (development/production)
- `DB_HOST`: 数据库主机地址
- `DB_PORT`: 数据库端口
- `DB_USER`: 数据库用户名
- `DB_PASSWORD`: 数据库密码
- `DB_NAME`: 数据库名称
- `JWT_SECRET`: JWT密钥

### 可选配置
- `API_URL`: API服务地址
- `FRONTEND_URL`: 前端地址
- `PORT`: 后端服务端口
- `DB_SSL`: 是否使用SSL连接

## 服务端口

- **前端**: 3000 (HTTP)
- **后端**: 3001 (HTTP)
- **健康检查**: 
  - 前端: http://localhost:3000/health
  - 后端: http://localhost:3001/health

## 备份文件说明

`Back/` 文件夹包含以下旧文件：
- **K8s配置**: 所有Kubernetes相关配置文件
- **旧Docker配置**: 混合部署的Docker文件
- **部署脚本**: 旧的批处理和Shell脚本
- **文档**: 旧的部署和配置文档
- **镜像文件**: 预构建的Docker镜像

这些文件已不再使用，但保留作为备份，以防需要回滚到旧架构。

## 下一步操作

1. **配置数据库**: 确保PostgreSQL数据库可用
2. **环境配置**: 根据实际环境修改环境变量
3. **测试部署**: 运行 `./test-deployment.sh` 验证配置
4. **生产部署**: 使用 `./deploy.sh start production` 启动服务
5. **监控维护**: 使用部署脚本进行日常维护

## 技术支持

如有问题，请参考：
- `README.md`: 详细的使用说明
- `test-deployment.sh`: 部署测试和故障排除
- `Back/` 文件夹: 旧配置参考
