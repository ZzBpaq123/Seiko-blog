"use client";

import { useEffect, useState } from "react";

interface UseEntityLoadOptions<T> {
  /** 是否为编辑模式（需要加载已有数据）；新建模式传 false */
  enabled: boolean;
  /** 记录 ID，来自 URL 查询参数 */
  id: number;
  /** 按 ID 取数的接口函数 */
  loader: (id: number) => Promise<T>;
  /** 取数成功后回填表单字段 */
  onLoaded: (data: T) => void;
  invalidIdMessage?: string;
  loadFailMessage?: string;
}

/**
 * 编辑表单不可约的加载逻辑：校验 ID、取数回填、加载态与整页错误。
 * 9 个编辑表单原先各自手写的这段 effect 收敛到此处。
 */
export function useEntityLoad<T>({
  enabled,
  id,
  loader,
  onLoaded,
  invalidIdMessage = "无效的 ID",
  loadFailMessage = "加载失败",
}: UseEntityLoadOptions<T>) {
  const [loading, setLoading] = useState(enabled);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    if (!id || Number.isNaN(id)) {
      Promise.resolve().then(() => {
        if (cancelled) return;
        setLoadError(invalidIdMessage);
        setLoading(false);
      });
      return () => {
        cancelled = true;
      };
    }

    Promise.resolve()
      .then(() => {
        setLoading(true);
        setLoadError(null);
        return loader(id);
      })
      .then((data) => {
        if (!cancelled) onLoaded(data);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : loadFailMessage);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // loader / onLoaded / 文案为稳定引用，仅以 enabled / id 触发
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, id]);

  return { loading, loadError };
}
