"use client";

import { Suspense } from "react";
import ResourceForm from "@/components/forms/ResourceForm";
import PageLoading from "@/components/PageLoading";

export default function NewResourcePage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <ResourceForm mode="new" />
    </Suspense>
  );
}
