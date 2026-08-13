"use client";

import { Suspense } from "react";
import UserForm from "@/components/forms/UserForm";
import PageLoading from "@/components/PageLoading";

export default function EditUserPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <UserForm mode="edit" />
    </Suspense>
  );
}
