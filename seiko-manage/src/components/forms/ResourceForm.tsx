"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createResource, getResourceById, updateResource } from "@/api/resource";
import Select from "@/components/Select";
import FormScaffold from "@/components/FormScaffold";
import { useEntityLoad } from "@/hooks/useEntityForm";
import { notifyError } from "@/utils/toast";
import type { ResourceDTO, ResourceVO } from "@/types";

/** 资源分类预设 */
const CATEGORY_PRESETS = ["工具", "设计资源", "学习", "效率", "娱乐"];

export default function ResourceForm({ mode }: { mode: "new" | "edit" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = Number(searchParams.get("id"));

  const [resourceName, setResourceName] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [enabled, setEnabled] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { loading, loadError } = useEntityLoad<ResourceVO>({
    enabled: mode === "edit",
    id,
    loader: getResourceById,
    invalidIdMessage: "无效的资源 ID",
    loadFailMessage: "加载资源失败",
    onLoaded: (resource) => {
      setResourceName(resource.resourceName ?? "");
      setResourceUrl(resource.resourceUrl ?? "");
      setCategory(resource.category ?? "");
      setDescription(resource.description ?? "");
      setSortOrder(resource.sortOrder != null ? String(resource.sortOrder) : "0");
      setEnabled(resource.enabled ?? true);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!resourceName.trim()) {
      notifyError("请填写资源名称");
      return;
    }
    if (!resourceUrl.trim()) {
      notifyError("请填写资源网址");
      return;
    }
    const payload: ResourceDTO = {
      resourceName: resourceName.trim(),
      resourceUrl: resourceUrl.trim(),
      category: category.trim() || undefined,
      description: description.trim() || undefined,
      sortOrder: sortOrder.trim() ? Number(sortOrder) : 0,
      enabled,
    };
    setSubmitting(true);
    try {
      if (mode === "new") await createResource(payload);
      else await updateResource(id, payload);
      router.push("/resources");
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormScaffold
      title={mode === "new" ? "新建资源" : "编辑资源"}
      backHref="/resources"
      submitting={submitting}
      onSubmit={handleSubmit}
      loading={loading}
      loadError={loadError}
    >
      <div className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">资源名称 *</label>
          <input
            type="text"
            className="input"
            placeholder="如：Figma"
            value={resourceName}
            onChange={(e) => setResourceName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">资源网址 *</label>
          <input
            type="text"
            className="input"
            placeholder="如：https://www.figma.com"
            value={resourceUrl}
            onChange={(e) => setResourceUrl(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">资源分类</label>
          <input
            type="text"
            className="input"
            placeholder="如：设计资源"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {CATEGORY_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                  category === preset
                    ? "border-blue-500 bg-blue-50 text-blue-600"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
                onClick={() => setCategory(preset)}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">资源简介</label>
          <textarea
            className="input min-h-20 resize-y"
            placeholder="简单介绍这个资源..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
