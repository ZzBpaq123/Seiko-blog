import { getDictItemOptions } from "@/api/dict";
import type { DictItemVO } from "@/types";

/** 字典项选项（供 Select 使用） */
export interface DictOption {
  value: string;
  label: string;
}

const cache = new Map<string, DictItemVO[]>();
const pending = new Map<string, Promise<DictItemVO[]>>();

/**
 * 加载某类型全部启用中的字典项，带模块级缓存，重复调用只请求一次。
 * 失败时不写入缓存，下次调用会重试。
 */
export async function loadDictOptions(typeCode: string): Promise<DictItemVO[]> {
  const cached = cache.get(typeCode);
  if (cached) return cached;

  const inflight = pending.get(typeCode);
  if (inflight) return inflight;

  const promise = getDictItemOptions(typeCode)
    .then((items) => {
      const list = items ?? [];
      cache.set(typeCode, list);
      pending.delete(typeCode);
      return list;
    })
    .catch((err) => {
      pending.delete(typeCode);
      throw err;
    });
  pending.set(typeCode, promise);
  return promise;
}

/** 将字典项转换为下拉选项，前面追加「全部」项（用于列表筛选） */
export function dictSelectOptions(items: DictItemVO[], allLabel = "全部"): DictOption[] {
  return [{ value: "", label: allLabel }, ...dictFormOptions(items)];
}

/** 将字典项转换为下拉选项（无「全部」项，用于表单） */
export function dictFormOptions(items: DictItemVO[]): DictOption[] {
  return items.map((it) => ({ value: it.itemValue, label: it.itemLabel }));
}

/** 按值查找字典项，值为 null/undefined 时返回 undefined */
export function dictFind(
  items: DictItemVO[],
  value: string | number | boolean | null | undefined
): DictItemVO | undefined {
  if (value === null || value === undefined) return undefined;
  return items.find((it) => it.itemValue === String(value));
}

/** 取字典项展示文案；找不到时回退为原始值 */
export function dictLabel(
  items: DictItemVO[],
  value: string | number | boolean | null | undefined
): string {
  const item = dictFind(items, value);
  if (item) return item.itemLabel;
  return value === null || value === undefined ? "—" : String(value);
}

const TAG_BADGE_CLASS: Record<string, string> = {
  green: "badge badge-green",
  red: "badge badge-red",
  yellow: "badge badge-yellow",
  blue: "badge badge-blue",
  gray: "badge badge-gray",
};

/** 取字典项标签样式类；找不到时回退为灰色 */
export function dictBadgeClass(
  items: DictItemVO[],
  value: string | number | boolean | null | undefined,
  fallback = "badge badge-gray"
): string {
  const tag = dictFind(items, value)?.itemTag;
  return (tag && TAG_BADGE_CLASS[tag]) || fallback;
}
