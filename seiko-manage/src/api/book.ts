import { del, get, getPage, post, put } from "@/utils/request";
import type { BookDTO, BookVO, PageParams, PageResult } from "@/types";

export interface BookListParams extends PageParams {
  /** 按书籍名称模糊查询 */
  bookName?: string;
}

/** 查询书籍列表（管理端） */
export async function getBookList(params: BookListParams = {}): Promise<PageResult<BookVO>> {
  return getPage<PageResult<BookVO>>("/manage/book/list", params);
}

/** 查询书籍详情（管理端） */
export async function getBookById(id: number): Promise<BookVO> {
  return get<BookVO>(`/manage/book/${id}`);
}

/** 新建书籍（管理端） */
export async function createBook(data: BookDTO): Promise<number> {
  return post<number>("/manage/book", data);
}

/** 更新书籍（管理端） */
export async function updateBook(id: number, data: BookDTO): Promise<boolean> {
  return put<boolean>(`/manage/book/${id}`, data);
}

/** 删除书籍（管理端） */
export async function deleteBook(id: number): Promise<boolean> {
  return del<boolean>(`/manage/book/${id}`);
}
