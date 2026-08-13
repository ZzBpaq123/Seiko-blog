import type { Metadata } from "next";
import Image from "next/image";
import PostCard from "@/components/PostCard";
import TagCloud from "@/components/TagCloud";
import { getPostList, getTagCounts } from "@/api/post";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "文章 - Seiko Blog",
  description: "浏览所有博客文章",
};

export const revalidate = 300;

const PAGE_SIZE = 8;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Math.max(Number(page) || 1, 1);

  const [listRes, tagCountsRes] = await Promise.all([
    getPostList({ page: currentPage, size: PAGE_SIZE }).catch(() => null),
    getTagCounts().catch(() => null),
  ]);

  const pageResult = listRes ?? {
    records: [],
    total: 0,
    current: currentPage,
    size: PAGE_SIZE,
    pages: 0,
  };

  const pagePosts = pageResult.records;
  const totalPages = Math.max(pageResult.pages, 1);
  const tagCounts = tagCountsRes ?? [];

  return (
    <main className="-mt-14 min-h-screen bg-white dark:bg-zinc-950">
      {/* Hero Section */}
      <section
        className="relative flex h-[80vh] flex-col bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("/article_bg.jpg")' }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30" />
        {/* Content */}
        <div className="relative z-10 flex flex-1 items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white drop-shadow-lg sm:text-5xl">
              文章列表
            </h1>
            <p className="mt-3 text-lg text-white/80 drop-shadow">
              共 {pageResult.total} 篇文章
            </p>
          </div>
        </div>
        {/* Banner Waves at Bottom */}
        <div className="relative z-10 w-full leading-0 overflow-hidden">
          <div className="animate-wave-slow flex w-[200%]">
            <Image
              src="/bannerWave2.png"
              alt=""
              width={1920}
              height={200}
              quality={100}
              className="block w-1/2 h-15"
              priority
              unoptimized
            />
            <Image
              src="/bannerWave2.png"
              alt=""
              width={1920}
              height={200}
              quality={100}
              className="block w-1/2 h-15"
              priority
              unoptimized
            />
          </div>
          <div className="absolute bottom-0 left-0 flex w-[200%] animate-wave-fast">
            <Image
              src="/bannerWave1.png"
              alt=""
              width={1920}
              height={200}
              quality={100}
              className="block w-1/2 h-15"
              priority
              unoptimized
            />
            <Image
              src="/bannerWave1.png"
              alt=""
              width={1920}
              height={200}
              quality={100}
              className="block w-1/2 h-15"
              priority
              unoptimized
            />
          </div>
        </div>
      </section>

      {/* Main Content - Two Column Layout */}
      <section className="relative overflow-hidden bg-white px-4 py-10">
        <div className="relative mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
            {/* Left Column - Posts List */}
            <div>
              {/* Posts List */}
              <div>
                {pagePosts.length > 0 ? (
                  <div className="grid gap-6">
                    {pagePosts.map((post, i) => (
                      <PostCard key={post.slug} post={post} index={i} />
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <p className="text-zinc-500 dark:text-zinc-400">暂无文章</p>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-2">
                    <Link
                      href={`/blog?page=${currentPage - 1}`}
                      aria-disabled={currentPage === 1}
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border text-sm transition-colors ${
                        currentPage === 1
                          ? "pointer-events-none border-pink-100 text-pink-200 dark:border-pink-900/30 dark:text-pink-800"
                          : "border-pink-200 text-pink-400 hover:bg-pink-50 hover:border-pink-300 hover:text-pink-500 dark:border-pink-900/50 dark:text-pink-400 dark:hover:bg-pink-950/30"
                      }`}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Link>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (p) => (
                        <Link
                          key={p}
                          href={`/blog?page=${p}`}
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
                      href={`/blog?page=${currentPage + 1}`}
                      aria-disabled={currentPage === totalPages}
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border text-sm transition-colors ${
                        currentPage === totalPages
                          ? "pointer-events-none border-pink-100 text-pink-200 dark:border-pink-900/30 dark:text-pink-800"
                          : "border-pink-200 text-pink-400 hover:bg-pink-50 hover:border-pink-300 hover:text-pink-500 dark:border-pink-900/50 dark:text-pink-400 dark:hover:bg-pink-950/30"
                      }`}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Tag Cloud */}
            <aside className="space-y-6">
              <TagCloud tagCounts={tagCounts} />
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
