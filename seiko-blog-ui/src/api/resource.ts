import { get } from "@/utils/request";
import type { ResourceGroupVO } from "./types";

/**
 * 获取资源分组列表
 * GET /resource/groups
 */
export async function getResourceGroups() {
  return get<ResourceGroupVO[]>("/resource/groups");
}
