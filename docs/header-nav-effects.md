# 首页导航栏（Header）效果说明

> 文件位置：`seiko-blog-ui/src/components/Header.tsx`  
> 样式配置：`seiko-blog-ui/src/styles/pageStyles.ts`  
> 布局引用：`seiko-blog-ui/src/app/layout.tsx`

---

## 一、整体结构

```
<header>          -- fixed 定位，z-50，全宽，高度由内容决定
  <div>           -- max-w-4xl 居中，h-14，左右 padding
    Logo          -- 左侧
    Desktop Nav   -- 右侧，md 以上显示
    Mobile Button -- 右侧，md 以下显示
  </div>
  Mobile Menu     -- 展开的全宽下拉面板
</header>
```

| 属性 | 值 |
|------|-----|
| 定位 | `fixed top-0 left-0` |
| 层级 | `z-50` |
| 内容最大宽度 | `max-w-4xl`（约 896px） |
| 内容区高度 | `h-14`（56px） |
| 主体上偏移 | `main` 有 `pt-14`，避免内容被遮挡 |
| 首页特殊处理 | Hero 区域用 `-mt-16` 向上覆盖 Header，实现全屏效果 |

---

## 二、滚动行为

Header 有两个核心滚动状态，由 `useEffect + scroll` 事件监听控制：

### 1. 显示/隐藏（`isVisible`）

| 滚动方向 | 条件 | 效果 |
|---------|------|------|
| 向下滚动 | 超过 100px 且继续向下 | `translate-y-full` 向上滑出隐藏 |
| 向上滚动 | 任意位置 | `translate-y-0` 向下滑入显示 |
| 回到顶部 | `< 100px` | 始终显示 |

- 动画时长：`duration-300`
- 使用 `lastScrollY` ref 记录上次位置做方向判断

### 2. 背景切换（`isScrolled`）

| 滚动位置 | 效果 |
|---------|------|
| `scrollY <= 50` | 使用页面配置的 `bg`（通常为透明/低透明度） |
| `scrollY > 50` | 使用页面配置的 `scrolledBg`（更高不透明度 + 可能带阴影） |

---

## 三、页面样式配置系统

每个页面在 `src/styles/pageStyles.ts` 中独立配置 Header 样式：

```typescript
interface PageHeaderStyle {
  bg: string;           // 默认背景（透明/毛玻璃）
  text: string;         // 文字颜色（支持 dark: 前缀）
  scrolledBg?: string;  // 滚动后的背景（带阴影/更高不透明度）
}
```

### 样式匹配规则

1. **精确匹配**：当前 `pathname` 完全等于配置键
2. **前缀匹配**：用于子路由（如 `/explore/music` 会命中 `/explore` 配置）
3. **默认样式**：`defaultHeaderStyle`（白色毛玻璃 + 深色文字）

### 各页面当前配置

| 页面 | 默认背景 | 滚动背景 | 文字颜色 |
|------|---------|---------|---------|
| `/` 首页 | `bg-white/10 backdrop-blur-sm` | `bg-white/50 backdrop-blur-md` + 白色发光阴影 | `text-white` |
| `/blog` | 同首页 | 同首页 | `text-zinc-900 dark:text-zinc-100` |
| `/gallery` | 同首页 | 同首页 | `text-zinc-900 dark:text-zinc-100` |
| `/footprint` | `bg-[#2a2a2a]/95 backdrop-blur-md` | 同默认（+ shadow-lg） | `text-white` |
| `/explore` | `bg-indigo-50/80 dark:bg-indigo-950/30` | `bg-indigo-50/95 dark:bg-indigo-950/50` | `text-indigo-900 dark:text-indigo-100` |
| `/explore/music` | `bg-violet-50/80 dark:bg-violet-950/30` | `bg-violet-50/95 dark:bg-violet-950/50` | `text-violet-900 dark:text-violet-100` |
| `/explore/book` | `bg-amber-50/80 dark:bg-amber-950/30` | `bg-amber-50/95 dark:bg-amber-950/50` | `text-amber-900 dark:text-amber-100` |
| `/explore/movie` | `bg-[#0d0d19]/80` | `bg-[#0d0d19]/95` + shadow-lg | `text-[#e6e3f5]` |
| `/explore/game` | `bg-[#0c0e17]/80` | `bg-[#0c0e17]/95` + shadow-lg | `text-[#f0f0fd]` |
| `/about` | `bg-rose-50/80 dark:bg-rose-950/30` | `bg-rose-50/95 dark:bg-rose-950/50` | `text-rose-900 dark:text-rose-100` |
| 默认 | `bg-white/50 dark:bg-zinc-950/50` | `bg-white/60 dark:bg-zinc-950/60` + 白色/深色发光阴影 | `text-zinc-900 dark:text-zinc-100` |

