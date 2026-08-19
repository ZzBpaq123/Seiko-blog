import { del, get, getPage, patch, post, put } from "@/utils/request";
import type { DictItemDTO, DictItemVO, DictTypeDTO, DictTypeVO, PageParams, PageResult } from "@/types";

export interface DictTypeListParams extends PageParams {
  /** 类型编码/名称模糊查询 */
  keyword?: string;
  /** 是否启用: true-启用 false-停用 */
  enabled?: boolean;
}

export interface DictItemListParams extends PageParams {
  /** 所属字典类型编码 */
  typeCode: string;
  /** 标签/值模糊查询 */
  keyword?: string;
  /** 是否启用: true-启用 false-停用 */
  enabled?: boolean;
}

// ─── 字典类型 ───

/** 分页查询字典类型（管理端） */
export async function getDictTypeList(params: DictTypeListParams = {}): Promise<PageResult<DictTypeVO>> {
  return getPage<PageResult<DictTypeVO>>("/manage/dict/type/list", params);
}

/** 查询字典类型详情（管理端） */
export async function getDictTypeById(id: number): Promise<DictTypeVO> {
  return get<DictTypeVO>(`/manage/dict/type/${id}`);
}

/** 新建字典类型（管理端） */
export async function createDictType(data: DictTypeDTO): Promise<number> {
  return post<number>("/manage/dict/type", data);
}

/** 更新字典类型（管理端） */
export async function updateDictType(id: number, data: DictTypeDTO): Promise<boolean> {
  return put<boolean>(`/manage/dict/type/${id}`, data);
}

/** 删除字典类型（管理端），会级联删除其下字典项 */
export async function deleteDictType(id: number): Promise<boolean> {
  return del<boolean>(`/manage/dict/type/${id}`);
}

/** 切换字典类型启用状态（管理端） */
export async function updateDictTypeEnabled(id: number, enabled: boolean): Promise<boolean> {
  return patch<boolean>(`/manage/dict/type/${id}/enabled`, undefined, { params: { enabled } });
}

// ─── 字典项 ───

/** 分页查询字典项（管理端） */
export async function getDictItemList(params: DictItemListParams): Promise<PageResult<DictItemVO>> {
  return getPage<PageResult<DictItemVO>>("/manage/dict/item/list", params);
}

/** 查询字典项详情（管理端） */
export async function getDictItemById(id: number): Promise<DictItemVO> {
  return get<DictItemVO>(`/manage/dict/item/${id}`);
}

/** 查询某类型全部启用中的字典项（用于下拉选项与展示映射） */
export async function getDictItemOptions(typeCode: string): Promise<DictItemVO[]> {
  return get<DictItemVO[]>("/manage/dict/item/options", { params: { typeCode } });
}

/** 新建字典项（管理端） */
export async function createDictItem(data: DictItemDTO): Promise<number> {
  return post<number>("/manage/dict/item", data);
}

/** 更新字典项（管理端） */
export async function updateDictItem(id: number, data: DictItemDTO): Promise<boolean> {
  return put<boolean>(`/manage/dict/item/${id}`, data);
}

/** 删除字典项（管理端） */
export async function deleteDictItem(id: number): Promise<boolean> {
  return del<boolean>(`/manage/dict/item/${id}`);
}

/** 切换字典项启用状态（管理端） */
export async function updateDictItemEnabled(id: number, enabled: boolean): Promise<boolean> {
  return patch<boolean>(`/manage/dict/item/${id}/enabled`, undefined, { params: { enabled } });
}
