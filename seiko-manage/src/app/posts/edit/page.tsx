"use client";

import { Suspense } from "react";
import PostForm from "@/components/forms/PostForm";
import PageLoading from "@/components/PageLoading";

export default function EditPostPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <PostForm mode="edit" />
    </Suspense>
  );
}
