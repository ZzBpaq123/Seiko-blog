"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  pageFooterStyles,
  defaultFooterStyle,
  getPageStyle,
} from "@/styles/pageStyles";

export default function Footer() {
  const pathname = usePathname();
  const pageStyle = getPageStyle(
    pathname,
    pageFooterStyles,
    defaultFooterStyle,
  );

  return (
    <footer
      className={`relative border-t pb-4 pt-6 ${pageStyle.bg} ${pageStyle.border}`}
    >
      {/* 小动物趴在上边框 */}
      <div className="absolute left-0 right-0 top-0 -translate-y-[calc(100%-34px)] overflow-hidden">
        <Image
          src="/animals.webp"
          alt="小动物们"
          width={1200}
          height={200}
          className="mx-auto w-full max-w-4xl"
          unoptimized
        />
      </div>

      <div className="mx-auto max-w-4xl px-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className={`text-base ${pageStyle.text}`}>
            云想衣裳花想容，春风拂槛露华浓。若非群玉山头见，会向瑶台月下逢。
          </p>
          <div
            className={`flex flex-wrap items-center justify-center gap-4 text-xs ${pageStyle.text}`}
          >
            <a
              href="https://beian.mps.gov.cn/#/query/webSearch?code=13010402003178"
              rel="noreferrer"
              target="_blank"
              className="flex items-center gap-1 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              <Image
                src="/gongan.png"
                alt="公安备案"
                width={16}
                height={16}
                className="h-4 w-4"
              />
              冀公网安备13010402003178号
            </a>
            <a
              href="https://beian.miit.gov.cn"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              冀ICP备2025113221号-1
            </a>
          </div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            版权所有 © 2025 Seiko
          </p>
        </div>
      </div>
    </footer>
  );
}
