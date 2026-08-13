"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, Pencil, Trash2, Eye, EyeOff, RotateCcw, Loader2, Bell } from "lucide-react";
import {
  getNoticeList,
  deleteNotice,
  updateNoticeEnabled,
} from "@/api/notice";
import type { NoticeVO } from "@/types";
import { useConfirm } from "@/components/ConfirmDialog";
import Select from "@/components/Select";
import PageHeader from "@/components/PageHeader";
import Pagination from "@/components/Pagination";
import { useDebounce } from "@/hooks/useDebounce";
import { usePagedList } from "@/hooks/usePagedList";
import { notifyError } from "@/utils/toast";
import { toDateOnly } from "@/utils/date";

const PAGE_SIZE = 10;

export default function NoticesPage() {
  const router = useRouter();
  const confirm = useConfirm();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const debouncedSearch = useDebounce(search);

  const { page, setPage, loading, pageResult, records, refresh, reset } = usePagedList<NoticeVO>({
    pageSize: PAGE_SIZE,
    deps: [debouncedSearch, statusFilter],
    fetch: (page) =>
      getNoticeList({
        page,
        size: PAGE_SIZE,
        noticeTitle: debouncedSearch.trim() || undefined,
        enabled: statusFilter === "" ? undefined : statusFilter === "true",
      }),
  });

  const handleReset = () => {
    setSearch("");
    setStatusFilter("");
    reset();
  };

  // 切换启用状态
  const handleToggle = async (notice: NoticeVO) => {
    setTogglingId(notice.id);
    try {
      await updateNoticeEnabled(notice.id, !notice.enabled);
      refresh();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "操作失败");
    } finally {
      setTogglingId(null);
    }
  };

  // 删除公告
  const handleDelete = async (id: number) => {
    if (!id) return;
    if (!(await confirm({ message: "确定要删除这条公告吗？删除后不可恢复。" }))) return;
    setDeletingId(id);
    try {
      await deleteNotice(id);
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
        title="公告管理"
        action={
          <Link href="/notices/new" className="btn btn-primary">
            <Plus size={16} /> 新建公告
          </Link>
        }
      />

      {/* Filter Bar */}
      <div className="card flex items-center gap-4">
        <div className="relative flex-6 min-w-0">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索公告标题..."
            className="input input-icon"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          className="flex-3 min-w-0"
          value={statusFilter}
          onChange={(v) => setStatusFilter(String(v))}
          options={[
            { value: "", label: "全部状态" },
            { value: "true", label: "已启用" },
            { value: "false", label: "已停用" },
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

      {/* Table */}
      <div className="card table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>排序</th>
              <th>标题</th>
              <th>内容</th>
              <th>状态</th>
              <th>创建时间</th>
              <th className="text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-16 text-gray-500">
                  <div className="flex items-center justify-center">
                    <Loader2 size={24} className="animate-spin mr-2" /> 加载中...
                  </div>
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-gray-400">
                  <div className="flex flex-col items-center justify-center">
                    <Bell size={36} className="mb-2" /> 暂无公告
                  </div>
                </td>
              </tr>
            ) : (
              records.map((notice) => (
                <tr key={notice.id}>
                  <td>{notice.sortOrder}</td>
                  <td className="font-medium text-foreground">{notice.noticeTitle}</td>
                  <td className="max-w-xs truncate">{notice.noticeContent || "—"}</td>
                  <td>
                    <span className={`badge ${notice.enabled ? "badge-green" : "badge-gray"}`}>
                      {notice.enabled ? "已启用" : "已停用"}
                    </span>
                  </td>
                  <td>{toDateOnly(notice.createTime) || "—"}</td>
                  <td className="text-right">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed"
                        title={notice.enabled ? "停用" : "启用"}
                        onClick={() => handleToggle(notice)}
                        disabled={togglingId === notice.id}
                      >
                        {togglingId === notice.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : notice.enabled ? (
                          <EyeOff size={14} />
                        ) : (
                          <Eye size={14} />
                        )}
                      </button>
                      <button
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"
                        title="编辑"
                        onClick={() => router.push(`/notices/edit?id=${notice.id}`)}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 disabled:opacity-40 disabled:cursor-not-allowed"
                        title="删除"
                        onClick={() => handleDelete(notice.id)}
                        disabled={deletingId === notice.id}
                      >
                        <Trash2 size={14} />
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
