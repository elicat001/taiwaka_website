# 太哇卡咖啡 Taiwaka Coffee

源自东非火山高地的精品咖啡。坚持直接贸易，猎寻每一颗豆子在风味巅峰的瞬间。

## ✨ 特性

- 🎨 **极简设计** - 受 Blue Bottle 启发的高端视觉体验
- 🚀 **性能优化** - Lighthouse 性能分数 90+
- ♿ **可访问性** - 完整的 ARIA 标签和语义化 HTML
- 📱 **响应式设计** - 完美适配各种设备
- 🤖 **AI 导师** - 基于 Gemini 的智能咖啡推荐
- 🔍 **SEO 优化** - 完整的 meta 标签和结构化数据

## 🛠️ 技术栈

- **前端框架**: React 19 + TypeScript
- **构建工具**: Vite 6
- **样式方案**: TailwindCSS 4
- **AI 集成**: Google Gemini API
- **后端**: PHP + MySQL

## 📦 安装

```bash
# 克隆仓库
git clone https://github.com/elicat001/taiwaka_website.git
cd taiwaka_website

# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入你的 GEMINI_API_KEY
```

## 🚀 开发

```bash
# 启动开发服务器
pnpm dev

# 访问 http://localhost:3000
```

## 🏗️ 构建

```bash
# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview
```

## 📊 性能优化

本项目已进行全面优化：

### 性能优化
- ✅ TailwindCSS 本地化，移除 CDN
- ✅ 代码分割和 Tree Shaking
- ✅ Gzip 压缩
- ✅ 图片懒加载
- ✅ 资源预加载和预连接
- ✅ 生产环境移除 console

### SEO 优化
- ✅ 完整的 meta 标签（Open Graph、Twitter Card）
- ✅ JSON-LD 结构化数据
- ✅ sitemap.xml 和 robots.txt
- ✅ 语义化 HTML 标签
- ✅ 动态页面标题

### 可访问性
- ✅ 完整的 ARIA 标签
- ✅ 键盘导航支持
- ✅ 屏幕阅读器优化
- ✅ 动画降级支持（prefers-reduced-motion）
- ✅ 高对比度文本

### 代码质量
- ✅ TypeScript 严格模式
- ✅ 错误边界处理
- ✅ 加载状态和骨架屏
- ✅ 环境变量安全管理
- ✅ 代码注释和文档

## 📁 项目结构

```
taiwaka_website/
├── index.html          # 入口 HTML（包含 SEO meta）
├── App.tsx             # 主应用组件（已优化）
├── constants.tsx       # 常量和图标
├── types.ts            # TypeScript 类型
├── styles.css          # 全局样式
├── services/           # 服务层
│   └── geminiService.ts
├── api/                # 后端 API
│   ├── products.php
│   ├── config.php
│   └── db_setup.sql
├── public/             # 静态资源
│   ├── manifest.json   # PWA manifest
│   ├── robots.txt      # 搜索引擎爬虫配置
│   ├── sitemap.xml     # 网站地图
│   └── favicon.svg     # 网站图标
├── vite.config.ts      # Vite 配置（性能优化）
├── tailwind.config.js  # TailwindCSS 配置
└── tsconfig.json       # TypeScript 配置（严格模式）
```

## 🌐 部署

本项目可部署到任何支持静态网站的平台：

- Vercel
- Netlify
- GitHub Pages
- Cloudflare Pages

## 📝 许可证

© 2025 Taiwäka Coffee. All rights reserved.

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系

如有问题，请通过 GitHub Issues 联系我们。

---

**原始 AI Studio 链接**: https://ai.studio/apps/drive/1Ft07LMUfCt_lDq-FHotiEE2wK1w4m-1z
