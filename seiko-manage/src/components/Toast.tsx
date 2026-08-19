"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, X } from "lucide-react";
import { APP_ERROR_EVENT, APP_SUCCESS_EVENT, type AppErrorDetail, type AppSuccessDetail } from "@/utils/toast";

interface ToastItem {
  id: number;
  message: string;
  type: "error" | "success";
}

const AUTO_DISMISS_MS = 4000;

/**
 * 全局提示。
 * 监听 notifyError() 派发的 `app-error` 与 notifySuccess() 派发的 `app-success` 事件，
 * 在右上角按类型弹出通知并自动消失。
 */
export default function Toast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    let seq = 0;
    const pushToast = (message: string, type: "error" | "success") => {
      const id = ++seq;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, AUTO_DISMISS_MS);
    };

    const onAppError = (e: Event) => {
      const detail = (e as CustomEvent<AppErrorDetail>).detail;
      pushToast(detail?.message || "请求失败，请稍后重试", "error");
    };
    const onAppSuccess = (e: Event) => {
      const detail = (e as CustomEvent<AppSuccessDetail>).detail;
      pushToast(detail?.message || "操作成功", "success");
    };

    window.addEventListener(APP_ERROR_EVENT, onAppError);
    window.addEventListener(APP_SUCCESS_EVENT, onAppSuccess);
    return () => {
      window.removeEventListener(APP_ERROR_EVENT, onAppError);
      window.removeEventListener(APP_SUCCESS_EVENT, onAppSuccess);
    };
  }, []);

  const remove = (id: number) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-100 flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
      {toasts.map((t) => {
        const isError = t.type === "error";
        return (
          <div
            key={t.id}
            className={`flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg animate-toast-in ${
              isError
                ? "border-red-200 bg-red-50"
                : "border-green-200 bg-green-50"
            }`}
          >
            {isError ? (
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />
            ) : (
              <CheckCircle size={18} className="mt-0.5 shrink-0 text-green-600" />
            )}
            <p className={`flex-1 text-sm wrap-break-word ${isError ? "text-red-700" : "text-green-700"}`}>
              {t.message}
            </p>
            <button
              type="button"
              onClick={() => remove(t.id)}
              className={`shrink-0 transition-colors ${isError ? "text-red-400 hover:text-red-600" : "text-green-400 hover:text-green-600"}`}
              aria-label="关闭"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
