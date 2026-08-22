"use client";

import Image from "next/image";
import { Globe, ExternalLink } from "lucide-react";
import type { ResourceGroupVO, ResourceVO } from "@/api/types";
import { cn } from "@/utils/cn";

interface ResourceClientProps {
  initialGroups: ResourceGroupVO[];
}

function ResourceCard({ resource }: { resource: ResourceVO }) {
  const hasIcon = resource.resourceIcon?.trim().length > 0;

  return (
    <a
      href={resource.resourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex items-start gap-4 rounded-xl bg-white/5 p-4 transition-all duration-300 hover:bg-white/10 hover:shadow-lg hover:-translate-y-0.5"
    >
      <div className="shrink-0">
        {hasIcon ? (
          <Image
            src={resource.resourceIcon}
            alt={resource.resourceName}
            width={48}
            height={48}
            className="h-12 w-12 rounded-lg object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
            <Globe className="h-6 w-6 text-emerald-400" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-base font-semibold text-emerald-50">
            {resource.resourceName}
          </h3>
          <ExternalLink className="h-3.5 w-3.5 shrink-0 text-emerald-400/70 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
        {resource.description ? (
          <p className="mt-1 line-clamp-2 text-sm text-emerald-100/60">
            {resource.description}
          </p>
        ) : null}
      </div>
    </a>
  );
}

function ResourceGroup({ group, index }: { group: ResourceGroupVO; index: number }) {
  return (
    <section
      key={group.category}
      className={cn(
        "py-12 md:py-16",
        index % 2 === 0 ? "bg-[#0a1210]" : "bg-[#0d1815]",
      )}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="h-8 w-1 rounded-full bg-emerald-500" />
          <h2 className="text-2xl font-bold text-emerald-50 md:text-3xl">
            {group.category}
          </h2>
          <span className="ml-2 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
            {group.resources.length}
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {group.resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function ResourceClient({ initialGroups }: ResourceClientProps) {
  if (initialGroups.length === 0) {
    return (
      <main className="-mt-14 -mb-16 flex min-h-screen items-center justify-center bg-[#0a1210] px-4">
        <div className="text-center">
          <Globe className="mx-auto mb-4 h-12 w-12 text-emerald-700" />
          <p className="text-lg text-emerald-100/70">暂无资源</p>
        </div>
      </main>
    );
  }

  return (
    <main className="-mt-14 -mb-16 min-h-screen bg-[#0a1210]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0a1210] pb-16 pt-32 md:pb-20 md:pt-40">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -left-1/4 -top-1/4 h-[600px] w-[600px] rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute -right-1/4 bottom-0 h-[500px] w-[500px] rounded-full bg-teal-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
            <Globe className="h-8 w-8 text-emerald-400" />
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-emerald-50 md:text-5xl lg:text-6xl">
            资源收藏
          </h1>
          <p className="mx-auto max-w-2xl text-base text-emerald-100/60 md:text-lg">
            精心整理的工具、网站与资料链接，点击卡片即可访问
          </p>
        </div>
      </section>

      {/* Groups */}
      {initialGroups.map((group, index) => (
        <ResourceGroup key={group.category} group={group} index={index} />
      ))}
    </main>
  );
}
