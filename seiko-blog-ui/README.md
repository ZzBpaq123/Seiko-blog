# Seiko Blog UI

Seiko Blog 的公开前台，基于 Next.js 16 + React 19 构建，采用 App Router，数据驱动页面使用 SSG/ISR（`revalidate = 3600`，整页缓存 1 小时）。页面在构建或按需渲染时从 Spring Boot 后端 `/api/blog/**` 获取数据，部分交互组件在客户端按需请求。支持亮 / 暗双主题，并跟随系统偏好。

## 技术栈

- **Next.js 16.1.6** - App Router，`reactCompiler: true`（React Compiler）
- **React 19.2.3** - UI 框架
- **TypeScript 5** - 严格模式，路径别名 `@/*` → `src/*`
- **Tailwind CSS v4** - `@import "tailwindcss"`，`@theme inline` 自定义主题变量与动画
- **Axios** - API 请求封装（拦截器、错误码映射、Token 注入）
- **react-markdown + remark-gfm** - 文章 Markdown 渲染
- **lucide-react + simple-icons** - 图标库
- **clsx + tailwind-merge** - className 合并工具
- **next/font** - Geist、Geist Mono、ZCOOL KuaiLe（中文字体）
- **高德地图 JS API 2.0** - 足迹页面地图展示

## 功能特性

### 核心功能

- 70vh Hero 全屏背景，打字机动画 + 双层波浪动画（CSS `translateX` 无缝循环）
- 通知公告轮播，支持图片 / 渐变背景，hover 暂停
- 侧边栏个人资料卡 + 网站运行时间（实时秒级）
- 首页推荐文章（3 篇）+ 文章分页（每页 6 篇）；文章列表页每页 8 篇
- 智能导航栏：滚动隐藏 / 显示，首页透明背景，下拉菜单，移动端汉堡菜单
- 响应式布局，亮 / 暗主题跟随系统偏好
- 文章标签系统 + 阅读时间估算
- 数据驱动页面 ISR 缓存 1 小时，与后端阅读量回刷周期对齐
- 404 页面与平滑滚动、隐藏滚动条

### 页面

- **首页 `/`** - Hero + 公告轮播 + 推荐 / 分页文章 + 侧边栏（运行时间、3D 技术球、标签云、最新评论）
- **文章列表 `/blog`** - 文章分页列表，支持按标签筛选
- **文章详情 `/blog/[slug]`** - ISR 按需渲染，Markdown 渲染、目录（TOC）、AI 总结、评论区（邮箱验证码）、阅读悬浮按钮
- **关于我 `/about/myself`** - 全屏水平滑动四屏交互页：Hero、活跃度日历热力图（GitHub 风格 52 周）、个人介绍、作品展示；支持滚轮 / 方向键 / 右侧指示器切换
- **足迹 `/footprint`** - 高德地图展示旅行足迹，支持国内 / 国际筛选
- **相册 `/gallery`** - 星空入场动画 → 选择相册 → 照片网格（分阶段交互动画 + 图片灯箱）
- **探索页** - `/explore/book`、`/explore/movie` 使用后端 API；`/explore/game`、`/explore/ranking` 使用静态数据

### 数据获取方式

- **服务端页面**：在构建 / 按需渲染时调用 API，`.catch(() => [])` 降级，后端不可达时页面仍可构建
- **客户端组件**：公告、相册照片、评论列表、发表评论（含邮箱验证码）等在客户端请求

## 项目结构

