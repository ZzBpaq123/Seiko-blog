# Seiko Blog UI 开发规范

> 适用范围：`seiko-blog-ui/` 下的所有代码
> 基于代码风格审查报告制定，旨在统一代码风格、提升可维护性

---

## 一、通用规范

### 1.1 文件组织

- 每个页面/组件文件遵循 **metadata → 组件定义 → 默认导出** 的顺序
- 服务端页面使用 `export default async function`，客户端组件使用 `export default function`
- 客户端组件文件顶部必须放置 `"use client"` 指令

```tsx
// ✅ 正确示例
export const metadata = { title: "页面标题" };

export default async function Page() {
  // ...
}

// ✅ 客户端组件正确示例
"use client";

interface MyClientProps {
  data: SomeType;
}

export default function MyClient({ data }: MyClientProps) {
  // ...
}
```

### 1.2 命名规范

| 类型 | 命名方式 | 示例 |
|------|----------|------|
| 页面组件 | PascalCase，与目录名对应 | `Page`, `BlogPage` |
| 客户端组件 | PascalCase + `Client` 后缀 | `BookClient`, `GalleryContent` |
| Props 接口 | `XxxProps` 或 `XxxClientProps` | `PostCardProps`, `BookClientProps` |
| 类型导入 | 使用 `import type` | `import type { PostVO }` |
| 工具函数 | camelCase | `formatDate`, `getBaseUrl` |

### 1.3 注释规范

- 统一使用 **中文注释**
- 对复杂的业务逻辑添加行内注释
- 组件/函数使用 JSDoc 风格注释说明用途和参数（可选）

---

## 二、编码规范

### 2.1 引号风格

**强制统一使用双引号 `"`**，包括：

- `"use client"` 指令
- 字符串字面量
- JSX 属性值
- import 路径

```tsx
// ✅ 正确
"use client";
import { useState } from "react";
<div className="bg-white">...</div>

// ❌ 错误
'use client';
import { useState } from 'react';
<div className='bg-white'>...</div>
```

> **工具配置**：已在 `.prettierrc` 中设置 `"singleQuote": false`，保存时自动格式化。

### 2.2 类型导入

仅用于类型注解的导入，**必须使用 `import type`**：

```tsx
// ✅ 正确
import type { PostVO, PageResult } from "@/api/types";
import { getPostList } from "@/api/post";

// ❌ 错误
import { PostVO, PageResult } from "@/api/types";
```

### 2.3 路径导入

- 本地模块统一使用 `@/` 路径别名
- 外部库使用包名导入
- 导入顺序：React/Next.js 内置 → 第三方库 → `@/` 本地模块 → 相对路径

```tsx
// ✅ 正确
import { useState } from "react";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { getPostList } from "@/api/post";
import type { PostVO } from "@/api/types";
import { PostCard } from "@/components/PostCard";
```

---

## 三、组件规范

### 3.1 页面根元素

- **页面级组件的根元素必须使用 `<main>` 标签**
- 仅在需要包裹多个同级区块且不作为页面主体时，才使用 `<div>` 或 `<>` Fragment
- 确保 HTML 语义化，便于 SEO 和可访问性

```tsx
// ✅ 正确 - 页面级组件
export default async function BlogPage() {
  return (
    <main className="min-h-screen">
      {/* 页面内容 */}
    </main>
  );
}

// ❌ 错误 - 页面级组件使用 div
export default async function BlogPage() {
  return (
    <div className="min-h-screen">
      {/* 页面内容 */}
    </div>
  );
}
```

### 3.2 Header 偏移处理

项目 Header 高度为 `pt-14`（56px），所有页面须统一使用 `-mt-14` 进行偏移：

```tsx
// ✅ 正确
<main className="-mt-14 pt-14 min-h-screen">

// ❌ 错误 - 使用 -mt-16（64px，多偏移了 8px）
<main className="-mt-16 pt-14 min-h-screen">
```

