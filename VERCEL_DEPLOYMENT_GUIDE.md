# 太哇卡咖啡网站 - Vercel 部署完整指南

## 目录
1. [项目架构深度分析](#项目架构深度分析)
2. [数据库设计详解](#数据库设计详解)
3. [后端API架构](#后端api架构)
4. [Vercel部署要求](#vercel部署要求)
5. [数据库迁移方案](#数据库迁移方案)
6. [详细部署步骤](#详细部署步骤)
7. [环境配置](#环境配置)
8. [常见问题解决](#常见问题解决)

---

## 项目架构深度分析

### 整体架构
```
太哇卡咖啡网站
├── 前端 (React + TypeScript + Vite)
│   ├── 单页应用 (SPA)
│   ├── 静态文件生成
│   └── API 调用
│
└── 后端 (Python Flask)
    ├── RESTful API
    ├── SQLite 数据库 (需要迁移到 PostgreSQL)
    ├── 文件上传系统
    └── Session 认证系统
```

### 目录结构详解

#### 前端结构
```
taiwaka_website/
├── App.tsx                    # React 主应用组件
├── index.tsx                  # 应用入口点
├── index.html                 # HTML 模板
├── constants.tsx              # 常量配置
├── types.ts                   # TypeScript 类型定义
├── vite.config.ts            # Vite 构建配置
├── tsconfig.json             # TypeScript 配置
├── package.json              # Node.js 依赖
└── services/                 # 服务层 (如果有)
```

#### 后端结构
```
backend/
├── app.py                    # Flask 应用工厂
├── config.py                 # 配置文件
├── models.py                 # 数据库模型 (6个模型)
├── init_db.py                # 数据库初始化脚本
├── requirements.txt          # Python 依赖
│
├── routes/                   # 路由模块 (蓝图架构)
│   ├── __init__.py
│   ├── auth.py              # 认证相关 (登录/注册/会话)
│   ├── products.py          # 产品管理 (CRUD + 搜索)
│   ├── categories.py        # 分类管理 (CRUD)
│   ├── articles.py          # 文章管理 (CMS)
│   ├── orders.py            # 订单管理 (含库存控制)
│   └── upload.py            # 文件上传 (图片)
│
├── templates/                # Jinja2 模板
│   └── admin/
│       ├── login.html       # 管理员登录页
│       └── dashboard.html   # 管理后台
│
└── static/                   # 静态文件
    └── uploads/             # 上传文件存储
```

### 技术栈

#### 前端
- **框架**: React 19.2.3
- **语言**: TypeScript 5.8.2
- **构建工具**: Vite 6.2.0
- **AI集成**: Google Gemini AI (@google/genai)

#### 后端
- **框架**: Flask 3.0+
- **ORM**: SQLAlchemy 3.1.1
- **数据库**: SQLite (开发) → PostgreSQL (生产)
- **认证**: Session-based (Flask session + Werkzeug)
- **CORS**: Flask-CORS 4.0.0
- **图片处理**: Pillow 10.0.0

---

## 数据库设计详解

### ER 关系图

```
┌──────────────┐
│   Category   │
│              │
│  id (PK)     │
│  name        │◀──────────┐
│  description │           │
│  icon        │           │ 1:N
│  sort_order  │           │
│  is_active   │           │
│  created_at  │           │
│  updated_at  │           │
└──────────────┘           │
                           │
                    ┌──────┴────────┐
                    │    Product    │
                    │               │
                    │  id (PK)      │
                    │  name         │
                    │  description  │
                    │  price        │
                    │  original_price│
                    │  image_url    │
                    │  category_id (FK)│◀─────┐
                    │  stock        │        │
                    │  is_featured  │        │
                    │  is_active    │        │
                    │  tags         │        │ N:1
                    │  sort_order   │        │
                    │  created_at   │        │
                    │  updated_at   │        │
                    └───────────────┘        │
                                            │
                    ┌──────────────┐        │
                    │  OrderItem   │        │
                    │              │        │
                    │  id (PK)     │        │
                    │  order_id (FK)│       │
                    │  product_id (FK)─────┘
                    │  product_name│
                    │  product_price│
                    │  quantity    │
                    │  subtotal    │
                    └──────┬───────┘
                           │
                           │ N:1
                           │
                    ┌──────▼───────┐
                    │    Order     │
                    │              │
                    │  id (PK)     │
                    │  order_number│
                    │  customer_name│
                    │  customer_phone│
                    │  customer_email│
                    │  delivery_address│
                    │  total_amount│
                    │  status      │
                    │  payment_method│
                    │  payment_status│
                    │  notes       │
                    │  created_at  │
                    │  updated_at  │
                    └──────────────┘

┌──────────────┐              ┌──────────────┐
│   Article    │              │    Admin     │
│              │              │              │
│  id (PK)     │              │  id (PK)     │
│  title       │              │  username    │
│  subtitle    │              │  email       │
│  content     │              │  password_hash│
│  cover_image │              │  is_active   │
│  author      │              │  last_login  │
│  category    │              │  created_at  │
│  is_published│              └──────────────┘
│  view_count  │
│  sort_order  │
│  published_at│
│  created_at  │
│  updated_at  │
└──────────────┘
```

### 数据模型详解

#### 1. Category (产品分类)
```python
字段说明:
- id: 主键
- name: 分类名称 (唯一, 必填)
- description: 分类描述
- icon: 图标 (emoji或图标名称)
- sort_order: 排序顺序 (升序显示)
- is_active: 是否启用 (软删除)
- created_at: 创建时间
- updated_at: 更新时间

关系:
- products: 一对多 → Product (级联删除)

业务规则:
- 分类名称必须唯一
- 删除分类前必须先删除所有关联产品
- 默认按 sort_order 升序排列
```

#### 2. Product (产品)
```python
字段说明:
- id: 主键
- name: 产品名称 (必填)
- description: 产品描述
- price: 当前售价 (必填)
- original_price: 原价 (用于显示折扣)
- image_url: 产品图片URL
- category_id: 分类外键 (必填)
- stock: 库存数量 (默认0)
- is_featured: 是否精选产品
- is_active: 是否上架
- tags: 标签 (逗号分隔字符串)
- sort_order: 排序顺序
- created_at: 创建时间
- updated_at: 更新时间

关系:
- category: 多对一 → Category
- order_items: 一对多 → OrderItem

业务规则:
- 必须关联到有效的分类
- 库存扣减在订单创建时自动执行
- 库存恢复在订单取消时自动执行
- tags 存储为逗号分隔字符串, 转换为数组返回
```

#### 3. Article (文章/CMS)
```python
字段说明:
- id: 主键
- title: 文章标题 (必填)
- subtitle: 副标题
- content: 文章内容 (支持Markdown, 必填)
- cover_image: 封面图片URL
- author: 作者
- category: 文章分类 (brand_story/news/guide等)
- is_published: 是否发布
- view_count: 浏览次数 (自动增加)
- sort_order: 排序顺序
- published_at: 发布时间
- created_at: 创建时间
- updated_at: 更新时间

业务规则:
- 从草稿变为发布时自动设置 published_at
- 查看文章时自动增加 view_count
- 默认只显示已发布的文章 (is_published=True)
```

#### 4. Order (订单)
```python
字段说明:
- id: 主键
- order_number: 订单号 (格式: TW{timestamp}{4位随机数})
- customer_name: 客户姓名 (必填)
- customer_phone: 客户电话 (必填)
- customer_email: 客户邮箱
- delivery_address: 配送地址
- total_amount: 订单总额 (自动计算)
- status: 订单状态 (pending/confirmed/preparing/delivered/cancelled)
- payment_method: 支付方式 (cash/card/online)
- payment_status: 支付状态 (unpaid/paid/refunded)
- notes: 订单备注
- created_at: 创建时间
- updated_at: 更新时间

关系:
- items: 一对多 → OrderItem (级联删除)

业务规则:
- 订单号自动生成, 格式: TW20241220153045XXXX
- 创建订单时自动扣减库存
- 取消订单时自动恢复库存
- 只能删除 pending 或 cancelled 状态的订单
- 已完成订单不能取消
```

#### 5. OrderItem (订单项)
```python
字段说明:
- id: 主键
- order_id: 订单外键 (必填)
- product_id: 产品外键 (必填)
- product_name: 产品名称 (冗余字段, 防止产品被删)
- product_price: 产品价格 (冗余字段, 记录下单时价格)
- quantity: 购买数量 (必填)
- subtotal: 小计 (price × quantity)

关系:
- order: 多对一 → Order
- product: 多对一 → Product

业务规则:
- 冗余存储产品名称和价格, 避免产品删除后订单信息丢失
- subtotal 自动计算
```

#### 6. Admin (管理员)
```python
字段说明:
- id: 主键
- username: 用户名 (唯一, 必填)
- email: 邮箱 (唯一, 必填)
- password_hash: 密码哈希 (Werkzeug加密)
- is_active: 是否启用
- last_login: 最后登录时间
- created_at: 创建时间

方法:
- set_password(password): 设置密码 (自动哈希)
- check_password(password): 验证密码

业务规则:
- 密码长度至少6位
- 不能禁用或删除自己的账户
- 登录成功后更新 last_login
- 使用 Flask session 存储登录状态
```

### 数据库索引策略

```sql
-- 建议的索引 (用于PostgreSQL)

-- Category
CREATE INDEX idx_category_name ON categories(name);
CREATE INDEX idx_category_sort_active ON categories(sort_order, is_active);

-- Product
CREATE INDEX idx_product_category ON products(category_id);
CREATE INDEX idx_product_featured ON products(is_featured, is_active);
CREATE INDEX idx_product_name_search ON products(name);
CREATE INDEX idx_product_sort ON products(sort_order, created_at);

-- Article
CREATE INDEX idx_article_category ON articles(category);
CREATE INDEX idx_article_published ON articles(is_published, published_at);

-- Order
CREATE INDEX idx_order_number ON orders(order_number);
CREATE INDEX idx_order_customer_phone ON orders(customer_phone);
CREATE INDEX idx_order_status ON orders(status, payment_status);
CREATE INDEX idx_order_created ON orders(created_at DESC);

-- OrderItem
CREATE INDEX idx_orderitem_order ON order_items(order_id);
CREATE INDEX idx_orderitem_product ON order_items(product_id);

-- Admin
CREATE INDEX idx_admin_username ON admins(username);
CREATE INDEX idx_admin_email ON admins(email);
```

---

## 后端API架构

### API设计模式
- **架构**: Blueprint模块化架构
- **风格**: RESTful API
- **认证**: Session-based认证
- **错误处理**: 统一JSON错误响应
- **CORS**: 配置允许的前端源

### API端点总览

#### 认证模块 (`/api/auth`)
```
POST   /api/auth/login              # 管理员登录
POST   /api/auth/logout             # 管理员登出 (需认证)
GET    /api/auth/me                 # 获取当前用户信息 (需认证)
POST   /api/auth/register           # 注册新管理员
POST   /api/auth/change-password    # 修改密码 (需认证)
GET    /api/auth/admins             # 获取管理员列表 (需认证)
PUT    /api/auth/admins/:id         # 更新管理员 (需认证)
DELETE /api/auth/admins/:id         # 删除管理员 (需认证)
```

**登录流程**:
```python
1. 客户端发送: {username, password}
2. 服务器验证用户名和密码
3. 验证通过后设置 session['admin_id'] 和 session['admin_username']
4. 返回管理员信息
5. 后续请求自动携带 session cookie
```

#### 产品模块 (`/api/products`)
```
GET    /api/products                # 获取产品列表 (分页+搜索+筛选)
GET    /api/products/:id            # 获取单个产品
POST   /api/products                # 创建产品 (需认证)
PUT    /api/products/:id            # 更新产品 (需认证)
DELETE /api/products/:id            # 删除产品 (需认证)
GET    /api/products/featured       # 获取精选产品
```

**查询参数**:
- `page`: 页码 (默认1)
- `per_page`: 每页数量 (默认20)
- `category_id`: 按分类筛选
- `is_featured`: 是否精选
- `is_active`: 是否激活
- `search`: 搜索关键词 (名称/描述/标签)

**响应示例**:
```json
{
  "products": [
    {
      "id": 1,
      "name": "美式咖啡",
      "description": "经典美式，浓郁醇香",
      "price": 25.0,
      "original_price": 30.0,
      "image_url": "/api/uploads/image.jpg",
      "category_id": 1,
      "category_name": "精品咖啡",
      "stock": 100,
      "is_featured": true,
      "is_active": true,
      "tags": ["热饮", "冰饮", "推荐"],
      "sort_order": 1,
      "created_at": "2024-12-20T10:00:00",
      "updated_at": "2024-12-20T10:00:00"
    }
  ],
  "total": 100,
  "pages": 5,
  "current_page": 1,
  "per_page": 20
}
```

#### 分类模块 (`/api/categories`)
```
GET    /api/categories              # 获取分类列表
GET    /api/categories/:id          # 获取单个分类
POST   /api/categories              # 创建分类 (需认证)
PUT    /api/categories/:id          # 更新分类 (需认证)
DELETE /api/categories/:id          # 删除分类 (需认证)
GET    /api/categories/:id/products # 获取分类下的产品
```

#### 文章模块 (`/api/articles`)
```
GET    /api/articles                # 获取文章列表 (分页)
GET    /api/articles/:id            # 获取单篇文章 (自动增加浏览量)
POST   /api/articles                # 创建文章 (需认证)
PUT    /api/articles/:id            # 更新文章 (需认证)
DELETE /api/articles/:id            # 删除文章 (需认证)
GET    /api/articles/categories     # 获取文章分类列表
```

**查询参数**:
- `page`, `per_page`: 分页
- `category`: 文章分类
- `is_published`: 是否发布
- `search`: 搜索 (标题/副标题/内容)
- `include_content`: 是否包含正文 (默认false, 列表页优化)

#### 订单模块 (`/api/orders`)
```
GET    /api/orders                  # 获取订单列表 (需认证)
GET    /api/orders/:id              # 获取订单详情 (需认证)
POST   /api/orders                  # 创建订单 (公开, 自动扣减库存)
PUT    /api/orders/:id              # 更新订单 (需认证)
DELETE /api/orders/:id              # 删除订单 (需认证, 恢复库存)
POST   /api/orders/:id/cancel       # 取消订单 (恢复库存)
GET    /api/orders/statistics       # 订单统计 (需认证)
```

**创建订单请求**:
```json
{
  "customer_name": "张三",
  "customer_phone": "13800138000",
  "customer_email": "zhang@example.com",
  "delivery_address": "北京市朝阳区xxx",
  "payment_method": "online",
  "notes": "请尽快配送",
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    },
    {
      "product_id": 3,
      "quantity": 1
    }
  ]
}
```

**订单状态流转**:
```
pending (待处理)
  ↓
confirmed (已确认)
  ↓
preparing (准备中)
  ↓
delivered (已配送)

或者:
pending → cancelled (已取消, 恢复库存)
```

#### 上传模块 (`/api/uploads`)
```
POST   /api/uploads/image           # 上传单张图片
POST   /api/uploads/images          # 批量上传图片
GET    /api/uploads/:filename       # 获取上传的文件
DELETE /api/uploads/:filename       # 删除文件 (需认证)
```

**上传限制**:
- 允许格式: PNG, JPG, JPEG, GIF, WEBP
- 最大文件大小: 16MB
- 文件名格式: `{timestamp}_{uuid}.{ext}`

#### 其他端点
```
GET    /api/health                  # 健康检查
GET    /admin                       # 管理后台登录页
GET    /admin/login                 # 管理后台登录页
GET    /admin/dashboard             # 管理后台首页 (需认证)
```

### 错误处理

**统一错误响应格式**:
```json
{
  "error": "错误描述信息"
}
```

**HTTP状态码**:
- `200`: 成功
- `201`: 创建成功
- `400`: 请求参数错误
- `401`: 未认证
- `403`: 权限不足
- `404`: 资源不存在
- `500`: 服务器错误

### 认证机制

**Session认证流程**:
```python
# 1. 登录装饰器
@login_required
def protected_route():
    # 检查 session['admin_id'] 是否存在
    if 'admin_id' not in session:
        return 401 Unauthorized

    # 继续执行业务逻辑
    ...

# 2. Session配置
app.config['SECRET_KEY'] = 'your-secret-key'
session.permanent = True
app.permanent_session_lifetime = timedelta(hours=24)

# 3. 前端请求配置
fetch(url, {
  credentials: 'include'  // 重要: 携带cookie
})
```

---

## Vercel部署要求

### Vercel平台特性

#### Serverless函数限制
Vercel使用serverless架构,有以下限制:
- **执行时间**: 每个请求最多10秒(免费)或60秒(Pro)
- **内存**: 最多1024MB
- **冷启动**: 函数可能需要1-3秒启动时间
- **无状态**: 每个请求都是独立的,不保留文件系统状态
- **文件系统**: 只读,除了 `/tmp` 目录(临时,不持久)

#### 不支持的功能
- ✗ SQLite (需要写文件系统)
- ✗ 本地文件上传存储 (需要持久化文件系统)
- ✗ Session文件存储 (需要外部存储)
- ✗ 长时间运行的进程
- ✗ WebSocket (需要特殊配置)

#### 支持的功能
- ✓ Python Serverless函数
- ✓ 静态文件托管
- ✓ 环境变量
- ✓ 自定义域名
- ✓ HTTPS (自动)
- ✓ CDN (全球)

### Flask on Vercel 要求

#### 1. 项目结构要求
```
project/
├── api/                      # Serverless函数目录
│   └── index.py             # Flask应用入口
├── requirements.txt         # Python依赖
├── vercel.json              # Vercel配置
└── .env                     # 环境变量 (不提交)
```

#### 2. Flask应用适配

**必须修改**:
```python
# 原来: app.run()
# Vercel: 导出app对象

# api/index.py
from app import create_app

app = create_app()

# 不需要 if __name__ == '__main__'
```

#### 3. 依赖项要求
```txt
# requirements.txt
Flask>=3.0.0
Flask-CORS>=4.0.0
Flask-SQLAlchemy>=3.1.1
psycopg2-binary>=2.9.9    # PostgreSQL驱动
python-dotenv>=1.0.0
Pillow>=10.0.0
```

---

## 数据库迁移方案

### 为什么必须迁移

**SQLite的限制**:
- 基于文件的数据库
- Vercel的文件系统是只读的
- 每次部署都会重置
- 无法在serverless环境持久化

**解决方案**: 迁移到外部数据库服务

### 推荐数据库服务

#### 1. Vercel Postgres (推荐)
- **优势**:
  - 与Vercel深度集成
  - 自动配置环境变量
  - 免费套餐: 256MB存储
  - 低延迟(同区域)
- **价格**: 免费 → $20/月
- **文档**: https://vercel.com/docs/storage/vercel-postgres

#### 2. Supabase (推荐)
- **优势**:
  - 免费套餐: 500MB存储, 无限API请求
  - 包含认证、存储、实时功能
  - 优秀的管理面板
  - 支持PostgreSQL所有功能
- **价格**: 免费 → $25/月
- **注册**: https://supabase.com

#### 3. Neon (推荐)
- **优势**:
  - Serverless PostgreSQL
  - 免费套餐: 0.5GB存储
  - 自动扩缩容
  - 冷启动快
- **价格**: 免费 → $19/月
- **注册**: https://neon.tech

#### 4. Railway
- **优势**:
  - 简单易用
  - 免费套餐: $5信用额度/月
  - 支持多种数据库
- **价格**: 按用量计费
- **注册**: https://railway.app

### SQLite → PostgreSQL 迁移步骤

#### 方法一: 使用pgloader (推荐)

```bash
# 1. 安装 pgloader
# Ubuntu/Debian
sudo apt-get install pgloader

# macOS
brew install pgloader

# 2. 执行迁移
pgloader sqlite://backend/database.db postgresql://user:password@host:5432/dbname

# 3. 验证数据
psql postgresql://user:password@host:5432/dbname
\dt  # 查看表
SELECT COUNT(*) FROM products;
```

#### 方法二: 使用Python脚本

```python
# migrate_db.py
import sqlite3
import psycopg2
from psycopg2.extras import execute_values

# 连接数据库
sqlite_conn = sqlite3.connect('backend/database.db')
sqlite_conn.row_factory = sqlite3.Row

pg_conn = psycopg2.connect(
    host="your-host",
    database="your-db",
    user="your-user",
    password="your-password"
)

# 获取所有表名
cursor = sqlite_conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()

for table in tables:
    table_name = table[0]
    print(f"Migrating {table_name}...")

    # 读取SQLite数据
    cursor.execute(f"SELECT * FROM {table_name}")
    rows = cursor.fetchall()

    if rows:
        # 获取列名
        columns = [description[0] for description in cursor.description]

        # 插入PostgreSQL
        pg_cursor = pg_conn.cursor()
        insert_query = f"INSERT INTO {table_name} ({','.join(columns)}) VALUES %s"

        execute_values(pg_cursor, insert_query, [tuple(row) for row in rows])
        pg_conn.commit()

        print(f"  → Migrated {len(rows)} rows")

print("Migration completed!")
```

#### 方法三: 导出SQL + 手动导入

```bash
# 1. 导出SQLite为SQL
sqlite3 backend/database.db .dump > export.sql

# 2. 手动编辑 export.sql
# - 删除 SQLite特定语法
# - 修改数据类型 (INTEGER → SERIAL, TEXT → VARCHAR等)
# - 修改 AUTOINCREMENT → SERIAL

# 3. 导入PostgreSQL
psql postgresql://user:password@host:5432/dbname < export.sql
```

### 代码适配

#### 修改 config.py

```python
import os

class Config:
    # 数据库配置
    DATABASE_URL = os.environ.get('DATABASE_URL') or \
        os.environ.get('POSTGRES_URL') or \
        'sqlite:///' + os.path.join(BASE_DIR, 'database.db')

    # Vercel Postgres 使用 POSTGRES_URL
    # Supabase/Neon 使用 DATABASE_URL

    # 修复 Heroku/某些服务的 postgres:// → postgresql://
    if DATABASE_URL and DATABASE_URL.startswith('postgres://'):
        DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)

    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # PostgreSQL连接池配置
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': 10,
        'pool_recycle': 3600,
        'pool_pre_ping': True,  # 自动重连
    }
```

#### 修改 models.py (如果需要)

大部分SQLAlchemy代码无需修改,但需注意:

```python
# SQLite vs PostgreSQL 差异

# 1. 布尔类型
# SQLite: INTEGER (0/1)
# PostgreSQL: BOOLEAN
# SQLAlchemy自动处理,无需修改

# 2. 日期时间
# SQLite: TEXT
# PostgreSQL: TIMESTAMP
# SQLAlchemy自动处理,无需修改

# 3. JSON类型 (如果使用)
# SQLite: TEXT
# PostgreSQL: JSONB (更好的性能)
from sqlalchemy.dialects.postgresql import JSONB

metadata = db.Column(JSONB)  # PostgreSQL
# 或
metadata = db.Column(db.JSON)  # 跨数据库兼容
```

---

## 详细部署步骤

### 前期准备

#### 1. 准备数据库

**选择Supabase (推荐)**:

1. 访问 https://supabase.com
2. 注册账户
3. 创建新项目
4. 记录数据库连接信息:
   ```
   Host: db.xxx.supabase.co
   Database: postgres
   User: postgres
   Password: [你的密码]
   Port: 5432
   ```
5. 获取连接字符串:
   ```
   postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres
   ```

**或选择Vercel Postgres**:

1. 在Vercel项目中点击 "Storage" 标签
2. 选择 "Postgres"
3. 创建数据库
4. 自动配置环境变量 (POSTGRES_URL等)

#### 2. 迁移数据库

```bash
# 使用 pgloader
pgloader \
  sqlite://backend/database.db \
  postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres
```

或者在生产环境初始化新数据库:

```bash
# 设置环境变量
export DATABASE_URL="postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres"

# 运行初始化脚本
cd backend
python init_db.py
```

#### 3. 准备文件存储

由于Vercel不支持本地文件存储,需要使用云存储:

**选项1: Vercel Blob Storage**
```bash
npm install @vercel/blob
```

**选项2: Cloudinary (推荐)**
- 免费: 25GB存储, 25GB带宽/月
- 注册: https://cloudinary.com
- 获取: Cloud Name, API Key, API Secret

**选项3: AWS S3 / 阿里云OSS**

修改 `routes/upload.py`:
```python
# 原来: 保存到本地
file.save(filepath)

# 现在: 上传到云存储
import cloudinary.uploader
result = cloudinary.uploader.upload(file)
file_url = result['secure_url']
```

### 后端部署到Vercel

#### 步骤1: 调整项目结构

```bash
cd taiwaka_website

# 创建api目录
mkdir -p api

# 将Flask应用移动到api目录
# 方案A: 移动整个backend目录
mv backend api/

# 方案B: 创建入口文件
# api/index.py
```

创建 `api/index.py`:
```python
import sys
import os

# 添加backend目录到Python路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from app import create_app

app = create_app()

# Vercel会自动调用这个app对象
```

或者,更简单的方式:
```python
# api/index.py
from backend.app import create_app

app = create_app()
```

#### 步骤2: 创建 vercel.json

在项目根目录创建 `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.py",
      "use": "@vercel/python",
      "config": {
        "maxLambdaSize": "50mb"
      }
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "api/index.py"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "PYTHON_VERSION": "3.11"
  }
}
```

#### 步骤3: 修改 backend/config.py

```python
import os
from datetime import timedelta

class Config:
    # 基础配置
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'taiwaka-coffee-secret-key-2024'
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))

    # 数据库配置
    DATABASE_URL = os.environ.get('DATABASE_URL') or \
                   os.environ.get('POSTGRES_URL') or \
                   os.environ.get('POSTGRES_URL_NON_POOLING')

    # 修复postgres://前缀
    if DATABASE_URL and DATABASE_URL.startswith('postgres://'):
        DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)

    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': 10,
        'pool_recycle': 3600,
        'pool_pre_ping': True,
    }

    # 文件上传配置 - 使用云存储
    # Cloudinary配置
    CLOUDINARY_CLOUD_NAME = os.environ.get('CLOUDINARY_CLOUD_NAME')
    CLOUDINARY_API_KEY = os.environ.get('CLOUDINARY_API_KEY')
    CLOUDINARY_API_SECRET = os.environ.get('CLOUDINARY_API_SECRET')

    # 或Vercel Blob
    BLOB_READ_WRITE_TOKEN = os.environ.get('BLOB_READ_WRITE_TOKEN')

    MAX_CONTENT_LENGTH = 16 * 1024 * 1024
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

    # JWT 配置
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key-2024'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)

    # CORS 配置 - 添加生产域名
    CORS_ORIGINS = [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://your-domain.vercel.app',  # 替换为你的域名
        'https://taiwaka-coffee.vercel.app'
    ]

    # Session配置 (重要!)
    SESSION_TYPE = 'filesystem'  # 开发环境
    # 生产环境建议使用Redis或数据库存储session
    # SESSION_TYPE = 'sqlalchemy'
    # SESSION_SQLALCHEMY = db
```

#### 步骤4: 修改 backend/app.py

```python
from flask import Flask, jsonify, render_template
from flask_cors import CORS
from config import Config
from models import db
import os

def create_app(config_class=Config):
    """应用工厂函数"""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # 初始化扩展
    db.init_app(app)
    CORS(app, resources={r"/api/*": {
        "origins": app.config['CORS_ORIGINS'],
        "supports_credentials": True,
        "allow_headers": ["Content-Type", "Authorization"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    }})

    # Vercel环境下不创建上传文件夹
    # if not os.environ.get('VERCEL'):
    #     os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # 注册路由
    from routes.categories import categories_bp
    from routes.products import products_bp
    from routes.articles import articles_bp
    from routes.orders import orders_bp
    from routes.auth import auth_bp
    from routes.upload import upload_bp

    app.register_blueprint(categories_bp, url_prefix='/api/categories')
    app.register_blueprint(products_bp, url_prefix='/api/products')
    app.register_blueprint(articles_bp, url_prefix='/api/articles')
    app.register_blueprint(orders_bp, url_prefix='/api/orders')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(upload_bp, url_prefix='/api/uploads')

    # 健康检查端点
    @app.route('/api/health')
    def health():
        return jsonify({
            'status': 'ok',
            'message': 'Taiwaka Coffee API is running',
            'environment': 'production' if os.environ.get('VERCEL') else 'development'
        })

    # 管理后台页面路由
    @app.route('/admin/login')
    def admin_login():
        return render_template('admin/login.html')

    @app.route('/admin/dashboard')
    def admin_dashboard():
        return render_template('admin/dashboard.html')

    @app.route('/admin')
    def admin_redirect():
        return render_template('admin/login.html')

    # 错误处理
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Not found'}), 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

    return app

# Vercel入口
app = create_app()

# 开发环境
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)
```

#### 步骤5: 修改 routes/upload.py (使用Cloudinary)

```python
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import cloudinary
import cloudinary.uploader
import os
from datetime import datetime

upload_bp = Blueprint('upload', __name__)

# 配置Cloudinary
cloudinary.config(
    cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME'),
    api_key=os.environ.get('CLOUDINARY_API_KEY'),
    api_secret=os.environ.get('CLOUDINARY_API_SECRET')
)

def allowed_file(filename):
    """检查文件扩展名"""
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@upload_bp.route('/image', methods=['POST'])
def upload_image():
    """上传图片到Cloudinary"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']

        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed'}), 400

        # 上传到Cloudinary
        result = cloudinary.uploader.upload(
            file,
            folder='taiwaka_coffee',  # 指定文件夹
            resource_type='image',
            allowed_formats=['png', 'jpg', 'jpeg', 'gif', 'webp']
        )

        return jsonify({
            'message': 'File uploaded successfully',
            'filename': result['public_id'],
            'url': result['secure_url'],
            'width': result['width'],
            'height': result['height']
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@upload_bp.route('/images', methods=['POST'])
def upload_multiple_images():
    """批量上传图片"""
    try:
        if 'files' not in request.files:
            return jsonify({'error': 'No files provided'}), 400

        files = request.files.getlist('files')
        uploaded_files = []
        errors = []

        for file in files:
            if file.filename == '':
                continue

            if not allowed_file(file.filename):
                errors.append(f'{file.filename}: File type not allowed')
                continue

            try:
                result = cloudinary.uploader.upload(
                    file,
                    folder='taiwaka_coffee',
                    resource_type='image'
                )

                uploaded_files.append({
                    'filename': result['public_id'],
                    'url': result['secure_url']
                })

            except Exception as e:
                errors.append(f'{file.filename}: {str(e)}')

        return jsonify({
            'message': f'Uploaded {len(uploaded_files)} files',
            'files': uploaded_files,
            'errors': errors
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@upload_bp.route('/<path:public_id>', methods=['DELETE'])
def delete_uploaded_file(public_id):
    """删除文件"""
    try:
        result = cloudinary.uploader.destroy(public_id)

        if result['result'] == 'ok':
            return jsonify({'message': 'File deleted successfully'})
        else:
            return jsonify({'error': 'File not found'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

#### 步骤6: 更新 requirements.txt

```txt
Flask>=3.0.0
Flask-CORS>=4.0.0
Flask-SQLAlchemy>=3.1.1
psycopg2-binary>=2.9.9
Werkzeug>=3.0.1
python-dotenv>=1.0.0
Pillow>=10.0.0
cloudinary>=1.36.0
```

#### 步骤7: 创建 .vercelignore

```
backend/database.db
backend/static/uploads/*
backend/__pycache__
backend/**/__pycache__
backend/.env
node_modules
.env
.git
*.pyc
__pycache__
venv
.venv
```

#### 步骤8: 部署到Vercel

```bash
# 1. 安装Vercel CLI
npm install -g vercel

# 2. 登录Vercel
vercel login

# 3. 部署 (首次)
vercel

# 按提示操作:
# - Set up and deploy "~/taiwaka_website"? Y
# - Which scope? [选择你的账户]
# - Link to existing project? N
# - What's your project's name? taiwaka-coffee
# - In which directory is your code located? ./
# - Want to override the settings? N

# 4. 部署到生产环境
vercel --prod
```

#### 步骤9: 配置环境变量

在Vercel Dashboard:

1. 进入项目设置
2. 选择 "Environment Variables"
3. 添加以下变量:

```bash
# 数据库
DATABASE_URL=postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres

# 或者使用Vercel Postgres (自动配置)
# POSTGRES_URL
# POSTGRES_PRISMA_URL
# POSTGRES_URL_NON_POOLING

# 密钥
SECRET_KEY=your-super-secret-key-here-change-me
JWT_SECRET_KEY=your-jwt-secret-key-here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Python版本
PYTHON_VERSION=3.11
```

4. 重新部署:
```bash
vercel --prod
```

#### 步骤10: 初始化生产数据库

```bash
# 方法1: 本地连接生产数据库
export DATABASE_URL="postgresql://..."
cd backend
python init_db.py

# 方法2: 使用Vercel CLI
vercel env pull  # 下载环境变量
python backend/init_db.py

# 方法3: 使用Supabase SQL编辑器
# 在Supabase Dashboard中手动运行SQL创建表和初始数据
```

### 前端部署到Vercel

前端会自动与后端一起部署,但需要确保:

#### 步骤1: 修改 package.json

```json
{
  "name": "taiwaka-coffee",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.2.3",
    "react-dom": "^19.2.3",
    "@google/genai": "^1.34.0"
  },
  "devDependencies": {
    "@types/node": "^22.14.0",
    "@vitejs/plugin-react": "^5.0.0",
    "typescript": "~5.8.2",
    "vite": "^6.2.0"
  }
}
```

#### 步骤2: 修改 vite.config.ts

```typescript
import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
});
```

#### 步骤3: 创建 API 配置文件

创建 `src/config/api.ts`:
```typescript
const API_BASE_URL = import.meta.env.PROD
  ? 'https://your-domain.vercel.app/api'  // 生产环境
  : 'http://localhost:5000/api';          // 开发环境

export default API_BASE_URL;
```

在组件中使用:
```typescript
import API_BASE_URL from './config/api';

// 获取产品
fetch(`${API_BASE_URL}/products`)
  .then(res => res.json())
  .then(data => console.log(data));
```

#### 步骤4: 更新 vercel.json (完整版)

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.py",
      "use": "@vercel/python",
      "config": {
        "maxLambdaSize": "50mb"
      }
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "api/index.py"
    },
    {
      "src": "/assets/(.*)",
      "dest": "/assets/$1"
    },
    {
      "src": "/(.*\\.(js|css|png|jpg|jpeg|gif|svg|ico|json|woff|woff2|ttf|eot))",
      "dest": "/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "PYTHON_VERSION": "3.11"
  },
  "functions": {
    "api/index.py": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

---

## 环境配置

### 开发环境

创建 `backend/.env`:
```bash
# 数据库
DATABASE_URL=sqlite:///database.db

# 密钥
SECRET_KEY=dev-secret-key
JWT_SECRET_KEY=dev-jwt-secret

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# 上传 (本地开发)
UPLOAD_FOLDER=static/uploads

# Flask
FLASK_APP=app.py
FLASK_ENV=development
FLASK_DEBUG=1
```

### 生产环境 (Vercel)

在Vercel Dashboard配置:

```bash
# 数据库
DATABASE_URL=postgresql://user:pass@host:5432/db
# 或
POSTGRES_URL=postgresql://...

# 密钥 (使用强密码!)
SECRET_KEY=生成随机密钥-32位以上
JWT_SECRET_KEY=另一个随机密钥

# Cloudinary
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# Python
PYTHON_VERSION=3.11

# Vercel会自动设置
VERCEL=1
VERCEL_ENV=production
VERCEL_URL=your-project.vercel.app
```

**生成强密钥**:
```python
import secrets
print(secrets.token_urlsafe(32))
# 或
import os
print(os.urandom(24).hex())
```

---

## 常见问题解决

### 1. 数据库连接错误

**错误**: `psycopg2.OperationalError: could not connect`

**解决**:
```bash
# 检查DATABASE_URL是否正确
echo $DATABASE_URL

# 检查防火墙/IP白名单
# Supabase: 项目设置 → Database → Connection pooling
# 添加 0.0.0.0/0 (允许所有IP)

# 测试连接
psql $DATABASE_URL
```

### 2. 文件上传失败

**错误**: `[Errno 30] Read-only file system`

**原因**: Vercel文件系统只读

**解决**: 必须使用云存储 (Cloudinary/Vercel Blob/S3)

### 3. Session不工作

**错误**: 登录后立即失效

**原因**: Serverless环境session默认存储在内存

**解决方案1**: 使用数据库存储session
```python
# backend/config.py
SESSION_TYPE = 'sqlalchemy'
SESSION_SQLALCHEMY = db
SESSION_PERMANENT = True
PERMANENT_SESSION_LIFETIME = 86400  # 24小时
```

**解决方案2**: 改用JWT认证
```python
# 安装
pip install flask-jwt-extended

# 配置
from flask_jwt_extended import JWTManager, create_access_token

jwt = JWTManager(app)

# 登录返回token
@auth_bp.route('/login', methods=['POST'])
def login():
    # ... 验证用户 ...
    access_token = create_access_token(identity=admin.id)
    return jsonify(access_token=access_token)

# 保护路由
from flask_jwt_extended import jwt_required, get_jwt_identity

@products_bp.route('', methods=['POST'])
@jwt_required()
def create_product():
    current_user_id = get_jwt_identity()
    # ...
```

### 4. CORS错误

**错误**: `Access to fetch blocked by CORS policy`

**解决**:
```python
# backend/config.py
CORS_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://your-domain.vercel.app',
    'https://*.vercel.app'  # 允许所有Vercel预览部署
]

# backend/app.py
CORS(app, resources={r"/api/*": {
    "origins": app.config['CORS_ORIGINS'],
    "supports_credentials": True,
    "allow_headers": ["Content-Type", "Authorization"],
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}})
```

前端请求:
```javascript
fetch(url, {
  credentials: 'include',  // 重要!
  headers: {
    'Content-Type': 'application/json'
  }
})
```

### 5. 构建超时

**错误**: `Error: Command "pip install -r requirements.txt" timed out`

**解决**:
```json
// vercel.json
{
  "builds": [
    {
      "src": "api/index.py",
      "use": "@vercel/python",
      "config": {
        "maxLambdaSize": "50mb"
      }
    }
  ],
  "functions": {
    "api/index.py": {
      "memory": 3008,
      "maxDuration": 30
    }
  }
}
```

减少依赖:
```txt
# requirements.txt - 移除不必要的依赖
Flask==3.0.0
Flask-CORS==4.0.0
Flask-SQLAlchemy==3.1.1
psycopg2-binary==2.9.9
cloudinary==1.36.0
```

### 6. 找不到模块

**错误**: `ModuleNotFoundError: No module named 'backend'`

**解决**:
```python
# api/index.py
import sys
import os

# 方法1: 添加到路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# 方法2: 调整导入
from backend.app import create_app

# 方法3: 调整项目结构
# 将backend/*直接放到api/目录
```

### 7. 数据库表不存在

**错误**: `relation "products" does not exist`

**解决**:
```bash
# 连接生产数据库
export DATABASE_URL="postgresql://..."

# 创建表
python backend/init_db.py

# 或直接在Python中
from backend.app import create_app
from backend.models import db

app = create_app()
with app.app_context():
    db.create_all()
    print("Tables created!")
```

### 8. 环境变量未生效

**错误**: 部署后配置不正确

**解决**:
```bash
# 1. 在Vercel Dashboard检查环境变量
# 2. 确保变量应用到正确的环境(Production/Preview/Development)
# 3. 重新部署
vercel --prod

# 4. 拉取环境变量到本地测试
vercel env pull .env.local
```

### 9. 静态文件404

**错误**: 前端资源加载失败

**解决**:
```json
// vercel.json
{
  "routes": [
    {
      "src": "/assets/(.*)",
      "dest": "/assets/$1"
    },
    {
      "src": "/(.*\\.(js|css|png|jpg))",
      "dest": "/$1"
    }
  ]
}
```

```typescript
// vite.config.ts
export default defineConfig({
  base: '/',  // 确保是根路径
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
```

---

## 部署检查清单

### 部署前
- [ ] 数据库已创建 (PostgreSQL)
- [ ] 数据已迁移到生产数据库
- [ ] Cloudinary账号已创建 (或其他文件存储)
- [ ] 所有环境变量已准备
- [ ] 生成强密钥 (SECRET_KEY, JWT_SECRET_KEY)
- [ ] 代码已提交到Git
- [ ] 测试本地构建: `npm run build`

### 配置检查
- [ ] vercel.json 已创建
- [ ] api/index.py 入口文件正确
- [ ] requirements.txt 包含所有依赖
- [ ] config.py 使用环境变量
- [ ] CORS配置包含生产域名
- [ ] 文件上传改为云存储
- [ ] Session配置适合serverless

### 部署后
- [ ] 访问 https://your-domain.vercel.app/api/health
- [ ] 测试API端点
- [ ] 测试前端页面加载
- [ ] 测试产品列表显示
- [ ] 测试管理员登录
- [ ] 测试文件上传
- [ ] 测试订单创建
- [ ] 检查数据库连接
- [ ] 检查错误日志 (Vercel Dashboard → Logs)

### 性能优化
- [ ] 启用数据库连接池
- [ ] 添加数据库索引
- [ ] 启用CDN (Vercel自动)
- [ ] 压缩图片
- [ ] 启用gzip
- [ ] 配置缓存策略

---

## 总结

这份指南涵盖了:
1. ✅ 项目架构深度分析
2. ✅ 数据库设计详解 (6个模型 + ER图 + 索引策略)
3. ✅ 后端API架构详解 (40+ API端点)
4. ✅ Vercel部署要求和限制
5. ✅ SQLite → PostgreSQL迁移方案
6. ✅ 详细的部署步骤 (代码级别)
7. ✅ 环境配置指南
8. ✅ 9个常见问题解决方案

**下一步**:
1. 执行数据库迁移
2. 配置云存储 (Cloudinary)
3. 部署到Vercel
4. 测试所有功能
5. 监控和优化

**需要帮助?**
- Vercel文档: https://vercel.com/docs
- Supabase文档: https://supabase.com/docs
- Flask文档: https://flask.palletsprojects.com

祝部署顺利! 🚀
