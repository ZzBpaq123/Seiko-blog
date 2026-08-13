"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, Pencil, Trash2, Eye, Loader2, RotateCcw, X, MapPin } from "lucide-react";
import { deleteFootprint, getFootprintById, getFootprintList } from "@/api/footprint";
import type { FootprintVO } from "@/types";
import { useConfirm } from "@/components/ConfirmDialog";
import Select from "@/components/Select";
import PageHeader from "@/components/PageHeader";
import Pagination from "@/components/Pagination";
import { useDebounce } from "@/hooks/useDebounce";
import { usePagedList } from "@/hooks/usePagedList";
import { notifyError } from "@/utils/toast";

const PAGE_SIZE = 10;

function formatType(type: string) {
  return type === "domestic" ? "国内" : type === "international" ? "国际" : type;
}

function typeBadgeClass(type: string) {
  return type === "domestic" ? "badge badge-blue" : "badge badge-purple";
}

export default function FootprintsPage() {
  const router = useRouter();
  const confirm = useConfirm();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [detail, setDetail] = useState<FootprintVO | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const debouncedSearch = useDebounce(search);

  const { page, setPage, loading, pageResult, records, refresh, reset } = usePagedList<FootprintVO>({
    pageSize: PAGE_SIZE,
    deps: [debouncedSearch, typeFilter],
    fetch: (page) =>
      getFootprintList({
        page,
        size: PAGE_SIZE,
        city: debouncedSearch.trim() || undefined,
        footprintType: typeFilter || undefined,
      }),
  });

  const handleReset = () => {
    setSearch("");
    setTypeFilter("");
    reset();
  };

  // 查看足迹详情
  const handleView = async (id: number) => {
    if (!id) return;
    setDetailLoading(true);
    try {
      const footprint = await getFootprintById(id);
      setDetail(footprint);
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "加载详情失败");
    } finally {
      setDetailLoading(false);
    }
  };

  // 删除足迹
  const handleDelete = async (id: number) => {
    if (!id) return;
    if (!(await confirm({ message: "确定要删除这条足迹吗？删除后不可恢复。" }))) return;
    setDeletingId(id);
    try {
      await deleteFootprint(id);
      refresh();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "删除失败");
    } finally {
      setDeletingId(null);
    }
  };

  // 编辑足迹
  const handleEdit = (id: number) => {
    if (!id) return;
    router.push(`/footprints/edit?id=${id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="足迹管理"
        action={
          <Link href="/footprints/new" className="btn btn-primary">
            <Plus size={16} /> 添加足迹
          </Link>
        }
      />

      {/* Filter Bar：搜索框占 60%，类型下拉占 30%，重置按钮占 10%，不换行 */}
      <div className="card flex items-center gap-3 md:gap-4">
        {/* 搜索框 */}
        <div className="relative flex-6 min-w-0">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索城市..."
            className="input input-icon w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* 类型下拉 */}
        <Select
          className="flex-3 min-w-0"
          value={typeFilter}
          onChange={(v) => setTypeFilter(String(v))}
          options={[
            { value: "", label: "全部类型" },
            { value: "domestic", label: "国内" },
            { value: "international", label: "国际" },
          ]}
        />

        {/* 重置按钮 */}
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
              <th>城市</th>
              <th>省份/州</th>
              <th>国家</th>
              <th>类型</th>
              <th>坐标</th>
              <th>日期</th>
              <th className="text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="py-16 text-gray-500">
                  <div className="flex items-center justify-center">
                    <Loader2 size={24} className="animate-spin mr-2" />
                    加载中...
                  </div>
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-gray-400">
                  <div className="flex flex-col items-center justify-center">
                    <MapPin size={36} className="mb-2" />
                    暂无足迹
                  </div>
                </td>
              </tr>
            ) : (
              records.map((fp) => (
                <tr key={fp.id}>
                  <td className="font-medium text-foreground">{fp.city}</td>
                  <td>{fp.province}</td>
                  <td>
                    <span className="flex items-center justify-center gap-1">
                      <MapPin size={14} className="text-gray-400" />
                      {fp.country}
                    </span>
                  </td>
                  <td>
                    <span className={typeBadgeClass(fp.footprintType)}>
                      {formatType(fp.footprintType)}
                    </span>
                  </td>
                  <td className="text-xs text-gray-500 font-mono">
                    {fp.lat?.toFixed(4) ?? "—"}, {fp.lng?.toFixed(4) ?? "—"}
                  </td>
                  <td>{fp.footprintDate ?? "—"}</td>
                  <td className="text-right">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed"
                        title="查看"
                        onClick={() => handleView(fp.id)}
                        disabled={detailLoading || !fp.id}
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
                        title="编辑"
                        onClick={() => handleEdit(fp.id)}
                        disabled={!fp.id}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 disabled:opacity-40 disabled:cursor-not-allowed"
                        title="删除"
                        onClick={() => handleDelete(fp.id)}
                        disabled={deletingId === fp.id || !fp.id}
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

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">
                {detail.city} · {detail.country}
              </h2>
              <button
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                onClick={() => setDetail(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-4 overflow-y-auto flex-1 space-y-4">
              {detail.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={detail.image}
                  alt={detail.city}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              <div className="flex flex-wrap gap-2">
                <span className={typeBadgeClass(detail.footprintType)}>
                  {formatType(detail.footprintType)}
                </span>
                <span className="badge badge-blue">{detail.countryCode?.toUpperCase()}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">省份/州：</span>
                  {detail.province}
                </div>
                <div>
                  <span className="text-gray-500">日期：</span>
                  {detail.footprintDate ?? "—"}
                </div>
                <div>
                  <span className="text-gray-500">经度：</span>
                  {detail.lng ?? "—"}
                </div>
                <div>
                  <span className="text-gray-500">纬度：</span>
                  {detail.lat ?? "—"}
                </div>
              </div>
              {detail.description && (
                <div>
                  <span className="text-gray-500 text-sm block mb-1">描述</span>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{detail.description}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-border bg-gray-50 dark:bg-gray-800/50">
              <button className="btn btn-secondary" onClick={() => setDetail(null)}>
                关闭
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setDetail(null);
                  router.push(`/footprints/edit?id=${detail.id}`);
                }}
              >
                去编辑
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
