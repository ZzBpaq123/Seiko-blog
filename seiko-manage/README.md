# Seiko Manage

Seiko Blog 后台管理系统前端，面向管理员的内容管理控制台（CRUD 仪表盘）。基于 Next.js 16 客户端渲染，运行时调用后端 `/api/manage/**` 接口，覆盖文章、标签、评论、足迹、相册 / 照片、公告、书籍、电影、资源、用户等模块的完整管理，并内置数据统计图表。

## 技术栈

- **Next.js 16.1.6** - App Router，`reactCompiler: true`（React Compiler）
- **React 19.2.3** - UI 框架
- **TypeScript 5** - 严格模式，路径别名 `@/*` → `src/*`
- **Tailwind CSS v4** - 原子化样式
- **lucide-react** - 图标库
- **next-themes** - 明暗主题切换（默认浅色，主题选择保存在 `localStorage`）
- **react-markdown + remark-gfm** - 文章 Markdown 编辑与预览
- **react-image-crop** - 图片上传裁剪
- **Axios** - HTTP 请求封装（Token 注入、错误码映射、401 处理）
- **高德地图 JS API 2.0** - 足迹表单地图选点

## 开发环境要求

- Node.js 20+
- npm 10+

## 安装与启动

```bash
cd seiko-manage
npm install
cp .env.example .env.local   # Windows: copy .env.example .env.local
npm run dev     # http://localhost:3001
```

## 可用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器（端口 3001） |
| `npm run build` | 构建生产版本 |
| `npm run start` | 启动生产服务器（端口 3001） |
| `npm run lint` | ESLint 代码检查 |

## 功能特性

- **登录与鉴权** - 调用 `/api/manage/user/login`，Token 保存在 `localStorage` 并由 Axios 请求拦截器注入 `token` 请求头；401 / 业务码 1002 自动清除登录态并跳转登录页
- **仪表盘** - 统计概览卡片（文章、评论、相册、照片、总阅读量）、最近动态、内容新建趋势图（近 7 / 14 / 30 天）、文章阅读量分布点阵图、系统信息
- **内容管理** - 文章（Markdown 分栏编辑、封面上传、标签多选）、标签、评论、足迹、相册 / 照片、公告、书籍、电影、资源、用户等模块的列表 / 新增 / 编辑 / 删除
- **通用交互** - 列表搜索（300ms 防抖）、分页、删除二次确认、全局 Toast 提示、编辑页通过 `?id=` 查询参数加载
- **图片上传** - 拖拽 / 选择上传，支持裁剪（可配置固定宽高比），上传后端 `/api/manage/upload/image`
- **足迹地图选点** - 高德地图点击 / 拖拽标点自动回填经纬度，地图加载失败时降级为手工输入
- **明暗主题** - 左侧栏手动切换，主题选择持久化到 `localStorage`

## 项目结构

