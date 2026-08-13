import { get } from "@/utils/request";
import type { BookVO } from "./types";

/**
 * 获取书籍列表
 * GET /api/book
 */
export async function getBookList() {
  return get<BookVO[]>("/book");
}
