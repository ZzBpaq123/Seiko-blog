"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import type { MovieVO } from "@/api/types";

interface MovieSliderSectionProps {
  title: string;
  movies: MovieVO[];
  onOpenDetail: (movie: MovieVO) => void;
  showRank?: boolean;
}

// 自动滚动速度（像素/帧，约 60fps）
const AUTO_SCROLL_SPEED = 0.5;
// 用户交互后恢复自动滚动的延迟（毫秒）
const RESUME_DELAY = 2000;

export default function MovieSliderSection({
  title,
  movies,
  onOpenDetail,
  showRank = false,
}: MovieSliderSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let rafId = 0;
    let direction = 1; // 1 向右，-1 向左
    let paused = false;
    let resumeTimer: ReturnType<typeof setTimeout> | undefined;

    const tick = () => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (!paused && maxScroll > 0) {
        let next = el.scrollLeft + AUTO_SCROLL_SPEED * direction;
        if (next >= maxScroll) {
          next = maxScroll;
          direction = -1;
        } else if (next <= 0) {
          next = 0;
          direction = 1;
        }
        el.scrollLeft = next;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    // 用户交互时暂停自动滚动，空闲后恢复
    const pauseTemporarily = () => {
      paused = true;
      if (resumeTimer) clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        paused = false;
      }, RESUME_DELAY);
    };

    // 鼠标悬停暂停
    const onEnter = () => {
      paused = true;
      if (resumeTimer) clearTimeout(resumeTimer);
    };
    const onLeave = () => {
      paused = false;
    };

    // 滚轮纵向滚动转为横向滚动
    const onWheel = (e: WheelEvent) => {
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (delta === 0) return;
      e.preventDefault();
      el.scrollLeft += delta;
      pauseTemporarily();
    };

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", pauseTemporarily, { passive: true });
    el.addEventListener("touchmove", pauseTemporarily, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      if (resumeTimer) clearTimeout(resumeTimer);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", pauseTemporarily);
      el.removeEventListener("touchmove", pauseTemporarily);
    };
  }, [movies]);

  return (
    <section className="py-10 md:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-semibold mb-6 md:mb-8">
          {title}
        </h2>
        <div className="relative group/slider">
          <div
            ref={scrollRef}
            className="flex gap-4 md:gap-5 overflow-x-auto hide-scrollbar movie-scroll py-5 md:py-6 px-3 md:px-4"
          >
            {movies.map((movie, index) => (
              <div
                key={`${title}-${movie.id}`}
                onClick={() => onOpenDetail(movie)}
                className="group relative shrink-0 w-40 h-60 md:w-[260px] md:h-[390px] rounded-xl overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:scale-[1.03] hover:shadow-[0_0_12px_var(--color-movie-accent)]"
              >
                {showRank && (
                  <div className="absolute top-0 left-0 z-20 w-7 md:w-9">
                    <svg
                      viewBox="0 0 759.352 1022.826"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-full h-auto"
                    >
                      <path
                        d="M0 0v1012.472a11.505 11.505 0 0 0 16.567 10.354l363.11-175.341L742.785 1022.826a11.505 11.505 0 0 0 16.567-10.354V0z"
                        fill="var(--color-movie-rank)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center pt-1 md:pt-1.5 text-white text-[8px] md:text-[9px] font-bold leading-tight">
                      <span>TOP</span>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                    </div>
                  </div>
                )}
                <Image
                  src={movie.backdrop}
                  alt={movie.movieName}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  unoptimized
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                  <h3 className="text-sm md:text-lg font-semibold text-white mb-1 line-clamp-2">
                    {movie.movieName}
                  </h3>
                  <div className="flex items-center gap-1 text-xs md:text-sm text-white/70">
                    <Star className="w-3 h-3 md:w-4 md:h-4 text-movie-accent fill-current" />
                    <span>{movie.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
