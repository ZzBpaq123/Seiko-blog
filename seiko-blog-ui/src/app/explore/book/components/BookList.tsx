"use client";

import type { BookVO } from "@/api/types";
import BookCard from "./BookCard";

interface BookListProps {
  books: BookVO[];
  currentIndex: number;
}

export default function BookList({ books, currentIndex }: BookListProps) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        className="flex h-full flex-col transition-transform duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          transform: `translateY(-${currentIndex * 50}%)`,
        }}
      >
        {books.map((book, index) => {
          const visibleStart = currentIndex;
          const visibleEnd = currentIndex + 1;
          const isActive = index >= visibleStart && index <= visibleEnd;

          return (
            <div
              key={`${book.id}-${index}`}
              className="h-1/2 w-full shrink-0"
              style={{ transitionDelay: `${Math.abs(index - currentIndex) * 40}ms` }}
            >
              <BookCard book={book} active={isActive} />
            </div>
          );
        })}
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-linear-to-r from-amber-50/80 to-transparent dark:from-amber-950/80" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-linear-to-l from-amber-50/80 to-transparent dark:from-amber-950/80" />
    </div>
  );
}
