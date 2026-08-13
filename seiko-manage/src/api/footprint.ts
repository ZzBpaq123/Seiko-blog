import { del, get, getPage, post, put } from "@/utils/request";
import type { FootprintCreateDTO, FootprintVO, PageParams, PageResult } from "@/types";

export interface FootprintListParams extends PageParams {
  /** 按城市/国家模糊查询 */
  city?: string;
  /** 按足迹类型查询：domestic=国内，international=国际 */
  footprintType?: string;
}

/** 查询足迹列表（管理端） */
export async function getFootprintList(params: FootprintListParams = {}): Promise<PageResult<FootprintVO>> {
  return getPage<PageResult<FootprintVO>>("/manage/footprint/list", params);
}

/** 查询足迹详情（管理端） */
export async function getFootprintById(id: number): Promise<FootprintVO> {
  return get<FootprintVO>(`/manage/footprint/${id}`);
}

/** 新建足迹（管理端） */
export async function createFootprint(data: FootprintCreateDTO): Promise<FootprintVO> {
  return post<FootprintVO>("/manage/footprint", data);
}

/** 更新足迹（管理端） */
export async function updateFootprint(id: number, data: FootprintCreateDTO): Promise<FootprintVO> {
  return put<FootprintVO>(`/manage/footprint/${id}`, data);
}

/** 删除足迹（管理端） */
export async function deleteFootprint(id: number): Promise<boolean> {
  return del<boolean>(`/manage/footprint/${id}`);
}
