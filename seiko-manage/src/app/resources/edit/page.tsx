"use client";

import { Suspense } from "react";
import ResourceForm from "@/components/forms/ResourceForm";
import PageLoading from "@/components/PageLoading";

export default function EditResourcePage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <ResourceForm mode="edit" />
    </Suspense>
  );
}
