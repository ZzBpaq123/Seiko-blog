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
  type LucideIcon,
} from "lucide-react";

export interface NavChild {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  children?: NavChild[];
}

/** 侧边栏菜单与面包屑共用的导航配置 */
export const navItems: NavItem[] = [
  { label: "仪表盘", href: "/", icon: LayoutDashboard },
  { label: "文章管理", href: "/posts", icon: FileText },
  { label: "标签管理", href: "/tags", icon: Tag },
  { label: "评论管理", href: "/comments", icon: MessageSquare },
  { label: "足迹管理", href: "/footprints", icon: MapPin },
  { label: "相册管理", href: "/photos", icon: ImageIcon },
  { label: "公告管理", href: "/notices", icon: Megaphone },
  { label: "书籍管理", href: "/books", icon: BookOpen },
  { label: "电影管理", href: "/movies", icon: Film },
  { label: "资源管理", href: "/resources", icon: Link2 },
  {
    label: "系统管理",
    icon: Settings,
    children: [
      { label: "用户管理", href: "/users", icon: Users },
      { label: "日志管理", href: "/logs", icon: ScrollText },
      { label: "字典管理", href: "/dicts", icon: BookMarked },
    ],
  },
];
