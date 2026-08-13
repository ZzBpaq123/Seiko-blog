"use client";

import { Suspense } from "react";
import UserForm from "@/components/forms/UserForm";
import PageLoading from "@/components/PageLoading";

export default function NewUserPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <UserForm mode="new" />
    </Suspense>
  );
}
