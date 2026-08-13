import axios from "axios";
import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";

// ═══════════════════════════════════════════════════════════════
// 类型定义（对应后端 com.seiko.blog.common.Result<T>）
// ═══════════════════════════════════════════════════════════════

/**
 * 后端 API 统一响应结构
 */
export interface ApiResult<T> {
  code: number;
  message: string;
  data: T;
}

/**
 * MyBatis-Plus 分页响应结构
 * 对应后端 com.baomidou.mybatisplus.extension.plugins.pagination.Page<T>
 */
export interface PageResult<T> {
  records: T[];
  total: number;
  current: number;
  size: number;
  pages: number;
}

/**
 * 分页请求参数
 */
export interface PageParams {
  page?: number;
  size?: number;
}

// ═══════════════════════════════════════════════════════════════
// 错误处理
// ═══════════════════════════════════════════════════════════════

/**
 * 自定义业务错误类
 */
export class ApiBusinessError extends Error {
  code: number;
  rawData: unknown;

  constructor(message: string, code: number, rawData?: unknown) {
    super(message);
    this.name = "ApiBusinessError";
    this.code = code;
    this.rawData = rawData;
  }
}

/**
 * 业务错误码映射
 * 与后端 com.seiko.blog.common.ResultCode 枚举一一对应
 */
const ERROR_CODE_MESSAGES: Record<number, string> = {
  400: "参数错误",
  401: "未授权，请先登录",
  403: "禁止访问",
  404: "资源不存在",
  405: "请求方式错误",
  409: "资源冲突",
  429: "请求过于频繁",
  500: "操作失败",
  1001: "用户名或密码错误",
  1002: "登录已过期，请重新登录",
  1003: "用户已被禁用",
  1004: "用户名已存在",
  1005: "原密码错误",
};

const SUCCESS_CODE = 200;

// ═══════════════════════════════════════════════════════════════
// Axios 实例配置
// ═══════════════════════════════════════════════════════════════

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:1001/api/blog";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * 判断响应是否为 ApiResult 结构
 */
function isApiResult(data: unknown): data is ApiResult<unknown> {
  return (
    typeof data === "object" &&
    data !== null &&
    "code" in data &&
    "message" in data &&
    "data" in data
  );
}

/**
 * 请求拦截器：注入 Authorization Token
 */
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        config.headers.token = token;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

/**
 * 响应拦截器：处理业务码、统一错误提示、Token 过期自动清除
 */
axiosInstance.interceptors.response.use(
  (response) => {
    const { data } = response;

    // 非 ApiResult 结构（如 blob）直接返回
    if (!isApiResult(data)) {
      return response;
    }

    const result = data as ApiResult<unknown>;

    if (result.code !== SUCCESS_CODE) {
      const message =
        result.message || ERROR_CODE_MESSAGES[result.code] || "请求失败";

      // Token 过期/无效 → 清除登录态
      if (result.code === 401 || result.code === 1002) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          window.dispatchEvent(new CustomEvent("unauthorized"));
        }
      }

      return Promise.reject(new ApiBusinessError(message, result.code, result));
    }

    return response;
  },
  (error: AxiosError<ApiResult<unknown>>) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      ERROR_CODE_MESSAGES[status || 0] ||
      error.message ||
      "网络请求失败";

    if (status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        window.dispatchEvent(new CustomEvent("unauthorized"));
      }
    }

    return Promise.reject(
      new ApiBusinessError(message, status || 500, error.response?.data),
    );
  },
);

// ═══════════════════════════════════════════════════════════════
// 通用请求封装
// ═══════════════════════════════════════════════════════════════

/**
 * 通用请求（自动提取 ApiResult.data）
 */
export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await axiosInstance.request<ApiResult<T>>(config);
  return response.data.data;
}

/**
 * 便捷 HTTP 方法
 */
export async function get<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  return request<T>({ method: "GET", url, ...config });
}

export async function post<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  return request<T>({ method: "POST", url, data, ...config });
}

export async function put<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  return request<T>({ method: "PUT", url, data, ...config });
}

export async function patch<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  return request<T>({ method: "PATCH", url, data, ...config });
}

export async function del<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  return request<T>({ method: "DELETE", url, ...config });
}

/**
 * 分页 GET 请求
 */
export async function getPage<T>(
  url: string,
  params: PageParams = {},
  config?: AxiosRequestConfig,
): Promise<T> {
  return request<T>({
    method: "GET",
    url,
    params: { page: 1, size: 10, ...params },
    ...config,
  });
}

export { axiosInstance };
export default axiosInstance;
