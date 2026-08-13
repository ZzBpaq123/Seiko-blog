"use client";

import { useState } from "react";
import { Sparkles, ChevronDown, ChevronUp } from "lucide-react";

interface AiSummaryProps {
  content?: string;
}

export default function AiSummary({ content }: AiSummaryProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mb-6 rounded-lg border border-emerald-500 dark:border-emerald-600">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-5 py-3.5 text-left focus:outline-none"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
          <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            AI总结
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-emerald-500 transition-transform dark:text-emerald-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-emerald-500 transition-transform dark:text-emerald-400" />
        )}
      </button>

      {/* Content */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          expanded ? "max-h-125 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex items-center px-5 pb-4">
          <p className="text-sm leading-relaxed text-emerald-800 dark:text-emerald-300/90">
            {content || "暂无总结内容"}
          </p>
        </div>
      </div>
    </div>
  );
}
