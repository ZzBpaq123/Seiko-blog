import { get, post } from "@/utils/request";
import type { LoginDTO, LoginVO, RegisterDTO, UserVO } from "./types";

/**
 * 用户登录
 * POST /api/user/login
 */
export function login(data: LoginDTO) {
  return post<LoginVO>("/user/login", data);
}

/**
 * 用户注册（注册成功后自动登录）
 * POST /api/user/register
 */
export function register(data: RegisterDTO) {
  return post<LoginVO>("/user/register", data);
}

/**
 * 用户登出
 * POST /api/user/logout
 */
export function logout() {
  return post<void>("/user/logout");
}

/**
 * 获取当前登录用户信息
 * GET /api/user/info
 */
export function getCurrentUser() {
  return get<UserVO>("/user/info");
}

/**
 * 检查当前是否已登录
 * GET /api/user/check
 */
export function checkLogin() {
  return get<boolean>("/user/check");
}
