"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import {
  Home,
  FileText,
  Camera,
  MapPin,
  Globe,
  BookOpen,
  Film,
  Gamepad2,
  Link2,
  CircleAlert,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import {
  pageHeaderStyles,
  defaultHeaderStyle,
  getPageStyle,
} from "@/styles/pageStyles";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  children?: NavItem[];
}

interface HeaderProps {
  overlayMode?: boolean;
}

export default function Header({ overlayMode = false }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const lastScrollY = useRef(0);
  const pathname = usePathname();
  const router = useRouter();
  const pageStyle = getPageStyle(
    pathname,
    pageHeaderStyles,
    defaultHeaderStyle,
  );
  const isDarkHeroPage = ["/", "/blog", "/explore/movie", "/explore/game"].includes(pathname);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const handleGalleryClick = () => {
    if (pathname === "/gallery") return;
    router.push("/gallery");
  };

  const getNavClass = (href: string, mobile = false) => {
    const active = isActive(href);
    const base = `flex items-center gap-3 text-lg font-medium  whitespace-nowrap transition-colors${mobile ? " py-4" : " pb-1"}`;

    if (overlayMode) {
      return `${base} ${active ? "text-white border-b-2 border-white" : "text-white/90 hover:text-white"}`;
    }

    if (isDarkHeroPage) {
      if (isScrolled)
        return `${base} ${active ? "text-zinc-900 border-b-2 border-zinc-900" : "text-zinc-600 hover:text-zinc-900"}`;
      return `${base} ${active ? "text-white border-b-2 border-white" : "text-white/90 hover:text-white"}`;
    }
    const textColor = pageStyle.text.includes("dark:")
      ? pageStyle.text.split(" ")[0]
      : pageStyle.text;
    const darkTextColor = pageStyle.text.includes("dark:")
      ? pageStyle.text.split("dark:")[1]
      : pageStyle.text;
    return `${base} ${
      active
        ? `${textColor} border-b-2 border-current dark:${darkTextColor}`
        : `${textColor} hover:opacity-80 dark:${darkTextColor} dark:hover:opacity-80`
    }`;
  };

  const getDropdownItemClass = (href: string) => {
    const active = isActive(href);
    const base = "block px-4 py-2 text-lg font-medium";

    if (overlayMode) {
      return `${base} ${active ? "text-white bg-white/20" : "text-white/90 hover:text-white hover:bg-white/10"}`;
    }

    if (isDarkHeroPage) {
      if (isScrolled)
        return `${base} ${active ? "text-zinc-900 bg-zinc-100/50" : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/30"}`;
      return `${base} ${active ? "text-white underline decoration-2 underline-offset-4" : "text-white/90 hover:text-white hover:bg-white/10"}`;
    }

    const textColor = pageStyle.text.includes("dark:")
      ? pageStyle.text.split(" ")[0]
      : pageStyle.text;
    const darkTextColor = pageStyle.text.includes("dark:")
      ? pageStyle.text.split("dark:")[1]
      : pageStyle.text;

    return `${base} ${
      active
        ? `${textColor} bg-white/20 dark:${darkTextColor} dark:bg-white/10`
        : `${textColor} hover:opacity-80 dark:${darkTextColor} dark:hover:opacity-80`
    }`;
  };

  const navItems: NavItem[] = [
    { href: "/", label: "首页", icon: <Home className="w-6 h-6" /> },
    { href: "/blog", label: "文章", icon: <FileText className="w-6 h-6" /> },
    { href: "/gallery", label: "相册", icon: <Camera className="w-6 h-6" /> },
    { href: "/footprint", label: "足迹", icon: <MapPin className="w-6 h-6" /> },
    {
      href: "/explore",
      label: "探索",
      icon: <Globe className="w-6 h-6" />,
      children: [
        // {
        //   href: "/explore/music",
        //   label: "音乐",
        //   icon: <Music className="w-5 h-5" />,
        // },
        {
          href: "/explore/book",
          label: "书籍",
          icon: <BookOpen className="w-5 h-5" />,
        },
        {
          href: "/explore/movie",
          label: "影视",
          icon: <Film className="w-5 h-5" />,
        },
        {
          href: "/explore/game",
          label: "游戏",
          icon: <Gamepad2 className="w-5 h-5" />,
        },
        {
          href: "/explore/resource",
          label: "资源",
          icon: <Link2 className="w-5 h-5" />,
        },
      ],
    },
    { href: "/about/myself", label: "关于", icon: <CircleAlert className="w-6 h-6" /> },
  ];

  useEffect(() => {
    if (overlayMode) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 50);
      if (currentScrollY < lastScrollY.current || currentScrollY < 100) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [overlayMode]);

  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []);

  const headerBg = overlayMode
    ? "bg-transparent"
    : isScrolled && pageStyle.scrolledBg
      ? pageStyle.scrolledBg
      : pageStyle.bg;

  const logoColor = overlayMode
    ? "text-white"
    : isDarkHeroPage
      ? isScrolled
        ? "text-zinc-900"
        : "text-white"
      : pageStyle.text;

  const mobileBtnColor = overlayMode
    ? "text-white"
    : isDarkHeroPage
      ? isScrolled
        ? "text-zinc-600"
        : "text-white"
      : pageStyle.text;

  const mobilePanelBg = overlayMode
    ? "border-white/20 bg-black/60 backdrop-blur-md"
    : isDarkHeroPage
      ? isScrolled
        ? "border-zinc-200/50 bg-white/90 backdrop-blur-md"
        : "border-white/20 bg-black/60 backdrop-blur-md"
      : `${pageStyle.bg.replace("/80", "/95").replace("/50", "/95")} border-zinc-200/50`;

  const dropdownBg = overlayMode
    ? "bg-white/10 backdrop-blur-md"
    : isScrolled && pageStyle.scrolledBg
      ? pageStyle.scrolledBg
      : pageStyle.bg;

  const getMobileChildClass = (href: string) => {
    const active = isActive(href);
    if (overlayMode) {
      return active ? "text-white font-medium" : "text-white/80";
    }
    if (isDarkHeroPage) {
      return active
        ? isScrolled
          ? "text-zinc-900 font-medium"
          : "text-white font-medium"
        : isScrolled
          ? "text-zinc-600"
          : "text-white/80";
    }
    return active
      ? "text-zinc-900 dark:text-zinc-100 font-medium"
      : "text-zinc-600 dark:text-zinc-400";
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 z-50 w-full transition-transform duration-300 ${
          overlayMode || isVisible ? "translate-y-0" : "-translate-y-full"
        } ${headerBg}`}
      >
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link
            href="/"
            className={`text-3xl font-bold transition-colors ${logoColor}`}
          >
            <span className="logo-wave-text">
              {"Seiko Blog".split("").map((char, i) => (
                <span
                  key={i}
                  style={{ "--delay": `${i * 0.05}s` } as React.CSSProperties}
                >
                  {char === " " ? " " : char}
                </span>
              ))}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-10">
            {navItems.map((item) => (
              <div
                key={item.href}
                className="relative"
                ref={item.children ? dropdownRef : undefined}
                onMouseEnter={() => {
                  if (item.children) {
                    if (dropdownTimeoutRef.current) {
                      clearTimeout(dropdownTimeoutRef.current);
                      dropdownTimeoutRef.current = null;
                    }
                    setOpenDropdown(item.href);
                  }
                }}
                onMouseLeave={() => {
                  if (item.children) {
                    dropdownTimeoutRef.current = setTimeout(() => {
                      setOpenDropdown(null);
                    }, 200);
                  }
                }}
              >
                {item.children ? (
                  <>
                    <button
                      className={`${getNavClass(item.href)} flex items-center gap-1`}
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === item.href ? null : item.href,
                        )
                      }
                    >
                      {item.icon}
                      <span>{item.label}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${openDropdown === item.href ? "rotate-180" : ""}`}
                      />
                    </button>
                    {openDropdown === item.href && (
                      <div
                        className={`absolute top-full left-0 mt-1 w-28 rounded-lg overflow-hidden ${dropdownBg}`}
                        onMouseEnter={() => {
                          if (dropdownTimeoutRef.current) {
                            clearTimeout(dropdownTimeoutRef.current);
                            dropdownTimeoutRef.current = null;
                          }
                        }}
                        onMouseLeave={() => {
                          dropdownTimeoutRef.current = setTimeout(() => {
                            setOpenDropdown(null);
                          }, 200);
                        }}
                      >
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={getDropdownItemClass(child.href)}
                            onClick={() => setOpenDropdown(null)}
                          >
                            <span className="inline-flex items-center gap-2">
                              {child.icon}
                              {child.label}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : item.href === "/gallery" ? (
                  <button
                    onClick={handleGalleryClick}
                    className={getNavClass(item.href)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ) : (
                  <Link href={item.href} className={getNavClass(item.href)}>
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                )}
              </div>
            ))}
          </nav>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden p-2 ${mobileBtnColor}`}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {isMenuOpen && (
          <div className={`md:hidden border-t px-4 py-2 ${mobilePanelBg}`}>
            <nav className="flex flex-col">
              {navItems.map((item) => (
                <div key={item.href}>
                  {item.children ? (
                    <>
                      <button
                        onClick={() =>
                          setOpenDropdown(
                            openDropdown === item.href ? null : item.href,
                          )
                        }
                        className={`${getNavClass(item.href, true)} w-full justify-between`}
                      >
                        <span className="flex items-center gap-3">
                          {item.icon}
                          {item.label}
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 transition-transform ${openDropdown === item.href ? "rotate-180" : ""}`}
                        />
                      </button>
                      {openDropdown === item.href && (
                        <div className="pl-11 py-1">
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => {
                                setOpenDropdown(null);
                                setIsMenuOpen(false);
                              }}
                              className={`flex items-center gap-3 py-2 text-base ${getMobileChildClass(child.href)}`}
                            >
                              {child.icon}
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : item.href === "/gallery" ? (
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleGalleryClick();
                      }}
                      className={getNavClass(item.href, true)}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={getNavClass(item.href, true)}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
