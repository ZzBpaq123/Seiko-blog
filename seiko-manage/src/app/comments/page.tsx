"use client";

import { useState } from "react";
import { Search, Trash2, MessageSquare, RotateCcw, Loader2 } from "lucide-react";
import { getCommentList, deleteComment } from "@/api/comment";
import type { CommentVO } from "@/types";
import { useConfirm } from "@/components/ConfirmDialog";
import PageHeader from "@/components/PageHeader";
import Pagination from "@/components/Pagination";
import { useDebounce } from "@/hooks/useDebounce";
import { usePagedList } from "@/hooks/usePagedList";
import { notifyError, notifySuccess } from "@/utils/toast";
import { toDateOnly } from "@/utils/date";

const PAGE_SIZE = 10;

function getAvatarInitials(author?: string): string {
  if (!author) return "?";
  return author.slice(0, 1).toUpperCase();
}

export default function CommentsPage() {
  const confirm = useConfirm();

  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const debouncedSearch = useDebounce(search);

  const { page, setPage, loading, pageResult, records, refresh, reset } = usePagedList<CommentVO>({
    pageSize: PAGE_SIZE,
    deps: [debouncedSearch],
    fetch: (page) =>
      getCommentList({
        page,
        size: PAGE_SIZE,
        author: debouncedSearch.trim() || undefined,
      }),
  });

  const handleReset = () => {
    setSearch("");
    reset();
  };

  const handleDelete = async (id: number) => {
    if (!id) return;
    if (!(await confirm({ message: "确定要删除这条评论吗？删除后不可恢复。" }))) return;
    setDeletingId(id);
    try {
      await deleteComment(id);
      notifySuccess("评论删除成功");
      refresh();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "删除失败");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="评论管理" />

      {/* Filter Bar */}
      <div className="card flex items-center gap-4">
        <div className="relative flex-9 min-w-0">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索评论作者..."
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

      {/* Table */}
      <div className="card table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>用户</th>
              <th>评论内容</th>
              <th>关联文章</th>
              <th>评论时间</th>
              <th className="text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="py-16 text-gray-500">
                  <div className="flex items-center justify-center">
                    <Loader2 size={24} className="animate-spin mr-2" /> 加载中...
                  </div>
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-gray-400">
                  <div className="flex flex-col items-center justify-center">
                    <MessageSquare size={36} className="mb-2" /> 暂无评论
                  </div>
                </td>
              </tr>
            ) : (
              records.map((comment) => (
                <tr key={comment.id}>
                  <td>
                    <div className="flex items-center justify-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: comment.avatarColor || "#3b82f6" }}
                      >
                        {getAvatarInitials(comment.author)}
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-foreground">{comment.author}</div>
                        <div className="text-xs text-gray-500">{comment.userEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="max-w-md">
                    <div className="truncate" title={comment.commentContent}>
                      {comment.commentContent}
                    </div>
                  </td>
                  <td>
                    {comment.postId ? (
                      <span className="badge badge-blue">文章 #{comment.postId}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td>{toDateOnly(comment.createTime) || "—"}</td>
                  <td className="text-right">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 disabled:opacity-40 disabled:cursor-not-allowed"
                        title="删除"
                        onClick={() => handleDelete(comment.id)}
                        disabled={deletingId === comment.id}
                      >
                        {deletingId === comment.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination pageResult={pageResult} page={page} onChange={setPage} />
    </div>
  );
}
