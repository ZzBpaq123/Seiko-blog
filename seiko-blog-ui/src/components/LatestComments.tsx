"use client";

import { useEffect, useState } from "react";
import { getCommentList } from "@/api/comment";
import type { CommentVO } from "@/api/types";

const MAX_DISPLAY = 5;

export default function LatestComments() {
  const [comments, setComments] = useState<CommentVO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getCommentList()
      .then((data) => {
        if (!cancelled) {
          const list = Array.isArray(data) ? data : [];
          setComments(list.slice(0, MAX_DISPLAY));
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-[220px] items-center justify-center text-xs text-zinc-400">
        加载中...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[220px] items-center justify-center text-xs text-zinc-400">
        评论加载失败
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-xs text-zinc-400">
        暂无评论
      </div>
    );
  }

  const displayComments = [...comments, ...comments];

  return (
    <div className="overflow-hidden" style={{ height: "220px" }}>
      <div className="animate-scroll-up">
        {displayComments.map((comment, i) => (
          <div
            key={`${comment.id}-${i}`}
            className="mb-3 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div
                className="h-6 w-6 flex-shrink-0 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                style={{ backgroundColor: comment.avatarColor || "#A0E7E5" }}
              >
                {comment.author[0]}
              </div>
              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                {comment.author}
              </span>
              <span className="ml-auto text-[10px] text-zinc-400 dark:text-zinc-500">
                {comment.commentDate?.slice(0, 10) ?? ""}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
              {comment.commentContent}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
