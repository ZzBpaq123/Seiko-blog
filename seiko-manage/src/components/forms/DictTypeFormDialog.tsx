"use client";

import { useEffect, useRef, useState } from "react";
import { BookMarked, Loader2 } from "lucide-react";
import { createDictType, updateDictType } from "@/api/dict";
import { notifyError, notifySuccess } from "@/utils/toast";
import type { DictTypeDTO, DictTypeVO } from "@/types";

interface DictTypeFormDialogProps {
  open: boolean;
  /** 传入则为编辑模式，否则为新建 */
  type?: DictTypeVO | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function DictTypeFormDialog({ open, type, onClose, onSaved }: DictTypeFormDialogProps) {
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
      <DictTypeForm type={type} onClose={onClose} onSaved={onSaved} />
    </div>
  );
}

function DictTypeForm({ type, onClose, onSaved }: Omit<DictTypeFormDialogProps, "open">) {
  const [typeName, setTypeName] = useState(type?.typeName ?? "");
  const [typeCode, setTypeCode] = useState(type?.typeCode ?? "");
  const [remark, setRemark] = useState(type?.remark ?? "");
  const [sortOrder, setSortOrder] = useState(type?.sortOrder ?? 0);
  const [enabled, setEnabled] = useState(type?.enabled ?? true);
  const [submitting, setSubmitting] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => nameRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!typeName.trim()) {
      notifyError("请填写字典类型名称");
      return;
    }
    if (!typeCode.trim()) {
      notifyError("请填写字典类型编码");
      return;
    }
    const payload: DictTypeDTO = {
      typeName: typeName.trim(),
      typeCode: typeCode.trim(),
      remark: remark.trim() || undefined,
      sortOrder,
      enabled,
    };
    setSubmitting(true);
    try {
      if (type) await updateDictType(type.id, payload);
      else await createDictType(payload);
      notifySuccess(type ? "字典类型更新成功" : "字典类型创建成功");
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
          <BookMarked size={20} className="text-blue-600" />
        </span>
        <h3 className="flex-1 pt-2 text-base font-semibold text-foreground">
          {type ? "编辑字典类型" : "新建字典类型"}
        </h3>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            类型名称 *
          </label>
          <input
            ref={nameRef}
            type="text"
            className="input w-full"
            placeholder="如：通用状态"
            value={typeName}
            onChange={(e) => setTypeName(e.target.value)}
            autoComplete="off"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            类型编码 *
          </label>
          <input
            type="text"
            className="input w-full"
            placeholder="如：common_status"
            value={typeCode}
            onChange={(e) => setTypeCode(e.target.value)}
            disabled={Boolean(type)}
            autoComplete="off"
          />
          <p className="text-xs text-gray-400 mt-1.5">
            仅支持小写字母、数字和下划线，以小写字母开头；创建后不可修改。
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            备注
          </label>
          <textarea
            className="input w-full min-h-20 resize-y"
            placeholder="选填，说明该字典的用途"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
          />
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
          <div className="flex items-end pb-1">
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
