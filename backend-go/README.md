# Taiwaka Coffee API - Go Backend

高性能 Go 后端，使用 Gin 框架构建。

## 技术栈

- **框架**: Gin (高性能 HTTP 框架)
- **ORM**: GORM (MySQL)
- **AI**: Google Gemini API
- **部署**: Docker

## 目录结构

```
backend-go/
├── cmd/
│   └── server/          # 应用入口
│       └── main.go
├── internal/
│   ├── config/          # 配置管理
│   ├── database/        # 数据库连接
│   ├── handlers/        # HTTP 处理器
│   ├── middleware/      # 中间件
│   ├── models/          # 数据模型
│   └── services/        # 业务逻辑
├── pkg/
│   └── response/        # 统一响应格式
├── Dockerfile
├── Makefile
└── go.mod
```

## 快速开始

### 开发环境

```bash
# 安装依赖
make deps

# 开发模式运行
make dev
```

### 生产构建

```bash
# 构建
make build

# 运行
./bin/taiwaka-coffee-api
```

### Docker

```bash
# 构建镜像
make docker-build

# 运行容器
make docker-run
```

## API 端点

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | /api/health | 健康检查 |
| GET | /api/products | 获取产品列表 |
| GET | /api/products/:id | 获取单个产品 |
| POST | /api/products | 创建产品 |
| PUT | /api/products/:id | 更新产品 |
| DELETE | /api/products/:id | 删除产品 |
| GET | /api/cart | 获取购物车 |
| POST | /api/cart | 添加到购物车 |
| PUT | /api/cart/:id | 更新购物车项 |
| DELETE | /api/cart/:id | 移除购物车项 |
| GET | /api/orders | 获取订单列表 |
| POST | /api/orders | 创建订单 |
| GET | /api/orders/:id | 获取订单详情 |
| PUT | /api/orders/:id/status | 更新订单状态 |
| GET | /api/customers | 获取客户列表 |
| GET | /api/stock/logs | 获取库存日志 |
| POST | /api/ai/recommend | AI 咖啡推荐 |

## 环境变量

```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=taiwaka_coffee
GEMINI_API_KEY=your-api-key
```

## 性能特点

- 单二进制部署，无运行时依赖
- 内存占用低 (~10-20MB)
- 高并发处理能力
- 连接池优化
- 请求日志和监控

## 许可证

MIT
