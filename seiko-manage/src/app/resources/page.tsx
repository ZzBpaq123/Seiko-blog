"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  RotateCcw,
  Loader2,
  Link as LinkIcon,
  ExternalLink,
} from "lucide-react";
import {
  getResourceList,
  deleteResource,
  updateResourceEnabled,
} from "@/api/resource";
import type { ResourceVO } from "@/types";
import { useConfirm } from "@/components/ConfirmDialog";
import Select from "@/components/Select";
import CapsuleToggle from "@/components/CapsuleToggle";
import PageHeader from "@/components/PageHeader";
import Pagination from "@/components/Pagination";
import { useDebounce } from "@/hooks/useDebounce";
import { usePagedList } from "@/hooks/usePagedList";
import { useDictOptions } from "@/hooks/useDict";
import { dictSelectOptions } from "@/utils/dict";
import { notifyError, notifySuccess } from "@/utils/toast";
import { toDateOnly } from "@/utils/date";

const PAGE_SIZE = 10;

export default function ResourcesPage() {
  const router = useRouter();
  const confirm = useConfirm();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const debouncedSearch = useDebounce(search);
  const { options: commonBooleanOptions } = useDictOptions("common_boolean");

  const { page, setPage, loading, pageResult, records, refresh, reset, updateRecord } = usePagedList<ResourceVO>({
    pageSize: PAGE_SIZE,
    deps: [debouncedSearch, categoryFilter, statusFilter],
    fetch: (page) =>
      getResourceList({
        page,
        size: PAGE_SIZE,
        resourceName: debouncedSearch.trim() || undefined,
        category: categoryFilter.trim() || undefined,
        enabled: statusFilter === "" ? undefined : statusFilter === "true",
      }),
  });

  const handleReset = () => {
    setSearch("");
    setCategoryFilter("");
    setStatusFilter("");
    reset();
  };

  // 切换启用状态（无筛选时局部乐观更新，失败回滚；有状态筛选时刷新保证列表一致）
  const handleToggle = async (resource: ResourceVO) => {
    setTogglingId(resource.id);
    const nextEnabled = !resource.enabled;
    const shouldRefresh = statusFilter !== "";

    if (!shouldRefresh) {
      updateRecord(resource.id, (r) => ({ ...r, enabled: nextEnabled }));
    }

    try {
      await updateResourceEnabled(resource.id, nextEnabled);
      notifySuccess("资源状态更新成功");
      if (shouldRefresh) refresh();
    } catch (err) {
      if (!shouldRefresh) {
        updateRecord(resource.id, (r) => ({ ...r, enabled: resource.enabled }));
      }
      notifyError(err instanceof Error ? err.message : "操作失败");
    } finally {
      setTogglingId(null);
    }
  };

  // 删除资源
  const handleDelete = async (id: number) => {
    if (!id) return;
    if (!(await confirm({ message: "确定要删除这个资源吗？删除后不可恢复。" }))) return;
    setDeletingId(id);
    try {
      await deleteResource(id);
      notifySuccess("资源删除成功");
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
        title="资源管理"
        action={
          <Link href="/resources/new" className="btn btn-primary">
            <Plus size={16} /> 新建资源
          </Link>
        }
      />

      {/* Filter Bar */}
      <div className="card flex items-center gap-4">
        <div className="relative flex-5 min-w-0">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索资源名称..."
            className="input input-icon"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <input
          type="text"
          placeholder="按分类筛选..."
          className="input flex-3 min-w-0"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        />
        <Select
          className="flex-3 min-w-0"
          value={statusFilter}
          onChange={(v) => setStatusFilter(String(v))}
          options={dictSelectOptions(commonBooleanOptions, "全部状态")}
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
              <th>资源名称</th>
              <th>网址</th>
              <th>分类</th>
              <th>简介</th>
              <th>状态</th>
              <th>创建时间</th>
              <th className="text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="py-16 text-gray-500">
                  <div className="flex items-center justify-center">
                    <Loader2 size={24} className="animate-spin mr-2" /> 加载中...
                  </div>
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-gray-400">
                  <div className="flex flex-col items-center justify-center">
                    <LinkIcon size={36} className="mb-2" /> 暂无资源
                  </div>
                </td>
              </tr>
            ) : (
              records.map((resource) => (
                <tr key={resource.id}>
                  <td>{resource.sortOrder}</td>
                  <td className="font-medium text-foreground">{resource.resourceName}</td>
                  <td className="max-w-xs">
                    {resource.resourceUrl ? (
                      <a
                        href={resource.resourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline truncate max-w-60"
                        title={resource.resourceUrl}
                      >
                        <span className="truncate">{resource.resourceUrl}</span>
                        <ExternalLink size={12} className="shrink-0" />
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    {resource.category ? (
                      <span className="badge badge-gray">{resource.category}</span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="max-w-xs truncate">{resource.description || "—"}</td>
                  <td>
                    <CapsuleToggle
                      checked={resource.enabled}
                      onChange={() => handleToggle(resource)}
                      disabled={togglingId === resource.id}
                    />
                  </td>
                  <td>{toDateOnly(resource.createTime) || "—"}</td>
                  <td className="text-right">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"
                        title="编辑"
                        onClick={() => router.push(`/resources/edit?id=${resource.id}`)}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 disabled:opacity-40 disabled:cursor-not-allowed"
                        title="删除"
                        onClick={() => handleDelete(resource.id)}
                        disabled={deletingId === resource.id}
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
