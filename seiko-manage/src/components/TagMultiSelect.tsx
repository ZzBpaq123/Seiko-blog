"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Loader2, X } from "lucide-react";
import { getTagList } from "@/api/post";
import type { TagVO } from "@/types";

interface TagMultiSelectProps {
  /** 已选标签名称列表（受控） */
  value: string[];
  /** 选择变化回调 */
  onChange: (tags: string[]) => void;
  /** 字段标签 */
  label?: string;
  /** 占位提示 */
  placeholder?: string;
  /** 是否禁用 */
  disabled?: boolean;
}

export default function TagMultiSelect({
  value,
  onChange,
  label,
  placeholder = "选择标签",
  disabled = false,
}: TagMultiSelectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [options, setOptions] = useState<TagVO[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // 加载标签列表
  useEffect(() => {
    let active = true;
    Promise.resolve()
      .then(() => {
        setLoading(true);
        return getTagList();
      })
      .then((list) => {
        if (active) setOptions(list);
      })
      .catch(() => {
        // 标签加载失败时保持空选项即可
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // 点击外部关闭下拉
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const toggleTag = (name: string) => {
    if (value.includes(name)) {
      onChange(value.filter((t) => t !== name));
    } else {
      onChange([...value, name]);
    }
  };

  const removeTag = (name: string) => {
    onChange(value.filter((t) => t !== name));
  };

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-600 mb-1.5">
          {label}
        </label>
      )}

      {/* 选择框 */}
      <div
        onClick={() => !disabled && setOpen((o) => !o)}
        className={[
          "input flex items-center flex-wrap gap-1.5 min-h-[2.5rem] cursor-pointer",
          disabled ? "cursor-not-allowed opacity-70" : "",
        ].join(" ")}
      >
        {value.length === 0 ? (
          <span className="text-gray-400">{placeholder}</span>
        ) : (
          value.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1 rounded-md bg-primary/10 text-primary text-xs px-2 py-0.5"
            >
              {name}
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTag(name);
                  }}
                  className="hover:text-red-500"
                  aria-label={`移除 ${name}`}
                >
                  <X size={12} />
                </button>
              )}
            </span>
          ))
        )}
        <ChevronDown
          size={16}
          className={`ml-auto text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>

      {/* 下拉面板 */}
      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-card-bg shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-4 text-sm text-gray-400">
              <Loader2 size={16} className="animate-spin" /> 加载中...
            </div>
          ) : options.length === 0 ? (
            <div className="py-4 text-center text-sm text-gray-400">暂无标签</div>
          ) : (
            options.map((tag) => {
              const selected = value.includes(tag.name);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.name)}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm text-left hover:bg-[var(--hover-bg)]"
                >
                  <span className={selected ? "text-primary font-medium" : "text-foreground"}>
                    {tag.name}
                  </span>
                  {selected && <Check size={16} className="text-primary" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
