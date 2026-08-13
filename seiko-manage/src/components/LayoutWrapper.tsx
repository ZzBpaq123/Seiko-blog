"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { ConfirmProvider } from "./ConfirmDialog";
import { PromptProvider } from "./PromptDialog";
import { getToken } from "@/api/user";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/login";

  // 未登录跳转到登录页；登录态过期事件同样跳转
  useEffect(() => {
    if (!isLoginPage && !getToken()) {
      router.replace("/login");
    }
    const onUnauthorized = () => router.replace("/login");
    window.addEventListener("unauthorized", onUnauthorized);
    return () => window.removeEventListener("unauthorized", onUnauthorized);
  }, [isLoginPage, pathname, router]);

  // 登录页使用独立的全屏布局，不渲染侧边栏/顶栏
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <ConfirmProvider>
      <PromptProvider>
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        <div
          className="min-h-screen flex flex-col transition-[margin] duration-300 ease-in-out"
          style={{ marginLeft: collapsed ? "64px" : "var(--sidebar-width)" }}
        >
          <Header />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </PromptProvider>
    </ConfirmProvider>
  );
}
