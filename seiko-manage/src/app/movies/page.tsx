"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, Pencil, Trash2, Film, Star, RotateCcw, Loader2, Pin } from "lucide-react";
import {
  getMovieList,
  deleteMovie,
  updateMovieTopStatus,
} from "@/api/movie";
import type { MovieVO } from "@/types";
import { useConfirm } from "@/components/ConfirmDialog";
import Select from "@/components/Select";
import PageHeader from "@/components/PageHeader";
import Pagination from "@/components/Pagination";
import { useDebounce } from "@/hooks/useDebounce";
import { usePagedList } from "@/hooks/usePagedList";
import { notifyError } from "@/utils/toast";

const PAGE_SIZE = 10;

export default function MoviesPage() {
  const router = useRouter();
  const confirm = useConfirm();

  const [search, setSearch] = useState("");
  const [topFilter, setTopFilter] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const debouncedSearch = useDebounce(search);

  const { page, setPage, loading, pageResult, records: rawRecords, refresh, reset } =
    usePagedList<MovieVO>({
      pageSize: PAGE_SIZE,
      deps: [debouncedSearch],
      fetch: (page) =>
        getMovieList({
          page,
          size: PAGE_SIZE,
          movieName: debouncedSearch.trim() || undefined,
        }),
    });

  // 客户端置顶过滤
  const records = rawRecords.filter((movie) => {
    if (topFilter === "") return true;
    return String(movie.isTop) === topFilter;
  });

  const handleReset = () => {
    setSearch("");
    setTopFilter("");
    reset();
  };

  // 删除电影
  const handleDelete = async (id: number) => {
    if (!id) return;
    if (!(await confirm({ message: "确定要删除这部电影吗？删除后不可恢复。" }))) return;
    setDeletingId(id);
    try {
      await deleteMovie(id);
      refresh();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "删除失败");
    } finally {
      setDeletingId(null);
    }
  };

  // 切换置顶状态
  const handleToggleTop = async (movie: MovieVO) => {
    const next = movie.isTop === 1 ? 0 : 1;
    setTogglingId(movie.id);
    try {
      await updateMovieTopStatus(movie.id, next);
      refresh();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "状态更新失败");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="电影管理"
        action={
          <Link href="/movies/new" className="btn btn-primary">
            <Plus size={16} /> 添加电影
          </Link>
        }
      />

      {/* Filter Bar */}
      <div className="card flex items-center gap-4">
        <div className="relative flex-6 min-w-0">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索电影名称..."
            className="input input-icon"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          className="flex-3 min-w-0"
          value={topFilter}
          onChange={(v) => setTopFilter(String(v))}
          options={[
            { value: "", label: "全部" },
            { value: "1", label: "置顶" },
            { value: "0", label: "普通" },
          ]}
        />
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
          <Film size={36} className="mb-2" /> 暂无电影
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {records.map((movie) => (
            <div key={movie.id} className="card p-4 hover:shadow-md transition-shadow group relative">
              {movie.isTop === 1 && (
                <div className="absolute top-3 right-3 z-10">
                  <span className="badge badge-yellow flex items-center gap-1">
                    <Star size={10} /> 置顶
                  </span>
                </div>
              )}
              <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                {movie.backdrop ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={movie.backdrop} alt={movie.movieName} className="w-full h-full object-cover" />
                ) : (
                  <Film size={40} className="text-gray-300" />
                )}
              </div>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground line-clamp-1">{movie.movieName}</h3>
                  <div className="flex items-center flex-wrap gap-2 mt-1">
                    <span className="flex items-center gap-1 text-sm font-semibold text-orange-500">
                      <Star size={14} fill="currentColor" />
                      {movie.rating}
                    </span>
                    <span className="text-xs text-gray-400">{movie.ratingSource || "—"}</span>
                    {movie.tags?.split(",").map((tag) => (
                      <span key={tag} className="badge badge-gray">{tag.trim()}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                  <button
                    className="p-1 rounded hover:bg-blue-50 text-blue-600"
                    title="编辑"
                    onClick={() => router.push(`/movies/edit?id=${movie.id}`)}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    className="p-1 rounded hover:bg-amber-50 text-amber-600 disabled:opacity-40 disabled:cursor-not-allowed"
                    title={movie.isTop === 1 ? "取消置顶" : "置顶"}
                    onClick={() => handleToggleTop(movie)}
                    disabled={togglingId === movie.id}
                  >
                    {togglingId === movie.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Pin size={14} className={movie.isTop === 1 ? "fill-current" : ""} />
                    )}
                  </button>
                  <button
                    className="p-1 rounded hover:bg-red-50 text-red-600 disabled:opacity-40 disabled:cursor-not-allowed"
                    title="删除"
                    onClick={() => handleDelete(movie.id)}
                    disabled={deletingId === movie.id}
                  >
                    {deletingId === movie.id ? (
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
