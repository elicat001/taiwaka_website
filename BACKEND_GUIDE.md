# 太哇卡咖啡网站 - 后端系统使用指南

## 项目概述

这是一个完整的 Python Flask 后端内容管理系统，包含：

- **RESTful API** - 完整的产品、分类、文章、订单管理接口
- **管理后台** - 基于 Bootstrap 的可视化管理界面
- **SQLite 数据库** - 轻量级数据库，开箱即用
- **图片上传** - 支持产品和文章图片管理
- **认证系统** - Session 认证，保护管理接口

## 快速开始

### 方式一：使用启动脚本（推荐）

**Windows 用户：**
```bash
cd backend
start.bat
```

**Mac/Linux 用户：**
```bash
cd backend
chmod +x start.sh
./start.sh
```

启动脚本会自动：
1. 创建虚拟环境（首次运行）
2. 安装所有依赖
3. 初始化数据库（首次运行）
4. 启动服务器

### 方式二：手动启动

```bash
# 1. 进入后端目录
cd backend

# 2. 创建虚拟环境（可选但推荐）
python -m venv venv

# 3. 激活虚拟环境
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 4. 安装依赖
pip install -r requirements.txt

# 5. 初始化数据库
python init_db.py

# 6. 启动服务器
python app.py
```

## 访问地址

服务器启动后，访问以下地址：

- **API 地址**: http://localhost:5000/api
- **管理后台**: http://localhost:5000/admin
- **健康检查**: http://localhost:5000/api/health

## 默认账户

初始化数据库后，会创建一个默认管理员账户：

- **用户名**: `admin`
- **密码**: `admin123`

**重要**: 首次登录后请立即修改密码！

## 功能模块

### 1. 产品管理
- 添加、编辑、删除产品
- 产品分类
- 库存管理
- 价格设置（支持原价和促销价）
- 产品上架/下架
- 精选产品标记
- 产品搜索和筛选

### 2. 分类管理
- 创建产品分类
- 分类图标设置
- 分类排序
- 分类启用/禁用

### 3. 文章管理
- 发布品牌故事、新闻等文章
- Markdown 支持
- 文章分类
- 发布/草稿状态
- 浏览量统计
- 文章搜索

### 4. 订单管理
- 订单查看和管理
- 订单状态更新（待处理、已确认、配送中、已完成）
- 支付状态管理
- 订单取消和退款
- 自动库存扣减
- 订单统计

### 5. 图片上传
- 单张/批量图片上传
- 支持格式：PNG、JPG、JPEG、GIF、WEBP
- 最大文件大小：16MB
- 自动生成唯一文件名

### 6. 管理员系统
- 管理员登录/登出
- 密码加密存储
- 多管理员支持
- 权限管理

## API 使用示例

### 获取产品列表
```bash
curl http://localhost:5000/api/products
```

### 创建产品
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "拿铁咖啡",
    "description": "香浓拿铁",
    "price": 30,
    "category_id": 1,
    "stock": 100
  }'
```

### 上传图片
```bash
curl -X POST http://localhost:5000/api/uploads/image \
  -F "file=@/path/to/image.jpg"
```

更多 API 文档请查看 `backend/README.md`

## 数据库管理

### 重置数据库
如果需要清空所有数据并重新开始：

```bash
# 删除数据库文件
rm database.db  # Mac/Linux
del database.db  # Windows

# 重新初始化
python init_db.py
```

### 备份数据库
```bash
# 复制数据库文件即可
cp database.db database_backup.db
```

## 与前端集成

前端项目（React）需要配置 API 地址：

1. 在前端项目中找到 API 配置文件
2. 将 API_URL 设置为 `http://localhost:5000`
3. 确保 CORS 已正确配置

前端调用示例：
```javascript
// 获取产品列表
const response = await fetch('http://localhost:5000/api/products');
const data = await response.json();

// 创建订单
const response = await fetch('http://localhost:5000/api/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    customer_name: '张三',
    customer_phone: '13800138000',
    items: [
      { product_id: 1, quantity: 2 }
    ]
  })
});
```

## 常见问题

### 1. 端口被占用
如果 5000 端口被占用，修改 `app.py` 中的端口：
```python
app.run(debug=True, host='0.0.0.0', port=8000)
```

### 2. CORS 错误
如果前端无法访问 API，检查 `config.py` 中的 CORS 配置：
```python
CORS_ORIGINS = ['http://localhost:5173', 'http://localhost:3000']
```
添加你的前端地址。

### 3. 图片无法显示
确保：
- 图片已成功上传到 `static/uploads/` 目录
- 图片 URL 格式正确：`/api/uploads/filename.jpg`
- 后端服务器正在运行

### 4. 无法登录管理后台
- 检查数据库是否已初始化
- 确认使用默认账户：admin / admin123
- 清除浏览器缓存和 Cookie

## 生产环境部署建议

### 1. 使用生产级 WSGI 服务器
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### 2. 使用 MySQL/PostgreSQL
修改 `config.py` 中的数据库 URL：
```python
SQLALCHEMY_DATABASE_URI = 'mysql://user:password@localhost/taiwaka_db'
```

### 3. 配置环境变量
创建 `.env` 文件：
```env
SECRET_KEY=your-strong-secret-key
DATABASE_URL=postgresql://user:password@localhost/taiwaka_db
FLASK_ENV=production
```

### 4. 启用 HTTPS
使用 Nginx 或 Apache 作为反向代理，配置 SSL 证书。

### 5. 图片云存储
建议使用阿里云 OSS、AWS S3 等云存储服务存储图片。

## 项目结构

```
taiwaka_website/
├── backend/                    # 后端目录
│   ├── app.py                  # Flask 主应用
│   ├── config.py               # 配置文件
│   ├── models.py               # 数据库模型
│   ├── init_db.py              # 数据库初始化
│   ├── requirements.txt        # Python 依赖
│   ├── start.bat               # Windows 启动脚本
│   ├── start.sh                # Linux/Mac 启动脚本
│   ├── .env.example            # 环境变量示例
│   ├── README.md               # 详细文档
│   │
│   ├── routes/                 # 路由模块
│   │   ├── __init__.py
│   │   ├── auth.py             # 认证路由
│   │   ├── products.py         # 产品管理
│   │   ├── categories.py       # 分类管理
│   │   ├── articles.py         # 文章管理
│   │   ├── orders.py           # 订单管理
│   │   └── upload.py           # 图片上传
│   │
│   ├── templates/              # HTML 模板
│   │   └── admin/
│   │       ├── login.html      # 登录页
│   │       └── dashboard.html  # 管理后台
│   │
│   └── static/                 # 静态文件
│       └── uploads/            # 上传文件存储
│
├── App.tsx                     # 前端主文件
├── index.html
└── ...                         # 其他前端文件
```

## 技术支持

如有问题，请查看：
1. `backend/README.md` - 详细的 API 文档
2. 检查控制台错误信息
3. 查看 Flask 日志输出

## 下一步

1. ✅ 后端系统已完成
2. 🔄 前端对接 API（将原有的前端代码连接到新后端）
3. 🔄 添加更多功能（如优惠券、会员系统等）
4. 🔄 部署到生产环境

祝你使用愉快！
