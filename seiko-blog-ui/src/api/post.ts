import { cache } from "react";
import { get, getPage } from "@/utils/request";
import type { PageParams, PageResult, PostVO, TagCount } from "./types";

/**
 * 获取文章列表（分页）
 * GET /api/posts?page=1&size=10
 */
export function getPostList(params?: PageParams) {
  return getPage<PageResult<PostVO>>("/posts", params);
}

/**
 * 根据 slug 获取文章详情
 * GET /api/posts/{slug}
 * React cache：同一请求内 generateMetadata 与页面组件共享结果，避免重复请求
 */
export const getPostBySlug = cache((slug: string) =>
  get<PostVO>(`/posts/${slug}`),
);

/**
 * 获取所有文章标签
 * GET /api/posts/tags
 */
export function getAllTags() {
  return get<string[]>("/posts/tags");
}

/**
 * 根据标签获取文章列表（分页）
 * GET /api/posts/tag/{tag}?page=1&size=10
 */
export function getPostsByTag(tag: string, params?: PageParams) {
  return getPage<PageResult<PostVO>>(
    `/posts/tag/${encodeURIComponent(tag)}`,
    params,
  );
}

/**
 * 获取标签统计（含文章数量）
 * GET /api/posts/tag-counts
 */
export function getTagCounts() {
  return get<TagCount[]>("/posts/tag-counts");
}
