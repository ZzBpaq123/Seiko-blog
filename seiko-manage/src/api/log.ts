import { getPage } from "@/utils/request";
import type { LogVO, PageParams, PageResult } from "@/types";

export interface LogListParams extends PageParams {
  /** 日志类型: operation-操作日志, login-登录日志, error-错误日志, security-安全日志 */
  logType?: string;
}

/** 查询日志列表（管理端） */
export async function getLogList(params: LogListParams = {}): Promise<PageResult<LogVO>> {
  return getPage<PageResult<LogVO>>("/manage/log/list", params);
}
