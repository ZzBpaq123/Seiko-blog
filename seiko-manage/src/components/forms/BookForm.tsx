"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBook, getBookById, updateBook } from "@/api/book";
import ImageUpload from "@/components/ImageUpload";
import FormScaffold from "@/components/FormScaffold";
import { useEntityLoad } from "@/hooks/useEntityForm";
import { notifyError } from "@/utils/toast";
import type { BookDTO, BookVO } from "@/types";

export default function BookForm({ mode }: { mode: "new" | "edit" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = Number(searchParams.get("id"));

  const [bookName, setBookName] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [bookCover, setBookCover] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { loading, loadError } = useEntityLoad<BookVO>({
    enabled: mode === "edit",
    id,
    loader: getBookById,
    invalidIdMessage: "无效的书籍 ID",
    loadFailMessage: "加载书籍失败",
    onLoaded: (book) => {
      setBookName(book.bookName ?? "");
      setBookAuthor(book.bookAuthor ?? "");
      setBookCover(book.bookCover ?? "");
      setDescription(book.description ?? "");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!bookName.trim()) {
      notifyError("请填写书籍名称");
      return;
    }
    const payload: BookDTO = {
      bookName: bookName.trim(),
      bookAuthor: bookAuthor.trim() || undefined,
      bookCover: bookCover.trim() || undefined,
      description: description.trim() || undefined,
    };
    setSubmitting(true);
    try {
      if (mode === "new") await createBook(payload);
      else await updateBook(id, payload);
      router.push("/books");
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormScaffold
      title={mode === "new" ? "添加书籍" : "编辑书籍"}
      backHref="/books"
      submitting={submitting}
      onSubmit={handleSubmit}
      loading={loading}
      loadError={loadError}
    >
      <div className="card space-y-4">
        <div className="flex gap-4">
          <div className="w-65 shrink-0">
            <label className="block text-sm font-medium text-gray-600 mb-1.5">封面</label>
            <div className="h-64">
              <ImageUpload value={bookCover} onChange={setBookCover} placeholder="上传封面" />
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">书籍名称 *</label>
              <input
                type="text"
                className="input"
                placeholder="如：杀死一只知更鸟"
                value={bookName}
                onChange={(e) => setBookName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">作者</label>
              <input
                type="text"
                className="input"
                placeholder="如：[美]哈珀·李"
                value={bookAuthor}
                onChange={(e) => setBookAuthor(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">书籍简介</label>
          <textarea
            className="input min-h-24 resize-y"
            placeholder="书籍的简要介绍..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>
    </FormScaffold>
  );
}
