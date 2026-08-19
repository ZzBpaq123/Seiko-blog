/**
 * 全局提示的唯一出口。
 *
 * 接口失败（request.ts 拦截器）与客户端校验失败（表单）调用 notifyError，
 * 操作成功调用 notifySuccess，两者分别派发 `app-error` / `app-success` 事件，
 * 由全局 <Toast /> 统一渲染。
 */
export const APP_ERROR_EVENT = "app-error";
export const APP_SUCCESS_EVENT = "app-success";

export interface AppErrorDetail {
  message: string;
}

export interface AppSuccessDetail {
  message: string;
}

export function notifyError(message: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<AppErrorDetail>(APP_ERROR_EVENT, { detail: { message } })
  );
}

export function notifySuccess(message: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<AppSuccessDetail>(APP_SUCCESS_EVENT, { detail: { message } })
  );
}
