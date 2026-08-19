"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createNotice, getNoticeById, updateNotice } from "@/api/notice";
import Select from "@/components/Select";
import FormScaffold from "@/components/FormScaffold";
import { useEntityLoad } from "@/hooks/useEntityForm";
import { notifyError, notifySuccess } from "@/utils/toast";
import type { NoticeDTO, NoticeVO } from "@/types";

export default function NoticeForm({ mode }: { mode: "new" | "edit" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = Number(searchParams.get("id"));

  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeContent, setNoticeContent] = useState("");
  const [noticeLink, setNoticeLink] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [enabled, setEnabled] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { loading } = useEntityLoad<NoticeVO>({
    enabled: mode === "edit",
    id,
    loader: getNoticeById,
    invalidIdMessage: "无效的公告 ID",
    loadFailMessage: "加载公告失败",
    onLoaded: (notice) => {
      setNoticeTitle(notice.noticeTitle ?? "");
      setNoticeContent(notice.noticeContent ?? "");
      setNoticeLink(notice.noticeLink ?? "");
      setSortOrder(notice.sortOrder != null ? String(notice.sortOrder) : "0");
      setEnabled(notice.enabled ?? true);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!noticeTitle.trim()) {
      notifyError("请填写公告标题");
      return;
    }
    const payload: NoticeDTO = {
      noticeTitle: noticeTitle.trim(),
      noticeContent: noticeContent.trim() || undefined,
      noticeLink: noticeLink.trim() || undefined,
      sortOrder: sortOrder.trim() ? Number(sortOrder) : 0,
      enabled,
    };
    setSubmitting(true);
    try {
      if (mode === "new") await createNotice(payload);
      else await updateNotice(id, payload);
      notifySuccess(mode === "new" ? "公告创建成功" : "公告更新成功");
      router.push("/notices");
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormScaffold
      title={mode === "new" ? "新建公告" : "编辑公告"}
      backHref="/notices"
      submitting={submitting}
      onSubmit={handleSubmit}
      loading={loading}
    >
      <div className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">公告标题 *</label>
          <input
            type="text"
            className="input"
            placeholder="如：🎉 博客全新改版上线"
            value={noticeTitle}
            onChange={(e) => setNoticeTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">公告内容</label>
          <textarea
            className="input min-h-20 resize-y"
            placeholder="公告的详细内容..."
            value={noticeContent}
            onChange={(e) => setNoticeContent(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">跳转链接</label>
          <input
            type="text"
            className="input"
            placeholder="如：https://example.com"
            value={noticeLink}
            onChange={(e) => setNoticeLink(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">排序序号</label>
            <input
              type="number"
              className="input"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">状态</label>
            <Select
              value={enabled ? "true" : "false"}
              onChange={(v) => setEnabled(v === "true")}
              options={[
                { value: "true", label: "已启用" },
                { value: "false", label: "已停用" },
              ]}
            />
          </div>
        </div>
      </div>
    </FormScaffold>
  );
}
