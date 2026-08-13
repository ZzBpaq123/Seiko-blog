import type { Metadata } from "next";
import { getPostBySlug } from "@/api/post";
import { Calendar, Flame, Bookmark, User } from "lucide-react";
import { notFound } from "next/navigation";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import TableOfContents from "@/components/TableOfContents";
import AiSummary from "@/components/AiSummary";
import ReadingFloatButtons from "@/components/ReadingFloatButtons";
import CommentSection from "@/components/CommentSection";
import { extractHeadings } from "@/utils/toc";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// ISR：文章页按需渲染后缓存 5 分钟，新文章最长 5 分钟内可见
export const revalidate = 300;

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug).catch(() => null);

  if (!post) {
    return {
      title: "文章未找到 - Seiko Blog",
    };
  }

  return {
    title: `${post.title} - Seiko Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug).catch(() => null);

  if (!post) {
    notFound();
  }

  const headings = extractHeadings(post.content);

  return (
    <>
      <main className="-mt-14 min-h-screen bg-linear-to-b from-pink-50/50 to-white px-4 pt-20 dark:from-pink-950/60 dark:to-zinc-950">
        <div className="mx-auto max-w-7xl">
          <div className="flex justify-center gap-6 pt-8">
            {/* 桌面端左侧目录：与文章内容顶部对齐 */}
            <aside className="hidden w-60 shrink-0 lg:block">
              <div className="sticky top-20">
                <TableOfContents headings={headings} />
              </div>
            </aside>

            {/* 内容区域：保持 max-w-5xl 不变 */}
            <div className="w-full max-w-5xl">
              {/* AI 总结 */}
              <AiSummary />

              {/* Article */}
              <article className="rounded-lg border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
                {/* Header */}
                <header className="mb-8 border-b border-zinc-200 pb-8 dark:border-zinc-800">
                  <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-4xl">
                    {post.title}
                  </h1>
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                    <span className="inline-flex items-center gap-1 text-sky-500 dark:text-sky-400">
                      <Calendar className="h-4 w-4" />
                      <time dateTime={post.date}>{post.date}</time>
                    </span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1 text-rose-500 dark:text-rose-400">
                      <Flame className="h-4 w-4 fill-current" />
                      {post.readNum}
                    </span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1 text-emerald-500 dark:text-emerald-400">
                      <User className="h-4 w-4" />
                      {post.author}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                      >
                        <Bookmark className="h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </header>

                {/* Content */}
                <div className="prose prose-zinc max-w-none dark:prose-invert">
                  <MarkdownRenderer content={post.content} headings={headings} />
                </div>
              </article>

              <CommentSection postId={post.id} />
            </div>
          </div>
        </div>
      </main>

      <ReadingFloatButtons />
    </>
  );
}
