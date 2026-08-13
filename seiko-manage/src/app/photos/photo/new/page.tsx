"use client";

import { Suspense } from "react";
import PhotoForm from "@/components/forms/PhotoForm";
import PageLoading from "@/components/PageLoading";

export default function NewPhotoPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <PhotoForm mode="new" />
    </Suspense>
  );
}