```
seiko-blog-ui/
├── src/
│   ├── app/                          # App Router 路由
│   │   ├── page.tsx                  # 首页（ISR，推荐 + 分页）
│   │   ├── layout.tsx                # 根布局（字体、Header、Footer、metadata）
│   │   ├── globals.css               # 主题变量、自定义动画、工具类
│   │   ├── not-found.tsx             # 404 页面
│   │   ├── favicon.ico
│   │   ├── blog/
│   │   │   ├── page.tsx              # 文章列表（分页，每页 8 篇，ISR）
│   │   │   └── [slug]/page.tsx       # 文章详情（ISR，Markdown、TOC、评论）
│   │   ├── about/myself/             # 关于我（四屏滑页交互）
│   │   │   ├── page.tsx              # 页面入口（metadata）
│   │   │   ├── MyselfClient.tsx      # 滑屏容器（滚轮 / 键盘 / 指示器）
│   │   │   ├── HeroPanel.tsx         # 第 1 屏：Hero
│   │   │   ├── ActivityPanel.tsx     # 第 2 屏：活跃度日历热力图
│   │   │   ├── AboutPanel.tsx        # 第 3 屏：个人介绍
│   │   │   └── WorkPanel.tsx         # 第 4 屏：作品展示
│   │   ├── footprint/
│   │   │   ├── page.tsx              # 足迹页（ISR）
│   │   │   └── FootprintClient.tsx   # 高德地图客户端组件
│   │   ├── gallery/
│   │   │   ├── page.tsx              # 相册页（ISR）
│   │   │   └── GalleryContent.tsx    # 相册交互主内容
│   │   └── explore/
│   │       ├── book/                 # 书籍（后端 API，ISR）
│   │       ├── movie/                # 影视（后端 API，ISR）
│   │       ├── game/                 # 游戏（静态数据）
│   │       └── ranking/              # 硬件排行（静态数据）
│   ├── api/                          # API 层
│   │   ├── types.ts                  # 后端 VO / DTO 类型（ApiResult、PageResult 等）
│   │   ├── post.ts                   # 文章 API
│   │   ├── footprint.ts              # 足迹 API
│   │   ├── photo.ts                  # 相册 / 照片 API
│   │   ├── notice.ts                 # 公告 API
│   │   ├── comment.ts                # 评论 API
│   │   ├── code.ts                   # 邮箱验证码 API
│   │   ├── user.ts                   # 用户 API（已封装，暂未接入页面）
│   │   ├── book.ts                   # 书籍 API
│   │   └── movie.ts                  # 电影 API
│   ├── components/
│   │   ├── Header.tsx                # 智能导航栏（滚动响应、下拉、移动端菜单）
│   │   ├── Footer.tsx                # 页脚
│   │   ├── PostCard.tsx              # 文章卡片
│   │   ├── Typewriter.tsx            # 打字机效果
│   │   ├── NoticeCarousel.tsx        # 公告轮播
│   │   ├── RunningTime.tsx           # 网站运行时间
│   │   ├── TechSphere.tsx            # 3D 技术球
│   │   ├── TagCloud.tsx              # 标签云
│   │   ├── LatestComments.tsx        # 最新评论（后端 API，前 5 条自动滚动）
│   │   ├── MarkdownRenderer.tsx      # Markdown 渲染
│   │   ├── TableOfContents.tsx       # 文章目录
│   │   ├── AiSummary.tsx             # AI 总结（当前为占位组件）
│   │   ├── CommentSection.tsx        # 文章评论区（邮箱验证码）
│   │   ├── ReadingFloatButtons.tsx   # 阅读页悬浮按钮
│   │   ├── MovieSliderSection.tsx    # 影视滑动展示
│   │   ├── PhotoLightbox.tsx         # 图片灯箱
│   │   └── gallery/                  # 相册交互组件
│   │       ├── GalleryEntrance.tsx   # 星空入场动画
│   │       ├── StarField.tsx         # Canvas 星空背景
│   │       ├── MeteorShower.tsx      # 流星动画
│   │       └── StarFieldWarp.tsx     # warp 速度线动画
│   ├── data/                         # 静态数据（无需后端 API）
│   │   ├── games.ts                  # 游戏探索页数据
│   │   ├── hardware.ts               # 硬件排行数据
│   │   ├── techs.ts                  # 3D 技术球数据
│   │   └── experiences.ts            # 关于页个人经历数据
│   ├── styles/
│   │   ├── pageStyles.ts             # 各页面 Header / Footer 样式配置
│   │   └── colors.ts                 # 颜色配置（标签颜色等）
│   └── utils/
│       ├── request.ts                # Axios 封装（拦截器、错误处理）
│       ├── cn.ts                     # className 合并工具
│       └── toc.ts                    # 目录（TOC）解析
├── public/                           # 静态资源（Hero 背景、波浪图、头像、游戏截图、备案图标等）
├── next.config.ts                    # reactCompiler、图片域名与 unoptimized 配置
├── .env.example                      # 环境变量模板（复制为 .env.local）
├── package.json
├── tsconfig.json
├── eslint.config.mjs
└── postcss.config.mjs
```

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器（端口 3000）
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint
```

访问 [http://localhost:3000](http://localhost:3000)

后端 API 默认地址：`http://localhost:1001/api/blog`，可通过环境变量 `NEXT_PUBLIC_API_BASE_URL` 覆盖。

