import { get } from "@/utils/request";
import type { MovieVO } from "./types";

/**
 * 获取电影列表
 * GET /api/movie
 */
export async function getMovieList() {
  return get<MovieVO[]>("/movie");
}
