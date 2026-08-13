import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-4 dark:bg-black">
      <div className="flex w-full max-w-md flex-col items-center text-center">
        {/* 404 插画 */}
        <Image
          src="/404.png"
          alt="404 页面未找到"
          width={480}
          height={320}
          className="w-full max-w-90"
          priority
        />

        {/* 标题与说明 */}
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          404
        </h1>
        <p className="mt-2 text-lg text-zinc-500 dark:text-zinc-400">
          页面迷失在沙漠里了
        </p>
        <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
          你访问的页面不存在或已被移除
        </p>

        {/* 返回首页 */}
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          <ArrowLeft className="h-4 w-4" />
          返回首页
        </Link>
      </div>
    </main>
  );
}
