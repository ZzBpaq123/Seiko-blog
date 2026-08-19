"use client";

import { useState } from "react";
import { Eye, Loader2, RotateCcw, ScrollText, X } from "lucide-react";
import { getLogList } from "@/api/log";
import type { LogVO } from "@/types";
import Select from "@/components/Select";
import PageHeader from "@/components/PageHeader";
import Pagination from "@/components/Pagination";
import { usePagedList } from "@/hooks/usePagedList";

const PAGE_SIZE = 10;

const LOG_TYPE_OPTIONS = [
  { value: "", label: "全部类型" },
  { value: "operation", label: "操作日志" },
  { value: "login", label: "登录日志" },
  { value: "error", label: "错误日志" },
  { value: "security", label: "安全日志" },
];

function logTypeMeta(type: string): { label: string; badge: string } {
  switch (type) {
    case "operation":
      return { label: "操作日志", badge: "badge badge-blue" };
    case "login":
      return { label: "登录日志", badge: "badge badge-green" };
    case "error":
      return { label: "错误日志", badge: "badge badge-red" };
    case "security":
      return { label: "安全日志", badge: "badge badge-yellow" };
    default:
      return { label: type || "—", badge: "badge badge-gray" };
  }
}

function logLevelMeta(level: string): { label: string; badge: string } {
  switch (level) {
    case "DEBUG":
      return { label: "调试", badge: "badge badge-gray" };
    case "INFO":
      return { label: "信息", badge: "badge badge-blue" };
    case "WARN":
      return { label: "警告", badge: "badge badge-yellow" };
    case "ERROR":
      return { label: "错误", badge: "badge badge-red" };
    default:
      return { label: level || "—", badge: "badge badge-gray" };
  }
}

