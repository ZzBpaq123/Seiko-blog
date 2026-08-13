# 管理后台页面创建规范（以 posts 为例）

> 适用范围：`seiko-manage/src/app/<module>/` 下的所有页面。  
> 参考示例：`seiko-manage/src/app/posts/`。  
> 以后新增管理后台页面时，应按照本规范建立文件、命名、组织代码。

---

## 1. 目录与文件结构

一个完整的管理模块通常包含：列表页、新建页、编辑页。目录按下述方式组织：

```
src/app/<module>/
├── page.tsx              # 列表页（默认路由 /module）
├── new/
│   └── page.tsx          # 新建页（路由 /module/new）
└── edit/
    └── page.tsx          # 编辑页（路由 /module/edit?id=xxx）
```

### 1.1 示例：`posts` 模块

```
src/app/posts/
├── page.tsx              # /posts       文章列表
├── new/page.tsx          # /posts/new   新建文章
└── edit/page.tsx         # /posts/edit  编辑文章
```

### 1.2 命名规则

| 位置 | 命名 | 说明 |
|------|------|------|
| 列表页 | `<module>/page.tsx` | 模块入口，统一叫 `page.tsx` |
| 新建页 | `<module>/new/page.tsx` | 子目录 `new`，内部 `page.tsx` |
| 编辑页 | `<module>/edit/page.tsx` | 子目录 `edit`，内部 `page.tsx` |
| 默认导出组件 | `export default function <Name>Page()` | 组件名采用 PascalCase，以 `Page` 结尾 |

> 不要在一个文件里放多个页面；每个路由对应一个目录（或叶子文件）。

---

## 2. 路由约定

| 页面 | 路由 | 参数传递方式 |
|------|------|--------------|
| 列表 | `/posts` | 无 |
| 新建 | `/posts/new` | 无 |
| 编辑 | `/posts/edit` | 通过查询参数 `?id=xxx` |

### 2.1 编辑页传参

编辑页使用 **查询参数** `?id=xxx`，不使用动态路由段（如 `/posts/edit/[id]`）。原因：

- 查询参数更灵活，便于在表单校验失败、权限不足时直接回退；
- 与现有代码风格保持一致；
- 读取方式：

```tsx
import { useSearchParams } from "next/navigation";

function EditPostForm() {
  const searchParams = useSearchParams();
  const id = Number(searchParams.get("id"));
  // ...
}
```

因为 `useSearchParams()` 需要包裹在 `Suspense` 中，所以编辑页拆分为：

```tsx
export default function EditPostPage() {
  return (
    <Suspense fallback={<Loading />}>
      <EditPostForm />
    </Suspense>
  );
}
```

---

## 3. 组件组织规范

### 3.1 默认导出组件命名

| 页面 | 默认导出函数名 |
|------|----------------|
| `posts/page.tsx` | `PostsPage` |
| `posts/new/page.tsx` | `NewPostPage` |
| `posts/edit/page.tsx` | `EditPostPage` |

内部辅助组件（如编辑页的表单组件）命名示例：`EditPostForm`。

