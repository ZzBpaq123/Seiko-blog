"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import PageLoading from "@/components/PageLoading";

interface FormScaffoldProps {
  /** 页面标题，如「新建资源」「编辑资源」 */
  title: string;
  /** 返回箭头与取消跳转的目标列表页 */
  backHref: string;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  /** 编辑页取数中（新建页不传） */
  loading?: boolean;
  /** 编辑页取数失败时的整页错误信息（页面无内容可展示时使用） */
  loadError?: string | null;
  /** 保存按钮左侧的额外操作（如「立即发布」开关） */
  headerExtra?: ReactNode;
  children: ReactNode;
}

/**
 * 新建 / 编辑表单的统一外壳：返回箭头 + 标题 + 保存按钮，
 * 以及编辑页的加载态与取数失败整页错误。提交类错误统一走全局 Toast，不再内联横幅。
 */
export default function FormScaffold({
  title,
  backHref,
  submitting,
  onSubmit,
  loading,
  loadError,
  headerExtra,
  children,
}: FormScaffoldProps) {
  if (loading) {
    return <PageLoading />;
  }

  if (loadError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href={backHref} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500" title="返回">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        </div>
        <div className="card border-red-200 bg-red-50 text-red-600 py-6 text-center">{loadError}</div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={backHref} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500" title="返回">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {headerExtra}
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            保存
          </button>
        </div>
      </div>

      {children}
    </form>
  );
}
