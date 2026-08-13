"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
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
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

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
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/15 text-primary"
                      : "text-(--muted) hover:bg-primary/10 hover:text-primary"
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span
                    className={`whitespace-nowrap transition-[opacity,transform] duration-300 ease-in-out ${
                      collapsed ? "opacity-0 -translate-x-2" : "opacity-100 translate-x-0"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
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
