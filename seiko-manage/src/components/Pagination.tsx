"use client";

import type { PageResult } from "@/types";

interface PaginationProps {
  pageResult: PageResult<unknown> | null;
  page: number;
  onChange: (page: number) => void;
}

/** 列表页统一分页控件：左侧总数，右侧上一页 / 页码 / 下一页。 */
export default function Pagination({ pageResult, page, onChange }: PaginationProps) {
  const total = pageResult?.total ?? 0;
  const pages = pageResult?.pages ?? 0;

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-500">共 {total} 条记录</span>
      <div className="flex gap-1">
        <button
          className="btn btn-secondary btn-sm"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          上一页
        </button>
        {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            className={`btn btn-sm ${p === page ? "btn-primary" : "btn-secondary"}`}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        ))}
        <button
          className="btn btn-secondary btn-sm"
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
        >
          下一页
        </button>
      </div>
    </div>
  );
}
