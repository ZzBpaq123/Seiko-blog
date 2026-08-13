"use client";

import { useState } from "react";
import { Plus, Search, Pencil, Trash2, RotateCcw, Loader2, Tag } from "lucide-react";
import { getTagPage, deleteTag } from "@/api/tag";
import type { TagVO } from "@/types";
import { useConfirm } from "@/components/ConfirmDialog";
import TagFormDialog from "@/components/forms/TagFormDialog";
import PageHeader from "@/components/PageHeader";
import Pagination from "@/components/Pagination";
import { useDebounce } from "@/hooks/useDebounce";
import { usePagedList } from "@/hooks/usePagedList";
import { notifyError } from "@/utils/toast";

const PAGE_SIZE = 10;

export default function TagsPage() {
  const confirm = useConfirm();

  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<TagVO | null>(null);
  const debouncedSearch = useDebounce(search);

  const { page, setPage, loading, pageResult, records, refresh, reset } = usePagedList<TagVO>({
    pageSize: PAGE_SIZE,
    deps: [debouncedSearch],
    fetch: (page) =>
      getTagPage({
        page,
        size: PAGE_SIZE,
        keyword: debouncedSearch.trim() || undefined,
      }),
  });

  const handleReset = () => {
    setSearch("");
    reset();
  };

  // 删除标签
  const handleDelete = async (id: number) => {
    if (!id) return;
    if (!(await confirm({ message: "确定要删除这个标签吗？已关联文章的标签将无法删除。" }))) return;
    setDeletingId(id);
    try {
      await deleteTag(id);
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
        title="标签管理"
        action={
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setEditingTag(null);
              setDialogOpen(true);
            }}
          >
            <Plus size={16} /> 新建标签
          </button>
        }
      />

      {/* Filter Bar */}
      <div className="card flex items-center gap-4">
        <div className="relative flex-9 min-w-0">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索标签名称或标识..."
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
              <th>标签名称</th>
              <th>URL 标识</th>
              <th className="text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="py-16 text-gray-500">
                  <div className="flex items-center justify-center">
                    <Loader2 size={24} className="animate-spin mr-2" /> 加载中...
                  </div>
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-16 text-gray-400">
                  <div className="flex flex-col items-center justify-center">
                    <Tag size={36} className="mb-2" /> 暂无标签
                  </div>
                </td>
              </tr>
            ) : (
              records.map((tag) => (
                <tr key={tag.id}>
                  <td className="font-medium text-foreground">{tag.name}</td>
                  <td>
                    <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded">
                      {tag.slug || "—"}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"
                        title="编辑"
                        onClick={() => {
                          setEditingTag(tag);
                          setDialogOpen(true);
                        }}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 disabled:opacity-40 disabled:cursor-not-allowed"
                        title="删除"
                        onClick={() => handleDelete(tag.id)}
                        disabled={deletingId === tag.id}
                      >
                        {deletingId === tag.id ? (
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

      <TagFormDialog
        open={dialogOpen}
        tag={editingTag}
        onClose={() => setDialogOpen(false)}
        onSaved={refresh}
      />
    </div>
  );
}
