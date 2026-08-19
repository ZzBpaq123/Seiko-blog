"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, Pencil, Trash2, Eye, Loader2, RotateCcw, X, FileText } from "lucide-react";
import { deletePost, getPostById, getPostList, getTagList } from "@/api/post";
import type { PostVO, TagVO } from "@/types";
import { useConfirm } from "@/components/ConfirmDialog";
import Select from "@/components/Select";
import PageHeader from "@/components/PageHeader";
import Pagination from "@/components/Pagination";
import { useDebounce } from "@/hooks/useDebounce";
import { usePagedList } from "@/hooks/usePagedList";
import { notifyError, notifySuccess } from "@/utils/toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const PAGE_SIZE = 10;

function formatStatus(published?: boolean) {
  return published ? "已发布" : "草稿";
}

export default function PostsPage() {
  const router = useRouter();
  const confirm = useConfirm();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [tagOptions, setTagOptions] = useState<TagVO[]>([]);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [detail, setDetail] = useState<PostVO | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const debouncedSearch = useDebounce(search);

  const { page, setPage, loading, pageResult, records, refresh, reset } = usePagedList<PostVO>({
    pageSize: PAGE_SIZE,
    deps: [debouncedSearch, statusFilter, tagFilter],
    fetch: (page) =>
      getPostList({
        page,
        size: PAGE_SIZE,
        title: debouncedSearch.trim() || undefined,
        published: statusFilter === "" ? undefined : statusFilter === "true",
        tag: tagFilter || undefined,
      }),
  });

  // 加载标签下拉框数据
  useEffect(() => {
    let cancelled = false;
    Promise.resolve()
      .then(() => {
        setTagsLoading(true);
        return getTagList();
      })
      .then((tags) => {
        if (!cancelled) setTagOptions(tags ?? []);
      })
      .catch(() => {
        if (!cancelled) setTagOptions([]);
      })
      .finally(() => {
        if (!cancelled) setTagsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleReset = () => {
    setSearch("");
    setStatusFilter("");
    setTagFilter("");
    reset();
  };

  // 查看文章详情
  const handleView = async (id: number) => {
    if (!id) return;
    setDetailLoading(true);
    try {
      const post = await getPostById(id);
      setDetail(post);
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "加载详情失败");
    } finally {
      setDetailLoading(false);
    }
  };

  // 删除文章
  const handleDelete = async (id: number) => {
    if (!id) return;
    if (!(await confirm({ message: "确定要删除这篇文章吗？删除后不可恢复。" }))) return;
    setDeletingId(id);
    try {
      await deletePost(id);
      notifySuccess("文章删除成功");
      refresh();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "删除失败");
    } finally {
      setDeletingId(null);
    }
  };

  // 编辑文章
  const handleEdit = (id: number) => {
    if (!id) return;
    router.push(`/posts/edit?id=${id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="文章管理"
        action={
          <Link href="/posts/new" className="btn btn-primary">
            <Plus size={16} /> 新建文章
          </Link>
        }
      />

      {/* Filter Bar：搜索框 + 标签下拉 + 状态下拉 + 重置按钮，不换行 */}
      <div className="card flex items-center gap-3 md:gap-4">
        {/* 搜索框 */}
        <div className="relative flex-4 min-w-0">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
              type="text"
              placeholder="搜索文章标题..."
              className="input input-icon w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* 标签下拉 */}
        <Select
            className="flex-3 min-w-0"
            value={tagFilter}
            disabled={tagsLoading}
            onChange={(v) => setTagFilter(String(v))}
            options={[
              { value: "", label: "全部标签" },
              ...tagOptions.map((tag) => ({ value: tag.name, label: tag.name })),
            ]}
        />

        {/* 状态下拉 */}
        <Select
            className="flex-2 min-w-0"
            value={statusFilter}
            onChange={(v) => setStatusFilter(String(v))}
            options={[
              { value: "", label: "全部状态" },
              { value: "true", label: "已发布" },
              { value: "false", label: "草稿" },
            ]}
        />

        {/* 重置按钮 */}
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
              <th>标题</th>
              <th>作者</th>
              <th>标签</th>
              <th>阅读量</th>
              <th>状态</th>
              <th>发布时间</th>
              <th className="text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="py-16 text-gray-500">
                  <div className="flex items-center justify-center">
                    <Loader2 size={24} className="animate-spin mr-2" />
                    加载中...
                  </div>
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-gray-400">
                  <div className="flex flex-col items-center justify-center">
                    <FileText size={36} className="mb-2" />
                    暂无文章
                  </div>
                </td>
              </tr>
            ) : (
              records.map((post) => (
                <tr key={post.id}>
                  <td className="font-medium text-foreground">{post.title}</td>
                  <td>{post.author}</td>
                  <td>
                    <div className="flex justify-center gap-1 flex-wrap">
                      {post.tags?.map((tag) => (
                        <span key={tag} className="badge badge-blue">{tag}</span>
                      ))}
                    </div>
                  </td>
                  <td>{post.readNum.toLocaleString("zh-CN")}</td>
                  <td>
                    <span className={`badge ${post.published ? "badge-green" : "badge-yellow"}`}>
                      {formatStatus(post.published)}
                    </span>
                  </td>
                  <td>{post.date?.split(" ")[0] ?? "—"}</td>
                  <td className="text-right">
                    <div className="flex items-center justify-center gap-2">
                      <button
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed"
                          title="查看"
                          onClick={() => handleView(post.id)}
                          disabled={detailLoading || !post.id}
                      >
                        <Eye size={14} />
                      </button>
                      <button
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
                          title="编辑"
                          onClick={() => handleEdit(post.id)}
                          disabled={!post.id}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 disabled:opacity-40 disabled:cursor-not-allowed"
                          title="删除"
                          onClick={() => handleDelete(post.id)}
                          disabled={deletingId === post.id || !post.id}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination pageResult={pageResult} page={page} onChange={setPage} />

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">{detail.title}</h2>
              <button
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                onClick={() => setDetail(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-4 overflow-y-auto flex-1">
              {detail.cover && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={detail.cover}
                  alt={detail.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <div className="flex flex-wrap gap-2 mb-4">
                {detail.tags?.map((tag) => (
                  <span key={tag} className="badge badge-blue">{tag}</span>
                ))}
                <span className={`badge ${detail.published ? "badge-green" : "badge-yellow"}`}>
                  {formatStatus(detail.published)}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                作者：{detail.author} · 阅读量：{detail.readNum.toLocaleString("zh-CN")} · 发布时间：{detail.date?.split(" ")[0] ?? "—"}
              </p>
              <div className="markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{detail.content}</ReactMarkdown>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-border bg-gray-50 dark:bg-gray-800/50">
              <button
                className="btn btn-secondary"
                onClick={() => setDetail(null)}
              >
                关闭
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setDetail(null);
                  router.push(`/posts/edit?id=${detail.id}`);
                }}
              >
                去编辑
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
