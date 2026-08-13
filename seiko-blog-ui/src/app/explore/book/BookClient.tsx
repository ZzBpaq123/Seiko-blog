"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { BookVO } from "@/api/types";

interface BookClientProps {
  initialBooks: BookVO[];
}

export default function BookClient({ initialBooks }: BookClientProps) {
  const [books] = useState<BookVO[]>(initialBooks);
  const [activeIndex, setActiveIndex] = useState(
    Math.min(2, Math.max(0, initialBooks.length - 1)),
  );
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [selectedBook, setSelectedBook] = useState<BookVO | null>(null);
  const [timerKey, setTimerKey] = useState(0);

  // 自动轮播
  useEffect(() => {
    if (books.length === 0) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % books.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [timerKey, books.length]);

  const prevSlide = () => {
    if (books.length === 0) return;
    setActiveIndex((prev) => (prev - 1 + books.length) % books.length);
    setTimerKey((prev) => prev + 1);
  };

  const nextSlide = () => {
    if (books.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % books.length);
    setTimerKey((prev) => prev + 1);
  };

  const getTransform = (index: number) => {
    const diff = index - activeIndex;
    const absOffset = Math.abs(diff);

    const translateX = diff * 400;
    const rotateY = diff * -20;
    const translateZ = diff === 0 ? 50 : -absOffset * 80;
    const scale = diff === 0 ? 1.05 : 1 - absOffset * 0.1;

    return {
      transform: `translateX(${translateX}px) rotateY(${rotateY}deg) translateZ(${translateZ}px) scale(${scale})`,
      zIndex: 10 - absOffset,
      opacity: absOffset > 2 ? 0 : 1 - absOffset * 0.15,
    };
  };

  return (
    <div className="fixed inset-0 bg-amber-50 dark:bg-zinc-950 overflow-hidden">
      {/* 网格纹理背景 */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#27272a 1px, transparent 1px), linear-gradient(90deg, #27272a 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      {/* 3D 舞台 */}
      <div
        className="absolute inset-0 flex items-center justify-center pb-32"
        style={{ perspective: "2000px", perspectiveOrigin: "50% 30%" }}
      >
        <div
          className="relative flex items-center justify-center w-full h-full"
          style={{ transformStyle: "preserve-3d" }}
        >
          {books.length === 0 && (
            <div className="text-zinc-400 text-sm">暂无书籍</div>
          )}
          {books.map((book, index) => {
            const style = getTransform(index);
            const isHovered = hoveredId === book.id;

            return (
              <div
                key={book.id}
                className="absolute transition-all duration-700 ease-out cursor-pointer"
                style={{
                  ...style,
                  transformStyle: "preserve-3d",
                  transform: isHovered
                    ? `${style.transform} scale(1.05) translateZ(100px)`
                    : style.transform,
                }}
                onMouseEnter={() => setHoveredId(book.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => {
                  if (index === activeIndex) {
                    setSelectedBook(book);
                  }
                }}
              >
                {/* 书籍卡片 */}
                <div className="relative w-52 h-72 md:w-72 md:h-96 lg:w-80 lg:h-112 group">
                  {/* 书籍封面 */}
                  <div
                    className="relative w-full h-full overflow-hidden rounded-sm"
                    style={{
                      boxShadow: isHovered
                        ? "0 30px 60px rgba(0,0,0,0.15), 0 10px 30px rgba(0,0,0,0.1)"
                        : "0 20px 40px rgba(0,0,0,0.1), 0 5px 15px rgba(0,0,0,0.05)",
                      transition: "box-shadow 0.5s ease",
                    }}
                  >
                    <Image
                      src={book.bookCover}
                      alt={book.bookName}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {/* 左右切换按钮 */}
          {books.length > 0 && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-25 z-20">
              <button
                onClick={prevSlide}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800/60 text-white hover:bg-zinc-700/80 transition-all hover:scale-110 backdrop-blur-sm"
                aria-label="上一本"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextSlide}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800/60 text-white hover:bg-zinc-700/80 transition-all hover:scale-110 backdrop-blur-sm"
                aria-label="下一本"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 环境深度元素 */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* 地板反射 */}
        <div className="absolute bottom-0 w-full h-1/3 bg-linear-to-t from-zinc-200/40 to-transparent" />
        {/* 光点装饰 */}
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-zinc-400/20 rounded-full blur-sm" />
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-zinc-400/10 rounded-full blur-md" />
        <div className="absolute bottom-1/4 left-1/2 w-1.5 h-1.5 bg-zinc-400/30 rounded-full blur-sm" />
      </div>

      {/* 暗角效果 */}
      <div
        className="fixed inset-0 pointer-events-none z-40"
        style={{ boxShadow: "inset 0 0 150px rgba(0,0,0,0.1)" }}
      />

      {/* 书籍详情弹窗 */}
      {selectedBook && (
        <>
          {/* 窗口 */}
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-32 p-4">
            <div className="relative bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-w-3xl w-full h-[55vh] overflow-hidden flex flex-col md:flex-row animate-content-fade-in">
              {/* 关闭按钮 */}
              <button
                onClick={() => setSelectedBook(null)}
                className="absolute top-3 right-3 z-10 flex items-center justify-center w-5 h-5 rounded-full bg-zinc-800 text-white hover:scale-90 hover:bg-zinc-700 transition-all"
                aria-label="关闭"
              >
                <X className="w-4 h-4" />
              </button>
              {/* 左侧封面 */}
              <div className="relative w-full md:w-2/5 h-48 md:h-auto shrink-0">
                <Image
                  src={selectedBook.bookCover}
                  alt={selectedBook.bookName}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              {/* 右侧信息 */}
              <div className="w-full md:w-3/5 flex flex-col min-h-0">
                {/* 固定头部 */}
                <div className="px-6 md:px-8 pt-6 md:pt-8 pb-4 shrink-0">
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                    {selectedBook.bookName}
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {selectedBook.bookAuthor}
                  </p>
                </div>
                {/* 可滚动内容 */}
                <div className="flex-1 overflow-y-auto px-6 md:px-8 pb-6 md:pb-8 min-h-0">
                  <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line text-sm">
                    {selectedBook.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
