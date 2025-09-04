# 项目结构说明

## 前端应用核心文件
```
lctmr-v1.1/
├── index.html              # 主页面
├── css/                    # 样式文件
│   ├── input.css
│   └── style.css
├── js/                     # JavaScript 核心代码
│   ├── app.js              # 主应用逻辑
│   ├── state.js            # 状态管理
│   ├── ui.js               # UI 组件
│   ├── constants.js        # 常量定义
│   ├── performance-monitor.js  # 性能监控
│   ├── components/         # 组件
│   │   └── factory.js
│   ├── config/             # 配置文件
│   │   └── database-config.js
│   ├── services/           # 服务层
│   │   └── api.js
│   └── views/              # 视图层
│       ├── admin.js
│       ├── auth.js
│       ├── course.js
│       └── profile.js
├── assets/                 # 静态资源
│   ├── audio/              # 音频文件
│   ├── fonts/              # 字体文件
│   ├── images/             # 图片文件
│   └── libs/               # 第三方库
├── config/                 # 配置文件
│   └── database-config.js
├── env.local              # 环境配置文件（必需）
├── server/                 # 后端服务器
│   ├── server.js           # 服务器入口
│   ├── package.json        # 后端依赖
│   ├── config/             # 服务器配置
│   ├── middleware/         # 中间件
│   └── routes/             # 路由
├── dist/                   # 构建输出
│   └── output.css
├── node_modules/           # 前端依赖
└── package.json            # 前端依赖配置
```

## 备份文件 (back/)
```
back/
├── docker/                 # Docker 相关文件
│   ├── docker-compose.yml
│   ├── Dockerfile
│   └── nginx.conf
├── scripts/                # 脚本文件
│   ├── *.bat              # Windows 批处理脚本
│   ├── *.sh               # Linux Shell 脚本
│   └── *.js               # Node.js 脚本
├── docs/                   # 文档文件
│   ├── *.md               # Markdown 文档
│   └── database_schema.md
├── data/                   # 数据文件
│   ├── *.sql              # SQL 文件
│   └── *.json             # JSON 数据文件
├── test/                   # 测试文件
│   ├── test-*.html        # HTML 测试文件
│   └── test-*.js          # JavaScript 测试文件
└── deployment/             # 部署配置
    ├── env.*              # 环境配置文件
    ├── tailwind.config.js
    └── package-lock.json
```

## 快速启动
1. 确保 `env.local` 文件存在（包含数据库配置）
2. 安装依赖：`npm install`
3. 启动后端：`cd server && npm install && npm run dev`
4. 启动前端：使用 Live Server 或直接打开 `index.html`

## 重要说明
- `env.local` 文件是必需的，包含数据库连接配置
- 如果 `env.local` 文件丢失，可以从 `back/deployment/` 文件夹中恢复

## 注意事项
- 所有容器、测试、文档和部署相关文件已移动到 `back/` 文件夹
- 核心应用文件保留在根目录，便于开发和维护
- 数据库配置文件保留在 `config/` 和 `js/config/` 中