```
seiko-manage/
├── src/
│   ├── app/                  # Next.js App Router 页面
│   │   ├── page.tsx          # 仪表盘（统计卡片、趋势图、阅读量点阵、系统信息）
│   │   ├── login/page.tsx    # 登录页
│   │   ├── posts/            # 文章管理（列表 / new / edit）
│   │   ├── tags/page.tsx     # 标签管理
│   │   ├── comments/page.tsx # 评论管理
│   │   ├── footprints/       # 足迹管理（含地图选点）
│   │   ├── photos/           # 相册管理（album 相册 / photo 照片）
│   │   ├── notices/          # 公告管理
│   │   ├── books/            # 书籍管理
│   │   ├── movies/           # 电影管理
│   │   ├── resources/        # 资源管理
│   │   ├── users/            # 用户管理
│   │   └── layout.tsx        # 根布局（主题、布局包装、Toast）
│   ├── api/                  # 各模块 API 封装
│   │   ├── post.ts  tag.ts  comment.ts  footprint.ts  photo.ts
│   │   ├── notice.ts  book.ts  movie.ts  resource.ts
│   │   ├── user.ts  upload.ts  stats.ts
│   ├── components/           # 共享组件
│   │   ├── 布局：LayoutWrapper  Sidebar  Header  Breadcrumb  PageHeader  PageLoading  ThemeProvider
│   │   ├── 通用：ConfirmDialog  PromptDialog  Toast  Pagination  Select  CalendarPicker
│   │   ├── 通用：TagMultiSelect  FormScaffold  MarkdownSplitEditor  ImageUpload
│   │   ├── 地图：AMapPicker  AMapPickerDialog
│   │   ├── 图表：ReadDotMatrixChart  CreationTrendChart
│   │   └── forms/            # 各实体表单
│   │       ├── PostForm  TagFormDialog  FootprintForm
│   │       ├── AlbumForm  PhotoForm  NoticeForm
│   │       └── BookForm  MovieForm  ResourceForm  UserForm
│   ├── hooks/                # 复用 Hook
│   │   ├── usePagedList.ts   # 分页列表（搜索 / 分页 / 删除）
│   │   ├── useEntityForm.ts  # 实体表单（加载 / 提交 / 校验）
│   │   ├── useDebounce.ts    # 防抖
│   │   └── useAMap.ts        # 高德地图 SDK 动态加载
│   ├── types/                # TypeScript 类型定义
│   │   ├── index.ts          # 与后端 VO/DTO 对应的类型
│   │   └── amap.d.ts         # 高德地图最小类型声明
│   └── utils/                # 工具函数
│       ├── request.ts        # Axios 封装（注入 Token / 拆包 / 401 处理）
│       ├── date.ts           # 日期格式化
│       └── toast.ts          # 全局提示
├── .env.example              # 环境变量模板（复制为 .env.local）
├── package.json
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
└── postcss.config.mjs
```

## 核心约定

- **页面模式**：每个管理模块通常包含列表页（`page.tsx`）、新增页（`new/`）、编辑页（`edit/`）；编辑页通过 `?id=xxx` 查询参数加载数据
- **数据获取**：客户端渲染，运行时通过 `src/api/*` 调用后端，由 `utils/request.ts` 统一处理
- **列表交互**：统一通过 `usePagedList` 实现搜索（300ms 防抖）、分页与删除确认
- **表单交互**：统一通过 `useEntityForm` + `forms/` 下的实体表单实现
- **React Compiler**：已启用 `babel-plugin-react-compiler`，无需手写 `useMemo` / `useCallback`

## 布局说明

- **左侧侧边栏**（`Sidebar`）：包含各管理模块导航，支持收起 / 展开
- **顶部 Header**：显示页面标题、主题切换与用户信息
- **主内容区**：自适应剩余空间，展示各模块管理内容

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `NEXT_PUBLIC_API_BASE_URL` | 后端 API 基础地址 | `http://localhost:1001/api` |
| `NEXT_PUBLIC_AMAP_KEY` | 高德地图 JS API Key（足迹地图选点） | 无（复制 `.env.example` 为 `.env.local` 后配置） |
| `NEXT_PUBLIC_AMAP_SECURITY_CODE` | 高德地图安全密钥（可选） | 无 |

`.env.example` 已提交到仓库，实际配置请复制为 `.env.local`（已被 `.gitignore` 忽略），避免提交真实 key。

## 后端接口

管理后台调用 Seiko Blog 后端 REST API，实际请求落在 `/api/manage/**`（默认需登录且具备 `admin` 角色；`user/login`、`user/register`、`user/check` 公开，`user/logout`、`user/info` 仅需登录）。

`utils/request.ts` 中的 Axios 实例负责：

- 请求拦截：从 `localStorage` 读取 Token 并注入 `token` 请求头
- 响应拦截：拆包后端 `Result.data`，错误码映射为提示，401 / 1002 清除登录态并跳转登录

登录账号需后端用户表存在 `admin` 角色用户，项目约定默认账号：`admin` / `123456`。

## 相关项目

- [Seiko Blog UI](../seiko-blog-ui/) — 博客前台展示（公开前台，端口 3000）
- [Seiko Blog Backend](../) — Spring Boot 后端服务（端口 1001）

## 许可证

MIT License
