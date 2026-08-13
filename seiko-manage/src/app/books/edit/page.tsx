"use client";

import { Suspense } from "react";
import BookForm from "@/components/forms/BookForm";
import PageLoading from "@/components/PageLoading";

export default function EditBookPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <BookForm mode="edit" />
    </Suspense>
  );
}
