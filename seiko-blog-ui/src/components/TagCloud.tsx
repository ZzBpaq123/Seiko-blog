"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getTagColor } from "@/styles/colors";

interface TagCount {
  tag: string;
  count: number;
  total?: number;
}

interface TagCloudProps {
  tagCounts?: TagCount[];
  tags?: string[];
}

export default function TagCloud({ tagCounts, tags }: TagCloudProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimated(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const items: TagCount[] = tagCounts?.length
    ? tagCounts
    : (tags?.map((tag) => ({ tag, count: 1 })) ?? []);

  if (items.length === 0) return null;

  const maxCount = items[0].count;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-5 text-center text-xl font-semibold text-zinc-700 dark:text-zinc-300">
        标签云
      </h2>
      <div className="space-y-4">
        {items.map(({ tag, count, total }, index) => {
          const percentage =
            total && total > 0
              ? (count / total) * 100
              : maxCount > 0
                ? (count / maxCount) * 100
                : 100;
          const color = getTagColor(index);
          return (
            <Link
              key={tag}
              href={`/tag/${encodeURIComponent(tag)}`}
              className="group block"
              style={
                {
                  "--tag-color-main": color.main,
                  "--tag-color-hover": color.hover,
                } as React.CSSProperties
              }
            >
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-zinc-700 transition-colors group-hover:text-[var(--tag-color-hover)] dark:text-zinc-300">
                  {tag}
                </span>
                {tagCounts?.length ? (
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {count} 篇
                  </span>
                ) : null}
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full bg-[var(--tag-color-main)] transition-all duration-1000 ease-out group-hover:bg-[var(--tag-color-hover)]"
                  style={{
                    width: animated ? `${percentage}%` : "0%",
                    transitionDelay: `${index * 100}ms`,
                  }}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
