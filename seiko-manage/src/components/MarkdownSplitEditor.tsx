"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownSplitEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minLeft?: number;
  maxLeft?: number;
}

export default function MarkdownSplitEditor({
  value,
  onChange,
  placeholder = "在此用 Markdown 编写文章内容...",
  minLeft = 20,
  maxLeft = 80,
}: MarkdownSplitEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [leftWidth, setLeftWidth] = useState(50);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const percent = ((e.clientX - rect.left) / rect.width) * 100;
      setLeftWidth(Math.min(maxLeft, Math.max(minLeft, percent)));
    };

    const handleMouseUp = () => {
      setDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    // 拖动时禁止选中文本，避免光标闪烁
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [dragging, minLeft, maxLeft]);

  return (
    <div
      ref={containerRef}
      className="flex h-[32rem] min-h-[28rem] overflow-hidden rounded-lg border border-border bg-card-bg"
    >
      {/* 编辑区 */}
      <div
        className="flex min-w-0 flex-col"
        style={{ width: `${leftWidth}%` }}
      >
        <textarea
          className="h-full w-full resize-none border-0 bg-card-bg text-foreground p-4 font-mono text-sm leading-relaxed focus:outline-none"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>

      {/* 可拖动分割线 */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="调整编辑区和预览区宽度"
        className={`w-1 shrink-0 cursor-col-resize transition-colors ${
          dragging ? "bg-primary" : "bg-border hover:bg-primary"
        }`}
        onMouseDown={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
      />

      {/* 预览区 */}
      <div className="min-w-0 flex-1 overflow-auto bg-card-bg p-4 markdown-body">
        {value.trim() ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
        ) : (
          <p className="text-gray-400">暂无内容</p>
        )}
      </div>
    </div>
  );
}
