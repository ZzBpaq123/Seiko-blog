"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { BookOpen } from "lucide-react";
import type { BookVO } from "@/api/types";
import { cn } from "@/utils/cn";
import { useBookPagination } from "./hooks/useBookPagination";
import BookList from "./components/BookList";

const MoebiusScene = dynamic(
  () => import("./components/MoebiusScene"),
  { ssr: false, loading: () => <div className="bg-amber-50 dark:bg-amber-950" /> },
);

interface BookClientProps {
  initialBooks: BookVO[];
}

const SCROLL_LOCK_MS = 600;
const SCROLL_THRESHOLD = 30;
const PRELOAD_AHEAD = 2;

export default function BookClient({ initialBooks }: BookClientProps) {
  const { books, hasMore, isLoading, loadMore } = useBookPagination(initialBooks);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrollBoost, setScrollBoost] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const isScrollingRef = useRef(false);
  const boostTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const maxIndex = Math.max(0, books.length - 2);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  const triggerBoost = useCallback(() => {
    setScrollBoost(1.2);
    if (boostTimeoutRef.current) clearTimeout(boostTimeoutRef.current);
    boostTimeoutRef.current = setTimeout(() => setScrollBoost(0), 350);
  }, []);

  const jumpTo = useCallback(
    (target: number) => {
      if (isScrollingRef.current) return;

      const next = Math.max(0, Math.min(target, maxIndex));
      if (next === currentIndex) return;

      isScrollingRef.current = true;
      setCurrentIndex(next);
      triggerBoost();

      if (
        hasMore &&
        !isLoading &&
        next >= books.length - 2 - PRELOAD_AHEAD
      ) {
        loadMore();
      }

      setTimeout(() => {
        isScrollingRef.current = false;
      }, SCROLL_LOCK_MS);
    },
    [currentIndex, maxIndex, hasMore, isLoading, books.length, loadMore, triggerBoost],
  );

  const goTo = useCallback(
    (direction: 1 | -1) => {
      jumpTo(currentIndex + direction);
    },
    [currentIndex, jumpTo],
  );

  useEffect(() => {
    if (typeof window === "undefined" || reduceMotion) return;

    const handleWheel = (e: WheelEvent) => {
      if (isScrollingRef.current) {
        e.preventDefault();
        return;
      }

      if (e.deltaY > SCROLL_THRESHOLD) {
        if (currentIndex < maxIndex) {
          e.preventDefault();
          goTo(1);
        }
      } else if (e.deltaY < -SCROLL_THRESHOLD) {
        if (currentIndex > 0) {
          e.preventDefault();
          goTo(-1);
        }
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [currentIndex, maxIndex, goTo, reduceMotion]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        goTo(1);
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(-1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goTo]);

  useEffect(() => {
    return () => {
      if (boostTimeoutRef.current) clearTimeout(boostTimeoutRef.current);
    };
  }, []);

  if (initialBooks.length === 0) {
    return (
      <main className="-mb-16 -mt-14 flex min-h-screen items-center justify-center bg-amber-50 px-4 dark:bg-amber-950">
        <div className="text-center">
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-amber-300 dark:text-amber-700" />
          <p className="text-lg text-amber-800 dark:text-amber-200">暂无书籍</p>
        </div>
      </main>
    );
  }

  return (
    <main className="-mb-16 -mt-14 flex h-screen overflow-hidden bg-amber-50 dark:bg-amber-950">
      {/* 左侧：3D 莫比乌斯环 */}
      <section className="relative hidden h-full w-1/2 bg-amber-50 dark:bg-amber-950 lg:block">
        <MoebiusScene
          scrollBoost={scrollBoost}
          reducedMotion={reduceMotion}
          isDark={isDark}
        />

        <div className="absolute bottom-8 left-8 z-10">
          <h1 className="text-4xl font-bold tracking-tight text-amber-950 dark:text-amber-50">
            书籍
          </h1>
          <p className="mt-1 text-sm font-medium tracking-widest text-amber-800/50 dark:text-amber-200/50">
            BOOKS
          </p>
        </div>
      </section>

      {/* 右侧：图书列表 */}
      <section className="relative flex h-full w-full flex-col lg:w-1/2">
        <div className="flex flex-1 flex-col overflow-hidden px-6 py-10 md:px-10">
          <div className="mb-6 flex items-center justify-between">
            <div className="lg:hidden">
              <h1 className="text-2xl font-bold text-amber-950 dark:text-amber-50">书籍</h1>
              <p className="text-xs tracking-widest text-amber-700/70 dark:text-amber-300/70">BOOKS</p>
            </div>

            <div className="flex items-center gap-3 text-sm text-amber-700/70 dark:text-amber-300/70">
              <span>{currentIndex + 1}</span>
              <span>/</span>
              <span>{Math.max(1, books.length - 1)}</span>
            </div>
          </div>

          <div className="relative flex-1 overflow-hidden rounded-2xl border border-amber-900/5 bg-white/60 shadow-xl backdrop-blur-sm dark:border-amber-100/5 dark:bg-black/20">
            <BookList books={books} currentIndex={currentIndex} />
          </div>

          <div className="mt-6 flex items-center justify-between text-xs text-amber-700/60 dark:text-amber-300/60">
            {/*<p>滚动鼠标或按 ↑ / ↓ 翻阅</p>*/}
            {isLoading && <span className="animate-pulse">加载中…</span>}
          </div>
        </div>

        {/* 滚动指示器 */}
        <div className="absolute right-4 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-2">
          {Array.from({ length: Math.min(books.length - 1, 12) }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => jumpTo(i)}
              className={cn(
                "h-2 w-2 rounded-full transition-all duration-300",
                i === currentIndex
                  ? "scale-125 bg-amber-600 dark:bg-amber-400"
                  : "bg-amber-900/20 hover:bg-amber-900/40 dark:bg-amber-100/20 dark:hover:bg-amber-100/40",
              )}
              aria-label={`切换到第 ${i + 1} 屏`}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