> 特殊情况（如首页 Hero 全屏、地图铺满等）可根据设计需求调整，但需在注释中说明原因。

### 3.3 Footer 与底部间距处理

项目 `layout.tsx` 的 `<main>` 默认带有 `pt-14 pb-16`：

- `pt-14`（56px）为 **fixed Header** 预留空间
- `pb-16`（64px）为页面内容与 **Footer** 之间预留间距

所有页面须按类型统一处理，禁止各自随意覆盖：

#### 类型 A：标准内容页（首页、blog、文章详情等）

根元素添加 `-mt-14` 抵消顶部 padding，让 Hero/背景顶到视口顶部。**不处理底部**，保持 main 默认的 `pb-16`。

```tsx
// ✅ 正确
<main className="-mt-14 min-h-screen">
  {/* 页面内容 */}
</main>
```

#### 类型 B：全屏沉浸页（足迹、电影、游戏、关于我等）

根元素同时添加 `-mt-14` 和 `-mb-16`，让内容真正占满整个视口。如需防止内容贴边，可额外加 `pb-16`。

```tsx
// ✅ 正确 - 全屏页面
<main className="-mt-14 -mb-16 min-h-screen">
  {/* 内容占满视口 */}
</main>

// ✅ 正确 - 固定高度全屏
<div className="-mt-14 pt-14 -mb-16 pb-16 h-[calc(100dvh-3.5rem)]">
  {/* 内容占满视口，pt-14/pb-16 保持内边距 */}
</div>
```

#### 类型 C：固定定位覆盖页（相册、书籍等）

使用 `fixed inset-0` 覆盖整个视口，无需处理 `-mt-14` / `-mb-16`（main 的 padding 不影响 fixed 元素）。Footer 被自然遮住，不在该类页面中显示。

```tsx
// ✅ 正确
<main className="fixed inset-0 overflow-hidden">
  {/* 全屏覆盖内容 */}
</main>
```

#### 类型 D：特殊布局页（音乐等）

如有固定悬浮元素（底部播放器），使用 `-mb-16` 抵消 main 的 `pb-16`，再用自身的 padding 控制实际留白。

```tsx
// ✅ 正确 - 底部有固定播放器
<div className="-mb-16 pb-20">
  {/* pb-20 给播放器留空间，main 的 pb-16 被抵消 */}
</div>
```

> **注意**：禁止在已带有 `-mb-16` 的页面上再叠加 `pb-16`，除非确实需要超过 64px 的额外留白。

#### Footer 样式配置

所有页面的 Footer 背景色在 `src/styles/pageStyles.ts` 的 `pageFooterStyles` 中按路由配置：

- **新增页面时，必须同步添加 `pageFooterStyles` 配置**，否则回退到默认白色背景，与深色页面冲突
- **全屏深色页面的 Footer 背景必须与页面根背景色保持一致**（如 `about/myself` 用 `bg-zinc-950`，`footprint` 用 `bg-[#1a1a2e]`）
- 禁止在 `pageFooterStyles` 中使用与页面实际背景不一致的硬编码颜色

### 3.4 Props 定义

- 所有组件必须显式定义 Props 类型
- 服务端页面如需接收 params/searchParams，使用对应接口
- 客户端组件 Props 接口命名为 `XxxClientProps`

```tsx
// ✅ 服务端页面
interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  // ...
}

// ✅ 客户端组件
"use client";

interface BookClientProps {
  books: BookVO[];
}

export default function BookClient({ books }: BookClientProps) {
  // ...
}
```

---

## 四、图片规范

### 4.1 组件选择

**所有图片必须使用 Next.js `Image` 组件**，禁止直接使用原生 `<img>` 标签：

```tsx
// ✅ 正确
import Image from "next/image";

<Image src="/cover.jpg" alt="封面图" width={400} height={300} />

// ❌ 错误
<img src="/cover.jpg" alt="封面图" />
```

### 4.2 外部图片

