import { get } from "@/utils/request";
import type { CreationTrendVO, ReadTrendVO, StatsVO } from "@/types";

/** 获取后台数据统计概览（管理端） */
export async function getStats(): Promise<StatsVO> {
  return get<StatsVO>("/manage/stats");
}

/** 获取近 N 天阅读量趋势，默认 7 天 */
export async function getReadTrend(days = 7): Promise<ReadTrendVO[]> {
  return get<ReadTrendVO[]>("/manage/stats/read-trend", { params: { days } });
}

/** 获取近 N 天内容新建趋势（文章/相册/照片），默认 7 天 */
export async function getCreationTrend(days = 7): Promise<CreationTrendVO[]> {
  return get<CreationTrendVO[]>("/manage/stats/creation-trend", { params: { days } });
}
