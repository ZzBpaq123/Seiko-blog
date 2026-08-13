import { get } from "@/utils/request";
import type { FootprintVO } from "./types";

/**
 * 获取足迹列表
 * GET /api/footprints
 */
export function getFootprintList() {
  return get<FootprintVO[]>("/footprints");
}

/**
 * 根据 ID 获取足迹详情
 * GET /api/footprints/{id}
 */
export function getFootprintById(id: number) {
  return get<FootprintVO>(`/footprints/${id}`);
}

/**
 * 根据类型获取足迹列表
 * GET /api/footprints/type/{type}
 */
export function getFootprintsByType(type: string) {
  return get<FootprintVO[]>(`/footprints/type/${type}`);
}
