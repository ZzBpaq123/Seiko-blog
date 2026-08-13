import { del, get, getPage, post, put } from "@/utils/request";
import type { PageParams, PageResult, TagDTO, TagVO } from "@/types";

export interface TagListParams extends PageParams {
  /** 按名称/标识模糊查询 */
  keyword?: string;
}

/** 查询标签列表（管理端） */
export async function getTagPage(params: TagListParams = {}): Promise<PageResult<TagVO>> {
  return getPage<PageResult<TagVO>>("/manage/tag/list", params);
}

/** 查询标签详情（管理端） */
export async function getTagById(id: number): Promise<TagVO> {
  return get<TagVO>(`/manage/tag/${id}`);
}

/** 新建标签（管理端） */
export async function createTag(data: TagDTO): Promise<number> {
  return post<number>("/manage/tag", data);
}

/** 更新标签（管理端） */
export async function updateTag(id: number, data: TagDTO): Promise<boolean> {
  return put<boolean>(`/manage/tag/${id}`, data);
}

/** 删除标签（管理端） */
export async function deleteTag(id: number): Promise<boolean> {
  return del<boolean>(`/manage/tag/${id}`);
}