function prettyJson(value?: string): string {
  if (!value) return "";
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

export default function LogsPage() {
  const [typeFilter, setTypeFilter] = useState("");
  const [detail, setDetail] = useState<LogVO | null>(null);

  const { page, setPage, loading, pageResult, records, reset } = usePagedList<LogVO>({
    pageSize: PAGE_SIZE,
    deps: [typeFilter],
    fetch: (page) =>
      getLogList({
        page,
        size: PAGE_SIZE,
        logType: typeFilter || undefined,
      }),
  });

  const handleReset = () => {
    setTypeFilter("");
    reset();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="日志管理" />

      {/* Filter Bar */}
      <div className="card flex items-center gap-4">
        <Select
          className="flex-3 min-w-0"
          value={typeFilter}
          onChange={(v) => setTypeFilter(String(v))}
          options={LOG_TYPE_OPTIONS}
        />
        <button
          type="button"
          className="btn btn-secondary flex-1 min-w-0 justify-center whitespace-nowrap"
          onClick={handleReset}
          title="重置"
        >
          <RotateCcw size={16} /> 重置
        </button>
      </div>

      {/* Table */}
      <div className="card table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>类型</th>
              <th>级别</th>
              <th>操作</th>
              <th>用户</th>
              <th>IP 地址</th>
              <th>请求</th>
              <th>状态</th>
              <th>耗时</th>
              <th>创建时间</th>
              <th className="text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className="py-16 text-gray-500">
                  <div className="flex items-center justify-center">
                    <Loader2 size={24} className="animate-spin mr-2" /> 加载中...
                  </div>
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-16 text-gray-400">
                  <div className="flex flex-col items-center justify-center">
                    <ScrollText size={36} className="mb-2" /> 暂无日志
                  </div>
                </td>
              </tr>
            ) : (
              records.map((log) => {
                const type = logTypeMeta(log.logType);
                const level = logLevelMeta(log.logLevel);
                return (
                  <tr key={log.id}>
                    <td>
                      <span className={type.badge}>{type.label}</span>
                    </td>
                    <td>
                      <span className={level.badge}>{level.label}</span>
                    </td>
                    <td className="max-w-xs">
                      <div className="truncate font-medium text-foreground" title={log.action}>
                        {log.action}
                      </div>
                      {log.description && (
                        <div className="truncate text-xs text-gray-500" title={log.description}>
                          {log.description}
                        </div>
                      )}
                    </td>
                    <td>{log.username || "—"}</td>
                    <td className="font-mono text-xs text-gray-500">{log.ipAddress || "—"}</td>
                    <td className="max-w-[220px]">
                      <div className="flex items-center gap-1.5">
                        {log.requestMethod && (
                          <span className="badge badge-gray shrink-0">{log.requestMethod}</span>
                        )}
                        <span className="truncate text-xs text-gray-500" title={log.requestUrl}>
                          {log.requestUrl || "—"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${log.status === 1 ? "badge-red" : "badge-green"}`}
                      >
                        {log.status === 1 ? "异常" : "正常"}
                      </span>
                    </td>
                    <td>{log.costTime != null ? `${log.costTime} ms` : "—"}</td>
                    <td className="whitespace-nowrap">{log.createTime || "—"}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                          title="查看详情"
                          onClick={() => setDetail(log)}
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination pageResult={pageResult} page={page} onChange={setPage} />

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">日志详情</h2>
              <button
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                onClick={() => setDetail(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-4 overflow-y-auto flex-1 space-y-5 text-sm">
              {/* 概览 */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={logTypeMeta(detail.logType).badge}>
                  {logTypeMeta(detail.logType).label}
                </span>
                <span className={logLevelMeta(detail.logLevel).badge}>
                  {logLevelMeta(detail.logLevel).label}
                </span>
                <span className={`badge ${detail.status === 1 ? "badge-red" : "badge-green"}`}>
                  {detail.status === 1 ? "异常" : "正常"}
                </span>
                <span className="text-gray-500">{detail.createTime}</span>
              </div>

              {/* 操作与用户 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-gray-500 block mb-0.5">操作动作</span>
                  <span className="font-medium text-foreground">{detail.action}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-0.5">操作用户</span>
                  {detail.username ? (
                    <span>
                      {detail.username}
                      {detail.userId != null && (
                        <span className="text-gray-400">（ID: {detail.userId}）</span>
                      )}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </div>
                {detail.description && (
                  <div className="col-span-2">
                    <span className="text-gray-500 block mb-0.5">操作描述</span>
                    <p className="text-foreground whitespace-pre-wrap">{detail.description}</p>
                  </div>
                )}
              </div>

              {/* 请求信息 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-gray-500 block mb-0.5">请求方法</span>
                  <span className="badge badge-gray">{detail.requestMethod || "—"}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-0.5">响应状态码</span>
                  <span>{detail.responseCode ?? "—"}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-0.5">IP 地址</span>
                  <span className="font-mono">{detail.ipAddress || "—"}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-0.5">消耗时间</span>
                  <span>{detail.costTime != null ? `${detail.costTime} ms` : "—"}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500 block mb-0.5">请求 URL</span>
                  <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-3 py-2 font-mono text-xs break-all">
                    {detail.requestUrl || "—"}
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500 block mb-0.5">调用方法</span>
                  <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-3 py-2 font-mono text-xs break-all">
                    {detail.method || "—"}
                  </div>
                </div>
              </div>

              {/* 请求参数 */}
              {detail.requestParams && (
                <div>
                  <span className="text-gray-500 block mb-0.5">请求参数</span>
                  <pre className="rounded-lg bg-gray-100 dark:bg-gray-800 px-3 py-2 text-xs overflow-x-auto">
                    {prettyJson(detail.requestParams)}
                  </pre>
                </div>
              )}

              {/* 返回参数 */}
              {detail.jsonResult && (
                <div>
                  <span className="text-gray-500 block mb-0.5">返回参数</span>
                  <pre className="rounded-lg bg-gray-100 dark:bg-gray-800 px-3 py-2 text-xs overflow-x-auto">
                    {prettyJson(detail.jsonResult)}
                  </pre>
                </div>
              )}

              {/* 错误信息 */}
              {detail.errorMessage && (
                <div>
                  <span className="text-gray-500 block mb-0.5">错误信息</span>
                  <pre className="rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-3 py-2 text-xs text-red-600 dark:text-red-400 overflow-x-auto">
                    {detail.errorMessage}
                  </pre>
                </div>
              )}

              {/* 用户代理 */}
              {detail.userAgent && (
                <div>
                  <span className="text-gray-500 block mb-0.5">用户代理</span>
                  <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-3 py-2 text-xs break-all">
                    {detail.userAgent}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end px-6 py-4 border-t border-border bg-gray-50 dark:bg-gray-800/50">
              <button className="btn btn-secondary" onClick={() => setDetail(null)}>
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

