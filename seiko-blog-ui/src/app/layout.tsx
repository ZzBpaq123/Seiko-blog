import type { Metadata } from "next";
import { Geist, Geist_Mono, ZCOOL_KuaiLe } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const zcoolKuaiLe = ZCOOL_KuaiLe({
  variable: "--font-zcool-kuaile",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Seiko Blog - 个人博客",
  description: "一个简洁优雅的个人博客，分享技术、生活与思考",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${zcoolKuaiLe.variable} antialiased min-h-screen flex flex-col`}
      >
        <Header />
        <main className="flex-1 pt-14 pb-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
