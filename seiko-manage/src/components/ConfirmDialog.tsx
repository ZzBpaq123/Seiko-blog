"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmOptions {
  /** 标题，默认「确认删除」 */
  title?: string;
  /** 提示内容 */
  message: string;
  /** 确认按钮文案，默认「删除」 */
  confirmText?: string;
  /** 取消按钮文案，默认「取消」 */
  cancelText?: string;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

interface DialogState extends ConfirmOptions {
  open: boolean;
}

/**
 * 删除确认弹框 Provider
 * 通过 useConfirm() 返回的 confirm() 以 Promise 形式调用：
 *   const ok = await confirm({ message: "确定删除吗？" });
 *   if (!ok) return; // 取消时不调用任何接口
 */
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DialogState>({ open: false, message: "" });
  // 保存当前 Promise 的 resolve，确认/取消时回传布尔值
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((options) => {
    setState({ ...options, open: true });
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = useCallback((result: boolean) => {
    setState((prev) => ({ ...prev, open: false }));
    resolver.current?.(result);
    resolver.current = null;
  }, []);

  // 支持键盘 Esc 取消 / Enter 确认
  useEffect(() => {
    if (!state.open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(false);
      if (e.key === "Enter") close(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.open, close]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state.open && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          {/* 遮罩：点击取消 */}
          <div
            className="absolute inset-0 bg-black/40 animate-fade-in"
            onClick={() => close(false)}
          />
          <div className="relative w-full max-w-sm rounded-xl bg-card-bg p-6 shadow-xl animate-dialog-in">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10">
                <AlertTriangle size={20} className="text-red-600" />
              </span>
              <div className="flex-1 pt-0.5">
                <h3 className="text-base font-semibold text-foreground">
                  {state.title ?? "确认删除"}
                </h3>
                <p className="mt-1.5 text-sm text-[var(--muted)] break-words">
                  {state.message}
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => close(false)}
              >
                {state.cancelText ?? "取消"}
              </button>
              <button
                type="button"
                className="btn btn-primary !bg-red-600 hover:!bg-red-700"
                onClick={() => close(true)}
                autoFocus
              >
                {state.confirmText ?? "删除"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

/** 获取 confirm() 函数；必须在 ConfirmProvider 内使用 */
export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm 必须在 ConfirmProvider 内使用");
  }
  return ctx;
}
