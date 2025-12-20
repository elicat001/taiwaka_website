# 太哇卡咖啡 - 后端管理系统

基于 Python Flask + SQLite 构建的简单高效的内容管理系统。

## 功能特性

### 核心模块
- **产品管理** - 产品的增删改查，支持分类、库存、价格管理
- **分类管理** - 产品分类的组织和管理
- **文章管理** - 品牌故事、新闻资讯等内容管理
- **订单管理** - 订单查看、状态更新、库存自动扣减
- **管理员系统** - 登录认证、权限管理
- **图片上传** - 支持产品和文章的图片上传

### API 功能
- RESTful API 设计
- 完整的 CRUD 操作
- 分页查询支持
- 搜索和过滤功能
- Session 认证机制

## 技术栈

- **后端框架**: Flask 3.0
- **数据库**: SQLite
- **ORM**: Flask-SQLAlchemy
- **跨域**: Flask-CORS
- **图片处理**: Pillow

## 快速开始

### 1. 安装依赖

```bash
cd backend
pip install -r requirements.txt
```

### 2. 初始化数据库

```bash
python init_db.py
```

这将创建数据库表并添加示例数据。默认管理员账户：
- 用户名: `admin`
- 密码: `admin123`

### 3. 启动服务器

```bash
python app.py
```

服务器将在 `http://localhost:5000` 启动。

### 4. 访问管理后台

打开浏览器访问：`http://localhost:5000/admin`

## API 文档

### 基础 URL
```
http://localhost:5000/api
```

### 认证相关

#### 登录
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

#### 登出
```
POST /api/auth/logout
```

#### 获取当前用户
```
GET /api/auth/me
```

### 产品管理

#### 获取产品列表
```
GET /api/products?page=1&per_page=20&category_id=1&is_featured=true
```

#### 获取单个产品
```
GET /api/products/{id}
```

#### 创建产品
```
POST /api/products
Content-Type: application/json

{
  "name": "美式咖啡",
  "description": "经典美式",
  "price": 25.0,
  "category_id": 1,
  "stock": 100,
  "is_featured": true,
  "tags": "热饮,冰饮"
}
```

#### 更新产品
```
PUT /api/products/{id}
Content-Type: application/json

{
  "price": 28.0,
  "stock": 80
}
```

#### 删除产品
```
DELETE /api/products/{id}
```

### 分类管理

#### 获取分类列表
```
GET /api/categories
```

#### 创建分类
```
POST /api/categories
Content-Type: application/json

{
  "name": "精品咖啡",
  "description": "手工精选咖啡豆",
  "icon": "☕"
}
```

### 文章管理

#### 获取文章列表
```
GET /api/articles?page=1&category=brand_story&is_published=true
```

#### 创建文章
```
POST /api/articles
Content-Type: application/json

{
  "title": "品牌故事",
  "content": "文章内容...",
  "category": "brand_story",
  "is_published": true
}
```

### 订单管理

#### 获取订单列表
```
GET /api/orders?page=1&status=pending
```

#### 创建订单
```
POST /api/orders
Content-Type: application/json

{
  "customer_name": "张三",
  "customer_phone": "13800138000",
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    }
  ]
}
```

#### 更新订单状态
```
PUT /api/orders/{id}
Content-Type: application/json

{
  "status": "confirmed",
  "payment_status": "paid"
}
```

#### 取消订单
```
POST /api/orders/{id}/cancel
```

### 图片上传

#### 上传单张图片
```
POST /api/uploads/image
Content-Type: multipart/form-data

file: [图片文件]
```

#### 上传多张图片
```
POST /api/uploads/images
Content-Type: multipart/form-data

files: [图片文件1, 图片文件2, ...]
```

#### 获取图片
```
GET /api/uploads/{filename}
```

## 数据库结构

### 分类表 (categories)
- id - 主键
- name - 分类名称
- description - 描述
- icon - 图标
- sort_order - 排序
- is_active - 是否启用

### 产品表 (products)
- id - 主键
- name - 产品名称
- description - 描述
- price - 价格
- original_price - 原价
- image_url - 图片URL
- category_id - 分类ID
- stock - 库存
- is_featured - 是否精选
- is_active - 是否上架
- tags - 标签

### 文章表 (articles)
- id - 主键
- title - 标题
- subtitle - 副标题
- content - 内容
- cover_image - 封面图
- author - 作者
- category - 分类
- is_published - 是否发布
- view_count - 浏览量
- published_at - 发布时间

### 订单表 (orders)
- id - 主键
- order_number - 订单号
- customer_name - 客户姓名
- customer_phone - 客户电话
- customer_email - 客户邮箱
- delivery_address - 配送地址
- total_amount - 总金额
- status - 订单状态
- payment_method - 支付方式
- payment_status - 支付状态
- notes - 备注

### 订单项表 (order_items)
- id - 主键
- order_id - 订单ID
- product_id - 产品ID
- product_name - 产品名称
- product_price - 产品价格
- quantity - 数量
- subtotal - 小计

### 管理员表 (admins)
- id - 主键
- username - 用户名
- email - 邮箱
- password_hash - 密码哈希
- is_active - 是否启用
- last_login - 最后登录时间

## 项目结构

```
backend/
├── app.py              # Flask 主应用
├── config.py           # 配置文件
├── models.py           # 数据库模型
├── init_db.py          # 数据库初始化脚本
├── requirements.txt    # Python 依赖
├── routes/             # 路由模块
│   ├── auth.py         # 认证路由
│   ├── products.py     # 产品路由
│   ├── categories.py   # 分类路由
│   ├── articles.py     # 文章路由
│   ├── orders.py       # 订单路由
│   └── upload.py       # 上传路由
├── static/             # 静态文件
│   └── uploads/        # 上传文件存储
└── templates/          # 模板文件
    └── admin/          # 管理后台页面
        ├── login.html
        └── dashboard.html
```

## 环境变量配置

创建 `.env` 文件（可选）：

```env
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///database.db
JWT_SECRET_KEY=your-jwt-secret-key
```

## 开发建议

1. **修改默认密码**: 首次登录后立即修改管理员密码
2. **配置 CORS**: 根据前端地址调整 `config.py` 中的 CORS 设置
3. **图片存储**: 生产环境建议使用云存储服务（如阿里云 OSS）
4. **数据库**: 生产环境建议使用 MySQL 或 PostgreSQL
5. **安全性**: 启用 HTTPS，使用更强的密钥

## 常见问题

### Q: 如何重置数据库？
A: 删除 `database.db` 文件，重新运行 `python init_db.py`

### Q: 如何添加新的管理员？
A: 使用 `/api/auth/register` 接口或直接通过管理后台添加

### Q: 上传的图片保存在哪里？
A: 保存在 `backend/static/uploads/` 目录下

### Q: 如何修改端口？
A: 修改 `app.py` 中的 `app.run(port=5000)`

## 后续优化建议

- [ ] 添加 JWT 认证替代 Session
- [ ] 实现完整的权限管理系统
- [ ] 添加数据导出功能
- [ ] 集成邮件通知
- [ ] 添加数据统计图表
- [ ] 实现批量操作
- [ ] 添加操作日志
- [ ] 支持多语言

## 许可证

MIT License
