import { del, get, getPage, patch, post, put } from "@/utils/request";
import type { NoticeDTO, NoticeVO, PageParams, PageResult } from "@/types";

export interface NoticeListParams extends PageParams {
  /** 按公告标题模糊查询 */
  noticeTitle?: string;
  /** 按启用状态查询：true=已启用，false=已停用 */
  enabled?: boolean;
}

/** 查询公告列表（管理端） */
export async function getNoticeList(params: NoticeListParams = {}): Promise<PageResult<NoticeVO>> {
  return getPage<PageResult<NoticeVO>>("/manage/notice/list", params);
}

/** 查询公告详情（管理端） */
export async function getNoticeById(id: number): Promise<NoticeVO> {
  return get<NoticeVO>(`/manage/notice/${id}`);
}

/** 新建公告（管理端） */
export async function createNotice(data: NoticeDTO): Promise<number> {
  return post<number>("/manage/notice", data);
}

/** 更新公告（管理端） */
export async function updateNotice(id: number, data: NoticeDTO): Promise<boolean> {
  return put<boolean>(`/manage/notice/${id}`, data);
}

/** 删除公告（管理端） */
export async function deleteNotice(id: number): Promise<boolean> {
  return del<boolean>(`/manage/notice/${id}`);
}

/** 切换公告启用状态（管理端） */
export async function updateNoticeEnabled(id: number, enabled: boolean): Promise<boolean> {
  return patch<boolean>(`/manage/notice/${id}/enabled`, undefined, { params: { enabled } });
}
