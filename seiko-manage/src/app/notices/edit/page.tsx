"use client";

import { Suspense } from "react";
import NoticeForm from "@/components/forms/NoticeForm";
import PageLoading from "@/components/PageLoading";

export default function EditNoticePage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <NoticeForm mode="edit" />
    </Suspense>
  );
}
