import { post } from "@/utils/request";
import type { EmailCodeSendDTO } from "./types";

/**
 * 发送邮箱验证码
 * POST /api/blog/code/email/code
 */
export function sendEmailCode(data: EmailCodeSendDTO) {
  return post<void>("/code/email/code", data);
}
