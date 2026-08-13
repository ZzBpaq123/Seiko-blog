import Image from "next/image";
import Link from "next/link";

/** 轮播动画关键帧 */
const CAROUSEL_KEYFRAMES =
  "@keyframes carousel-scroll { 0%,15%{transform:translateY(0)} 18.33%,48.33%{transform:translateY(-1.75em)} 51.67%,81.67%{transform:translateY(-3.5em)} 85%,100%{transform:translateY(-5.25em)} } .animate-carousel-scroll{animation:carousel-scroll 12s ease-in-out infinite}";

export default function HeroPanel() {
  return (
    <section className="relative flex h-full w-screen shrink-0 flex-col">
      <div className="relative z-10 flex flex-1 items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between w-full max-w-5xl gap-10 mx-auto md:flex-row">
          {/* 左侧文本 */}
          <div className="text-center md:text-left">
            <h1 className="mb-6 font-semibold text-white text-[clamp(2.5rem,6vw,4rem)]">
              👋 Hello, 我叫Seiko
            </h1>
            <p className="mb-4 text-gray-300 text-[clamp(1.25rem,2.5vw,1.75rem)]">
              我是一名 00 年的{" "}
              <span className="relative inline-block h-[1.75em] overflow-hidden rounded-md align-bottom bg-blue-500 px-3 leading-[1.75em] text-white">
                <span className="block animate-carousel-scroll text-justify [text-align-last:justify]">
                  <span className="block h-[1.75em]">后端工程师</span>
                  <span className="block h-[1.75em]">前端工程师</span>
                  <span className="block h-[1.75em]">AI工程师</span>
                  <span className="block h-[1.75em]">后端工程师</span>
                </span>
              </span>
            </p>
            <p className="mb-8 text-lg text-gray-400">
              这个博客站，记录一些技术文章，分享一些知识，记录一些生活。
            </p>
            <div className="flex justify-center gap-4 md:justify-start">
              <Link
                href="/blog"
                className="rounded-full bg-blue-500 px-5 py-2 text-white transition-colors hover:bg-blue-600"
              >
                个人博客
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/20 px-5 py-2 text-white transition-colors hover:border-white/50 hover:bg-white/5"
              >
                GitHub
              </a>
            </div>
          </div>

          {/* 右侧头像 */}
          <div className="relative shrink-0">
            <div className="h-60 w-60 overflow-hidden rounded-full bg-white shadow-[0_0_60px_rgba(59,130,246,0.35)] sm:h-80 sm:w-[320px]">
              <Image
                src="/avatar.jpg"
                alt="Seiko的头像"
                width={320}
                height={320}
                className="h-full w-full object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* 轮播动画样式 */}
      <style dangerouslySetInnerHTML={{ __html: CAROUSEL_KEYFRAMES }} />
    </section>
  );
}
