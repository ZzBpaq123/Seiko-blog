"use client";

import { useEffect, useState } from "react";
import { loadDictOptions } from "@/utils/dict";
import type { DictItemVO } from "@/types";

/**
 * 按字典类型编码加载字典项，供下拉选项与展示映射使用。
 * 数据带模块级缓存，多个页面/组件使用同一类型时只请求一次。
 */
export function useDictOptions(typeCode: string) {
  const [options, setOptions] = useState<DictItemVO[]>([]);

  useEffect(() => {
    let cancelled = false;
    loadDictOptions(typeCode)
      .then((items) => {
        if (!cancelled) setOptions(items);
      })
      .catch((err) => {
        if (!cancelled) {
          console.error(`[dict] 加载字典 ${typeCode} 失败`, err);
          setOptions([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [typeCode]);

  return { options };
}
