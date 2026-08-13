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
  users: "用户管理",
  album: "相册",
  photo: "照片",
  new: "新建",
  edit: "编辑",
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
    crumbs.push({
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
      {crumbs.map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-1.5">
          <ChevronRight size={14} className="text-gray-300" />
          {crumb.isLink ? (
            <Link
              href={crumb.href}
              className="text-gray-500 hover:text-primary transition-colors"
            >
              {crumb.label}
            </Link>
          ) : (
            <span className="font-medium text-foreground">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