### 首页特殊处理

首页（`pathname === "/"`）在代码中做了大量硬编码的特殊判断：

- **未滚动时**：文字纯白（`text-white` / `text-white/90`），适合配合 Hero 背景图
- **滚动后**：文字变为 `text-zinc-900`，背景变白毛玻璃
- Logo、导航链接、下拉菜单、移动端按钮均遵循此规则
- **原因**：首页 Hero 是全屏大图，其他页面是浅色/纯色背景

> **注意**：如果要修改首页导航颜色，需要同时修改 `pageStyles.ts` 中 `/` 的配置 **和** `Header.tsx` 中的多处 `isHome ? ...` 条件判断。

---

## 四、Logo 波浪动画

Logo "Seiko Blog" 每个字符单独包裹 `<span>`，通过 CSS 变量 `--delay` 实现依次波浪效果。

### 实现

- **文件**：`src/app/globals.css`
- **关键帧**：`@keyframes logo-wave`
  - `0%, 100%` → `translateY(0)`
  - `40%` → `translateY(-6px)`
- **触发**：`.logo-wave-text:hover span`
- **延迟**：每个字符 `i * 0.05s`，共 10 个字符（含空格）
- **动画时长**：`0.5s`
- **缓动**：`ease-in-out`

---

## 五、导航项结构

### 桌面端（`md:flex`）

```
首页   文章   相册   足迹   探索 ▼
                          └── 音乐
                              书籍
                              影视
                              游戏
```

- 图标 + 文字横向排列，`gap-3`
- 导航间距：`gap-12`
- 字体：`text-lg font-medium`
- 当前页面：底部 `border-b-2 border-current` 下划线

### 移动端（`md:hidden`）

- 汉堡菜单按钮（`Menu` / `X` 图标切换）
- 点击展开全宽面板，带 `border-t` 分隔线
- 下拉项变为手风琴折叠（`ChevronDown` 旋转指示）
- 子菜单展开后左侧有 `pl-11` 缩进

### 下拉菜单交互

| 平台 | 触发方式 | 关闭方式 |
|------|---------|---------|
| 桌面端 | `mouseenter` / `mouseleave` | 200ms 延迟后关闭（防止快速划过中断） |
| 移动端 | 点击父级按钮 | 点击后关闭，或切换其他项 |

- 下拉面板宽度：`w-40`
- 圆角：`rounded-lg`
- 背景与 Header 当前背景一致

---

## 六、颜色逻辑总结

### 导航链接颜色（`getNavClass`）

```
首页:
  未滚动 → 白色系（active: text-white + border-white）
  滚动后 → zinc-900 系（active: text-zinc-900 + border-zinc-900）

其他页面:
  → 使用 pageStyle.text（支持 dark: 前缀拆分）
  active: textColor + border-b-2
  inactive: textColor + hover:opacity-80
```

### 下拉菜单项颜色（`getDropdownItemClass`）

```
首页:
  未滚动 → 白色文字 + hover:bg-white/10
  滚动后 → zinc-600/zinc-900 + hover:bg-zinc-100/30

其他页面:
  → 使用 pageStyle.text + 半透明背景
```

### 移动端面板颜色

```
首页:
  未滚动 → bg-black/60 backdrop-blur-md + border-white/20
  滚动后 → bg-white/90 backdrop-blur-md + border-zinc-200/50

其他页面:
  → 基于 pageStyle.bg 提高不透明度（/80→/95, /50→/95）
```

---

## 七、新增/修改页面时的注意事项

1. **在 `pageStyles.ts` 中添加配置**
   - 至少配置 `bg` 和 `text`
   - 建议同时配置 `scrolledBg` 以获得滚动后的视觉效果

2. **如果页面背景是图片/深色**
   - 参考首页做法，在 `Header.tsx` 中为该页面添加 `isXxx` 特殊判断
   - 或者将文字颜色配置为统一的颜色（如 `text-white`），避免硬编码

3. **当前激活状态**
   - `href === "/"` 时精确匹配
   - 其他路由用 `pathname.startsWith(href)` 匹配，支持子路由高亮

4. **Footer 样式**
   - 同页面也在 `pageStyles.ts` 中配置 `pageFooterStyles`
   - 字段：`bg`, `border`, `text`

---

## 八、相关文件速查

| 文件 | 作用 |
|------|------|
| `src/components/Header.tsx` | 导航栏组件本体 |
| `src/styles/pageStyles.ts` | 各页面 Header/Footer 样式配置 |
| `src/app/layout.tsx` | 根布局，引入 Header/Footer，设置 `pt-14` |
| `src/app/globals.css` | Logo 波浪动画、全局滚动隐藏等样式 |