### 3.2 文件顶部声明

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Search, Pencil, Trash2, Eye, Loader2, RotateCcw, X } from "lucide-react";
import { deletePost, getPostById, getPostList } from "@/api/post";
import type { PageResult, PostVO } from "@/types";
```

要点：

- 所有客户端页面第一行必须是 `"use client";`；
- 第三方库放一起，项目内引用放一起，类型导入放一起；
- 图标统一从 `lucide-react` 导入；
- API 从 `@/api/<module>` 导入；
- 类型从 `@/types` 导入。

---

## 4. 列表页规范

### 4.1 页面结构

一个标准列表页按顺序包含：

1. **页面标题 + 新建按钮**
2. **筛选栏**：搜索框 + 状态下拉 + 重置按钮
3. **数据表格**：展示核心字段 + 操作列
4. **分页器**：总数 + 页码按钮
5. **详情弹窗**（可选）：点击“查看”后弹出

### 4.2 状态声明顺序

```tsx
const [search, setSearch] = useState("");
const [debouncedSearch, setDebouncedSearch] = useState("");
const [statusFilter, setStatusFilter] = useState("");
const [page, setPage] = useState(1);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [detail, setDetail] = useState<PostVO | null>(null);
const [detailLoading, setDetailLoading] = useState(false);
const [deletingId, setDeletingId] = useState<number | null>(null);
const [refreshKey, setRefreshKey] = useState(0);
const [pageResult, setPageResult] = useState<PageResult<PostVO>>({
  records: [],
  total: 0,
  current: 1,
  size: PAGE_SIZE,
  pages: 0,
});
```

推荐状态顺序：

1. 查询条件（search / filter / page）；
2. 加载、错误状态；
3. 详情、删除等交互状态；
4. 刷新 key；
5. 列表数据。

### 4.3 防抖搜索

标题/关键词搜索需要 300ms 防抖：

```tsx
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search);
    setPage(1);
  }, 300);
  return () => clearTimeout(timer);
}, [search]);
```

### 4.4 数据加载

使用 `useEffect` 监听 `[page, debouncedSearch, statusFilter, refreshKey]`，并在 effect 内处理竞态：

```tsx
useEffect(() => {
  let cancelled = false;
  setLoading(true);
  setError(null);
  getPostList({
    page,
    size: PAGE_SIZE,
    title: debouncedSearch.trim() || undefined,
    published: statusFilter === "" ? undefined : statusFilter === "true",
  })
    .then((result) => {
      if (cancelled) return;
      if (!result || !Array.isArray(result.records)) {
        setError("接口返回数据异常");
        return;
      }
      setPageResult(result);
    })
    .catch((err) => {
      if (!cancelled) setError(err instanceof Error ? err.message : "加载失败");
    })
    .finally(() => {
      if (!cancelled) setLoading(false);
    });
  return () => { cancelled = true; };
}, [page, debouncedSearch, statusFilter, refreshKey]);
```

### 4.5 分页常量

列表页统一使用 `PAGE_SIZE = 10`：

```tsx
const PAGE_SIZE = 10;
```

### 4.6 操作按钮

操作列统一使用图标按钮，顺序为：查看、编辑、删除。

```tsx
<div className="flex items-center justify-center gap-2">
  <button title="查看" onClick={() => handleView(post.id)} disabled={detailLoading || !post.id}>
    <Eye size={14} />
  </button>
  <button title="编辑" onClick={() => handleEdit(post.id)} disabled={!post.id}>
    <Pencil size={14} />
  </button>
  <button title="删除" onClick={() => handleDelete(post.id)} disabled={deletingId === post.id || !post.id}>
    <Trash2 size={14} />
  </button>
