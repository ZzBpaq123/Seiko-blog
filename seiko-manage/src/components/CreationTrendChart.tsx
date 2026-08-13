"use client";

import { useState } from "react";
import type { CreationTrendVO } from "@/types";

interface CreationTrendChartProps {
  data: CreationTrendVO[];
  loading?: boolean;
}

const VIEW_WIDTH = 640;
const VIEW_HEIGHT = 200;
const PADDING = { top: 24, right: 20, bottom: 44, left: 44 };
const Y_TICKS = 4;

/** 三条数据系列的定义：取值字段、名称、颜色 */
const SERIES = [
  { key: "postCount", label: "新建文章", color: "#3b82f6" },
  { key: "albumCount", label: "新建相册", color: "#f97316" },
  { key: "photoCount", label: "新增照片", color: "#a855f7" },
] as const;

function formatLabel(date: string): string {
  // yyyy-MM-dd -> MM-dd
  return date.slice(5);
}

export default function CreationTrendChart({ data, loading }: CreationTrendChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (loading) {
    return <div className="h-44 bg-gray-100 rounded-lg animate-pulse" aria-label="加载图表中" />;
  }

  if (data.length === 0) {
    return (
      <div className="h-44 flex items-center justify-center text-sm text-[var(--muted)] border border-dashed border-[var(--border)] rounded-lg">
        暂无新建数据
      </div>
    );
  }

  const maxCount = Math.max(
    ...data.flatMap((d) => SERIES.map((s) => d[s.key])),
    1,
  );
  const yMax = Math.ceil(maxCount * 1.1);

  const chartWidth = VIEW_WIDTH - PADDING.left - PADDING.right;
  const chartHeight = VIEW_HEIGHT - PADDING.top - PADDING.bottom;
  const stepX = data.length > 1 ? chartWidth / (data.length - 1) : 0;

  const getX = (index: number) => PADDING.left + index * stepX;
  const getY = (value: number) => VIEW_HEIGHT - PADDING.bottom - (value / yMax) * chartHeight;

  const labelStep = data.length <= 14 ? 1 : Math.ceil(data.length / 6);

  return (
    <div className="w-full">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mb-2">
        {SERIES.map((s) => (
          <div key={s.key} className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
            <span className="inline-block w-3 h-0.5 rounded" style={{ backgroundColor: s.color }} />
            {s.label}
          </div>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className="w-full h-auto overflow-visible"
        role="img"
        aria-label="内容新建趋势折线图"
      >
        {/* Y grid lines and labels */}
        {Array.from({ length: Y_TICKS + 1 }).map((_, i) => {
          const value = Math.round((yMax * i) / Y_TICKS);
          const y = getY(value);
          return (
            <g key={`y-${i}`}>
              <line
                x1={PADDING.left}
                y1={y}
                x2={VIEW_WIDTH - PADDING.right}
                y2={y}
                stroke="var(--border)"
                strokeDasharray="4 4"
              />
              <text x={PADDING.left - 8} y={y + 4} textAnchor="end" fontSize="11" fill="var(--muted)">
                {value}
              </text>
            </g>
          );
        })}

        {/* Series lines */}
        {SERIES.map((s) => {
          const linePath = data
            .map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(d[s.key])}`)
            .join(" ");
          return (
            <path
              key={`line-${s.key}`}
              d={linePath}
              fill="none"
              stroke={s.color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}

        {/* Series data points */}
        {SERIES.map((s) =>
          data.map((d, i) => (
            <circle
              key={`dot-${s.key}-${i}`}
              cx={getX(i)}
              cy={getY(d[s.key])}
              r={activeIndex === i ? 4 : 2.5}
              fill="var(--card-bg)"
              stroke={s.color}
              strokeWidth="2"
            />
          )),
        )}

        {/* X axis labels */}
        {data.map((d, i) => {
          if (i % labelStep !== 0 && i !== data.length - 1) return null;
          return (
            <text
              key={`x-${i}`}
              x={getX(i)}
              y={VIEW_HEIGHT - PADDING.bottom + 20}
              textAnchor="middle"
              fontSize="11"
              fill="var(--muted)"
            >
              {formatLabel(d.date)}
            </text>
          );
        })}

        {/* Hover guide line */}
        {activeIndex !== null && (
          <line
            x1={getX(activeIndex)}
            y1={PADDING.top}
            x2={getX(activeIndex)}
            y2={VIEW_HEIGHT - PADDING.bottom}
            stroke="var(--border)"
          />
        )}

        {/* Hover tooltip */}
        {activeIndex !== null && (
          <g
            transform={`translate(${Math.min(
              Math.max(getX(activeIndex), PADDING.left + 60),
              VIEW_WIDTH - PADDING.right - 60,
            )}, ${PADDING.top})`}
          >
            <rect
              x="-60"
              y="0"
              width="120"
              height="78"
              rx="6"
              fill="var(--card-bg)"
              stroke="var(--border)"
              style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.08))" }}
            />
            <text x="0" y="16" textAnchor="middle" fontSize="11" fill="var(--muted)">
              {data[activeIndex].date}
            </text>
            {SERIES.map((s, si) => (
              <g key={`tip-${s.key}`} transform={`translate(-50, ${32 + si * 14})`}>
                <circle cx="0" cy="-3" r="3" fill={s.color} />
                <text x="10" y="0" fontSize="11" fill="var(--foreground)">
                  {s.label} {data[activeIndex][s.key]}
                </text>
              </g>
            ))}
          </g>
        )}

        {/* Hover hit areas */}
        {data.map((_, i) => {
          const x = getX(i);
          const half = stepX / 2;
          return (
            <rect
              key={`hit-${i}`}
              x={data.length === 1 ? PADDING.left : x - half}
              y={PADDING.top}
              width={data.length === 1 ? chartWidth : stepX}
              height={chartHeight}
              fill="transparent"
              onMouseEnter={() => setActiveIndex(i)}
              onMouseMove={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
              style={{ cursor: "pointer" }}
            />
          );
        })}
      </svg>
    </div>
  );
}
