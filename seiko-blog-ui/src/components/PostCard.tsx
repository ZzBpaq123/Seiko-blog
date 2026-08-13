import Link from "next/link";
import Image from "next/image";
import { Calendar, Flame, Bookmark } from "lucide-react";
import type { PostVO } from "@/api/types";

interface PostCardProps {
  post: PostVO;
  index?: number;
}

export default function PostCard({ post, index = 0 }: PostCardProps) {
  const isImageLeft = index % 2 === 0;
  const hasImage = !!post.cover;

  return (
    <article className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 h-[240px]">
      {/* 全卡片背景：模糊图片 / 纯渐变 */}
      <div className="absolute inset-0">
        {hasImage ? (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center scale-125 blur-2xl brightness-[0.32] saturate-150"
              style={{ backgroundImage: `url(${post.cover})` }}
            />
            <div className="absolute inset-0 bg-black/15" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-slate-800 to-slate-900" />
        )}
      </div>

      {/* 封面图：斜切裁剪（50% 宽度） */}
      {hasImage && (
        <div
          className={`absolute inset-y-0 w-[50%] ${isImageLeft ? "left-0" : "right-0"}`}
          style={{
            clipPath: isImageLeft
              ? "polygon(0 0, 100% 0, 88% 100%, 0 100%)"
              : "polygon(12% 0, 100% 0, 100% 100%, 0% 100%)",
          }}
        >
          <Image
            src={post.cover!}
            alt={post.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* 点击跳转 */}
      <Link
        href={`/blog/${post.slug}`}
        className="absolute inset-0 z-20"
        aria-label={post.title}
      />

      {/* 内容区 */}
      <div
        className={`relative z-10 flex h-full flex-col justify-between py-6 w-1/2 ${
          hasImage
            ? isImageLeft
              ? "ml-[50%] pr-8 pl-6"
              : "mr-[50%] pl-8 pr-6"
            : "px-8"
        }`}
      >
        {/* 标题 + 摘要 */}
        <div className="flex-1 flex flex-col">
          <h2 className="text-xl font-bold text-white leading-snug line-clamp-2 group-hover:text-blue-300 transition-colors">
            {post.title}
          </h2>
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-sm text-zinc-300/85 line-clamp-3 leading-relaxed">
              {post.excerpt}
            </p>
          </div>
        </div>

        {/* 底部元数据 */}
        <div className="flex items-center gap-5 text-[13px]">
          {/* 日期 - 浅蓝 */}
          <span className="flex items-center gap-1 text-sky-400">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <time dateTime={post.date}>{post.date}</time>
          </span>

          {/* 阅读人数 - 火焰红 */}
          <span className="flex items-center gap-1 text-rose-400">
            <Flame className="h-4 w-4 flex-shrink-0 fill-current" />
            {post.readNum}
          </span>

          {/* 分类标签 - 橙色 */}
          {post.tags.length > 0 && (
            <span className="flex items-center gap-1 text-amber-400 max-w-[160px] truncate">
              <Bookmark className="h-4 w-4 flex-shrink-0" />
              {post.tags.slice(0, 3).join(" · ")}
              {post.tags.length > 3 && ` · +${post.tags.length - 3}`}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