</div>
```

删除前必须 `window.confirm` 二次确认。

---

## 5. 表单页规范（新建 / 编辑）

### 5.1 页面结构

1. **顶部操作栏**：返回按钮 + 标题 + 保存按钮（+ 发布开关）
2. **错误提示条**（条件渲染）
3. **基础信息卡片**：封面图、标题、Slug、作者、摘要、标签等
4. **内容编辑卡片**：Markdown 编辑器 + 预览切换

### 5.2 顶部操作栏

```tsx
<div className="flex items-center justify-between">
  <div className="flex items-center gap-3">
    <Link href="/posts" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500" title="返回">
      <ArrowLeft size={18} />
    </Link>
    <h1 className="text-2xl font-bold text-foreground">新建文章</h1>
  </div>
  <div className="flex items-center gap-2">
    <label className="flex items-center gap-2 text-sm text-gray-600 mr-2">
      <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
      立即发布
    </label>
    <button type="submit" className="btn btn-primary" disabled={submitting}>
      {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
      保存
    </button>
  </div>
</div>
```

### 5.3 表单字段顺序

按视觉顺序从上到下、从左到右：

1. 封面图（左侧，占 2/5）
2. 标题 / Slug / 作者（右侧，占 3/5）
3. 摘要
4. 标签
5. 内容（Markdown 编辑/预览）

### 5.4 Slug 自动生成

标题修改时，如果用户未手动编辑过 Slug，则自动同步：

```tsx
const [slug, setSlug] = useState("");
const [slugEdited, setSlugEdited] = useState(false);

const handleTitleChange = (value: string) => {
  setTitle(value);
  if (!slugEdited) {
    setSlug(slugify(value));
  }
};

function slugify(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^一-龥a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
```

### 5.5 表单提交

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (submitting) return;

  if (!title.trim()) {
    setError("请填写文章标题");
    return;
  }
  // ... 其他校验

  const payload: PostCreateDTO = { /* ... */ };

  setSubmitting(true);
  setError(null);
  try {
    await createPost(payload); // 编辑页使用 updatePost(id, payload)
    router.push("/posts");
  } catch (err) {
    setError(err instanceof Error ? err.message : "保存失败");
  } finally {
    setSubmitting(false);
  }
};
```

### 5.6 编辑页初始化

```tsx
useEffect(() => {
  if (!id || Number.isNaN(id)) {
    setError("无效的文章 ID");
    setLoading(false);
    return;
  }

  setLoading(true);
  setError(null);
  getPostById(id)
    .then((post: PostVO) => {
      setTitle(post.title ?? "");
      // ...
    })
    .catch((err) => {
      setError(err instanceof Error ? err.message : "加载文章失败");
    })
    .finally(() => setLoading(false));
}, [id]);
```

### 5.7 Markdown 预览切换

```tsx
const [preview, setPreview] = useState(false);

<button type="button" onClick={() => setPreview((p) => !p)}>
  {preview ? <><Pencil size={14} /> 编辑</> : <><Eye size={14} /> 预览</>}
</button>
```

预览区：

```tsx
<div className="markdown-body min-h-[28rem] rounded-lg border border-border p-4">
  {content.trim() ? (
    <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
  ) : (
    <p className="text-gray-400">暂无内容</p>
  )}
</div>
```

---

## 6. 样式与 UI 规范

### 6.1 通用类名

项目已内置以下通用样式类，应优先使用：

| 用途 | 类名 |
|------|------|
| 卡片容器 | `card` |
| 主按钮 | `btn btn-primary` |
| 次按钮 | `btn btn-secondary` |
| 小按钮 | `btn btn-sm` |
| 输入框 | `input` |
| 带图标输入框 | `input input-icon` |
| 数据表格 | `data-table` |
| 表格容器 | `table-container` |
| 徽章-蓝色 | `badge badge-blue` |
| 徽章-绿色 | `badge badge-green` |
| 徽章-黄色 | `badge badge-yellow` |

### 6.2 页面间距

- 根容器：`space-y-6`
- 卡片内部垂直间距：`space-y-4` / `space-y-3`
- 表单栅格：`grid grid-cols-1 md:grid-cols-5 gap-4`

### 6.3 加载与空状态

```tsx
{loading ? (
  <div className="flex items-center justify-center py-16 text-gray-500">
    <Loader2 size={24} className="animate-spin mr-2" />
    加载中...
  </div>
) : error ? (
  <div className="flex items-center justify-center py-16 text-red-500">{error}</div>
) : (
  // 正常内容
)}
```

---

## 7. API 与类型导入

### 7.1 API 模块路径

```tsx
import { createPost, getPostById, getPostList, updatePost, deletePost } from "@/api/post";
```

### 7.2 类型导入

```tsx
import type { PageResult, PostVO, PostCreateDTO } from "@/types";
```

### 7.3 组件导入

```tsx
import ImageUpload from "@/components/ImageUpload";
import TagMultiSelect from "@/components/TagMultiSelect";
```

复用的复杂组件统一放在 `src/components/` 下。

---

## 8. 错误处理

- 所有接口调用必须 `try/catch`；
- 错误信息优先使用 `err instanceof Error ? err.message : "默认错误"`；
- 列表加载失败展示红色错误块；
- 表单提交失败在表单顶部展示错误提示条。

---

## 9. 其他约定

- 所有页面文件使用 **双引号**；
- 注释使用中文；
- 常量、辅助函数放在组件外部；
- 状态变量按功能分组，保持可读性；
- 路由跳转使用 `next/navigation` 的 `useRouter`；
- 链接使用 `next/link` 的 `Link` 组件；
- 图标使用 `lucide-react`。

---

## 10. 快速创建 checklist

新增一个管理模块 `xxx` 时，按以下顺序创建文件：

- [ ] `src/app/xxx/page.tsx` —— 列表页
- [ ] `src/app/xxx/new/page.tsx` —— 新建页
- [ ] `src/app/xxx/edit/page.tsx` —— 编辑页
- [ ] 在 `src/api/xxx.ts` 中添加对应 API
- [ ] 在 `src/types/index.ts` 中补充 VO/DTO 类型
- [ ] 按本规范拷贝 `posts` 结构并替换字段名
