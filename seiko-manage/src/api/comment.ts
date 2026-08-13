import { del, get, getPage } from "@/utils/request";
import type { CommentVO, PageParams, PageResult } from "@/types";

export interface CommentListParams extends PageParams {
  /** 按评论作者模糊查询 */
  author?: string;
}

/** 查询评论列表（管理端） */
export async function getCommentList(params: CommentListParams = {}): Promise<PageResult<CommentVO>> {
  return getPage<PageResult<CommentVO>>("/manage/comment/list", params);
}

/** 查询评论详情（管理端） */
export async function getCommentById(id: number): Promise<CommentVO> {
  return get<CommentVO>(`/manage/comment/${id}`);
}

/** 删除评论（管理端） */
export async function deleteComment(id: number): Promise<boolean> {
  return del<boolean>(`/manage/comment/${id}`);
}
