import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  User,
  Clock,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import PostCard from "@/components/PostCard";
import { getPostList } from "@/api/post";
import type { PostVO } from "@/api/types";
import Typewriter from "@/components/Typewriter";
import NoticeCarousel from "@/components/NoticeCarousel";
import RunningTime from "@/components/RunningTime";
import TechSphere from "@/components/TechSphere";
import LatestComments from "@/components/LatestComments";

export const metadata: Metadata = {
  title: "首页 - Seiko Blog",
  description: "Seiko 的个人博客首页，分享技术、生活与思考",
};

// ISR：整页缓存 5 分钟，与后端阅读量刷库周期对齐
export const revalidate = 300;

const PAGE_SIZE = 6;
const SITE_START_DATE = "2026-01-01";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Math.max(Number(page) || 1, 1);

  // 并行获取推荐文章和当前页文章列表
  const [recommendRes, listRes] = await Promise.all([
    getPostList({ page: 1, size: 3 }).catch(() => null),
    getPostList({ page: currentPage, size: PAGE_SIZE }).catch(() => null),
  ]);

  const recommendPosts = recommendRes?.records ?? [];

  const pageResult = listRes ?? {
    records: [],
    total: 0,
    current: currentPage,
    size: PAGE_SIZE,
    pages: 0,
  };

  const pagePosts = pageResult.records;
  const totalPages = Math.max(pageResult.pages, 1);

  return (
    <main className="-mt-14 min-h-screen bg-zinc-50 dark:bg-black">
      {/* Hero Section - Full Screen Background */}
      <section
        className="relative flex h-[70vh] flex-col bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("/home_bg.jpg")',
        }}
      >
        {/* Content */}
        <div className="relative z-10 flex flex-1 items-center justify-center px-4">
          <div className="mx-auto max-w-4xl text-center">
            <p
              className="inline-block min-h-[1.2em] text-2xl font-medium tracking-wide text-white/95 sm:text-3xl md:text-4xl drop-shadow-lg"
              style={{ fontFamily: "var(--font-zcool-kuaile)" }}
            >
              <Typewriter
                text="以代码为笔，以逻辑为墨，用技术丈量世界。"
                typingSpeed={120}
                deletingSpeed={100}
                pauseDuration={2500}
              />
            </p>
          </div>
        </div>

        {/* Banner Waves at Bottom */}
        <div className="relative z-10 w-full leading-0 overflow-hidden">
          {/* 底层波浪 - 慢速 */}
          <div className="animate-wave-slow flex w-[200%]">
            <Image
              src="/bannerWave2.png"
              alt=""
              width={1920}
              height={200}
              quality={100}
              className="block w-1/2 h-20"
              priority
              unoptimized
            />
            <Image
              src="/bannerWave2.png"
              alt=""
              width={1920}
              height={200}
              quality={100}
              className="block w-1/2 h-20"
              priority
              unoptimized
            />
          </div>
          {/* 上层波浪 - 快速 */}
          <div className="absolute bottom-0 left-0 flex w-[200%] animate-wave-fast">
            <Image
              src="/bannerWave1.png"
              alt=""
              width={1920}
              height={200}
              quality={100}
              className="block w-1/2 h-20"
              priority
              unoptimized
            />
            <Image
              src="/bannerWave1.png"
              alt=""
              width={1920}
              height={200}
              quality={100}
              className="block w-1/2 h-20"
              priority
              unoptimized
            />
          </div>
        </div>

        {/* Scroll Down Indicator */}
        <a
          href="#posts"
          className="absolute bottom-24 left-1/2 z-30 -translate-x-1/2 animate-bounce"
          aria-label="向下滚动"
        >
          <ChevronDown className="h-8 w-8 text-white drop-shadow-lg" />
        </a>
      </section>

      {/* Main Content - Two Column Layout */}
      <section
        id="posts"
        className="relative overflow-hidden bg-white px-4 py-10"
      >
        {/* Decorative Hanging Elements - Macaron Colors */}
        <div className="pointer-events-none absolute inset-0 hidden lg:block">
          {/* Left side decorations - spread out vertically */}
          <div className="absolute left-[13%] top-4 origin-top animate-swing-slow">
            <div className="h-20 w-px bg-linear-to-t from-zinc-300 to-transparent dark:from-zinc-700" />
            <div className="-ml-2 mt-0 h-4 w-4 rounded-full bg-macaron-pink shadow-lg" />
          </div>
          <div className="absolute left-[9%] top-28 origin-top animate-swing-medium">
            <div className="h-28 w-px bg-linear-to-t from-zinc-300 to-transparent dark:from-zinc-700" />
            <svg
              className="-ml-3 mt-0 h-6 w-6 text-macaron-peach drop-shadow-lg"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <div className="absolute left-[5%] top-56 origin-top animate-swing-slow">
            <div className="h-24 w-px bg-linear-to-t from-zinc-300 to-transparent dark:from-zinc-700" />
            <div className="-ml-2.5 mt-0 h-5 w-5 rounded-full bg-macaron-mint shadow-lg" />
          </div>

          {/* Right side decorations - spread out vertically */}
          <div className="absolute right-[3%] top-8 origin-top animate-swing-medium">
            <div className="h-24 w-px bg-gradient-to-t from-zinc-300 to-transparent dark:from-zinc-700" />
            <svg
              className="-ml-3 mt-0 h-6 w-6 text-macaron-sage drop-shadow-lg"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <div className="absolute right-[10%] top-36 origin-top animate-swing-slow">
            <div className="h-20 w-px bg-linear-to-t from-zinc-300 to-transparent dark:from-zinc-700" />
            <div className="-ml-2 mt-0 h-4 w-4 rounded-full bg-macaron-lime shadow-lg" />
          </div>
          <div className="absolute right-[6%] top-64 origin-top animate-swing-medium">
            <div className="h-28 w-px bg-linear-to-t from-zinc-300 to-transparent dark:from-zinc-700" />
            <svg
              className="-ml-2.5 mt-0 h-5 w-5 text-macaron-lavender drop-shadow-lg"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>

          {/* Additional floating elements - more spread out */}
          <div className="absolute left-[10%] top-80 origin-top animate-swing-fast">
            <div className="h-16 w-px bg-linear-to-t from-zinc-200 to-transparent dark:from-zinc-800" />
            <div className="-ml-1.5 mt-0 h-3 w-3 rounded-full bg-macaron-coral shadow-md" />
          </div>
          <div className="absolute right-[12%] top-96 origin-top animate-swing-fast">
            <div className="h-18 w-px bg-linear-to-t from-zinc-200 to-transparent dark:from-zinc-800" />
            <svg
              className="-ml-2 mt-0 h-4 w-4 text-macaron-rose drop-shadow-md"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
        </div>

        <div className="relative mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
            {/* Left Column - Notice & Posts */}
            <div className="space-y-8">
              {/* Notice Section */}
              <div>
                <NoticeCarousel />
              </div>

              {/* Posts Section */}
              <div>
                {pagePosts.length > 0 ? (
                  <div className="grid gap-6">
                    {pagePosts.map((post, i) => (
                      <PostCard key={post.slug} post={post} index={i} />
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-zinc-500 dark:text-zinc-400">
                    暂无文章
                  </p>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-2">
                    <Link
                      href={`/?page=${currentPage - 1}#posts`}
                      aria-disabled={currentPage === 1}
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border text-sm transition-colors ${
                        currentPage === 1
                          ? "pointer-events-none border-pink-100 text-pink-200 dark:border-pink-900/30 dark:text-pink-800"
                          : "border-pink-200 text-pink-400 hover:bg-pink-50 hover:border-pink-300 hover:text-pink-500 dark:border-pink-900/50 dark:text-pink-400 dark:hover:bg-pink-950/30"
                      }`}
                    >
                      ‹
                    </Link>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (p) => (
                        <Link
                          key={p}
                          href={`/?page=${p}#posts`}
                          className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border text-sm transition-colors ${
                            p === currentPage
                              ? "border-rose-300 bg-rose-300 text-white shadow-sm shadow-pink-200 dark:shadow-pink-900/30"
                              : "border-pink-200 text-pink-400 hover:bg-pink-50 hover:border-pink-300 hover:text-pink-500 dark:border-pink-900/50 dark:text-pink-400 dark:hover:bg-pink-950/30"
                          }`}
                        >
                          {p}
                        </Link>
                      ),
                    )}

                    <Link
                      href={`/?page=${currentPage + 1}#posts`}
                      aria-disabled={currentPage === totalPages}
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border text-sm transition-colors ${
                        currentPage === totalPages
                          ? "pointer-events-none border-pink-100 text-pink-200 dark:border-pink-900/30 dark:text-pink-800"
                          : "border-pink-200 text-pink-400 hover:bg-pink-50 hover:border-pink-300 hover:text-pink-500 dark:border-pink-900/50 dark:text-pink-400 dark:hover:bg-pink-950/30"
                      }`}
                    >
                      ›
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Profile Card & Running Days */}
            <aside className="space-y-6">
              {/* Profile Card */}
              <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                {/* Background Image - Full card with gradient fade */}
                <div
                  className="absolute inset-0 bg-cover bg-top bg-no-repeat"
                  style={{
                    backgroundImage: 'url("/info_bg.jpg")',
                  }}
                />
                {/* Gradient Overlay - Smooth fade from image to card background */}
                <div className="absolute inset-0 bg-linear-to-b from-white/10 via-white/70 to-white dark:from-zinc-900/10 dark:via-zinc-900/70 dark:to-zinc-900" />

                {/* Content */}
                <div className="relative z-10">
                  {/* Avatar & Name */}
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4 h-24 w-24 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <User className="h-full w-full text-zinc-300 dark:text-zinc-600" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                      Seiko
                    </h3>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      再渺小的星光，也有属于他的光芒!
                    </p>
                  </div>

                  {/* Social Links Divider */}
                  <div className="mt-8 flex items-center gap-3">
                    <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                      社交账号
                    </span>
                    <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
                  </div>

                  {/* Social Links */}
                  <div className="mt-4 flex justify-center gap-4">
                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-zinc-100 p-2.5 text-zinc-600 transition-colors hover:bg-zinc-200 hover:text-zinc-900 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
                      aria-label="GitHub"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </a>
                    <a
                      href="https://gitee.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-zinc-100 p-2.5 text-zinc-600 transition-colors hover:bg-zinc-200 hover:text-zinc-900 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
                      aria-label="Gitee"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M11.984 0A12.002 12.002 0 0 0 0 12a12.002 12.002 0 0 0 12 12 12.002 12.002 0 0 0 12-12A12.002 12.002 0 0 0 12 0a12.002 12.002 0 0 0-.016 0zm6.513 5.4a3.6 3.6 0 0 1 3.6 3.6 3.6 3.6 0 0 1-3.6 3.6 3.6 3.6 0 0 1-3.6-3.6 3.6 3.6 0 0 1 3.6-3.6zm-6.6 1.2a3.6 3.6 0 0 1 3.6 3.6 3.6 3.6 0 0 1-3.6 3.6 3.6 3.6 0 0 1-3.6-3.6 3.6 3.6 0 0 1 3.6-3.6z" />
                      </svg>
                    </a>
                    <a
                      href="https://wpa.qq.com/msgrd?v=3&uin=123456789&site=qq&menu=yes"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-zinc-100 p-2.5 text-zinc-600 transition-colors hover:bg-zinc-200 hover:text-zinc-900 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
                      aria-label="QQ"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12.003 2c-2.265 0-6.29 1.364-6.29 7.325v1.195S3.55 14.96 3.55 17.474c0 .665.17 1.025.281 1.025.114 0 .902-.484 1.748-2.072 0 0-.18 2.197 1.904 3.967 0 0-1.77.495-1.77 1.182 0 .686 4.078.43 6.29.43 2.21 0 6.287.257 6.287-.43 0-.687-1.768-1.182-1.768-1.182 2.085-1.77 1.905-3.967 1.905-3.967.845 1.588 1.634 2.072 1.746 2.072.111 0 .283-.36.283-1.025 0-2.514-2.166-6.954-2.166-6.954V9.325C18.29 3.364 14.268 2 12.003 2z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              {/* Running Days Card */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-4 w-4 text-rose-400" />
                  <span className="text-base text-rose-400">网站运营</span>
                </div>
                <RunningTime startDate={SITE_START_DATE} />
              </div>

              {/* Recommended Posts Card */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  <span className="text-base text-emerald-400">推荐文章</span>
                </div>
                <div className="space-y-3">
                  {recommendPosts.map((post: PostVO) => (
                    <Link
                      key={post.slug}
                      href={`/blog/${post.slug}`}
                      className="group relative block h-24 overflow-hidden rounded-xl"
                    >
                      {/* 封面图 */}
                      {post.cover ? (
                        <Image
                          src={post.cover}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-linear-to-br from-zinc-300 to-zinc-400 dark:from-zinc-700 dark:to-zinc-600" />
                      )}
                      {/* 底部渐变遮罩 + 标题 */}
                      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
                      <span className="absolute bottom-0 left-0 right-0 px-3 py-2 text-xs font-medium text-white line-clamp-2 leading-snug">
                        {post.title}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Latest Comments Card */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="h-4 w-4 text-indigo-300" />
                  <span className="text-base text-indigo-300">最新评论</span>
                </div>
                <LatestComments />
              </div>

              {/* Tech Sphere Card */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <TechSphere />
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
