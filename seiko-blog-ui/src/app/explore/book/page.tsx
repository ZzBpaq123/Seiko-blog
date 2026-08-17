import type { Metadata } from "next";
import { getBookList } from "@/api/book";
import BookClient from "./BookClient";

export const metadata: Metadata = {
  title: "书籍 - Seiko Blog",
  description: "探索书籍的世界",
};

export const revalidate = 3600;

export default async function BookPage() {
  const books = await getBookList().catch(() => []);

  return <BookClient initialBooks={books} />;
}
