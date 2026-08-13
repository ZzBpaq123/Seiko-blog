import type { Metadata } from "next";
import "./globals.css";
import "react-image-crop/dist/ReactCrop.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import { ThemeProvider } from "@/components/ThemeProvider";
import Toast from "@/components/Toast";

export const metadata: Metadata = {
  title: "Seiko 管理后台",
  description: "Seiko Blog 后台管理系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" storageKey="themeMode" enableSystem={false}>
          <LayoutWrapper>{children}</LayoutWrapper>
          <Toast />
        </ThemeProvider>
      </body>
    </html>
  );
}
