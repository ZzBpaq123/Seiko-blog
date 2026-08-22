import type { Metadata } from "next";
import { getResourceGroups } from "@/api/resource";
import ResourceClient from "./ResourceClient";

export const metadata: Metadata = {
  title: "资源 - Seiko Blog",
  description: "探索收藏的资源链接",
};

export const revalidate = 3600;

export default async function ResourcePage() {
  const groups = await getResourceGroups().catch(() => []);

  return <ResourceClient initialGroups={groups} />;
}
