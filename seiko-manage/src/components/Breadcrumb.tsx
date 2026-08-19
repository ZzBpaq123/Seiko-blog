"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { navItems } from "@/config/navigation";

/** 非菜单页面的路径段中文名（新建/编辑等操作页） */
const EXTRA_SEGMENT_LABELS: Record<string, string> = {
  album: "相册",
  photo: "照片",
  new: "新建",
  edit: "编辑",
};

/** 从菜单配置推导：路径段 → 中文名 */
const SEGMENT_LABELS: Record<string, string> = { ...EXTRA_SEGMENT_LABELS };
/** 从菜单配置推导：二级路径段 → 上级分组名（无真实路由，仅作层级展示） */
const PARENT_LABELS: Record<string, string> = {};
/** 从菜单配置推导：可作为中间层级点击跳转的页面路径 */
const NAVIGABLE = new Set<string>();

navItems.forEach((item) => {
  if (item.href) {
    NAVIGABLE.add(item.href);
    const segment = item.href.split("/").filter(Boolean).pop()!;
    SEGMENT_LABELS[segment] = item.label;
  }
  item.children?.forEach((child) => {
    NAVIGABLE.add(child.href);
    const segment = child.href.split("/").filter(Boolean).pop()!;
    SEGMENT_LABELS[segment] = child.label;
    PARENT_LABELS[segment] = item.label;
  });
});

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
    if (isLast && PARENT_LABELS[seg]) {
      crumbs.push({
        id: `group-${acc}`,
        label: PARENT_LABELS[seg],
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
