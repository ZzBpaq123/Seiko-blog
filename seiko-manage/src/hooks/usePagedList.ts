"use client";

import { useEffect, useRef, useState } from "react";
import type { PageResult } from "@/types";
import { notifyError } from "@/utils/toast";

function emptyPage<T>(size: number, current = 1): PageResult<T> {
  return { records: [], total: 0, current, size, pages: 0 };
}

interface UsePagedListOptions<T> {
  /** 取数函数，入参为目标页码，需返回后端分页结果 */
  fetch: (page: number) => Promise<PageResult<T>>;
  /** 查询条件依赖（如防抖后的搜索词、筛选项）；变化时自动回到第 1 页并重取 */
  deps?: unknown[];
  pageSize?: number;
}

/**
 * 列表页不可约的取数状态机：分页 + 加载态 + 取消标记 + 失败兜底。
 * 各列表页只需声明「如何取数」与「查询依赖」，其余逻辑只此一份。
 */
export function usePagedList<T>({ fetch, deps = [], pageSize = 10 }: UsePagedListOptions<T>) {
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pageResult, setPageResult] = useState<PageResult<T>>(() => emptyPage<T>(pageSize));

  const depsKey = JSON.stringify(deps);
  const prevDepsKey = useRef(depsKey);

  useEffect(() => {
    const depsChanged = prevDepsKey.current !== depsKey;
    prevDepsKey.current = depsKey;

    // 查询条件变化且当前不在第 1 页：先回到第 1 页，待 page 更新后由本 effect 重新取数
    if (depsChanged && page !== 1) {
      setPage(1);
      return;
    }

    let cancelled = false;
    setLoading(true);
    fetch(page)
      .then((res) => {
        if (cancelled) return;
        setPageResult(res && Array.isArray(res.records) ? res : emptyPage<T>(pageSize, page));
      })
      .catch((err) => {
        if (cancelled) return;
        notifyError(err instanceof Error ? err.message : "加载失败");
        setPageResult(emptyPage<T>(pageSize, page));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // fetch 每次渲染都是新引用，故仅以 page / depsKey / refreshKey 作为触发条件
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, depsKey, refreshKey]);

  const refresh = () => setRefreshKey((k) => k + 1);
  const reset = () => {
    setPage(1);
    setRefreshKey((k) => k + 1);
  };

  return {
    page,
    setPage,
    loading,
    pageResult,
    records: pageResult.records ?? [],
    refresh,
    reset,
  };
}
