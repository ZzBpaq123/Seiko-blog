import { del, get, getPage, patch, post, put } from "@/utils/request";
import type { MovieDTO, MovieVO, PageParams, PageResult } from "@/types";

export interface MovieListParams extends PageParams {
  /** 按电影名称模糊查询 */
  movieName?: string;
}

/** 查询电影列表（管理端） */
export async function getMovieList(params: MovieListParams = {}): Promise<PageResult<MovieVO>> {
  return getPage<PageResult<MovieVO>>("/manage/movie/list", params);
}

/** 查询电影详情（管理端） */
export async function getMovieById(id: number): Promise<MovieVO> {
  return get<MovieVO>(`/manage/movie/${id}`);
}

/** 新建电影（管理端） */
export async function createMovie(data: MovieDTO): Promise<number> {
  return post<number>("/manage/movie", data);
}

/** 更新电影（管理端） */
export async function updateMovie(id: number, data: MovieDTO): Promise<boolean> {
  return put<boolean>(`/manage/movie/${id}`, data);
}

/** 删除电影（管理端） */
export async function deleteMovie(id: number): Promise<boolean> {
  return del<boolean>(`/manage/movie/${id}`);
}

/** 更新电影置顶状态 */
export async function updateMovieTopStatus(id: number, isTop: number): Promise<boolean> {
  return patch<boolean>(`/manage/movie/${id}/top`, null, { params: { isTop } });
}
