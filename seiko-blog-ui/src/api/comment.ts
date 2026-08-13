import { del, get, post } from "@/utils/request";
import type { CommentDTO, CommentVO } from "./types";

/**
 * 获取评论列表
 * GET /api/blog/comments
 */
export function getCommentList() {
  return get<CommentVO[]>("/comments");
}

/**
 * 根据 ID 获取评论详情
 * GET /api/blog/comments/{id}
 */
export function getCommentById(id: number) {
  return get<CommentVO>(`/comments/${id}`);
}

/**
 * 根据文章 ID 获取评论列表
 * GET /api/blog/comments/post/{postId}
 */
export function getCommentsByPostId(postId: number) {
  return get<CommentVO[]>(`/comments/post/${postId}`);
}

/**
 * 创建评论（需登录 + 邮箱验证码）
 * POST /api/blog/comments
 */
export function createComment(data: CommentDTO) {
  return post<CommentVO>("/comments", data);
}

/**
 * 删除评论
 * DELETE /api/blog/comments/{id}
 */
export function deleteComment(id: number) {
  return del<void>(`/comments/${id}`);
}
