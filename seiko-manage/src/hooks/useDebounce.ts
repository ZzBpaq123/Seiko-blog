"use client";

import { useEffect, useState } from "react";

/**
 * 对任意值做防抖。原先 7 个列表页各自手写的 setTimeout/clearTimeout 收敛到此处。
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
