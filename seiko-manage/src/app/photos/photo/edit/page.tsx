"use client";

import { Suspense } from "react";
import PhotoForm from "@/components/forms/PhotoForm";
import PageLoading from "@/components/PageLoading";

export default function EditPhotoPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <PhotoForm mode="edit" />
    </Suspense>
  );
}
