"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import type { PhotoVO } from "@/api/types";

export default function PhotoLightbox({ photos }: { photos: PhotoVO[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [loadedIds, setLoadedIds] = useState<Set<number>>(new Set());

  const close = useCallback(() => setActiveIndex(null), []);

  const prev = useCallback(() => {
    setActiveIndex((i) =>
      i === null ? null : (i - 1 + photos.length) % photos.length,
    );
  }, [photos.length]);

  const next = useCallback(() => {
    setActiveIndex((i) => (i === null ? null : (i + 1) % photos.length));
  }, [photos.length]);

  useEffect(() => {
    if (activeIndex === null) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [activeIndex, close, prev, next]);

  const active = activeIndex !== null ? photos[activeIndex] : null;

  return (
    <>
      {/* 瀑布流网格 */}
      <div className="columns-2 gap-3 md:columns-3 lg:columns-4">
        {photos.map((photo, i) => (
          <div
            key={photo.id}
            className="mb-3 break-inside-avoid cursor-pointer overflow-hidden rounded-xl"
            onClick={() => setActiveIndex(i)}
          >
            <div className="group relative overflow-hidden rounded-xl bg-zinc-200 dark:bg-zinc-800">
              {!loadedIds.has(photo.id) && (
                <div className="absolute inset-0 z-10 flex items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-400 border-t-zinc-200 dark:border-zinc-600 dark:border-t-zinc-800" />
                </div>
              )}
              <Image
                src={photo.photoSrc}
                alt={photo.photoAlt}
                width={photo.photoWidth}
                height={photo.photoHeight}
                className="w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                loading="lazy"
                onLoad={() =>
                  setLoadedIds((prev) => new Set(prev).add(photo.id))
                }
                unoptimized
              />
              {/* Hover 遮罩 */}
              <div className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black/60 via-transparent to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {photo.photoTitle && (
                  <p className="text-sm font-medium text-white">
                    {photo.photoTitle}
                  </p>
                )}
                {photo.photoLocation && (
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-white/80">
                    <MapPin className="h-3 w-3" />
                    {photo.photoLocation}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 灯箱 */}
      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
          onClick={close}
        >
          {/* 关闭按钮 */}
          <button
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
            onClick={close}
            aria-label="关闭"
          >
            <X className="h-5 w-5" />
          </button>

          {/* 上一张 */}
          <button
            className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            aria-label="上一张"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* 图片容器 */}
          <div
            className="relative mx-16 flex max-h-[90vh] max-w-[90vw] flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative overflow-hidden rounded-xl bg-zinc-800 shadow-2xl">
              {!loadedIds.has(active.id) && (
                <div className="absolute inset-0 z-10 flex items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-white" />
                </div>
              )}
              <Image
                src={active.photoSrc}
                alt={active.photoAlt}
                width={active.photoWidth}
                height={active.photoHeight}
                className="max-h-[80vh] max-w-[80vw] object-contain"
                loading="lazy"
                onLoad={() =>
                  setLoadedIds((prev) => new Set(prev).add(active.id))
                }
                unoptimized
              />
            </div>
            {/* 图片信息 */}
            {(active.photoTitle ||
              active.photoLocation ||
              active.photoDate) && (
              <div className="mt-3 flex items-center gap-4 text-sm text-white/80">
                {active.photoTitle && (
                  <span className="font-medium text-white">
                    {active.photoTitle}
                  </span>
                )}
                {active.photoLocation && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {active.photoLocation}
                  </span>
                )}
                {active.photoDate && <span>{active.photoDate}</span>}
              </div>
            )}
            {/* 进度指示 */}
            <p className="mt-2 text-xs text-white/50">
              {(activeIndex ?? 0) + 1} / {photos.length}
            </p>
          </div>

          {/* 下一张 */}
          <button
            className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            aria-label="下一张"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </>
  );
}
