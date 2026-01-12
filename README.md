# Taiwaka Coffee | 太哇卡咖啡

<div align="center">

![Taiwaka Coffee](https://img.shields.io/badge/Taiwaka-Coffee-8B4513?style=for-the-badge&logo=coffeescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Go](https://img.shields.io/badge/Go-1.21-00ADD8?style=flat-square&logo=go)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

**源自东非火山高地的精品咖啡电商平台**

坚持直接贸易，猎寻每一颗豆子在风味巅峰的瞬间。

[在线演示](#) · [功能特性](#-功能特性) · [快速开始](#-快速开始) · [API文档](#-api-端点)

</div>

---

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                         客户端层                                  │
│  React 19 + TypeScript + TailwindCSS 4 + Vite 6                │
└───────────────────────────┬─────────────────────────────────────┘
                            │ REST API
┌───────────────────────────▼─────────────────────────────────────┐
│                      Go 后端 (Gin)                               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ Product │ │  Cart   │ │  Order  │ │Customer │ │  Stock  │   │
│  │ Handler │ │ Handler │ │ Handler │ │ Handler │ │ Handler │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
│                            │                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  中间件: CORS | Logger | Recovery | RateLimiter | Auth   │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────┘
                            │ GORM
┌───────────────────────────▼─────────────────────────────────────┐
│                       MySQL 8.0                                  │
│  products | customers | orders | order_items | cart | stock_logs │
└─────────────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                    Google Gemini API                             │
│                    AI 咖啡推荐引擎                                 │
└─────────────────────────────────────────────────────────────────┘
```

## ✨ 功能特性

### 前端功能
- 🎨 **极简设计** - 受 Blue Bottle 启发的高端视觉体验
- 📱 **响应式布局** - 完美适配 PC/平板/手机
- 🛒 **购物车系统** - 实时同步，本地持久化
- 🔍 **产品搜索** - 支持关键词、分类、价格区间筛选
- 🤖 **AI 咖啡师** - 基于 Gemini 的智能咖啡推荐
- ♿ **无障碍支持** - 完整 ARIA 标签，键盘导航

### 后端功能
- 📦 **产品管理** - CRUD + 分页搜索 + 分类筛选
- 🛍️ **订单系统** - 事务处理，自动库存扣减
- 👥 **客户管理** - 自动关联订单历史
- 📊 **库存追踪** - 完整变动日志，低库存预警
- 📈 **数据统计** - 仪表盘 API，实时业务指标

### 技术亮点
- ⚡ **高性能** - Go 后端，10000+ 并发
- 🔒 **类型安全** - TypeScript + Go 强类型
- 🐳 **容器化** - Docker 一键部署
- 📝 **完整日志** - 请求追踪，错误监控

## 📁 项目结构

```
taiwaka_website/
├── 📂 frontend (React)
│   ├── App.tsx                 # 主应用组件
│   ├── constants.tsx           # 常量配置 + 图标组件
│   ├── types.ts                # TypeScript 类型定义
│   ├── styles.css              # TailwindCSS 样式
│   ├── index.html              # 入口 HTML (SEO 优化)
│   ├── vite.config.ts          # Vite 构建配置
│   └── tailwind.config.js      # Tailwind 配置
│
├── 📂 backend-go (Go/Gin)
│   ├── cmd/server/main.go      # 应用入口
│   ├── internal/
│   │   ├── config/             # 配置管理
│   │   ├── database/           # 数据库连接
│   │   ├── handlers/           # API 处理器
│   │   ├── middleware/         # 中间件
│   │   └── models/             # 数据模型
│   ├── pkg/response/           # 统一响应格式
│   ├── Dockerfile              # Docker 构建
│   ├── Makefile                # 构建命令
│   └── go.mod                  # Go 模块
│
├── 📂 drizzle
│   └── schema.ts               # 数据库 Schema 定义
│
├── 📂 api (Legacy Express.js)
│   └── routes.ts               # Express API 路由
│
├── docker-compose.yml          # 容器编排
├── package.json                # 前端依赖
└── .env.example                # 环境变量模板
```

## 🚀 快速开始

### 环境要求

- Node.js 18+
- Go 1.21+ (可选，用于 Go 后端)
- MySQL 8.0
- Docker (可选)

### 方式一：Docker 部署 (推荐)

```bash
# 克隆仓库
git clone https://github.com/elicat001/taiwaka_website.git
cd taiwaka_website

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入数据库密码和 Gemini API Key

# 启动所有服务
docker-compose up -d

# 访问
# 前端: http://localhost:80
# API:  http://localhost:3000/api/health
```

### 方式二：本地开发

```bash
# 1. 安装前端依赖
pnpm install

# 2. 启动前端开发服务器
pnpm dev

# 3. 启动 Go 后端 (新终端)
cd backend-go
go mod tidy
go run ./cmd/server

# 访问 http://localhost:5173
```

### 方式三：仅前端开发

```bash
pnpm install
pnpm dev
# 访问 http://localhost:5173
```

## 🔌 API 端点

### 产品 API
| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/products` | 获取产品列表 (支持分页/搜索) |
| GET | `/api/products/:id` | 获取单个产品 |
| GET | `/api/products/featured` | 获取推荐产品 |
| GET | `/api/products/category/:category` | 按分类获取 |
| POST | `/api/products` | 创建产品 |
| PUT | `/api/products/:id` | 更新产品 |
| DELETE | `/api/products/:id` | 删除产品 |

### 购物车 API
| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/cart?sessionId=xxx` | 获取购物车 |
| POST | `/api/cart` | 添加商品 |
| PUT | `/api/cart/:id` | 更新数量 |
| DELETE | `/api/cart/:id` | 移除商品 |

### 订单 API
| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/orders` | 获取订单列表 |
| GET | `/api/orders/:id` | 获取订单详情 |
| POST | `/api/orders` | 创建订单 (含事务) |
| PUT | `/api/orders/:id/status` | 更新状态 |
| POST | `/api/orders/:id/cancel` | 取消订单 |

### 其他 API
| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/customers` | 客户列表 |
| GET | `/api/stock/logs` | 库存日志 |
| GET | `/api/stock/low` | 低库存预警 |
| POST | `/api/ai/recommend` | AI 咖啡推荐 |
| GET | `/api/stats/dashboard` | 仪表盘统计 |

## 🗄️ 数据库设计

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   products   │       │   customers  │       │    orders    │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id           │       │ id           │       │ id           │
│ name         │       │ email        │◄──────│ customerId   │
│ description  │       │ name         │       │ orderNumber  │
│ price        │       │ phone        │       │ totalPrice   │
│ category     │       │ address      │       │ status       │
│ image        │       │ createdAt    │       │ createdAt    │
│ specifications│      │ updatedAt    │       │ updatedAt    │
│ stock        │       └──────────────┘       └──────┬───────┘
│ featured     │                                      │
│ tag          │       ┌──────────────┐              │
│ isActive     │       │ order_items  │◄─────────────┘
│ createdAt    │◄──────├──────────────┤
│ updatedAt    │       │ id           │
└──────┬───────┘       │ orderId      │
       │               │ productId    │
       │               │ productName  │
       │               │ price        │
       │               │ quantity     │
       │               │ subtotal     │
       │               └──────────────┘
       │
       │               ┌──────────────┐
       └──────────────►│  stock_logs  │
                       ├──────────────┤
                       │ id           │
                       │ productId    │
                       │ changeAmount │
                       │ reason       │
                       │ previousStock│
                       │ newStock     │
                       │ createdAt    │
                       └──────────────┘
```

## ⚙️ 环境变量

```env
# 服务器
PORT=3000
NODE_ENV=development

# 数据库
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=taiwaka_coffee

# AI 服务
GEMINI_API_KEY=your_gemini_api_key
```

## 📊 性能指标

### Go 后端 vs Express.js

| 指标 | Express.js | Go/Gin | 提升 |
|------|------------|--------|------|
| 内存占用 | ~150MB | ~15MB | **10x** |
| 并发能力 | 1,000 | 10,000+ | **10x** |
| 冷启动 | 2-3s | <100ms | **20x** |
| 二进制大小 | node_modules | 15MB | 简化部署 |

### Lighthouse 评分

- Performance: **90+**
- Accessibility: **95+**
- Best Practices: **95+**
- SEO: **100**

## 🛠️ 开发命令

```bash
# 前端
pnpm dev          # 开发服务器
pnpm build        # 生产构建
pnpm preview      # 预览构建

# Go 后端
cd backend-go
make dev          # 开发模式
make build        # 编译
make test         # 测试
make docker-build # Docker 构建

# 数据库
pnpm db:push      # 推送 Schema
```

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add AmazingFeature'`)
4. 推送分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📝 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📧 联系方式

- GitHub Issues: [提交问题](https://github.com/elicat001/taiwaka_website/issues)
- Email: contact@taiwaka.coffee

---

<div align="center">

**用心烘焙，用爱调制**

Made with ❤️ by Taiwaka Coffee Team

</div>
