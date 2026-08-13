"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Tag } from "lucide-react";
import { createTag, updateTag } from "@/api/tag";
import { notifyError } from "@/utils/toast";
import type { TagDTO, TagVO } from "@/types";

interface TagFormDialogProps {
  open: boolean;
  /** 传入则为编辑模式，否则为新建 */
  tag?: TagVO | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function TagFormDialog({ open, tag, onClose, onSaved }: TagFormDialogProps) {
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
      <TagForm tag={tag} onClose={onClose} onSaved={onSaved} />
    </div>
  );
}

function TagForm({
  tag,
  onClose,
  onSaved,
}: Omit<TagFormDialogProps, "open">) {
  const [name, setName] = useState(tag?.name ?? "");
  const [slug, setSlug] = useState(tag?.slug ?? "");
  const [submitting, setSubmitting] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => nameRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!name.trim()) {
      notifyError("请填写标签名称");
      return;
    }
    const payload: TagDTO = {
      name: name.trim(),
      slug: slug.trim() || undefined,
    };
    setSubmitting(true);
    try {
      if (tag) await updateTag(tag.id, payload);
      else await createTag(payload);
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
          <Tag size={20} className="text-blue-600" />
        </span>
        <h3 className="flex-1 pt-2 text-base font-semibold text-foreground">
          {tag ? "编辑标签" : "新建标签"}
        </h3>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            标签名称 *
          </label>
          <input
            ref={nameRef}
            type="text"
            className="input w-full"
            placeholder="如：Spring Boot"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="off"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            URL 标识
          </label>
          <input
            type="text"
            className="input w-full"
            placeholder="如：spring-boot；留空将根据名称自动生成"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            autoComplete="off"
          />
          <p className="text-xs text-gray-400 mt-1.5">
            用于生成标签页面的 URL，仅支持字母、数字、连字符和下划线。
          </p>
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
