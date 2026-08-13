import { get } from "@/utils/request";
import type { AlbumVO, PhotoVO } from "./types";

/**
 * 获取照片列表
 * GET /api/photos
 */
export function getPhotoList() {
  return get<PhotoVO[]>("/photos");
}

/**
 * 获取相册列表
 * GET /api/photos/albums
 */
export function getAlbumList() {
  return get<AlbumVO[]>("/photos/albums");
}

/**
 * 根据相册ID获取照片列表
 * GET /api/photos/album/{albumId}
 */
export function getPhotosByAlbumId(albumId: number) {
  return get<PhotoVO[]>(`/photos/album/${albumId}`);
}

/**
 * 根据 ID 获取照片详情
 * GET /api/photos/{id}
 */
export function getPhotoById(id: number) {
  return get<PhotoVO>(`/photos/${id}`);
}

/**
 * 根据地点获取照片列表
 * GET /api/photos/location/{location}
 */
export function getPhotosByLocation(location: string) {
  return get<PhotoVO[]>(`/photos/location/${encodeURIComponent(location)}`);
}
