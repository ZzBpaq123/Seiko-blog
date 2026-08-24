"use client";

import { useCallback, useState } from "react";
import type { BookVO } from "@/api/types";

interface UseBookPaginationResult {
  books: BookVO[];
  hasMore: boolean;
  isLoading: boolean;
  loadMore: () => void;
}

const MOCK_PAGE_SIZE = 6;

function createMockBooks(page: number): BookVO[] {
  return Array.from({ length: MOCK_PAGE_SIZE }).map((_, i) => {
    const index = (page - 1) * MOCK_PAGE_SIZE + i + 1;
    return {
      id: -index,
      bookName: `Mock Book ${index}`,
      bookAuthor: `Author ${index}`,
      bookCover: `https://picsum.photos/seed/book${index}/300/450`,
      description: `这是第 ${index} 本模拟书籍的简介。滚轮翻页到底时会自动加载更多 mock 数据，用于演示分页加载机制。`,
    };
  });
}

export function useBookPagination(
  initialBooks: BookVO[],
): UseBookPaginationResult {
  const [books, setBooks] = useState<BookVO[]>(initialBooks);
  const [page, setPage] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);

    setTimeout(() => {
      const nextBooks = createMockBooks(page);
      setBooks((prev) => [...prev, ...nextBooks]);
      setPage((p) => p + 1);
      setIsLoading(false);

      if (page >= 5) {
        setHasMore(false);
      }
    }, 600);
  }, [hasMore, isLoading, page]);

  return {
    books,
    hasMore,
    isLoading,
    loadMore,
  };
}
