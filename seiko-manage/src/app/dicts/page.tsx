"use client";

import { useState } from "react";
import {
  BookMarked,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import {
  deleteDictItem,
  deleteDictType,
  getDictItemList,
  getDictTypeById,
  getDictTypeList,
  updateDictItemEnabled,
  updateDictTypeEnabled,
} from "@/api/dict";
import type { DictItemVO, DictTypeVO, PageResult } from "@/types";
import { useConfirm } from "@/components/ConfirmDialog";
import PageHeader from "@/components/PageHeader";
import Pagination from "@/components/Pagination";
import DictTypeFormDialog from "@/components/forms/DictTypeFormDialog";
import DictItemFormDialog from "@/components/forms/DictItemFormDialog";
import { useDebounce } from "@/hooks/useDebounce";
import { usePagedList } from "@/hooks/usePagedList";
import { notifyError, notifySuccess } from "@/utils/toast";
import { toDateOnly } from "@/utils/date";

const TYPE_PAGE_SIZE = 10;
const ITEM_PAGE_SIZE = 10;

const TAG_LABELS: Record<string, string> = {
  green: "绿色",
  red: "红色",
  yellow: "黄色",
  blue: "蓝色",
  gray: "灰色",
};

function tagBadgeClass(tag?: string): string {
  switch (tag) {
    case "green":
      return "badge badge-green";
    case "red":
      return "badge badge-red";
    case "yellow":
      return "badge badge-yellow";
    case "blue":
      return "badge badge-blue";
    case "gray":
    default:
      return "badge badge-gray";
  }
}

/** 左侧窄栏用的精简分页 */
function MiniPagination({
  pageResult,
  page,
  onChange,
}: {
  pageResult: PageResult<DictTypeVO> | null;
  page: number;
  onChange: (page: number) => void;
}) {
  const total = pageResult?.total ?? 0;
  const pages = pageResult?.pages ?? 0;
  return (
    <div className="flex items-center justify-between text-xs text-gray-500 px-1">
      <span>共 {total} 条</span>
      <div className="flex items-center gap-1">
        <button
          className="p-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          title="上一页"
        >
          ‹
        </button>
        <span>
          {page}/{pages || 1}
        </span>
        <button
          className="p-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
          title="下一页"
        >
          ›
        </button>
      </div>
    </div>
  );
}

export default function DictsPage() {
  const confirm = useConfirm();

  // ─── 类型列表（左栏） ───
  const [typeSearch, setTypeSearch] = useState("");
  const [selectedType, setSelectedType] = useState<DictTypeVO | null>(null);
  const [typeDialogOpen, setTypeDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<DictTypeVO | null>(null);
  const [typeDeletingId, setTypeDeletingId] = useState<number | null>(null);
  const [typeTogglingId, setTypeTogglingId] = useState<number | null>(null);
  const debouncedTypeSearch = useDebounce(typeSearch);

  const {
    page: typePage,
    setPage: setTypePage,
    loading: typeLoading,
    pageResult: typePageResult,
    records: typeRecords,
    refresh: refreshTypes,
  } = usePagedList<DictTypeVO>({
    pageSize: TYPE_PAGE_SIZE,
    deps: [debouncedTypeSearch],
    fetch: (page) =>
      getDictTypeList({
        page,
        size: TYPE_PAGE_SIZE,
        keyword: debouncedTypeSearch.trim() || undefined,
      }),
  });

  /** 当前生效的字典类型：未手动选择时默认取列表第一个 */
  const activeType = selectedType ?? typeRecords[0] ?? null;

  // ─── 字典项列表（右栏） ───
  const [itemSearch, setItemSearch] = useState("");
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DictItemVO | null>(null);
  const [itemDeletingId, setItemDeletingId] = useState<number | null>(null);
  const [itemTogglingId, setItemTogglingId] = useState<number | null>(null);
  const debouncedItemSearch = useDebounce(itemSearch);

  const {
    page: itemPage,
    setPage: setItemPage,
    loading: itemLoading,
    pageResult: itemPageResult,
    records: itemRecords,
    refresh: refreshItems,
    reset: resetItems,
  } = usePagedList<DictItemVO>({
    pageSize: ITEM_PAGE_SIZE,
    deps: [debouncedItemSearch, activeType?.id],
    fetch: (page) => {
      if (!activeType) {
        return Promise.resolve({
          records: [],
          total: 0,
          current: page,
          size: ITEM_PAGE_SIZE,
          pages: 0,
        });
      }
      return getDictItemList({
        page,
        size: ITEM_PAGE_SIZE,
        typeCode: activeType.typeCode,
        keyword: debouncedItemSearch.trim() || undefined,
      });
    },
  });

  // ─── 类型操作 ───
  const handleSelectType = (type: DictTypeVO) => {
    setSelectedType(type);
    setItemSearch("");
  };

  const handleOpenNewType = () => {
    setEditingType(null);
    setTypeDialogOpen(true);
  };

  const handleEditType = (type: DictTypeVO) => {
    setEditingType(type);
    setTypeDialogOpen(true);
  };

  const handleTypeSaved = async () => {
    refreshTypes();
    // 编辑的是当前选中类型时，同步刷新右侧选中信息
    if (editingType && activeType?.id === editingType.id) {
      try {
        const latest = await getDictTypeById(editingType.id);
        setSelectedType(latest);
      } catch {
        // 列表已刷新，忽略详情刷新失败
      }
    }
  };

  const handleDeleteType = async (type: DictTypeVO) => {
    if (!(await confirm({
      message: `确定删除字典类型「${type.typeName}」吗？将同时删除其下 ${type.itemCount ?? 0} 条字典项，删除后不可恢复。`,
    }))) return;
    setTypeDeletingId(type.id);
    try {
      await deleteDictType(type.id);
      notifySuccess("字典类型删除成功");
      if (selectedType?.id === type.id) {
        setSelectedType(null);
      }
      refreshTypes();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "删除失败");
    } finally {
      setTypeDeletingId(null);
    }
  };

  const handleToggleType = async (type: DictTypeVO) => {
    setTypeTogglingId(type.id);
    try {
      await updateDictTypeEnabled(type.id, !type.enabled);
      notifySuccess("字典类型状态更新成功");
      if (selectedType?.id === type.id) {
        setSelectedType({ ...type, enabled: !type.enabled });
      }
      refreshTypes();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "状态更新失败");
    } finally {
      setTypeTogglingId(null);
    }
  };

  // ─── 字典项操作 ───
  const handleResetItemSearch = () => {
    setItemSearch("");
    resetItems();
  };

  const handleOpenNewItem = () => {
    setEditingItem(null);
    setItemDialogOpen(true);
  };

  const handleEditItem = (item: DictItemVO) => {
    setEditingItem(item);
    setItemDialogOpen(true);
  };

  const handleDeleteItem = async (item: DictItemVO) => {
    if (!(await confirm({ message: `确定删除字典项「${item.itemLabel}（${item.itemValue}）」吗？删除后不可恢复。` }))) return;
    setItemDeletingId(item.id);
    try {
      await deleteDictItem(item.id);
      notifySuccess("字典项删除成功");
      refreshItems();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "删除失败");
    } finally {
      setItemDeletingId(null);
    }
  };

  const handleToggleItem = async (item: DictItemVO) => {
    setItemTogglingId(item.id);
    try {
      await updateDictItemEnabled(item.id, !item.enabled);
      notifySuccess("字典项状态更新成功");
      refreshItems();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "状态更新失败");
    } finally {
      setItemTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="字典管理" />

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
        {/* ─── 左栏：字典类型列表 ─── */}
        <div className="card p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-foreground">字典类型</h2>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleOpenNewType}
            >
              <Plus size={14} /> 新建类型
            </button>
          </div>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索编码或名称..."
              className="input input-icon text-sm"
              value={typeSearch}
              onChange={(e) => setTypeSearch(e.target.value)}
            />
          </div>

          <div className="space-y-2 max-h-[calc(100vh-360px)] overflow-y-auto">
            {typeLoading ? (
              <div className="flex items-center justify-center py-10 text-gray-500">
                <Loader2 size={18} className="animate-spin mr-2" /> 加载中...
              </div>
            ) : typeRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <BookMarked size={28} className="mb-2" /> 暂无字典类型
              </div>
            ) : (
              typeRecords.map((type) => {
                const isSelected = selectedType?.id === type.id;
                return (
                  <div
                    key={type.id}
                    onClick={() => handleSelectType(type)}
                    className={`rounded-lg border p-3 cursor-pointer transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border hover:bg-(--hover-bg)"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-sm text-foreground truncate">
                        {type.typeName}
                      </span>
                      <span className="text-xs text-gray-400 shrink-0">
                        {type.itemCount ?? 0} 项
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 font-mono mt-0.5">
                      {type.typeCode}
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <button
                        type="button"
                        className="p-1 rounded-lg hover:bg-blue-50 text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
                        title="编辑"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditType(type);
                        }}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed"
                        title={type.enabled ? "停用" : "启用"}
                        disabled={typeTogglingId === type.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleType(type);
                        }}
                      >
                        {typeTogglingId === type.id ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : type.enabled ? (
                          <EyeOff size={13} />
                        ) : (
                          <Eye size={13} />
                        )}
                      </button>
                      <button
                        type="button"
                        className="p-1 rounded-lg hover:bg-red-50 text-red-600 disabled:opacity-40 disabled:cursor-not-allowed"
                        title="删除"
                        disabled={typeDeletingId === type.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteType(type);
                        }}
                      >
                        {typeDeletingId === type.id ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Trash2 size={13} />
                        )}
                      </button>
                      <span
                        className={`ml-auto text-xs ${
                          type.enabled ? "text-green-600" : "text-gray-400"
                        }`}
                      >
                        {type.enabled ? "启用" : "停用"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <MiniPagination pageResult={typePageResult} page={typePage} onChange={setTypePage} />
        </div>

        {/* ─── 右栏：字典项列表 ─── */}
        {activeType ? (
          <div className="space-y-6 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {activeType.typeName}
                  <span className="ml-2 text-sm font-normal text-gray-400 font-mono">
                    {activeType.typeCode}
                  </span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {activeType.remark || "暂无备注"}
                </p>
              </div>
              <button type="button" className="btn btn-primary" onClick={handleOpenNewItem}>
                <Plus size={16} /> 新增字典项
              </button>
            </div>

            {/* Filter Bar */}
            <div className="card flex items-center gap-4">
              <div className="relative flex-9 min-w-0">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索标签或值..."
                  className="input input-icon"
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="btn btn-secondary flex-1 min-w-0 justify-center whitespace-nowrap"
                onClick={handleResetItemSearch}
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
                    <th>标签</th>
                    <th>值</th>
                    <th>样式</th>
                    <th>默认</th>
                    <th>排序</th>
                    <th>状态</th>
                    <th>创建时间</th>
                    <th className="text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {itemLoading ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-gray-500">
                        <div className="flex items-center justify-center">
                          <Loader2 size={24} className="animate-spin mr-2" /> 加载中...
                        </div>
                      </td>
                    </tr>
                  ) : itemRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-gray-400">
                        <div className="flex flex-col items-center justify-center">
                          <BookMarked size={36} className="mb-2" /> 暂无字典项
                        </div>
                      </td>
                    </tr>
                  ) : (
                    itemRecords.map((item) => (
                      <tr key={item.id}>
                        <td className="font-medium text-foreground">{item.itemLabel}</td>
                        <td className="font-mono text-xs text-gray-500">{item.itemValue}</td>
                        <td>
                          <span className={tagBadgeClass(item.itemTag)}>
                            {item.itemTag ? TAG_LABELS[item.itemTag] ?? item.itemTag : "—"}
                          </span>
                        </td>
                        <td>
                          {item.isDefault ? (
                            <span className="badge badge-blue">默认</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td>{item.sortOrder}</td>
                        <td>
                          <span className={`badge ${item.enabled ? "badge-green" : "badge-gray"}`}>
                            {item.enabled ? "启用" : "停用"}
                          </span>
                        </td>
                        <td>{toDateOnly(item.createTime) || "—"}</td>
                        <td className="text-right">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed"
                              title={item.enabled ? "停用" : "启用"}
                              onClick={() => handleToggleItem(item)}
                              disabled={itemTogglingId === item.id}
                            >
                              {itemTogglingId === item.id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : item.enabled ? (
                                <EyeOff size={14} />
                              ) : (
                                <Eye size={14} />
                              )}
                            </button>
                            <button
                              className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"
                              title="编辑"
                              onClick={() => handleEditItem(item)}
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 disabled:opacity-40 disabled:cursor-not-allowed"
                              title="删除"
                              onClick={() => handleDeleteItem(item)}
                              disabled={itemDeletingId === item.id}
                            >
                              {itemDeletingId === item.id ? (
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

            <Pagination pageResult={itemPageResult} page={itemPage} onChange={setItemPage} />
          </div>
        ) : (
          <div className="card flex flex-col items-center justify-center py-24 text-gray-400">
            <BookMarked size={48} className="mb-3" />
            <p>请先在左侧选择或新建一个字典类型</p>
          </div>
        )}
      </div>

      {/* 弹窗 */}
      <DictTypeFormDialog
        open={typeDialogOpen}
        type={editingType}
        onClose={() => setTypeDialogOpen(false)}
        onSaved={handleTypeSaved}
      />
      <DictItemFormDialog
        open={itemDialogOpen}
        item={editingItem}
        typeCode={activeType?.typeCode ?? ""}
        onClose={() => setItemDialogOpen(false)}
        onSaved={refreshItems}
      />
    </div>
  );
}
