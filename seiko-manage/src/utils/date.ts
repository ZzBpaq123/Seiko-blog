/**
 * 日期格式化工具。
 * 统一原先散落在 notices / resources / photos 各页的本地实现。
 */

/** 取日期部分（YYYY-MM-DD），用于表格展示。 */
export function toDateOnly(value?: string): string {
  if (!value) return "";
  return value.slice(0, 10);
}
