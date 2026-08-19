"use client";

import { User, LogOut, Palette, Check, Sun, Moon, KeyRound } from "lucide-react";
import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { logout, getStoredUser, resetUserPassword } from "@/api/user";
import { usePrompt } from "@/components/PromptDialog";
import { notifyError, notifySuccess } from "@/utils/toast";
import Breadcrumb from "./Breadcrumb";

const THEME_COLORS = [
  { name: "草莓粉", primary: "#e06b80", hover: "#c84e65" },
  { name: "樱花粉", primary: "#e88fa3", hover: "#d06b82" },
  { name: "蜜桃橙", primary: "#e89570", hover: "#d07350" },
  { name: "奶油黄", primary: "#e0c45a", hover: "#c8a83a" },
  { name: "薄荷绿", primary: "#5fc7ad", hover: "#44a892" },
  { name: "抹茶绿", primary: "#7db89f", hover: "#609a82" },
  { name: "天空蓝", primary: "#52a5e0", hover: "#3888c2" },
  { name: "薰衣草", primary: "#8880cc", hover: "#6b63b0" },
];

const DEFAULT_COLOR = THEME_COLORS[0].primary;

const colorListeners = new Set<() => void>();

function subscribeColor(callback: () => void) {
  colorListeners.add(callback);
  return () => colorListeners.delete(callback);
}

function getColorSnapshot() {
  if (typeof window === "undefined") return DEFAULT_COLOR;
  return localStorage.getItem("themeColor") || DEFAULT_COLOR;
}

function getColorServerSnapshot() {
  return DEFAULT_COLOR;
}

function setStoredColor(color: string) {
  localStorage.setItem("themeColor", color);
  colorListeners.forEach((cb) => cb());
}

function useThemeColor() {
  return useSyncExternalStore(subscribeColor, getColorSnapshot, getColorServerSnapshot);
}

function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

function getContrastColor(hex: string) {
  const normalized = hex.replace("#", "");
  const r = parseInt(normalized.substring(0, 2), 16);
  const g = parseInt(normalized.substring(2, 4), 16);
  const b = parseInt(normalized.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#1f2937" : "#ffffff";
}

export default function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const currentColor = useThemeColor();
  const mounted = useMounted();
  const { resolvedTheme, setTheme } = useTheme();
  const menuRef = useRef<HTMLDivElement>(null);
  const colorRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const prompt = usePrompt();

  // 同步主题色 CSS 变量（暗色模式由 next-themes 统一管理）
  useEffect(() => {
    const theme = THEME_COLORS.find((c) => c.primary === currentColor);
    if (theme) {
      document.documentElement.style.setProperty("--primary", theme.primary);
      document.documentElement.style.setProperty("--primary-hover", theme.hover);
      document.documentElement.style.setProperty("--primary-foreground", getContrastColor(theme.primary));
    }
  }, [currentColor]);

  useEffect(() => {
    if (!showUserMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserMenu]);

  useEffect(() => {
    if (!showColorMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (colorRef.current && !colorRef.current.contains(e.target as Node)) {
        setShowColorMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showColorMenu]);

  const handleSelectColor = (primary: string) => {
    setStoredColor(primary);
    setShowColorMenu(false);
  };

  const toggleDarkMode = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const isDark = resolvedTheme === "dark";

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const handleResetPassword = async () => {
    const currentUser = getStoredUser();
    if (!currentUser?.id) {
      notifyError("未获取到当前登录用户信息");
      return;
    }

    const newPassword = await prompt({
      title: "重置密码",
      message: "请输入新密码（6-20位）",
      placeholder: "请输入新密码",
      confirmPlaceholder: "请再次输入新密码",
      mismatchMessage: "两次输入的密码不一致",
      type: "password",
      confirmText: "确认重置",
    });
    if (!newPassword) return;

    setResettingPassword(true);
    try {
      await resetUserPassword(currentUser.id, newPassword);
      notifySuccess("密码重置成功");
      setShowUserMenu(false);
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "密码重置失败");
    } finally {
      setResettingPassword(false);
    }
  };

  return (
    <header className="h-(--header-height) bg-card-bg border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Left: 面包屑导航 */}
      <Breadcrumb />

      {/* Right */}
      <div className="flex items-center gap-4 mr-6">
        {/* 白天/黑夜切换 */}
        <button
          onClick={toggleDarkMode}
          className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-(--hover-bg) text-(--muted) transition-colors"
          title={isDark ? "切换到白天模式" : "切换到黑夜模式"}
          suppressHydrationWarning
        >
          {mounted ? (isDark ? <Sun size={18} /> : <Moon size={18} />) : <Sun size={18} />}
        </button>

        {/* 主题颜色切换 */}
        <div className="relative" ref={colorRef}>
          <button
            onClick={() => setShowColorMenu(!showColorMenu)}
            className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-(--hover-bg) transition-colors"
            title="切换主题颜色"
          >
            <Palette size={18} style={{ color: currentColor }} />
          </button>

          {showColorMenu && (
            <div className="absolute right-0 top-full mt-1.5 w-max bg-card-bg border border-border rounded-lg shadow-lg p-3">
              <p className="text-xs text-(--muted) mb-2 px-1">主题颜色</p>
              <div className="grid grid-cols-4 gap-2">
                {THEME_COLORS.map((c) => (
                  <button
                    key={c.primary}
                    onClick={() => handleSelectColor(c.primary)}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                    style={{ backgroundColor: c.primary }}
                    title={c.name}
                  >
                    {currentColor === c.primary && (
                      <Check size={16} style={{ color: getContrastColor(c.primary) }} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-(--hover-bg) transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <User size={16} />
            </div>
            <span className="text-sm font-medium text-foreground">管理员</span>
          </button>

          {showUserMenu && (
            <div className="absolute -right-2 top-full mt-1.5 min-w-full w-max bg-card-bg border border-border rounded-lg shadow-lg py-1">
              <button
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-(--hover-bg) transition-colors whitespace-nowrap disabled:opacity-50"
                onClick={handleResetPassword}
                disabled={resettingPassword}
              >
                {resettingPassword ? (
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <KeyRound size={16} />
                )}
                重置密码
              </button>
              <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors whitespace-nowrap" onClick={handleLogout}>
                <LogOut size={16} />
                退出登录
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