对于外部 URL 图片，必须添加 `unoptimized` 属性，并在 `next.config.ts` 中配置白名单：

```tsx
// ✅ 外部图片正确用法
<Image
  src={coverUrl}
  alt="封面"
  width={400}
  height={300}
  unoptimized
/>
```

### 4.3 必需属性

- 必须提供 `alt` 属性（可访问性要求）
- 必须提供 `width` 和 `height`（或 `fill` + 父容器尺寸），防止布局偏移（CLS）
- 懒加载由 Next.js 自动处理，无需手动添加 `loading="lazy"`

### 4.4 alt 可访问性规范

**所有图片都必须添加 `alt` 属性以提高可访问性**，屏幕阅读器依赖 `alt` 文本向视障用户描述图片内容。

- **内容性图片**：`alt` 应简洁、准确地描述图片内容，避免「图片」「照片」等冗余前缀
- **装饰性图片**：纯装饰、不传递信息的图片，使用空字符串 `alt=""`，让屏幕阅读器跳过
- **动态图片**：使用数据字段拼接有意义的描述，禁止留空或使用占位文本
- 禁止省略 `alt` 属性，也禁止使用无意义的内容（如 `alt="img"`、`alt="图片"`）

```tsx
// ✅ 正确 - 内容性图片，描述具体内容
<Image src={post.cover} alt={`${post.title} 封面`} width={400} height={300} />
<Image src={photo.url} alt={photo.description ?? "相册照片"} fill />

// ✅ 正确 - 装饰性图片，使用空 alt
<Image src="/wave-decoration.svg" alt="" width={200} height={80} />

// ❌ 错误 - 省略 alt
<Image src={post.cover} width={400} height={300} />

// ❌ 错误 - 无意义的 alt
<Image src={post.cover} alt="图片" width={400} height={300} />
```

---

## 五、样式规范

### 5.1 颜色值管理

**禁止使用硬编码十六进制颜色值**，统一使用 Tailwind CSS 语义化颜色类或自定义主题变量：

```tsx
// ✅ 正确 - Tailwind 语义化颜色
<div className="bg-zinc-50 dark:bg-black">
<div className="text-zinc-900 dark:text-zinc-100">

// ✅ 正确 - 自定义主题变量（需在 globals.css 中定义）
<div className="bg-dark-bg text-dark-text">

// ❌ 错误 - 硬编码十六进制
<div className="bg-[#0c0e17]">
<div className="text-[#e6e3f5]">
```

### 5.2 自定义主题配置

对于探索页（game/movie/book）等特殊主题色，在 `globals.css` 的 `@theme inline` 中定义：

```css
/* src/app/globals.css */
@theme inline {
  --color-dark-bg: #0c0e17;
  --color-dark-surface: #171924;
  --color-dark-text: #e6e3f5;
  --color-dark-muted: #aba9ba;
  --color-dark-accent: #8ff5ff;
}
```

或在 `src/styles/themes.ts` 中定义为常量（供 JS/TS 逻辑使用）：

```ts
// src/styles/themes.ts
export const darkTheme = {
  bg: "#0c0e17",
  surface: "#171924",
  text: "#e6e3f5",
  muted: "#aba9ba",
  accent: "#8ff5ff",
} as const;
```

### 5.3 Tailwind 类名组织

- 按照 **布局 → 尺寸 → 间距 → 外观 → 交互 → 响应式/状态变体** 的顺序组织类名
- 使用 `clsx` 或 `cn` 工具函数处理条件类名（如项目中已配置）

```tsx
// ✅ 推荐顺序
<div
  className="
    flex flex-col items-center
    w-full min-h-screen
    px-4 py-8
    bg-white text-gray-900
    hover:shadow-lg
    dark:bg-black dark:text-white
  "
>
```

### 5.4 尺寸单位规范

**优先使用 Tailwind 的标准数值单位，禁止在尺寸类中硬编码具体像素值。** Tailwind 间距标度中 `1` 等于 `0.25rem`（4px），因此 `像素值 ÷ 4 = 数值单位`。

