"use client";

import {
  createContext,
  useContext,
  useMemo,
  type HTMLAttributes,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Heading } from "@/utils/toc";

interface MarkdownRendererProps {
  content: string;
  headings?: Heading[];
}

const HeadingIdContext = createContext<ReadonlyMap<number, string>>(
  new Map(),
);

function useHeadingId(line?: number): string | undefined {
  const idByLine = useContext(HeadingIdContext);
  return line ? idByLine.get(line) : undefined;
}

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  node?: {
    position?: {
      start?: {
        line?: number;
      };
    };
  };
}

function H1({ node, ...props }: HeadingProps) {
  return (
    <h1
      id={useHeadingId(node?.position?.start?.line)}
      {...props}
      className="mt-8 text-2xl font-bold text-zinc-900 dark:text-zinc-100"
    />
  );
}

function H2({ node, ...props }: HeadingProps) {
  return (
    <h2
      id={useHeadingId(node?.position?.start?.line)}
      {...props}
      className="mt-8 text-xl font-semibold text-zinc-900 dark:text-zinc-100"
    />
  );
}

function H3({ node, ...props }: HeadingProps) {
  return (
    <h3
      id={useHeadingId(node?.position?.start?.line)}
      {...props}
      className="mt-6 text-lg font-semibold text-zinc-900 dark:text-zinc-100"
    />
  );
}

export default function MarkdownRenderer({
  content,
  headings,
}: MarkdownRendererProps) {
  const idByLine = useMemo(() => {
    if (!headings) return new Map<number, string>();
    return new Map(headings.map((h) => [h.line, h.id]));
  }, [headings]);

  return (
    <HeadingIdContext.Provider value={idByLine}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          img: (props) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              {...props}
              alt={props.alt ?? ""}
              className="my-4 rounded-lg max-w-full h-auto"
              loading="lazy"
            />
          ),
          table: (props) => (
            <div className="my-4 overflow-x-auto">
              <table
                {...props}
                className="min-w-full border-collapse border border-zinc-300 dark:border-zinc-700"
              />
            </div>
          ),
          thead: (props) => (
            <thead {...props} className="bg-zinc-100 dark:bg-zinc-800" />
          ),
          th: (props) => (
            <th
              {...props}
              className="border border-zinc-300 px-4 py-2 text-left font-semibold text-zinc-900 dark:border-zinc-700 dark:text-zinc-100"
            />
          ),
          td: (props) => (
            <td
              {...props}
              className="border border-zinc-300 px-4 py-2 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
            />
          ),
          tr: (props) => (
            <tr {...props} className="even:bg-zinc-50 dark:even:bg-zinc-900/50" />
          ),
          h1: H1,
          h2: H2,
          h3: H3,
          p: (props) => (
            <p {...props} className="my-4 text-zinc-600 dark:text-zinc-400" />
          ),
          ul: (props) => (
            <ul
              {...props}
              className="my-4 list-disc pl-6 text-zinc-600 dark:text-zinc-400"
            />
          ),
          ol: (props) => (
            <ol
              {...props}
              className="my-4 list-decimal pl-6 text-zinc-600 dark:text-zinc-400"
            />
          ),
          li: (props) => <li {...props} className="my-1" />,
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            return isInline ? (
              <code
                {...props}
                className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
              >
                {children}
              </code>
            ) : (
              <pre className="my-4 overflow-x-auto rounded-lg bg-zinc-900 p-4">
                <code {...props} className="text-sm text-zinc-100">
                  {children}
                </code>
              </pre>
            );
          },
          a: (props) => (
            <a
              {...props}
              className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              target="_blank"
              rel="noopener noreferrer"
            />
          ),
          blockquote: (props) => (
            <blockquote
              {...props}
              className="my-4 border-l-4 border-zinc-300 pl-4 italic text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
            />
          ),
          hr: (props) => (
            <hr
              {...props}
              className="my-8 border-zinc-200 dark:border-zinc-800"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </HeadingIdContext.Provider>
  );
}