"use client";

import { Suspense } from "react";
import FootprintForm from "@/components/forms/FootprintForm";
import PageLoading from "@/components/PageLoading";

export default function NewFootprintPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <FootprintForm mode="new" />
    </Suspense>
  );
}
