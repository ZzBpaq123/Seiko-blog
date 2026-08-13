import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import type { ApiResult, PageParams } from '@/types';

export class ApiBusinessError extends Error {
  code: number;
  rawData: unknown;

  constructor(message: string, code: number, rawData?: unknown) {
    super(message);
    this.name = 'ApiBusinessError';
    this.code = code;
    this.rawData = rawData;
  }
}

const ERROR_CODE_MESSAGES: Record<number, string> = {
  400: '参数错误',
  401: '未授权，请先登录',
  403: '禁止访问',
  404: '资源不存在',
  500: '操作失败',
  1001: '用户名或密码错误',
  1002: '登录已过期，请重新登录',
  1003: '用户已被禁用',
  1004: '用户名已存在',
  1005: '原密码错误',
};

const SUCCESS_CODE = 200;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:1001/api';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

function isApiResult(data: unknown): data is ApiResult<unknown> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'code' in data &&
    ('message' in data || 'msg' in data) &&
    'data' in data
  );
}

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.token = token;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => {
    const { data } = response;
    if (!isApiResult(data)) {
      return response;
    }
    const result = data as ApiResult<unknown>;
    if (result.code !== SUCCESS_CODE) {
      const message = result.message || result.msg || ERROR_CODE_MESSAGES[result.code] || '请求失败';
      if (result.code === 401 || result.code === 1002) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          window.dispatchEvent(new CustomEvent('unauthorized'));
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
      error.response?.data?.msg ||
      ERROR_CODE_MESSAGES[status || 0] ||
      error.message ||
      '网络请求失败';
    if (status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.dispatchEvent(new CustomEvent('unauthorized'));
      }
    }
    return Promise.reject(new ApiBusinessError(message, status || 500, error.response?.data));
  }
);

export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await axiosInstance.request<ApiResult<T>>(config);
  return response.data.data;
}

export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return request<T>({ method: 'GET', url, ...config });
}

export async function post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  return request<T>({ method: 'POST', url, data, ...config });
}

export async function put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  return request<T>({ method: 'PUT', url, data, ...config });
}

export async function patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  return request<T>({ method: 'PATCH', url, data, ...config });
}

export async function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return request<T>({ method: 'DELETE', url, ...config });
}

export async function getPage<T>(url: string, params: PageParams = {}, config?: AxiosRequestConfig): Promise<T> {
  return request<T>({
    method: 'GET',
    url,
    params: { page: 1, size: 10, ...params },
    ...config,
  });
}

export { axiosInstance };
export default axiosInstance;
