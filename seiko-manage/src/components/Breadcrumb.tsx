"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

/** 路径段到中文名称的映射 */
const SEGMENT_LABELS: Record<string, string> = {
  posts: "文章管理",
  tags: "标签管理",
  comments: "评论管理",
  footprints: "足迹管理",
  photos: "相册管理",
  notices: "公告管理",
  books: "书籍管理",
  movies: "电影管理",
  resources: "资源管理",
  users: "用户管理",
  logs: "日志管理",
  dicts: "字典管理",
  album: "相册",
  photo: "照片",
  new: "新建",
  edit: "编辑",
};

/** 二级菜单页面的上级分组（无真实路由，仅作为面包屑层级展示） */
const GROUP_PARENTS: Record<string, string> = {
  logs: "系统管理",
  dicts: "系统管理",
};

/** 可点击跳转的列表页路径（其余段仅作展示） */
const NAVIGABLE = new Set([
  "/posts",
  "/comments",
  "/footprints",
  "/photos",
  "/notices",
  "/books",
  "/movies",
  "/users",
]);

interface Crumb {
  id: string;
  label: string;
  href: string;
  isLink: boolean;
}

export default function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const crumbs: Crumb[] = [];
  let acc = "";
  segments.forEach((seg, index) => {
    acc += `/${seg}`;
    const isLast = index === segments.length - 1;
    if (isLast && GROUP_PARENTS[seg]) {
      crumbs.push({
        id: `group-${acc}`,
        label: GROUP_PARENTS[seg],
        href: "",
        isLink: false,
      });
    }
    crumbs.push({
      id: acc,
      label: SEGMENT_LABELS[seg] ?? seg,
      href: acc,
      isLink: !isLast && NAVIGABLE.has(acc),
    });
  });

  return (
    <nav aria-label="面包屑" className="flex items-center gap-1.5 text-sm">
      <Link
        href="/"
        className="flex items-center gap-1 text-gray-500 hover:text-primary transition-colors"
      >
        <Home size={15} />
        <span>首页</span>
      </Link>
      {crumbs.map((crumb, index) => (
        <span key={crumb.id} className="flex items-center gap-1.5">
          <ChevronRight size={14} className="text-gray-300" />
          {crumb.isLink ? (
            <Link
              href={crumb.href}
              className="text-gray-500 hover:text-primary transition-colors"
            >
              {crumb.label}
            </Link>
          ) : (
            <span
              className={
                index === crumbs.length - 1
                  ? "font-medium text-foreground"
                  : "text-gray-500"
              }
            >
              {crumb.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
