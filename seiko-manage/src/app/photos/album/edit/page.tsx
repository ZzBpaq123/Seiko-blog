"use client";

import { Suspense } from "react";
import AlbumForm from "@/components/forms/AlbumForm";
import PageLoading from "@/components/PageLoading";

export default function EditAlbumPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <AlbumForm mode="edit" />
    </Suspense>
  );
}
