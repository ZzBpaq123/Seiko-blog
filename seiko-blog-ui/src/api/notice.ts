import { get } from "@/utils/request";
import type { NoticeVO } from "./types";

/**
 * 获取已启用的公告列表（前台展示用）
 * GET /api/notices/enabled
 */
export function getEnabledNoticeList() {
  return get<NoticeVO[]>("/notice/enabled");
}

/**
 * 根据 ID 获取公告详情
 * GET /api/notices/{id}
 */
export function getNoticeById(id: number) {
  return get<NoticeVO>(`/notice/${id}`);
}
