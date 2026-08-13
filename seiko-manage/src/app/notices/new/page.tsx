"use client";

import { Suspense } from "react";
import NoticeForm from "@/components/forms/NoticeForm";
import PageLoading from "@/components/PageLoading";

export default function NewNoticePage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <NoticeForm mode="new" />
    </Suspense>
  );
}
