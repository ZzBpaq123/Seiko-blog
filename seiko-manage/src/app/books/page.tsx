"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, Pencil, Trash2, BookOpen, RotateCcw, Loader2 } from "lucide-react";
import { getBookList, deleteBook } from "@/api/book";
import type { BookVO } from "@/types";
import { useConfirm } from "@/components/ConfirmDialog";
import PageHeader from "@/components/PageHeader";
import Pagination from "@/components/Pagination";
import { useDebounce } from "@/hooks/useDebounce";
import { usePagedList } from "@/hooks/usePagedList";
import { notifyError, notifySuccess } from "@/utils/toast";

const PAGE_SIZE = 10;

export default function BooksPage() {
  const router = useRouter();
  const confirm = useConfirm();

  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const debouncedSearch = useDebounce(search);

  const { page, setPage, loading, pageResult, records, refresh, reset } = usePagedList<BookVO>({
    pageSize: PAGE_SIZE,
    deps: [debouncedSearch],
    fetch: (page) =>
      getBookList({
        page,
        size: PAGE_SIZE,
        bookName: debouncedSearch.trim() || undefined,
      }),
  });

  const handleReset = () => {
    setSearch("");
    reset();
  };

  // 删除书籍
  const handleDelete = async (id: number) => {
    if (!id) return;
    if (!(await confirm({ message: "确定要删除这本书吗？删除后不可恢复。" }))) return;
    setDeletingId(id);
    try {
      await deleteBook(id);
      notifySuccess("书籍删除成功");
      refresh();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "删除失败");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="书籍管理"
        action={
          <Link href="/books/new" className="btn btn-primary">
            <Plus size={16} /> 添加书籍
          </Link>
        }
      />

      {/* Filter Bar */}
      <div className="card flex items-center gap-4">
        <div className="relative flex-9 min-w-0">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索书名..."
            className="input input-icon"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          type="button"
          className="btn btn-secondary flex-1 min-w-0 justify-center whitespace-nowrap"
          onClick={handleReset}
          title="重置"
        >
          <RotateCcw size={16} /> 重置
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="card flex items-center justify-center py-16 text-gray-500">
          <Loader2 size={24} className="animate-spin mr-2" /> 加载中...
        </div>
      ) : records.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-gray-400">
          <BookOpen size={36} className="mb-2" /> 暂无书籍
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {records.map((book) => (
            <div key={book.id} className="card p-4 hover:shadow-md transition-shadow group">
              <div className="aspect-3/4 bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                {book.bookCover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={book.bookCover} alt={book.bookName} className="w-full h-full object-cover" />
                ) : (
                  <BookOpen size={40} className="text-gray-300" />
                )}
              </div>
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <h3 className="font-medium text-foreground line-clamp-1">{book.bookName}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{book.bookAuthor || "—"}</p>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{book.description}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                  <button
                    className="p-1 rounded hover:bg-blue-50 text-blue-600"
                    title="编辑"
                    onClick={() => router.push(`/books/edit?id=${book.id}`)}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    className="p-1 rounded hover:bg-red-50 text-red-600 disabled:opacity-40 disabled:cursor-not-allowed"
                    title="删除"
                    onClick={() => handleDelete(book.id)}
                    disabled={deletingId === book.id}
                  >
                    {deletingId === book.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination pageResult={pageResult} page={page} onChange={setPage} />
    </div>
  );
}
