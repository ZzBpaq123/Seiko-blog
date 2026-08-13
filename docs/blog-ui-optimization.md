# seiko-blog-ui 代码审查与优化建议

> 适用范围：`seiko-blog-ui/`（Next.js 16 + React 19 公开博客前台）。
> 基于 2026-07-31 对项目源码的完整审查整理，问题按优先级分为五类：渲染与缓存架构、实际 Bug、安全、性能、代码结构与可维护性。
> 每条建议均附具体文件与行号，行号以审查时代码为准。

---

## 概览

| 分类 | 数量 | 最高优先级项 |
|------|------|-------------|
| 一、渲染与缓存架构 | 6 | ISR/缓存止血（#1） |
| 二、实际 Bug | 7 | AI 总结空壳（#7）、公告渐变失效（#8） |
| 三、安全 | 2 | 足迹 InfoWindow XSS（#14） |
| 四、性能 | 4 | TechSphere 60fps 重渲染（#16） |
| 五、代码结构与可维护性 | 6 | 重复代码抽取（#20） |

**推荐落地顺序**：#1（ISR/缓存）→ #3（Markdown 服务端渲染）→ #7 / #8（确定性 Bug）。

---

## 一、渲染与缓存架构

### 1. "SSG" 名不副实，实际是全动态渲染且无缓存

> ✅ 已修复（2026-07-31）：采用方案一 + 方案三。7 个数据驱动页面（首页、`/blog`、`/blog/[slug]`、`/footprint`、`/gallery`、`/explore/book`、`/explore/movie`）均添加 `export const revalidate = 300`（ISR，整页缓存 5 分钟，与后端阅读量刷库周期对齐）；`[slug]` 页移除返回 `[]` 的空 `generateStaticParams`；`getPostBySlug` 用 React `cache()` 包装。
> 注意：ISR 后文章阅读量只在页面重新生成时才会触发后端计数，实时阅读量会偏低（后端本身有 Redis 计数 + 5 分钟刷库机制，可接受）。
> 遗留：如需进一步提升，仍可将分页改为路径参数回归真 SSG（方案二，未实施）。

**现状**（修复前）：
- `src/app/blog/[slug]/page.tsx:17-20` — `generateStaticParams` 直接返回 `[]`，文章详情全部为请求时动态渲染
- 首页、`/blog` 使用 `searchParams` 分页 → 路由变为动态渲染
- 数据层使用 axios（`src/utils/request.ts`）而非 `fetch` → 完全绕过 Next.js 数据缓存，**每次页面请求都实时打后端 API**

**建议**（三选一或组合）：
- 页面添加 `export const revalidate = 300`（ISR），最简单的止血方案
- 分页改为路径参数 `/blog/page/[page]` + `generateStaticParams`，回归真 SSG
- 用 React `cache()` 或 `unstable_cache` 包装 axios 请求，显式控制缓存

### 2. 文章详情页同一数据请求发两遍

> ✅ 已修复（2026-07-31）：`src/api/post.ts` 中 `getPostBySlug` 改用 React `cache()` 包装，同一请求内 `generateMetadata` 与页面组件共享结果。

`[slug]/page.tsx:26`（`generateMetadata`）和 `:42`（页面组件）各自调用 `getPostBySlug`，axios 没有请求去重。

**建议**：用 React `cache()` 包装数据请求函数即可去重。

### 3. MarkdownRenderer 是客户端组件，文章正文不进 HTML

`src/components/MarkdownRenderer.tsx:1` 标记了 `"use client"` → 搜索引擎抓不到文章正文，且每个文章页额外下发 react-markdown 的 JS bundle。

**建议**：react-markdown 完全可以在 RSC 中运行，去掉 `"use client"`（heading id 的 Context 方案在服务端同样适用）。

### 4. 公告轮播客户端取数，首页白屏闪烁

`NoticeCarousel.tsx:43-55` 在 `useEffect` 中拉取公告 → 首页 HTML 无公告内容，每次访问都有 loading spinner。

