"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Tag,
  MessageSquare,
  MapPin,
  Image as ImageIcon,
  Megaphone,
  BookOpen,
  Film,
  Users,
  Link2,
  ScrollText,
  BookMarked,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface NavChild {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  children?: NavChild[];
}

const navItems: NavItem[] = [
  { label: "仪表盘", href: "/", icon: <LayoutDashboard size={18} /> },
  { label: "文章管理", href: "/posts", icon: <FileText size={18} /> },
  { label: "标签管理", href: "/tags", icon: <Tag size={18} /> },
  { label: "评论管理", href: "/comments", icon: <MessageSquare size={18} /> },
  { label: "足迹管理", href: "/footprints", icon: <MapPin size={18} /> },
  { label: "相册管理", href: "/photos", icon: <ImageIcon size={18} /> },
  { label: "公告管理", href: "/notices", icon: <Megaphone size={18} /> },
  { label: "书籍管理", href: "/books", icon: <BookOpen size={18} /> },
  { label: "电影管理", href: "/movies", icon: <Film size={18} /> },
  { label: "资源管理", href: "/resources", icon: <Link2 size={18} /> },
  { label: "用户管理", href: "/users", icon: <Users size={18} /> },
  {
    label: "系统管理",
    icon: <Settings size={18} />,
    children: [
      { label: "日志管理", href: "/logs", icon: <ScrollText size={18} /> },
      { label: "字典管理", href: "/dicts", icon: <BookMarked size={18} /> },
    ],
  },
];

const isPathActive = (href: string, pathname: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navItems.forEach((item) => {
      if (item.children?.some((child) => isPathActive(child.href, pathname))) {
        initial[item.label] = true;
      }
    });
    return initial;
  });

  const isGroupActive = (item: NavItem) =>
    item.children?.some((child) => isPathActive(child.href, pathname)) ?? false;

  const isGroupOpen = (item: NavItem) => openGroups[item.label] ?? isGroupActive(item);

  const toggleGroup = (label: string) =>
    setOpenGroups((prev) => ({ ...prev, [label]: !(prev[label] ?? false) }));

  const rowBaseClass =
    "flex items-center gap-3 rounded-lg text-sm font-medium transition-colors";
  const rowActiveClass = "bg-primary/15 text-primary";
  const rowIdleClass = "text-(--muted) hover:bg-primary/10 hover:text-primary";
  const labelHiddenClass = "opacity-0 -translate-x-2";
  const labelVisibleClass = "opacity-100 translate-x-0";

  const renderItem = (item: NavItem) => {
    if (!item.children) {
      const href = item.href!;
      return (
        <li key={href}>
          <Link
            href={href}
            className={`${rowBaseClass} px-3 py-2.5 ${
              isPathActive(href, pathname) ? rowActiveClass : rowIdleClass
            }`}
            title={collapsed ? item.label : undefined}
          >
            <span className="shrink-0">{item.icon}</span>
            <span
              className={`whitespace-nowrap transition-[opacity,transform] duration-300 ease-in-out ${
                collapsed ? labelHiddenClass : labelVisibleClass
              }`}
            >
              {item.label}
            </span>
          </Link>
        </li>
      );
    }

    return (
      <li key={item.label}>
        <button
          type="button"
          onClick={() => toggleGroup(item.label)}
          className={`w-full cursor-pointer text-left ${rowBaseClass} px-3 py-2.5 ${
            isGroupActive(item) ? rowActiveClass : rowIdleClass
          }`}
          title={collapsed ? item.label : undefined}
        >
          <span className="shrink-0">{item.icon}</span>
          <span
            className={`whitespace-nowrap transition-[opacity,transform] duration-300 ease-in-out ${
              collapsed ? labelHiddenClass : labelVisibleClass
            }`}
          >
            {item.label}
          </span>
        </button>
        {isGroupOpen(item) && (
          <ul className="mt-1 space-y-1">
            {item.children.map((child) => {
              const isActive = isPathActive(child.href, pathname);
              return (
                <li key={child.href}>
                  <Link
                    href={child.href}
                    className={`${rowBaseClass} py-2.5 ${
                      collapsed ? "px-3" : "pl-[42px] pr-3"
                    } ${isActive ? rowActiveClass : rowIdleClass}`}
                    title={collapsed ? child.label : undefined}
                  >
                    <span className="shrink-0">{child.icon}</span>
                    <span
                      className={`whitespace-nowrap transition-[opacity,transform] duration-300 ease-in-out ${
                        collapsed ? labelHiddenClass : labelVisibleClass
                      }`}
                    >
                      {child.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </li>
    );
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-sidebar-bg border-r border-border flex flex-col transition-[width] duration-300 ease-in-out z-50 ${
        collapsed ? "w-16" : "w-52"
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-border overflow-hidden">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm shrink-0">
          S
        </div>
        <span
          className={`ml-3 font-semibold text-foreground whitespace-nowrap transition-[opacity,transform] duration-300 ease-in-out ${
            collapsed ? "opacity-0 -translate-x-2" : "opacity-100 translate-x-0"
          }`}
        >
          管理后台
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2">
        <ul className="space-y-2">{navItems.map(renderItem)}</ul>
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="absolute top-1/2 right-0 translate-x-full -translate-y-1/2 w-4 h-14 flex items-center justify-center rounded-r-full bg-sidebar-bg border border-l-0 border-border text-(--muted) hover:bg-(--hover-bg) hover:text-foreground transition-colors z-10"
        title={collapsed ? "展开" : "收起"}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
}
