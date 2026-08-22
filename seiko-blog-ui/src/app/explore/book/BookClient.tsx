"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import type { BookVO } from "@/api/types";
import { cn } from "@/utils/cn";

interface BookClientProps {
  initialBooks: BookVO[];
}

const PAGES_PER_BOOK = 2;

function getPageInfo(pageIndex: number, books: BookVO[]) {
  const totalContentPages = books.length * PAGES_PER_BOOK;

  if (pageIndex >= totalContentPages) {
    return { type: "back" as const };
  }

  const bookIndex = Math.floor(pageIndex / PAGES_PER_BOOK);
  const pageInBook = pageIndex % PAGES_PER_BOOK;
  const book = books[bookIndex];

  return {
    type: "content" as const,
    book,
    pageInBook,
  };
}

function PageContent({
  pageIndex,
  side,
  books,
}: {
  pageIndex: number;
  side: "left" | "right";
  books: BookVO[];
}) {
  const info = getPageInfo(pageIndex, books);
  const isLeft = side === "left";

  if (info.type === "back") {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-linear-to-br from-amber-600 to-amber-800",
          isLeft ? "rounded-l-lg" : "rounded-r-lg",
        )}
      >
        <div className="text-center">
          <span className="text-2xl font-bold text-amber-100/90">END</span>
          <p className="mt-2 text-sm text-amber-100/60">谢谢阅读</p>
        </div>
      </div>
    );
  }

  const { book, pageInBook } = info;
  const pageBase = cn(
    "relative h-full w-full overflow-hidden",
    isLeft
      ? "rounded-l-lg bg-linear-to-r from-[#e8e4df] to-[#fffbf6]"
      : "rounded-r-lg bg-linear-to-l from-[#e8e4df] to-[#fffbf6]",
  );

  if (isLeft) {
    return (
      <div className={pageBase}>
        <Image
          src={book.bookCover}
          alt={book.bookName}
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-y-0 right-0 w-5 bg-linear-to-l from-black/10 to-transparent" />
      </div>
    );
  }

  if (pageInBook === 0) {
    return (
      <div
        className={cn(
          pageBase,
          "flex flex-col items-center justify-center p-4 text-center md:p-8",
        )}
      >
        <h2 className="mb-3 text-xl font-bold text-amber-950 md:text-2xl lg:text-3xl">
          {book.bookName}
        </h2>
        <p className="text-sm font-medium text-amber-800/80 md:text-base">
          {book.bookAuthor}
        </p>
      </div>
    );
  }

  return (
    <div className={cn(pageBase, "flex flex-col p-4 md:p-8")}>
      <h3 className="mb-3 text-lg font-bold text-amber-950 md:text-xl">
        {book.bookName}
      </h3>
      <div className="hide-scrollbar flex-1 overflow-y-auto">
        <p className="whitespace-pre-line text-sm leading-relaxed text-amber-900/80 md:text-base">
          {book.description}
        </p>
      </div>
    </div>
  );
}

function PageCorner({
  position,
  onClick,
  label,
}: {
  position: "left" | "right";
  onClick: () => void;
  label: string;
}) {
  const isLeft = position === "left";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group absolute bottom-0 z-30 h-16 w-16 cursor-pointer animate-corner-float",
        isLeft ? "left-0" : "right-0",
      )}
      aria-label={label}
    >
      <div
        className={cn(
          "absolute bottom-0 h-14 w-14 transition-transform duration-300 group-hover:scale-110",
          isLeft
            ? "left-0 rounded-tr-2xl bg-linear-to-tr from-stone-500/40 via-stone-200/70 to-transparent"
            : "right-0 rounded-tl-2xl bg-linear-to-bl from-stone-500/40 via-stone-200/70 to-transparent",
        )}
        style={{
          clipPath: isLeft
            ? "polygon(0 0, 100% 100%, 0 100%)"
            : "polygon(100% 0, 100% 100%, 0 100%)",
          boxShadow: isLeft
            ? "2px -2px 6px rgba(0,0,0,0.12)"
            : "-2px -2px 6px rgba(0,0,0,0.12)",
        }}
      />
      <div
        className={cn(
          "absolute bottom-2 transition-transform duration-300 group-hover:scale-110",
          isLeft ? "left-2" : "right-2",
        )}
      >
        {isLeft ? (
          <ChevronLeft className="h-5 w-5 text-stone-700/70" />
        ) : (
          <ChevronRight className="h-5 w-5 text-stone-700/70" />
        )}
      </div>
    </button>
  );
}

function FlippingPage({
  direction,
  frontPage,
  backPage,
  books,
}: {
  direction: 1 | -1;
  frontPage: number;
  backPage: number;
  books: BookVO[];
}) {
  const isNext = direction === 1;

  return (
    <div
      className={cn(
        "absolute top-0 h-full w-1/2",
        isNext ? "right-0 origin-left animate-flip-next" : "left-0 origin-right animate-flip-prev",
      )}
      style={{ transformStyle: "preserve-3d" }}
    >
      <div
        className="absolute inset-0 overflow-hidden shadow-xl"
        style={{ backfaceVisibility: "hidden" }}
      >
        <PageContent
          pageIndex={frontPage}
          side={isNext ? "right" : "left"}
          books={books}
        />
      </div>
      <div
        className="absolute inset-0 overflow-hidden shadow-xl"
        style={{
          backfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
        }}
      >
        <PageContent
          pageIndex={backPage}
          side={isNext ? "left" : "right"}
          books={books}
        />
      </div>
    </div>
  );
}

