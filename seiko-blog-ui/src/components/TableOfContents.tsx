"use client";

import { useEffect, useState } from "react";
import { Heading } from "@/utils/toc";
import { List } from "lucide-react";

interface TableOfContentsProps {
  headings: Heading[];
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;

    const visibleSet = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleSet.add(entry.target.id);
          } else {
            visibleSet.delete(entry.target.id);
          }
        });

        // 当有多个标题同时可见时，选择文档顺序中最靠上的那个
        // 这样一级标题会优先于同屏内的二级标题被高亮
        const visible = headings.filter((h) => visibleSet.has(h.id));
        if (visible.length > 0) {
          setActiveId(visible[0].id);
        }
      },
      {
        rootMargin: "-80px 0px -20% 0px",
      },
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="rounded-lg border border-zinc-200 bg-white/80 p-4 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        <List className="h-4 w-4 text-pink-500" />
        目录
      </div>
      <ul className="hide-scrollbar max-h-[calc(100vh-14rem)] space-y-0.5 overflow-y-auto text-sm">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={`block rounded-md py-1 pr-2 transition-colors ${
                heading.level === 1
                  ? "pl-2"
                  : heading.level === 2
                    ? "pl-4"
                    : "pl-6"
              } ${
                activeId === heading.id
                  ? "bg-pink-50 font-medium text-pink-600 dark:bg-pink-950/30 dark:text-pink-400"
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
              }`}
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById(heading.id);
                if (element) {
                  const headerOffset = 80; // match scroll-padding-top: 5rem = 80px
                  const top =
                    element.getBoundingClientRect().top +
                    window.scrollY -
                    headerOffset;
                  window.scrollTo({ top, behavior: "smooth" });
                }
              }}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
