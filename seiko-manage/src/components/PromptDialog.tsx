"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { KeyRound } from "lucide-react";

interface PromptOptions {
  /** 标题，默认「请输入」 */
  title?: string;
  /** 提示内容 */
  message?: string;
  /** 输入框占位符 */
  placeholder?: string;
  /** 确认输入框占位符（提供时显示二次确认输入框） */
  confirmPlaceholder?: string;
  /** 两次输入不一致时的提示文案 */
  mismatchMessage?: string;
  /** 输入框类型，默认 text */
  type?: "text" | "password";
  /** 确认按钮文案，默认「确认」 */
  confirmText?: string;
  /** 取消按钮文案，默认「取消」 */
  cancelText?: string;
}

type PromptFn = (options: PromptOptions) => Promise<string | null>;

const PromptContext = createContext<PromptFn | null>(null);

interface DialogState extends PromptOptions {
  open: boolean;
}

/**
 * 输入提示弹框 Provider
 * 通过 usePrompt() 返回的 prompt() 以 Promise 形式调用：
 *   const value = await prompt({ title: "重置密码", message: "请输入新密码", type: "password" });
 *   if (!value) return; // 取消或空值时不调用任何接口
 */
export function PromptProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DialogState>({ open: false, title: "请输入" });
  const [value, setValue] = useState("");
  const [confirmValue, setConfirmValue] = useState("");
  const [touched, setTouched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const confirmInputRef = useRef<HTMLInputElement>(null);
  const resolver = useRef<((value: string | null) => void) | null>(null);

  const prompt = useCallback<PromptFn>((options) => {
    setValue("");
    setConfirmValue("");
    setTouched(false);
    setState({ ...options, open: true });
    return new Promise<string | null>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = useCallback((result: string | null) => {
    setState((prev) => ({ ...prev, open: false }));
    resolver.current?.(result);
    resolver.current = null;
  }, []);

  useEffect(() => {
    if (!state.open) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
    };
  }, [state.open, close]);

  const showConfirmInput = Boolean(state.confirmPlaceholder);
  const mismatch = showConfirmInput && touched && confirmValue && value !== confirmValue;
  const canSubmit = value.trim() && (!showConfirmInput || value === confirmValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    close(value.trim());
  };

  return (
    <PromptContext.Provider value={prompt}>
      {children}
      {state.open && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/40 animate-fade-in"
            onClick={() => close(null)}
          />
          <form
            onSubmit={handleSubmit}
            className="relative w-full max-w-sm rounded-xl bg-card-bg p-6 shadow-xl animate-dialog-in"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/10">
                <KeyRound size={20} className="text-blue-600" />
              </span>
              <div className="flex-1 pt-0.5">
                <h3 className="text-base font-semibold text-foreground">
                  {state.title ?? "请输入"}
                </h3>
                {state.message && (
                  <p className="mt-1.5 text-sm text-[var(--muted)] break-words">
                    {state.message}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <input
                ref={inputRef}
                type={state.type ?? "text"}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={state.placeholder}
                className="input w-full"
                autoComplete="off"
              />
              {showConfirmInput && (
                <input
                  ref={confirmInputRef}
                  type={state.type ?? "text"}
                  value={confirmValue}
                  onChange={(e) => {
                    setConfirmValue(e.target.value);
                    setTouched(true);
                  }}
                  onBlur={() => setTouched(true)}
                  placeholder={state.confirmPlaceholder}
                  className={`input w-full ${mismatch ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                  autoComplete="off"
                />
              )}
              {mismatch && (
                <p className="text-xs text-red-600">
                  {state.mismatchMessage ?? "两次输入不一致"}
                </p>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => close(null)}
              >
                {state.cancelText ?? "取消"}
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!canSubmit}
              >
                {state.confirmText ?? "确认"}
              </button>
            </div>
          </form>
        </div>
      )}
    </PromptContext.Provider>
  );
}

/** 获取 prompt() 函数；必须在 PromptProvider 内使用 */
export function usePrompt(): PromptFn {
  const ctx = useContext(PromptContext);
  if (!ctx) {
    throw new Error("usePrompt 必须在 PromptProvider 内使用");
  }
  return ctx;
}
