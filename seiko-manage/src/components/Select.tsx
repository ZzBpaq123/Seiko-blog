"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps {
  /** 当前选中值（受控） */
  value: string | number;
  /** 选择变化回调，返回选项原始 value */
  onChange: (value: string | number) => void;
  /** 选项列表 */
  options: SelectOption[];
  /** 作用于外层容器的类名（用于布局，如 flex-3 min-w-0） */
  className?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 未选中时的占位提示 */
  placeholder?: string;
}

/**
 * 自定义下拉选择框：替代原生 <select>，
 * 下拉面板展开时列表项从第一项开始逐渐淡入（错位动画）。
 */
export default function Select({
  value,
  onChange,
  options,
  className = "",
  disabled = false,
  placeholder = "请选择",
}: SelectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

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

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* 选择框 */}
      <div
        onClick={() => !disabled && setOpen((o) => !o)}
        className={[
          "input flex items-center cursor-pointer select-none",
          disabled ? "cursor-not-allowed opacity-70" : "",
        ].join(" ")}
      >
        <span className={`truncate ${selected ? "text-foreground" : "text-gray-400"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`ml-auto shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>

      {/* 下拉面板 */}
      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-card-bg shadow-lg max-h-60 overflow-y-auto py-1">
          {options.length === 0 ? (
            <div className="py-4 text-center text-sm text-gray-400">暂无选项</div>
          ) : (
            options.map((opt, i) => {
              const isSel = opt.value === value;
              return (
                <button
                  key={`${opt.value}`}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  style={{ animationDelay: `${i * 70}ms` }}
                  className="select-option flex items-center justify-between w-full px-3 py-2 text-sm text-left hover:bg-(--hover-bg)"
                >
                  <span className={isSel ? "text-primary font-medium" : "text-foreground"}>
                    {opt.label}
                  </span>
                  {isSel && <Check size={16} className="text-primary" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
