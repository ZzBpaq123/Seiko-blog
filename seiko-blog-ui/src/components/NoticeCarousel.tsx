"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { getEnabledNoticeList } from "@/api/notice";
import type { NoticeVO } from "@/api/types";

/** 公告轮播内部展示结构 */
interface DisplayNotice {
  id: number;
  title: string;
  content?: string;
  image?: string;
  link?: string;
}

interface NoticeCarouselProps {
  interval?: number;
}

/** 将后端 NoticeVO 映射为前端展示结构 */
function mapNoticeVO(vo: NoticeVO): DisplayNotice {
  return {
    id: vo.id,
    title: vo.noticeTitle,
    content: vo.noticeContent || undefined,
    image: vo.noticeImage || undefined,
    link: vo.noticeLink || undefined,
  };
}

export default function NoticeCarousel({
  interval = 5000,
}: NoticeCarouselProps) {
  const [notices, setNotices] = useState<DisplayNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // 从后端加载公告
  useEffect(() => {
    getEnabledNoticeList()
      .then((data) => {
        setNotices(data.map(mapNoticeVO));
      })
      .catch(() => {
        // 静默失败，保持空状态
        setNotices([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // 自动轮播
  useEffect(() => {
    if (isPaused || notices.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % notices.length);
    }, interval);
    return () => clearInterval(timer);
  }, [isPaused, interval, notices.length]);

  // 加载状态
  if (loading) {
    return (
      <div className="relative w-full overflow-hidden rounded-2xl border border-zinc-200/50 bg-white/80 shadow-lg backdrop-blur-sm dark:border-zinc-800/50 dark:bg-zinc-900/80">
        <div className="flex items-center justify-center py-10">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-blue-500" />
        </div>
      </div>
    );
  }

  // 空状态
  if (notices.length === 0) return null;

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-zinc-200/50 bg-white/80 shadow-lg backdrop-blur-sm dark:border-zinc-800/50 dark:bg-zinc-900/80"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Carousel Container */}
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {notices.map((notice) => (
          <div
            key={notice.id}
            className={`relative w-full flex-shrink-0 ${
              notice.image ? "aspect-[3/1] min-h-[120px]" : "py-6 px-8"
            }`}
          >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-linear-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/15 dark:to-purple-500/15" />

            {/* Image Background */}
            {notice.image && (
              <>
                <Image
                  src={notice.image}
                  alt={notice.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-linear-to-r from-black/60 via-black/30 to-transparent" />
              </>
            )}

            {/* Content */}
            <div
              className={`relative z-10 flex h-full flex-col justify-center ${
                notice.image ? "px-8 py-6" : ""
              }`}
            >
              {notice.link ? (
                <a href={notice.link} className="group cursor-pointer">
                  <h3
                    className={`text-lg font-bold transition-colors group-hover:text-blue-500 ${
                      notice.image
                        ? "text-white drop-shadow-lg"
                        : "text-zinc-900 dark:text-zinc-100"
                    }`}
                  >
                    {notice.title}
                  </h3>
                  {notice.content && (
                    <p
                      className={`mt-1 text-sm ${
                        notice.image
                          ? "text-white/80 drop-shadow"
                          : "text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      {notice.content}
                    </p>
                  )}
                </a>
              ) : (
                <>
                  <h3
                    className={`text-lg font-bold ${
                      notice.image
                        ? "text-white drop-shadow-lg"
                        : "text-zinc-900 dark:text-zinc-100"
                    }`}
                  >
                    {notice.title}
                  </h3>
                  {notice.content && (
                    <p
                      className={`mt-1 text-sm ${
                        notice.image
                          ? "text-white/80 drop-shadow"
                          : "text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      {notice.content}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Indicators */}
      {notices.length > 1 && (
        <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {notices.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "w-6 bg-blue-500"
                  : "w-2 bg-zinc-300 hover:bg-zinc-400 dark:bg-zinc-600 dark:hover:bg-zinc-500"
              }`}
              aria-label={`切换到第 ${index + 1} 条公告`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
