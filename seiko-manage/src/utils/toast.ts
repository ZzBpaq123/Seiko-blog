/**
 * 全局错误提示的唯一出口。
 *
 * 接口失败（request.ts 拦截器）与客户端校验失败（表单）都调用本函数，
 * 派发同一个 `app-error` 事件，由全局 <Toast /> 统一渲染。
 */
export const APP_ERROR_EVENT = "app-error";

export interface AppErrorDetail {
  message: string;
}

export function notifyError(message: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<AppErrorDetail>(APP_ERROR_EVENT, { detail: { message } })
  );
}
