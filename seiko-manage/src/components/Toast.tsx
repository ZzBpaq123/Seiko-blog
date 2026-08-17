"use client";

import { useEffect, useState } from "react";
import { AlertCircle, X } from "lucide-react";
import { APP_ERROR_EVENT, type AppErrorDetail } from "@/utils/toast";

interface ToastItem {
  id: number;
  message: string;
}

const AUTO_DISMISS_MS = 4000;

/**
 * 全局错误提示。
 * 监听 notifyError() 派发的 `app-error` 事件（接口失败与表单校验失败均经此），
 * 在右上角弹出通知并自动消失。
 */
export default function Toast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    let seq = 0;
    const onAppError = (e: Event) => {
      const detail = (e as CustomEvent<AppErrorDetail>).detail;
      const message = detail?.message || "请求失败，请稍后重试";
      const id = ++seq;
      setToasts((prev) => [...prev, { id, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, AUTO_DISMISS_MS);
    };
    window.addEventListener(APP_ERROR_EVENT, onAppError);
    return () => window.removeEventListener(APP_ERROR_EVENT, onAppError);
  }, []);

  const remove = (id: number) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-100 flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 shadow-lg animate-toast-in"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />
          <p className="flex-1 text-sm text-red-700 wrap-break-word">{t.message}</p>
          <button
            type="button"
            onClick={() => remove(t.id)}
            className="shrink-0 text-red-400 hover:text-red-600 transition-colors"
            aria-label="关闭"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
