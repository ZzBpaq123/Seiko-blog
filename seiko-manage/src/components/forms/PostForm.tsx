"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createPost, getPostById, updatePost } from "@/api/post";
import ImageUpload from "@/components/ImageUpload";
import TagMultiSelect from "@/components/TagMultiSelect";
import MarkdownSplitEditor from "@/components/MarkdownSplitEditor";
import FormScaffold from "@/components/FormScaffold";
import { useEntityLoad } from "@/hooks/useEntityForm";
import { notifyError, notifySuccess } from "@/utils/toast";
import type { PostCreateDTO, PostVO } from "@/types";

/** 由标题生成 URL 友好的 slug：保留中英文与数字，空白与符号转为短横线 */
function slugify(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^一-龥a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function PostForm({ mode }: { mode: "new" | "edit" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = Number(searchParams.get("id"));

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [cover, setCover] = useState("");
  const [author, setAuthor] = useState("Seiko");
  const [tags, setTags] = useState<string[]>([]);
  const [published, setPublished] = useState(true);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { loading } = useEntityLoad<PostVO>({
    enabled: mode === "edit",
    id,
    loader: getPostById,
    invalidIdMessage: "无效的文章 ID",
    loadFailMessage: "加载文章失败",
    onLoaded: (post) => {
      setTitle(post.title ?? "");
      setSlug(post.slug ?? "");
      setExcerpt(post.excerpt ?? "");
      setCover(post.cover ?? "");
      setAuthor(post.author ?? "Seiko");
      setTags(post.tags ?? []);
      setPublished(Boolean(post.published));
      setContent(post.content ?? "");
    },
  });

  // 标题变化时，未手动改过 slug 则自动同步
  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugEdited) {
      setSlug(slugify(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!title.trim()) {
      notifyError("请填写文章标题");
      return;
    }
    if (!slug.trim()) {
      notifyError("请填写 slug");
      return;
    }
    if (!content.trim()) {
      notifyError("请填写文章内容");
      return;
    }
    const payload: PostCreateDTO = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim(),
      content,
      cover: cover.trim() || undefined,
      author: author.trim() || undefined,
      tags,
      published,
    };
    setSubmitting(true);
    try {
      if (mode === "new") await createPost(payload);
      else await updatePost(id, payload);
      notifySuccess(mode === "new" ? "文章发布成功" : "文章更新成功");
      router.push("/posts");
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormScaffold
      title={mode === "new" ? "新建文章" : "编辑文章"}
      backHref="/posts"
      submitting={submitting}
      onSubmit={handleSubmit}
      loading={loading}
      headerExtra={
        <label className="flex items-center gap-2 text-sm text-gray-600 mr-2">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          立即发布
        </label>
      }
    >
      {/* 文章元信息 */}
      <div className="card space-y-4">
        {/* 顶部：左封面图，右标题/Slug/作者 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <ImageUpload
              label="封面图"
              value={cover}
              onChange={setCover}
              aspectRatio="16/9"
            />
          </div>
          <div className="space-y-4 md:col-span-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">标题</label>
              <input
                type="text"
                className="input"
                placeholder="文章标题"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Slug（URL 标识）</label>
                <input
                  type="text"
                  className="input"
                  placeholder="article-slug"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugEdited(true);
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">作者</label>
                <input
                  type="text"
                  className="input"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
              </div>
            </div>
            <div>
              <TagMultiSelect
                label="标签"
                value={tags}
                onChange={setTags}
                placeholder="选择标签（可多选）"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">摘要</label>
              <input
                type="text"
                className="input"
                placeholder="一句话简介，用于列表展示"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 内容编辑 / 预览 */}
      <div className="card space-y-3">
        <label className="block text-sm font-medium text-gray-600">
          内容（Markdown）
        </label>
        <MarkdownSplitEditor
          value={content}
          onChange={setContent}
          placeholder="在此用 Markdown 编写文章内容..."
        />
      </div>
    </FormScaffold>
  );
}
