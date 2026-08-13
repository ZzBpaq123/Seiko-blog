"use client";

import { Suspense } from "react";
import PostForm from "@/components/forms/PostForm";
import PageLoading from "@/components/PageLoading";

export default function NewPostPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <PostForm mode="new" />
    </Suspense>
  );
}
