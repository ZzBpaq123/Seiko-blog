"use client";

import { useEffect, useRef, useState } from "react";
import { List, Loader2 } from "lucide-react";
import { createDictItem, updateDictItem } from "@/api/dict";
import { notifyError, notifySuccess } from "@/utils/toast";
import Select from "@/components/Select";
import type { DictItemDTO, DictItemVO } from "@/types";

interface DictItemFormDialogProps {
  open: boolean;
  /** 传入则为编辑模式，否则为新建 */
  item?: DictItemVO | null;
  /** 当前字典类型编码（新建时必传） */
  typeCode: string;
  onClose: () => void;
  onSaved: () => void;
}

const TAG_OPTIONS = [
  { value: "", label: "无样式" },
  { value: "green", label: "绿色" },
  { value: "red", label: "红色" },
  { value: "yellow", label: "黄色" },
  { value: "blue", label: "蓝色" },
  { value: "gray", label: "灰色" },
];

function tagBadgeClass(tag: string): string {
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
      return "badge badge-gray";
    default:
      return "badge badge-gray";
  }
}

export default function DictItemFormDialog({
  open,
  item,
  typeCode,
  onClose,
  onSaved,
}: DictItemFormDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
      <DictItemForm item={item} typeCode={typeCode} onClose={onClose} onSaved={onSaved} />
    </div>
  );
}

function DictItemForm({
  item,
  typeCode,
  onClose,
  onSaved,
}: Omit<DictItemFormDialogProps, "open">) {
  const [itemLabel, setItemLabel] = useState(item?.itemLabel ?? "");
  const [itemValue, setItemValue] = useState(item?.itemValue ?? "");
  const [itemTag, setItemTag] = useState(item?.itemTag ?? "");
  const [isDefault, setIsDefault] = useState(item?.isDefault ?? false);
  const [sortOrder, setSortOrder] = useState(item?.sortOrder ?? 0);
  const [enabled, setEnabled] = useState(item?.enabled ?? true);
  const [submitting, setSubmitting] = useState(false);
  const labelRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => labelRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!itemLabel.trim()) {
      notifyError("请填写字典项标签");
      return;
    }
    if (!itemValue.trim()) {
      notifyError("请填写字典项值");
      return;
    }
    const payload: DictItemDTO = {
      typeCode,
      itemLabel: itemLabel.trim(),
      itemValue: itemValue.trim(),
      itemTag: itemTag || undefined,
      isDefault,
      sortOrder,
      enabled,
    };
    setSubmitting(true);
    try {
      if (item) await updateDictItem(item.id, payload);
      else await createDictItem(payload);
      notifySuccess(item ? "字典项更新成功" : "字典项创建成功");
      onSaved();
      onClose();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative w-full max-w-md rounded-xl bg-card-bg p-6 shadow-xl animate-dialog-in"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/10">
          <List size={20} className="text-blue-600" />
        </span>
        <h3 className="flex-1 pt-2 text-base font-semibold text-foreground">
          {item ? "编辑字典项" : "新增字典项"}
        </h3>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            所属类型
          </label>
          <input
            type="text"
            className="input w-full bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
            value={typeCode}
            disabled
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            展示标签 *
          </label>
          <input
            ref={labelRef}
            type="text"
            className="input w-full"
            placeholder="如：开启"
            value={itemLabel}
            onChange={(e) => setItemLabel(e.target.value)}
            autoComplete="off"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            存储值 *
          </label>
          <input
            type="text"
            className="input w-full"
            placeholder="如：0"
            value={itemValue}
            onChange={(e) => setItemValue(e.target.value)}
            autoComplete="off"
          />
          <p className="text-xs text-gray-400 mt-1.5">
            同一类型内不可重复；建议与业务字段实际存储值保持一致。
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            标签样式
          </label>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Select
                value={itemTag}
                onChange={(v) => setItemTag(String(v))}
                options={TAG_OPTIONS}
                placeholder="选择样式"
              />
            </div>
            <span className={tagBadgeClass(itemTag)}>{itemLabel.trim() || "预览"}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              排序
            </label>
            <input
              type="number"
              className="input w-full"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
            />
          </div>
          <div className="flex flex-col justify-end gap-2 pb-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-4 h-4 accent-[var(--primary)]"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
              />
              <span className="text-sm text-gray-600">设为默认项</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-4 h-4 accent-[var(--primary)]"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
              />
              <span className="text-sm text-gray-600">启用</span>
            </label>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          取消
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting && <Loader2 size={14} className="animate-spin" />}
          保存
        </button>
      </div>
    </form>
  );
}
