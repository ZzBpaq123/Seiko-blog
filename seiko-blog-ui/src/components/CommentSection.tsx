"use client";

import { useEffect, useState } from "react";
import { getCommentsByPostId, createComment } from "@/api/comment";
import { sendEmailCode } from "@/api/code";
import type { CommentVO } from "@/api/types";

interface CommentSectionProps {
  postId: number;
}

const AVATAR_COLORS = [
  "#FFB7B2",
  "#A0E7E5",
  "#C7CEEA",
  "#FFDAC1",
  "#B5EAD7",
  "#E2F0CB",
  "#FF9AA2",
  "#96CEB4",
];

function formatDateTime(value?: string) {
  if (!value) return "";
  return value.slice(0, 19).replace("T", " ");
}

function formatNow() {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentVO[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);

  const [sendingCode, setSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    getCommentsByPostId(postId)
      .then((data) => {
        if (!cancelled) {
          setComments(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFetchError(true);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [postId]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendCode = async () => {
    if (!email) {
      setFormError("请输入邮箱");
      return;
    }
    if (countdown > 0) return;

    setSendingCode(true);
    setFormError("");
    try {
      await sendEmailCode({ email });
      setCountdown(60);
      setFormSuccess("验证码已发送，请查收邮箱");
    } catch {
      setFormError("验证码发送失败，请检查邮箱或稍后重试");
    } finally {
      setSendingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !code || !author || !content) {
      setFormError("请填写完整信息");
      return;
    }

    setSubmitting(true);
    setFormError("");
    setFormSuccess("");

    try {
      const newComment = await createComment({
        userEmail: email,
        code,
        author,
        commentContent: content,
        commentDate: formatNow(),
        avatarColor,
        postId,
      });
      if (newComment) {
        setComments((prev) => [newComment, ...prev]);
      }
      setCode("");
      setContent("");
      setFormSuccess("评论发表成功");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "评论发表失败";
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-8 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-6 text-lg font-bold text-zinc-900 dark:text-zinc-100">
        评论 ({comments.length})
      </h2>

      {loading && (
          <p className="py-4 text-center text-sm text-zinc-400">评论加载中...</p>
      )}

      {!loading && fetchError && (
          <p className="py-4 text-center text-sm text-zinc-400">评论加载失败</p>
      )}

      {!loading && !fetchError && comments.length === 0 && (
          <p className="py-4 text-center text-sm text-zinc-400">暂无评论，快来抢沙发吧~</p>
      )}

      {!loading && !fetchError && comments.length > 0 && (
        <div className="mb-8 space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/60"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{
                    backgroundColor: comment.avatarColor || "#A0E7E5",
                  }}
                >
                  {comment.author?.[0] ?? "?"}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    {comment.author}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {formatDateTime(comment.commentDate)}
                  </p>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-300">
                {comment.commentContent}
              </p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          发表评论
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              昵称
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="你的昵称"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-300 dark:border-zinc-700 dark:bg-zinc-950"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              头像颜色
            </label>
            <div className="flex flex-wrap gap-2">
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setAvatarColor(color)}
                  className={`h-7 w-7 rounded-full border-2 transition-transform ${
                    avatarColor === color
                      ? "border-zinc-900 scale-110 dark:border-white"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`选择头像颜色 ${color}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              邮箱
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-300 dark:border-zinc-700 dark:bg-zinc-950"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              验证码
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="6 位验证码"
                maxLength={6}
                className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-300 dark:border-zinc-700 dark:bg-zinc-950"
                required
              />
              <button
                type="button"
                onClick={handleSendCode}
                disabled={sendingCode || countdown > 0}
                className="self-end rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600 disabled:bg-zinc-300 dark:disabled:bg-zinc-700"
              >
                {countdown > 0 ? `${countdown}s 后重发` : "获取验证码"}
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            评论内容
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            placeholder="写下你的想法..."
            className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-300 dark:border-zinc-700 dark:bg-zinc-950"
            required
          />
        </div>

        {formError && (
          <p className="text-sm text-rose-500">{formError}</p>
        )}
        {formSuccess && (
          <p className="text-sm text-emerald-500">{formSuccess}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:bg-zinc-400 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {submitting ? "提交中..." : "发表评论"}
        </button>
      </form>
    </section>
  );
}