export default function BookClient({ initialBooks }: BookClientProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<1 | -1>(1);
  const [flipKey, setFlipKey] = useState(0);

  const totalContentPages = initialBooks.length * PAGES_PER_BOOK;
  const totalPages = totalContentPages + 1;

  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const canGoNext = currentPage < totalPages - 1 && !isFlipping;
  const canGoPrev = currentPage > 0 && !isFlipping;

  const triggerFlip = (direction: 1 | -1) => {
    if (direction === 1 && !canGoNext) return;
    if (direction === -1 && !canGoPrev) return;

    setFlipDirection(direction);
    setIsFlipping(true);
    setFlipKey((k) => k + 1);

    setTimeout(() => {
      setCurrentPage((p) => p + direction);
      setIsFlipping(false);
    }, 700);
  };

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

  const targetPage = flipDirection === 1 ? currentPage + 1 : currentPage - 1;
  const pageZ = isOpen ? 1 : -3;

  return (
    <main className="-mb-16 -mt-14 flex min-h-screen items-center justify-center overflow-hidden bg-amber-50 px-4 py-16 dark:bg-amber-950">
      <div className="relative w-full" style={{ perspective: "1500px" }}>
        <div
          className="relative mx-auto transition-transform duration-1000 ease-out motion-reduce:transition-none"
          style={{
            width: "min(92vw, 800px)",
            height: "min(calc(92vw * 2 / 3), 533px)",
            transform: isOpen ? "rotateY(0deg)" : "rotateY(-6deg)",
            transformStyle: "preserve-3d",
          }}
        >
          {/* 后封面 */}
          <div
            className="absolute left-0 top-0 h-full w-1/2 rounded-l-lg bg-linear-to-br from-amber-600 to-amber-800 shadow-2xl"
            style={{ transform: "translateZ(-2px)" }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-amber-100/80">END</span>
            </div>
          </div>

          {/* 翻页时的目标 spread（底层） */}
          {isFlipping && (
            <>
              <div
                className="absolute left-0 top-0 h-full w-1/2 overflow-hidden rounded-l-lg shadow-inner"
                style={{ transform: "translateZ(0px)" }}
              >
                <PageContent
                  pageIndex={targetPage}
                  side="left"
                  books={initialBooks}
                />
              </div>
              <div
                className="absolute left-1/2 top-0 h-full w-1/2 overflow-hidden rounded-r-lg shadow-inner"
                style={{ transform: "translateZ(0px)" }}
              >
                <PageContent
                  pageIndex={targetPage}
                  side="right"
                  books={initialBooks}
                />
              </div>
            </>
          )}

          {/* 当前 spread 的左页 */}
          <div
            className="absolute left-0 top-0 h-full w-1/2 overflow-hidden rounded-l-lg shadow-inner transition-transform duration-1000 ease-out motion-reduce:transition-none"
            style={{
              transform: `translateZ(${pageZ}px)`,
            }}
          >
            <PageContent
              pageIndex={currentPage}
              side="left"
              books={initialBooks}
            />
          </div>

          {/* 当前 spread 的右页 */}
          <div
            className="absolute left-1/2 top-0 h-full w-1/2 overflow-hidden rounded-r-lg shadow-inner transition-transform duration-1000 ease-out motion-reduce:transition-none"
            style={{
              transform: `translateZ(${pageZ}px)`,
            }}
          >
            <PageContent
              pageIndex={currentPage}
              side="right"
              books={initialBooks}
            />
          </div>

          {/* 前封面（闭合时覆盖右页） */}
          <div
            className="absolute left-1/2 top-0 h-full w-1/2 origin-left rounded-r-lg shadow-2xl transition-transform duration-1000 ease-out motion-reduce:transition-none"
            style={{
              transform: isOpen
                ? "rotateY(-175deg) translateZ(0px)"
                : "rotateY(0deg) translateZ(12px)",
              transformStyle: "preserve-3d",
            }}
          >
            <div
              className="absolute inset-0 flex flex-col items-center justify-center rounded-r-lg bg-linear-to-br from-amber-500 to-amber-700 p-6"
              style={{ backfaceVisibility: "hidden" }}
            >
              <BookOpen className="mb-4 h-10 w-10 text-amber-100/80 md:h-14 md:w-14" />
              <h1 className="text-3xl font-bold text-amber-50 md:text-4xl">书籍</h1>
              <p className="mt-2 text-sm font-medium tracking-widest text-amber-100/70">
                BOOKS
              </p>
              <div className="absolute inset-y-0 left-0 w-3 bg-black/10" />
            </div>
            <div
              className="absolute inset-0 rounded-r-lg bg-amber-100"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            />
          </div>

          {/* 翻页动画层 */}
          {isFlipping && (
            <FlippingPage
              key={flipKey}
              direction={flipDirection}
              frontPage={currentPage}
              backPage={targetPage}
              books={initialBooks}
            />
          )}

          {/* 左下角翘角（向前翻页） */}
          {canGoPrev && (
            <PageCorner
              position="left"
              onClick={() => triggerFlip(-1)}
              label="上一页"
            />
          )}

          {/* 右下角翘角（向后翻页） */}
          {canGoNext && (
            <PageCorner
              position="right"
              onClick={() => triggerFlip(1)}
              label="下一页"
            />
          )}
        </div>

        {/* 提示文字 */}
        <p className="mt-8 text-center text-sm text-amber-700/70 dark:text-amber-300/70">
          点击页角翻阅书籍
        </p>
      </div>
    </main>
  );
}