- 组件的 **高度（`h-`）、宽度（`w-`）、最小高度（`min-h-`）、最大高度（`max-h-`）、最小/最大宽度（`min-w-` / `max-w-`）** 必须使用 Tailwind 标准数值单位
- 仅当目标尺寸不是 4 的整数倍、或确需精确像素控制时，才允许使用任意值 `[...px]`，并在注释中说明原因
- 全屏 / 视口相关尺寸优先使用 `min-h-screen`、`h-dvh`、`inset-0` 等语义类

```tsx
// ✅ 正确 - 使用数值单位
<div className="max-h-125">        {/* 500px ÷ 4 = 125 */}
<div className="min-h-75 w-50">    {/* min-h: 300px，w: 200px */}
<div className="h-25 max-w-300">   {/* h: 100px，max-w: 1200px */}

// ❌ 错误 - 硬编码像素值
<div className="max-h-[500px]">
<div className="min-h-[300px] w-[200px]">
<div className="h-[100px] max-w-[1200px]">
```

**常用换算参考：**

| 像素值 | 数值单位 | 像素值 | 数值单位 |
|--------|----------|--------|----------|
| 100px | `25` | 400px | `100` |
| 200px | `50` | 500px | `125` |
| 300px | `75` | 600px | `150` |

---

## 六、数据获取规范

### 6.1 服务端数据获取

- 在服务端页面中直接调用 API 函数获取数据
- 错误处理统一使用 `.catch(() => null)` 或 `.catch(() => [])`
- 获取数据后做非空判断，提供降级 UI

```tsx
// ✅ 正确
const posts = await getPostList().catch(() => []);

// 降级处理
if (posts.length === 0) {
  return <EmptyState />;
}
```

### 6.2 客户端数据获取

- 使用 React 的 `use` 函数配合 Suspense，或使用 `useEffect` + `useState`
- 错误状态需有用户友好的提示

---

## 七、工具配置

### 7.1 Prettier 配置

项目 `.prettierrc` 已配置以下规则，保存时自动格式化：

```json
{
  "singleQuote": false,
  "semi": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### 7.2 全项目格式化命令

```bash
cd seiko-blog-ui
npx prettier --write "src/**/*.tsx" "src/**/*.ts" "src/**/*.css"
```

---

## 八、问题对照与修复检查表

| 问题类别 | 规范条款 | 涉及文件 | 修复状态 |
|----------|----------|----------|----------|
| 单双引号混用 | 2.1 | `BookClient.tsx`, `MovieClient.tsx` 等 | ⬜ 待修复 |
| 页面根元素非 `<main>` | 3.1 | `page.tsx`, `blog/page.tsx`, `about/myself/page.tsx` 等 | ⬜ 待修复 |
| Header 偏移不一致 | 3.2 | `page.tsx`（`-mt-16`）, `blog/page.tsx`（`-mt-16`） | ⬜ 待修复 |
| 原生 `<img>` 混用 | 4.1 | `MovieClient.tsx`, `MusicClient.tsx`, `BookClient.tsx`, `GalleryContent.tsx` | ⬜ 待修复 |
| 图片缺失 `alt` 属性 | 4.4 | 图片相关组件 | ⬜ 待修复 |
| 硬编码颜色值 | 5.1 | `game/page.tsx`, `movie/page.tsx`, `book/page.tsx` | ⬜ 待修复 |
| 尺寸硬编码像素值 | 5.4 | 含 `[...px]` 尺寸类的组件 | ⬜ 待修复 |
| `import type` 不一致 | 2.2 | 多处类型导入 | ⬜ 待修复 |

---

## 九、参考资源

- [Next.js App Router 文档](https://nextjs.org/docs/app)
- [Tailwind CSS v4 文档](https://tailwindcss.com/docs/v4-beta)
- [React 19 文档](https://react.dev/)
