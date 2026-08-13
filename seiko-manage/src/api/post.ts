import { del, get, getPage, post, put } from "@/utils/request";
import type { PageParams, PageResult, PostCreateDTO, PostVO, TagVO } from "@/types";

export interface PostListParams extends PageParams {
  /** 按标题模糊查询 */
  title?: string;
  /** 按发布状态查询：true=已发布，false=草稿 */
  published?: boolean;
  /** 按标签名称查询 */
  tag?: string;
}

/** 查询文章列表（管理端，包含草稿） */
export async function getPostList(params: PostListParams = {}): Promise<PageResult<PostVO>> {
  return getPage<PageResult<PostVO>>("/manage/post/list", params);
}

/** 查询文章详情（管理端） */
export async function getPostById(id: number): Promise<PostVO> {
  return get<PostVO>(`/manage/post/${id}`);
}

/** 新建文章（管理端） */
export async function createPost(data: PostCreateDTO): Promise<PostVO> {
  return post<PostVO>("/manage/post", data);
}

/** 更新文章（管理端） */
export async function updatePost(id: number, data: PostCreateDTO): Promise<PostVO> {
  return put<PostVO>(`/manage/post/${id}`, data);
}

/** 删除文章（管理端） */
export async function deletePost(id: number): Promise<boolean> {
  return del<boolean>(`/manage/post/${id}`);
}

/** 查询标签列表（管理端） */
export async function getTagList(): Promise<TagVO[]> {
  return get<TagVO[]>("/manage/post/tag/list");
}
