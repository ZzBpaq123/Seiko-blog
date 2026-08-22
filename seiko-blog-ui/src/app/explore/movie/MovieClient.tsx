"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Star, X } from "lucide-react";
import type { MovieVO } from "@/api/types";
import MovieSliderSection from "@/components/MovieSliderSection";
import { cn } from "@/utils/cn";

interface MovieClientProps {
  initialMovies: MovieVO[];
}

export default function MovieClient({ initialMovies }: MovieClientProps) {
  // 数据分组：置顶作品、高分佳作、全部影视
  const hotMovies = initialMovies.filter((movie) => movie.isTop === 1);
  const topRatedMovies = [...initialMovies]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 10);

  // 轮播图数据：仅使用置顶作品
  const heroMovies = hotMovies.slice(0, 5);

  const [currentSlide, setCurrentSlide] = useState(0);
  const currentHero = heroMovies[currentSlide];
  const [selectedMovie, setSelectedMovie] = useState<MovieVO | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // 轮播自动播放
  useEffect(() => {
    if (heroMovies.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroMovies.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroMovies.length, isPaused]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const openDetail = (movie: MovieVO) => {
    setSelectedMovie(movie);
  };

  const closeDetail = () => {
    setSelectedMovie(null);
  };

  // 详情弹窗打开时锁定背景滚动
  useEffect(() => {
    if (selectedMovie) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedMovie]);

  if (initialMovies.length === 0) {
    return (
      <main className="-mt-14 -mb-16 min-h-screen flex items-center justify-center bg-movie-bg text-movie-muted">
        暂无影视数据
      </main>
    );
  }

  return (
    <main className="-mt-14 -mb-16 min-h-screen bg-movie-bg text-movie-text">
      {heroMovies.length > 0 && (
        <section
          className="relative w-full h-full min-h-150 md:min-h-190 overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {heroMovies.map((movie, index) => (
            <div
              key={movie.id}
              className={cn(
                "absolute inset-0 transition-opacity duration-1000 ease-in-out",
                index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0",
              )}
            >
              <Image
                src={movie.backdrop}
                alt={movie.movieName}
                fill
                className="object-cover"
                priority={index === 0}
                unoptimized
              />
              {/* 渐变遮罩 */}
              <div className="absolute inset-0 bg-linear-to-r from-movie-bg/60 via-movie-bg/10 via-50% to-movie-bg/60" />
            </div>
          ))}

          {/* 轮播内容 */}
          <div className="absolute inset-0 z-20 flex items-end">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-20">
              <div
                key={currentHero.id}
                className="max-w-2xl animate-fade-in-up"
              >
                <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
                  {currentHero.movieName}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-sm md:text-base text-movie-muted mb-3 md:mb-4">
                  <span className="flex items-center gap-1 text-movie-accent">
                    <Star className="w-4 h-4 fill-current" />
                    {currentHero.rating.toFixed(1)}
                  </span>
                  <span>·</span>
                  <span>{currentHero.tags}</span>
                  <span>·</span>
                  <span>{currentHero.ratingSource}</span>
                  {currentHero.duration ? (
                    <>
                      <span>·</span>
                      <span>{currentHero.duration} 分钟</span>
                    </>
                  ) : null}
                </div>
                <p className="text-sm md:text-lg text-movie-muted/80 line-clamp-3 md:line-clamp-4 mb-5 md:mb-6 leading-relaxed">
                  {currentHero.synopsis}
                </p>
                <button
                  onClick={() => openDetail(currentHero)}
                  className="px-6 py-2.5 md:px-7 md:py-3 border-2 border-movie-accent text-movie-accent rounded-lg font-medium transition-colors duration-300 hover:bg-movie-accent hover:text-movie-bg"
                >
                  查看详情
                </button>
              </div>
            </div>
          </div>

          {/* 轮播指示点 */}
          {heroMovies.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
              {heroMovies.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    index === currentSlide
                      ? "w-6 bg-movie-accent"
                      : "w-2 bg-white/30 hover:bg-white/50",
                  )}
                  aria-label={`切换到第 ${index + 1} 张`}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 高分佳作 */}
      {topRatedMovies.length > 0 && (
        <MovieSliderSection
          title="高分佳作"
          movies={topRatedMovies}
          onOpenDetail={openDetail}
          showRank
        />
      )}

      {/* 我的观影 */}
      {initialMovies.length > 0 && (
        <MovieSliderSection
          title="我的观影"
          movies={initialMovies}
          onOpenDetail={openDetail}
        />
      )}

      {/* 影视详情弹窗 */}
      {selectedMovie && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-24 md:pt-32 bg-black/70 backdrop-blur-sm animate-content-fade-in"
          onClick={closeDetail}
        >
          <div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-movie-surface-elevated shadow-2xl flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeDetail}
              className="absolute top-3 right-3 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-black/50 text-white transition-all hover:bg-movie-accent hover:text-movie-bg"
              aria-label="关闭"
            >
              <X className="w-4 h-4" />
            </button>

            {/* 弹窗封面 */}
            <div className="relative w-full md:w-2/5 h-56 md:h-auto md:min-h-100 shrink-0">
              <Image
                src={selectedMovie.backdrop}
                alt={selectedMovie.movieName}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-linear-to-t from-movie-surface-elevated via-transparent to-transparent md:bg-linear-to-r" />
            </div>

            {/* 弹窗信息 */}
            <div className="flex flex-col flex-1 min-h-0 p-5 md:p-8">
              <div className="shrink-0 mb-4">
                <h3 className="text-2xl md:text-3xl font-bold text-movie-text mb-2">
                  {selectedMovie.movieName}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-sm text-movie-muted">
                  <span className="flex items-center gap-1 text-movie-accent">
                    <Star className="w-4 h-4 fill-current" />
                    {selectedMovie.rating.toFixed(1)}
                  </span>
                  <span>·</span>
                  <span>{selectedMovie.tags}</span>
                  <span>·</span>
                  <span>{selectedMovie.ratingSource}</span>
                  {selectedMovie.duration ? (
                    <>
                      <span>·</span>
                      <span>{selectedMovie.duration} 分钟</span>
                    </>
                  ) : null}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto pr-1">
                <p className="text-movie-muted/90 leading-relaxed whitespace-pre-line">
                  {selectedMovie.synopsis}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