首次运行可复制 `.env.example` 为 `.env.local`，并按需配置 `NEXT_PUBLIC_API_BASE_URL` 与 `NEXT_PUBLIC_AMAP_KEY`（未配置高德 key 时足迹页跳过地图加载）。

## 数据层说明

### API 驱动数据

| 数据 | API 模块 | 主要方法 | 获取时机 |
|------|---------|---------|---------|
| 文章列表 / 详情 | `src/api/post.ts` | `getPostList()`, `getPostBySlug()` | SSG / ISR 构建时 |
| 足迹 | `src/api/footprint.ts` | `getFootprintList()` | SSG / ISR 构建时 |
| 相册列表 | `src/api/photo.ts` | `getAlbumList()` | SSG / ISR 构建时 |
| 相册照片 | `src/api/photo.ts` | `getPhotosByAlbumId()` | 客户端（选择相册后） |
| 公告 | `src/api/notice.ts` | `getEnabledNoticeList()` | 客户端 |
| 书籍 | `src/api/book.ts` | `getBookList()` | SSG / ISR 构建时 |
| 电影 | `src/api/movie.ts` | `getMovieList()` | SSG / ISR 构建时 |
| 评论列表 | `src/api/comment.ts` | `getCommentList()`, `getCommentsByPostId()` | 客户端 |
| 发表评论 | `src/api/comment.ts` | `createComment()` | 客户端（需邮箱验证码） |
| 邮箱验证码 | `src/api/code.ts` | `sendEmailCode()` | 客户端（文章页评论区） |

> 首页侧边栏「最新评论」通过 `getCommentList()` 获取前 5 条并自动滚动展示，不再使用静态数据。

### 静态数据（无需后端）

`src/data/` 目录存放纯静态数据：

| 文件 | 用途 |
|------|------|
| `games.ts` | `/explore/game` 页面数据 |
| `hardware.ts` | `/explore/ranking` 排行页数据 |
| `techs.ts` | 首页 3D 技术球数据 |
| `experiences.ts` | 关于页个人经历数据 |

## 自定义配置

| 配置项 | 位置 | 说明 |
|--------|------|------|
| 网站起始日期 | `src/app/page.tsx` `SITE_START_DATE` | 运行时间计算起点（默认 `2026-01-01`） |
| 首页每页文章数 | `src/app/page.tsx` `PAGE_SIZE` | 默认 6 |
| 文章列表每页文章数 | `src/app/blog/page.tsx` `PAGE_SIZE` | 默认 8 |
| 最新评论展示条数 | `src/components/LatestComments.tsx` `MAX_DISPLAY` | 默认 5 |
| 个人资料 | `src/app/page.tsx` 侧边栏区域 | 名称、简介、社交链接 |
| 网站元数据 | `src/app/layout.tsx` `metadata` | 标题、描述、SEO |
| 外部图片域名 | `next.config.ts` `images.remotePatterns` | 已允许 picsum.photos、images.unsplash.com、localhost:1001/uploads；全局 `unoptimized: true` |
| API 基础地址 | 环境变量 `NEXT_PUBLIC_API_BASE_URL` | 默认 `http://localhost:1001/api/blog` |
| 高德地图 key | 环境变量 `NEXT_PUBLIC_AMAP_KEY` | 足迹页地图展示，未配置时跳过地图加载 |

## 构建与部署

项目可部署到任何支持 Next.js 的托管平台（Vercel、Netlify 等）。

```bash
npm run build
# 输出目录: .next/
```

数据驱动页面使用 ISR，页面首次访问时按需渲染并缓存 1 小时；构建 / 运行期间后端 API 不可达时页面数据为空（已做 `.catch()` 降级，构建不会失败）。

## 已知问题与待办

- `AiSummary` 目前是占位组件，尚未接收后端文章内容
- `getAllTags()`、`getPostsByTag()` 与 `src/api/user.ts` 已封装但暂未接入页面

## 许可证

MIT License
