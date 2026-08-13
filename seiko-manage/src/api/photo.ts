import { del, get, getPage, post, put } from "@/utils/request";
import type {
  AlbumCreateDTO,
  AlbumVO,
  PageParams,
  PageResult,
  PhotoCreateDTO,
  PhotoVO,
} from "@/types";

// ─── 相册 Album ───

export interface AlbumListParams extends PageParams {
  /** 按相册名称模糊查询 */
  albumName?: string;
}

/** 查询相册列表（管理端，分页） */
export async function getAlbumList(params: AlbumListParams = {}): Promise<PageResult<AlbumVO>> {
  return getPage<PageResult<AlbumVO>>("/manage/album/list", params);
}

/** 查询相册详情（管理端） */
export async function getAlbumById(id: number): Promise<AlbumVO> {
  return get<AlbumVO>(`/manage/album/${id}`);
}

/** 新建相册（管理端） */
export async function createAlbum(data: AlbumCreateDTO): Promise<number> {
  return post<number>("/manage/album", data);
}

/** 更新相册（管理端） */
export async function updateAlbum(id: number, data: AlbumCreateDTO): Promise<boolean> {
  return put<boolean>(`/manage/album/${id}`, data);
}

/** 删除相册（管理端，同时删除相册下的照片） */
export async function deleteAlbum(id: number): Promise<boolean> {
  return del<boolean>(`/manage/album/${id}`);
}

// ─── 照片 Photo ───

export interface PhotoListParams extends PageParams {
  /** 按相册 ID 过滤 */
  albumId?: number;
  /** 按拍摄地点模糊查询 */
  location?: string;
}

/** 查询照片列表（管理端，分页） */
export async function getPhotoList(params: PhotoListParams = {}): Promise<PageResult<PhotoVO>> {
  return getPage<PageResult<PhotoVO>>("/manage/photo/list", params);
}

/** 查询照片详情（管理端） */
export async function getPhotoById(id: number): Promise<PhotoVO> {
  return get<PhotoVO>(`/manage/photo/${id}`);
}

/** 新建照片（管理端） */
export async function createPhoto(data: PhotoCreateDTO): Promise<number> {
  return post<number>("/manage/photo", data);
}

/** 批量新建照片（管理端） */
export async function batchCreatePhotos(data: PhotoCreateDTO[]): Promise<boolean> {
  return post<boolean>("/manage/photo/batch", data);
}

/** 更新照片（管理端） */
export async function updatePhoto(id: number, data: PhotoCreateDTO): Promise<boolean> {
  return put<boolean>(`/manage/photo/${id}`, data);
}

/** 删除照片（管理端） */
export async function deletePhoto(id: number): Promise<boolean> {
  return del<boolean>(`/manage/photo/${id}`);
}