**建议**：首页本身是 server component，应在服务端取数后作为 prop 传入 `NoticeCarousel`。

### 5. 相册页渲染了两个 Header

根布局 `layout.tsx:38` 固定渲染 `<Header />`，而 `GalleryContent.tsx:138` 又渲染了一个 `<Header overlayMode />` → 两个 `fixed top-0 z-50` 的导航栏重叠，双份滚动监听。

**建议**：让 layout 支持按路由排除 Header，或相册页复用根布局的 Header（通过路由组 `(main)` / `(fullscreen)` 分离布局）。

### 6. 嵌套 `<main>` 标签

`layout.tsx:39` 已有 `<main>`，首页、`/blog`、`[slug]`、`FootprintClient` 内部又各自渲染 `<main>` → 非法 HTML，影响可访问性。

**建议**：layout 中改为 `<div>`，`<main>` 由各页面自行渲染。

---

## 二、实际 Bug

### 7. AI 总结组件永远显示"暂无总结内容"

`[slug]/page.tsx:65` 使用 `<AiSummary />`，未传 `content` prop。

**建议**：接后端的文章摘要字段，或下线该组件——目前是展示空壳。

### 8. 公告渐变背景静默失效

`NoticeCarousel.tsx:106`：`bg-gradient-to-r ${notice.bgColor}` — bgColor 来自后端数据库，Tailwind 扫描不到动态拼接的类名，对应 CSS 永远不会生成。

**建议**：改用 inline style，或在 `globals.css` 中通过 `@source inline(...)` safelist 固定几组渐变。

### 9. token 请求头名与后端不一致

`request.ts:119` 注入的是 `config.headers.token`，但后端（Sa-Token 配置）约定的 header 名是 `Authorization`。且该站点目前没有登录 UI，整套 token/unauthorized 逻辑属于死代码。

**建议**：二选一——删除精简，或修正 header 名为评论登录功能做准备。

### 10. 足迹 InfoWindow 的轮播是死代码

`FootprintClient.tsx:276`：`images = data.image ? [data.image] : []` 最多 1 张图，但下面维护了一整套 `window.carouselState / initCarousel / startAutoPlay / stopAutoPlay` 全局函数（约 80 行）+ 计数器 UI，永远不会真正轮播。

**建议**：后端支持多图，或删除整套轮播机制。

### 11. `getPageStyle` 前缀匹配依赖对象 key 顺序

`pageStyles.ts:174-178`：`/explore/book/xxx` 这类路径会先命中 `/explore` 而非 `/explore/book`（对象遍历顺序问题）。

**建议**：改为按路径长度降序的最长前缀匹配。

### 12. `/explore/music` 引用了不存在的数据文件

`explore/music/MusicClient.tsx:17` import `@/data/music`，但 `src/data/` 下不存在该文件。路由存在于 `app/` 下，`next build` 会编译它 → 构建直接报错。

**建议**：删除该路由，或补回数据文件。

### 13. GalleryContent 的 phase 切换隐患

- `GalleryContent.tsx:109` 的 `setTimeout(() => setPhase("photos"), 1500)` 未在卸载时清理
- `loadingPhotos` 在 timeout 结束前就置为 `false`（`:106`），`:307` 的 loading 分支实际不可达

**建议**：timeout 存入 ref 并在 cleanup 中清除；梳理 phase 状态机中 loading 的真实语义。

---

## 三、安全

### 14. 足迹 InfoWindow 存在 XSS 风险

`FootprintClient.tsx:279-320`：用模板字符串将 `data.city`、`data.description`、`img` 等后端字段直接拼进 HTML 再 `setContent`。管理端录入的内容若含 `<script>` / `<img onerror>` 即被注入执行。

**建议**：对所有插值做 HTML 转义，或改用 DOM API（`createElement` + `textContent`）构建内容。

### 15. 高德地图 key 硬编码 & 加载了未使用的 AMapUI

