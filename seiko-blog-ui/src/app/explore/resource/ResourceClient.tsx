"use client";

import { useState } from "react";
import Image from "next/image";
import { Globe, ExternalLink, ChevronDown } from "lucide-react";
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
      className="group relative flex items-start gap-4 rounded-xl bg-white border border-stone-200 shadow-sm p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-emerald-300"
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
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100">
            <Globe className="h-6 w-6 text-emerald-600" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-base font-semibold text-stone-800">
            {resource.resourceName}
          </h3>
          <ExternalLink className="h-3.5 w-3.5 shrink-0 text-emerald-600/70 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
        {resource.description ? (
          <p className="mt-1 line-clamp-2 text-sm text-stone-500">
            {resource.description}
          </p>
        ) : null}
      </div>
    </a>
  );
}

function ResourceGroup({
  group,
  isExpanded,
  onToggle,
}: {
  group: ResourceGroupVO;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <section
      key={group.category}
      className="py-12 md:py-16 bg-[#f8f7f5]"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onToggle}
          className="group mb-8 flex w-full items-center gap-3 text-left"
          aria-expanded={isExpanded}
        >
          <div className="h-8 w-1 rounded-full bg-emerald-600" />
          <h2 className="text-2xl font-bold text-stone-800 md:text-3xl">
            {group.category}
          </h2>
          <span className="ml-2 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
            {group.resources.length}
          </span>
          <ChevronDown
            className={cn(
              "ml-auto h-6 w-6 text-stone-400 transition-transform duration-300 group-hover:text-stone-600",
              isExpanded && "rotate-180",
            )}
          />
        </button>

        <div
          className={cn(
            "grid transition-all duration-300 ease-in-out",
            isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="overflow-hidden">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.resources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ResourceClient({ initialGroups }: ResourceClientProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => new Set());

  const toggleGroup = (category: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  if (initialGroups.length === 0) {
    return (
      <main className="-mt-14 -mb-16 flex min-h-screen items-center justify-center bg-[#f8f7f5] px-4 pb-16">
        <div className="text-center">
          <Globe className="mx-auto mb-4 h-12 w-12 text-emerald-600/50" />
          <p className="text-lg text-stone-500">暂无资源</p>
        </div>
      </main>
    );
  }

  return (
    <main className="-mt-14 -mb-16 min-h-screen bg-[#f8f7f5] pb-16 pt-20">
      {initialGroups.map((group) => (
        <ResourceGroup
          key={group.category}
          group={group}
          isExpanded={expandedGroups.has(group.category)}
          onToggle={() => toggleGroup(group.category)}
        />
      ))}
    </main>
  );
}
