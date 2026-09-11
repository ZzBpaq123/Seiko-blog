// Header 页面背景色配置
export const pageHeaderStyles: Record<
  string,
  { bg: string; text: string; scrolledBg?: string }
> = {
  // 首页 - 透明/毛玻璃
  "/": {
    bg: "bg-white/10 backdrop-blur-sm",
    scrolledBg:
      "bg-white/50 backdrop-blur-md shadow-[0_0_30px_rgba(255,255,255,0.4),0_0_60px_rgba(255,255,255,0.2),inset_0_1px_0_rgba(255,255,255,0.3)]",
    text: "text-white",
  },
  // 文章列表页 - 与首页相同背景，但使用深色文字
  "/blog": {
    bg: "bg-white/10 backdrop-blur-sm",
    scrolledBg:
      "bg-white/50 backdrop-blur-md shadow-[0_0_30px_rgba(255,255,255,0.4),0_0_60px_rgba(255,255,255,0.2),inset_0_1px_0_rgba(255,255,255,0.3)]",
    text: "text-zinc-900 dark:text-zinc-100",
  },
  // 相册页 - 白色文字，透明毛玻璃效果
  "/gallery": {
    bg: "bg-white/10 backdrop-blur-sm",
    scrolledBg:
      "bg-white/50 backdrop-blur-md shadow-[0_0_30px_rgba(255,255,255,0.4),0_0_60px_rgba(255,255,255,0.2),inset_0_1px_0_rgba(255,255,255,0.3)]",
    text: "text-zinc-900 dark:text-zinc-100",
  },
  // 足迹页 - 白色文字，深色背景 #2a2a2a
  "/footprint": {
    bg: "bg-[#2a2a2a]/95 backdrop-blur-md",
    scrolledBg: "bg-[#2a2a2a]/95 backdrop-blur-md shadow-lg",
    text: "text-white",
  },
  // 探索页
  "/explore": {
    bg: "bg-indigo-50/80 backdrop-blur-md dark:bg-indigo-950/30",
    scrolledBg:
      "bg-indigo-50/95 backdrop-blur-md shadow-sm dark:bg-indigo-950/50",
    text: "text-indigo-900 dark:text-indigo-100",
  },
  "/explore/book": {
    bg: "bg-amber-50/80 backdrop-blur-md dark:bg-amber-950/30",
    scrolledBg:
      "bg-amber-50/95 backdrop-blur-md shadow-sm dark:bg-amber-950/50",
    text: "text-amber-900 dark:text-amber-100",
  },
  "/explore/movie": {
    bg: "bg-white/10 backdrop-blur-sm",
    scrolledBg:
      "bg-white/50 backdrop-blur-md shadow-[0_0_30px_rgba(255,255,255,0.4),0_0_60px_rgba(255,255,255,0.2),inset_0_1px_0_rgba(255,255,255,0.3)]",
    text: "text-white",
  },
  "/explore/game": {
    bg: "bg-white/10 backdrop-blur-sm",
    scrolledBg:
      "bg-white/50 backdrop-blur-md shadow-[0_0_30px_rgba(255,255,255,0.4),0_0_60px_rgba(255,255,255,0.2),inset_0_1px_0_rgba(255,255,255,0.3)]",
    text: "text-white",
  },
  "/explore/resource": {
    bg: "bg-[#f8f7f5]/80 backdrop-blur-md",
    scrolledBg: "bg-[#f8f7f5]/95 backdrop-blur-md shadow-sm",
    text: "text-stone-800",
  },
  // 关于页
  "/about/myself": {
    bg: "bg-[#f8f7f5]/80 backdrop-blur-md",
    scrolledBg: "bg-[#f8f7f5]/95 backdrop-blur-md shadow-sm",
    text: "text-stone-800",
  },
};

// Footer 页面背景色配置
export const pageFooterStyles: Record<
  string,
  { bg: string; border: string; text: string }
> = {
  // 首页
  "/": {
    bg: "bg-zinc-50 dark:bg-zinc-950",
    border: "border-zinc-200 dark:border-zinc-800",
    text: "text-zinc-500 dark:text-zinc-400",
  },
  // 文章列表页 - 与首页相同
  "/blog": {
    bg: "bg-zinc-50 dark:bg-zinc-950",
    border: "border-zinc-200 dark:border-zinc-800",
    text: "text-zinc-500 dark:text-zinc-400",
  },
  // 相册页 - 与首页相同
  "/gallery": {
    bg: "bg-zinc-50 dark:bg-zinc-950",
    border: "border-zinc-200 dark:border-zinc-800",
    text: "text-zinc-500 dark:text-zinc-400",
  },
  // 足迹页 - 与首页相同
  "/footprint": {
    bg: "bg-zinc-50 dark:bg-zinc-950",
    border: "border-zinc-200 dark:border-zinc-800",
    text: "text-zinc-500 dark:text-zinc-400",
  },
  // 探索页
  "/explore": {
    bg: "bg-indigo-50 dark:bg-black",
    border: "border-indigo-200 dark:border-indigo-900",
    text: "text-indigo-600 dark:text-indigo-400",
  },
  "/explore/book": {
    bg: "bg-amber-50 dark:bg-black",
    border: "border-amber-200 dark:border-amber-900",
    text: "text-amber-600 dark:text-amber-400",
  },
  "/explore/movie": {
    bg: "bg-[#f5f3ef]",
    border: "border-stone-200",
    text: "text-stone-500",
  },
  "/explore/game": {
    bg: "bg-[#f8f7f5]",
    border: "border-stone-200",
    text: "text-stone-500",
  },
  "/explore/resource": {
    bg: "bg-[#f8f7f5]",
    border: "border-stone-200",
    text: "text-stone-500",
  },
  // 关于我页
  "/about/myself": {
    bg: "bg-[#f8f7f5]",
    border: "border-stone-200",
    text: "text-stone-500",
  },
};

// 默认 Header 样式
export const defaultHeaderStyle = {
  bg: "bg-white/50 backdrop-blur-sm dark:bg-zinc-950/50",
  scrolledBg:
    "bg-white/60 backdrop-blur-md shadow-[0_0_30px_rgba(255,255,255,0.35),0_0_60px_rgba(255,255,255,0.15),inset_0_1px_0_rgba(255,255,255,0.2)] dark:bg-zinc-950/60 dark:shadow-[0_0_30px_rgba(0,0,0,0.5),0_0_60px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]",
  text: "text-zinc-900 dark:text-zinc-100",
};

// 默认 Footer 样式
export const defaultFooterStyle = {
  bg: "bg-white dark:bg-zinc-950",
  border: "border-zinc-200 dark:border-zinc-800",
  text: "text-zinc-500 dark:text-zinc-400",
};

// 获取页面样式，支持前缀匹配
export function getPageStyle<T>(
  pathname: string,
  styles: Record<string, T>,
  defaultStyle: T,
): T {
  // 精确匹配
  if (styles[pathname]) {
    return styles[pathname];
  }
  // 前缀匹配（用于子路由）
  for (const [path, style] of Object.entries(styles)) {
    if (pathname.startsWith(path) && path !== "/") {
      return style;
    }
  }
  // 默认样式
  return defaultStyle;
}
