"use client";

import { Suspense } from "react";
import MovieForm from "@/components/forms/MovieForm";
import PageLoading from "@/components/PageLoading";

export default function NewMoviePage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <MovieForm mode="new" />
    </Suspense>
  );
}