- `FootprintClient.tsx:366`：key 直接写在源码中
- `FootprintClient.tsx:372`：加载了 AMapUI 脚本但全部代码未使用

**建议**：key 移到 `NEXT_PUBLIC_AMAP_KEY` 环境变量（高德 key 本身靠域名白名单防护，但硬编码进 git 仍不规范）；删除 AMapUI 加载。

---

## 四、性能

### 16. TechSphere 每帧 setState，首页侧栏 60fps 重渲染

`TechSphere.tsx:46`：`requestAnimationFrame` 中 `setPositions([...])` → 整个组件每秒重渲染 60 次（React Compiler 无法避免）。

**建议**：改用 ref 直接写 DOM `style.transform`，React 层零渲染。

### 17. Header 滚动监听无节流

`Header.tsx:173-181`：每次 scroll 事件都 `setIsScrolled` / `setIsVisible` → 每个滚动帧重渲染 Header。

**建议**：rAF 节流，或仅在布尔值实际变化时 setState。

### 18. 全局 `images.unoptimized: true` 让 next/image 形同虚设

`next.config.ts:6`：所有图片原图直出，丧失缩放 / WebP / 尺寸优化。首页波浪图还叠加 `priority × 4 + quality={100}`（`page.tsx:84-128`）。

**建议**：若非为静态导出，关闭全局开关，仅对波浪图单独设置 `unoptimized`。

### 19. Typewriter 每个字符重建一次 rAF 循环

`Typewriter.tsx:77`：effect 依赖 `phase` / `index`，每打一个字就销毁重建 rAF。

**建议**：改用 `setTimeout` 链（打字场景间隔 120ms，rAF 没有意义），逻辑更简单。

---

## 五、代码结构与可维护性

### 20. 首页与 /blog 页约 100 行重复代码

波浪 section（`page.tsx:82-129` vs `blog/page.tsx:62-107`）和分页 UI 完全重复。

**建议**：抽取 `<BannerWaves />`、`<Pagination />` 组件。

### 21. Header 的魔法字符串解析

- `Header.tsx:77-87` 对类名做 `split("dark:")`
- `Header.tsx:224` 做 `replace("/80", "/95")`

配置格式稍变就静默坏掉。另外 `pageStyles.ts` 中同一段发光 shadow 字符串复制了 6 次。

**建议**：`pageStyles.ts` 将 `text` / `darkText` / `bg` / `scrolledBg` 拆为结构化字段，公共 shadow 提取为常量。

### 22. 手动 useMemo/useCallback 与项目约定不一致

React Compiler 已开启（README 明确"无需手动 memo"），但 `GalleryContent`、`NoticeCarousel`、`FootprintClient` 仍大量手写。

**建议**：统一去掉，减少噪音。

### 23. 死代码清理

- `getAllTags`、`getPostsByTag`、`getCommentList`、整个 `user.ts` API 已封装但界面未使用
- `data/comments.ts` 静态评论与后端评论 API 二选一

**建议**：确认规划后删除或接入，避免两套并存。

### 24. 站点级硬编码信息散落

QQ 占位号 `123456789`、占位 `github.com` 链接（`page.tsx:356,322`）、`SITE_START_DATE`、个人简介等散落在页面中。

**建议**：集中到 `src/data/site.ts` 统一配置。

### 25. SEO 补齐

没有 `sitemap.ts` / `robots.ts`，文章页 `generateMetadata` 只有 title/description，无 OpenGraph / Twitter Card。

**建议**：对博客类站点值得补齐，成本低廉。

---

## 附：推荐落地顺序

| 阶段 | 内容 | 理由 |
|------|------|------|
| 第一阶段 | #1 ISR/缓存、#3 Markdown 服务端渲染 | 收益最大：后端压力、SEO、首屏 |
| 第二阶段 | #7、#8、#12、#13 确定性 Bug | 修复即可见的问题 |
| 第三阶段 | #14、#15 安全项 | 录入数据后即可被触发 |
| 第四阶段 | #16–#19 性能、#20–#25 结构 | 持续改善 |
