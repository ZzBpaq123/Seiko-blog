"use client";

import { Suspense } from "react";
import BookForm from "@/components/forms/BookForm";
import PageLoading from "@/components/PageLoading";

export default function NewBookPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <BookForm mode="new" />
    </Suspense>
  );
}
