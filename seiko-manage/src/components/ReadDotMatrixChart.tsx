"use client";

import { useState } from "react";

export interface ReadDotItem {
  /** 文章标题 */
  title: string;
  /** 阅读量 */
  readNum: number;
}

interface ReadDotMatrixChartProps {
  data: ReadDotItem[];
  loading?: boolean;
}

/** 画布尺寸：宽矮的矩形，使高度与左侧图表对齐 */
const WIDTH = 600;
const HEIGHT = 150;
const MIN_R = 3;
const MAX_R = 12;
const GAP = 2;
const MAX_ATTEMPTS = 250;

/** 点的配色方案，按索引循环分配，使点阵呈现多彩散点效果 */
const PALETTE = [
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#a855f7", // purple
  "#f97316", // orange
  "#22c55e", // green
  "#ef4444", // red
  "#eab308", // yellow
  "#ec4899", // pink
  "#14b8a6", // teal
  "#6366f1", // indigo
];

/** 将阅读量映射为点的半径：使用平方根缩放，避免大值过度放大 */
function radiusFor(readNum: number, maxRead: number): number {
  if (maxRead <= 0) return MIN_R;
  const ratio = Math.sqrt(readNum / maxRead);
  return MIN_R + ratio * (MAX_R - MIN_R);
}

/** 由数据派生出稳定的随机种子，保证同一份数据每次渲染布局一致 */
function seedFrom(data: ReadDotItem[]): number {
  let seed = data.length * 2654435761;
  for (const d of data) {
    seed = (seed ^ (d.readNum + d.title.length * 131)) >>> 0;
    seed = (seed * 1664525 + 1013904223) >>> 0;
  }
  return seed || 1;
}

/** mulberry32 伪随机数生成器：相同种子产生相同序列 */
function makeRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface PlacedDot extends ReadDotItem {
  x: number;
  y: number;
  r: number;
  color: string;
}

/** 在正方形区域内以拒绝采样方式随机散布，尽量避免重叠（大点优先放置） */
function buildLayout(data: ReadDotItem[]): PlacedDot[] {
  const maxRead = Math.max(...data.map((d) => d.readNum), 1);
  const rng = makeRng(seedFrom(data));
  const items = data.map((d, i) => ({
    ...d,
    r: radiusFor(d.readNum, maxRead),
    color: PALETTE[i % PALETTE.length],
  }));
  const order = [...items].sort((a, b) => b.r - a.r);

  const placed: PlacedDot[] = [];
  for (const it of order) {
    const min = it.r + GAP;
    const spanX = WIDTH - 2 * min;
    const spanY = HEIGHT - 2 * min;
    let fallback: PlacedDot | null = null;
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const x = min + rng() * spanX;
      const y = min + rng() * spanY;
      const candidate: PlacedDot = { ...it, x, y };
      if (!fallback) fallback = candidate;
      const overlaps = placed.some(
        (p) => Math.hypot(x - p.x, y - p.y) < it.r + p.r + GAP,
      );
      if (!overlaps) {
        placed.push(candidate);
        fallback = null;
        break;
      }
    }
    if (fallback) placed.push(fallback);
  }
  return placed;
}

export default function ReadDotMatrixChart({ data, loading }: ReadDotMatrixChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const layout = data.length > 0 ? buildLayout(data) : [];

  if (loading) {
    return <div className="h-44 bg-gray-100 rounded-lg animate-pulse" aria-label="加载图表中" />;
  }

  if (data.length === 0) {
    return (
      <div className="h-44 flex items-center justify-center text-sm text-[var(--muted)] border border-dashed border-[var(--border)] rounded-lg">
        暂无阅读数据
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mb-2 text-xs text-[var(--muted)]">
        <span>阅读量</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block rounded-full bg-gray-400" style={{ width: 6, height: 6 }} />
          少
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block rounded-full bg-gray-400" style={{ width: 16, height: 16 }} />
          多
        </span>
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-auto"
        role="img"
        aria-label="文章阅读量云图"
      >
        {layout.map((d, i) => {
          const active = activeIndex === i;
          return (
            <circle
              key={i}
              cx={d.x}
              cy={d.y}
              r={d.r}
              fill={d.color}
              fillOpacity={active ? 1 : 0.75}
              stroke={active ? d.color : "transparent"}
              strokeWidth="1.5"
              style={{ cursor: "pointer", transition: "fill-opacity 0.15s" }}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
            />
          );
        })}
      </svg>

      {/* Tooltip */}
      <div className="h-5 mt-1 text-xs text-center text-[var(--muted)] truncate">
        {activeIndex !== null && layout[activeIndex] && (
          <span>
            <span className="text-foreground font-medium">{layout[activeIndex].title}</span>
            {" · "}
            {layout[activeIndex].readNum} 次阅读
          </span>
        )}
      </div>
    </div>
  );
}
