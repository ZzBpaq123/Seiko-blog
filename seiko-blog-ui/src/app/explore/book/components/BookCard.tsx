"use client";

import { useState } from "react";
import Image from "next/image";
import { BookOpen } from "lucide-react";
import type { BookVO } from "@/api/types";
import { cn } from "@/utils/cn";

interface BookCardProps {
  book: BookVO;
  active: boolean;
}

export default function BookCard({ book, active }: BookCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className={cn(
        "flex h-full w-full items-center gap-6 px-8 py-6 transition-all duration-500",
        active ? "opacity-100" : "opacity-60",
      )}
    >
      <div
        className={cn(
          "relative aspect-[2/3] h-full max-h-[260px] shrink-0 overflow-hidden rounded-lg shadow-lg transition-transform duration-500",
          active ? "scale-100" : "scale-95",
        )}
      >
        {imageError ? (
          <div className="flex h-full w-full items-center justify-center bg-amber-200/50 dark:bg-amber-800/50">
            <BookOpen className="h-12 w-12 text-amber-700/50 dark:text-amber-300/50" />
          </div>
        ) : (
          <Image
            src={book.bookCover}
            alt={book.bookName}
            fill
            className="object-cover"
            unoptimized
            onError={() => setImageError(true)}
          />
        )}
        <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-black/5 dark:ring-white/10" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <h3
          className={cn(
            "mb-2 text-2xl font-bold tracking-tight text-amber-950 transition-colors dark:text-amber-50",
            active ? "text-amber-950 dark:text-amber-50" : "text-amber-900/70 dark:text-amber-100/70",
          )}
        >
          {book.bookName}
        </h3>
        <p className="mb-4 text-sm font-medium text-amber-800/80 dark:text-amber-300/80">
          {book.bookAuthor}
        </p>
        <p className="line-clamp-4 text-base leading-relaxed text-amber-900/70 dark:text-amber-200/70">
          {book.description}
        </p>
      </div>
    </div>
  );
}
