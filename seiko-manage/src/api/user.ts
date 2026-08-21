import { del, get, getPage, patch, post, put } from "@/utils/request";
import type { LoginDTO, LoginVO, PageParams, PageResult, UserDTO, UserVO, ForgotPasswordEmailDTO, ForgotPasswordSendCodeDTO, ForgotPasswordResetDTO } from "@/types";

const TOKEN_KEY = "token";
const USER_KEY = "user";

/** 用户登录 */
export async function login(data: LoginDTO): Promise<LoginVO> {
  const result = await post<LoginVO>("/manage/user/login", data);
  saveAuth(result);
  return result;
}

/** 用户登出（best-effort：服务端失败也不影响本地登出） */
export async function logout(): Promise<void> {
  try {
    await post<void>("/manage/user/logout");
  } catch {
    // 忽略服务端错误（如 token 已过期）——本地清除即视为登出成功
  } finally {
    clearAuth();
  }
}

/** 获取当前登录用户信息 */
export async function getCurrentUser(): Promise<UserVO> {
  return get<UserVO>("/manage/user/info");
}

/** 检查登录状态 */
export async function checkLogin(): Promise<boolean> {
  return get<boolean>("/manage/user/check");
}

// ─── 用户管理（后台 CRUD）───

export interface UserListParams extends PageParams {
  /** 按用户名/昵称模糊查询 */
  username?: string;
  /** 按邮箱模糊查询 */
  email?: string;
  /** 按角色过滤：admin / user */
  userRole?: string;
  /** 按状态过滤：active / inactive */
  userStatus?: string;
}

/** 查询用户列表（管理端） */
export async function getUserList(params: UserListParams = {}): Promise<PageResult<UserVO>> {
  return getPage<PageResult<UserVO>>("/manage/user/list", params);
}

/** 查询用户详情（管理端） */
export async function getUserById(id: number): Promise<UserVO> {
  return get<UserVO>(`/manage/user/${id}`);
}

/** 新建用户（管理端） */
export async function createUser(data: UserDTO): Promise<number> {
  return post<number>("/manage/user", data);
}

/** 更新用户（管理端） */
export async function updateUser(id: number, data: UserDTO): Promise<boolean> {
  return put<boolean>(`/manage/user/${id}`, data);
}

/** 删除用户（管理端） */
export async function deleteUser(id: number): Promise<boolean> {
  return del<boolean>(`/manage/user/${id}`);
}

/** 切换用户状态（管理端） */
export async function updateUserStatus(id: number, userStatus: string): Promise<boolean> {
  return patch<boolean>(`/manage/user/${id}/status`, undefined, { params: { userStatus } });
}

/** 重置用户密码（管理端） */
export async function resetUserPassword(id: number, newPassword: string): Promise<boolean> {
  return patch<boolean>(`/manage/user/${id}/password`, undefined, { params: { newPassword } });
}

// ─── 忘记密码 ───

/** 根据用户名获取掩码后的邮箱 */
export async function getMaskedEmail(data: ForgotPasswordEmailDTO): Promise<string> {
  return post<string>("/manage/user/forgot-password/masked-email", data);
}

/** 校验邮箱与用户名匹配后发送验证码 */
export async function sendForgotPasswordCode(data: ForgotPasswordSendCodeDTO): Promise<void> {
  return post<void>("/manage/user/forgot-password/send-code", data);
}

/** 校验验证码后重置密码 */
export async function resetPasswordByEmail(data: ForgotPasswordResetDTO): Promise<void> {
  return post<void>("/manage/user/forgot-password/reset", data);
}

// ─── 本地 Token / 用户存储 ───

export function saveAuth(loginVO: LoginVO): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, loginVO.token);
  localStorage.setItem(USER_KEY, JSON.stringify(loginVO.user));
}

export function clearAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): UserVO | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserVO;
  } catch {
    return null;
  }
}
