import { del, get, getPage, patch, post, put } from "@/utils/request";
import type { PageParams, PageResult, ResourceDTO, ResourceVO } from "@/types";

export interface ResourceListParams extends PageParams {
  /** 按资源名称模糊查询 */
  resourceName?: string;
  /** 按资源分类查询 */
  category?: string;
  /** 按启用状态查询：true=已启用，false=已停用 */
  enabled?: boolean;
}

/** 查询资源列表（管理端） */
export async function getResourceList(params: ResourceListParams = {}): Promise<PageResult<ResourceVO>> {
  return getPage<PageResult<ResourceVO>>("/manage/resource/list", params);
}

/** 查询资源详情（管理端） */
export async function getResourceById(id: number): Promise<ResourceVO> {
  return get<ResourceVO>(`/manage/resource/${id}`);
}

/** 新建资源（管理端） */
export async function createResource(data: ResourceDTO): Promise<number> {
  return post<number>("/manage/resource", data);
}

/** 更新资源（管理端） */
export async function updateResource(id: number, data: ResourceDTO): Promise<boolean> {
  return put<boolean>(`/manage/resource/${id}`, data);
}

/** 删除资源（管理端） */
export async function deleteResource(id: number): Promise<boolean> {
  return del<boolean>(`/manage/resource/${id}`);
}

/** 切换资源启用状态（管理端） */
export async function updateResourceEnabled(id: number, enabled: boolean): Promise<boolean> {
  return patch<boolean>(`/manage/resource/${id}/enabled`, undefined, { params: { enabled } });
}
