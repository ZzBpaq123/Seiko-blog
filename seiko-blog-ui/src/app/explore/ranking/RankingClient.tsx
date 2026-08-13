"use client";

import { useState, type ReactNode } from "react";
import { Cpu, MonitorCog } from "lucide-react";
import {
  type HardwareCategory,
  type HardwareGrid,
  brandColors,
} from "@/data/hardware";

interface RankingClientProps {
  grids: Record<HardwareCategory, HardwareGrid>;
}

const tabs: { key: HardwareCategory; label: string; icon: ReactNode }[] = [
  { key: "phoneCpu", label: "手机CPU", icon: <Cpu className="w-5 h-5" /> },
  { key: "desktopCpu", label: "桌面CPU", icon: <Cpu className="w-5 h-5" /> },
  { key: "laptopCpu", label: "笔记本CPU", icon: <Cpu className="w-5 h-5" /> },
  { key: "desktopGpu", label: "桌面显卡", icon: <MonitorCog className="w-5 h-5" /> },
  { key: "laptopGpu", label: "笔记本显卡", icon: <MonitorCog className="w-5 h-5" /> },
];

// 网格布局参数
const AXIS_W = 60; // 中轴宽度(px)
const ROW_H = 60; // 每行高度(px)
const HEADER_H = 40; // 代际表头高度
const ARROW_H = 36; // 中轴顶部箭头高度(px)

// 中轴性能渐变（与 docs/CPU性能天梯图.html 保持一致：上=高性能，下=低性能）
const AXIS_GRADIENT =
  "linear-gradient(180deg,#ffd31a 0%,#ff8a23 20%,#fb4e43 42%,#e844b5 64%,#9f69e8 82%,#58c2ff 100%)";

export default function RankingClient({ grids }: RankingClientProps) {
  const [category, setCategory] = useState<HardwareCategory>("desktopCpu");

  const grid = grids[category];
  const { leftBrand, rightBrand, leftCols, rightCols, rowCount, placements } =
    grid;
  const leftColor = brandColors[leftBrand];
  const rightColor = brandColors[rightBrand];

  const L = leftCols.length;
  const R = rightCols.length;
  // 全局列号 → CSS grid 列号（跳过中轴列）
  const gridColumn = (col: number) => (col < L ? col + 1 : col + 2);
  const colTemplate = `repeat(${L}, minmax(0, 1fr)) ${AXIS_W}px repeat(${R}, minmax(0, 1fr))`;
  const bodyHeight = rowCount * ROW_H;

  // 每列品牌（用于背景着色）
  const colBrand = (col: number) => (col < L ? leftBrand : rightBrand);

  return (
    <div className="min-h-screen bg-[#0a0c12] text-zinc-100 -mt-14 -mb-16">
      {/* Hero */}
      <div className="relative overflow-hidden pt-28 pb-10 px-4 sm:px-6 lg:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.12),transparent_60%)]" />
        <div className="relative max-w-5xl mx-auto text-center">
          <h1
            className="font-bold text-5xl md:text-7xl tracking-tighter mb-3 bg-linear-to-r from-cyan-300 via-violet-300 to-emerald-300 bg-clip-text text-transparent"
            style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}
          >
            {grid.title}
          </h1>
          <p className="text-zinc-500 text-xs md:text-sm tracking-[0.3em] uppercase">
            {grid.subtitle}
          </p>

          {/* Tabs */}
          <div className="mt-8 inline-flex gap-1 p-1 rounded-full bg-white/5 border border-white/10">
            {tabs.map((tab) => {
              const active = category === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setCategory(tab.key)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                    active
                      ? "bg-cyan-400 text-[#04181c] shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                      : "text-zinc-400 hover:text-zinc-100"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 天梯网格 */}
      <div className="pb-20 px-2 sm:px-4 lg:px-6">
        <div className="mx-auto max-w-600 rounded-2xl border border-white/10 bg-white/2">
          <div className="w-full">
            {/* 表头：品牌横幅 + 代际列标题（随页面吸顶于站点导航下方） */}
            <div className="sticky top-14 z-20 bg-[#0a0c12] shadow-[0_6px_16px_rgba(0,0,0,0.5)]">
              {/* 品牌横幅 */}
              <div className="grid" style={{ gridTemplateColumns: colTemplate }}>
                <div
                  className="flex items-center justify-center font-bold text-base md:text-lg tracking-wide py-3 border-b border-white/10"
                  style={{
                    gridColumn: `1 / span ${L}`,
                    color: leftColor,
                    backgroundColor: `${leftColor}14`,
                  }}
                >
                  {leftBrand}
                </div>
                <div
                  className="border-b border-white/10"
                  style={{ gridColumn: `${L + 1}` }}
                />
                <div
                  className="flex items-center justify-center font-bold text-base md:text-lg tracking-wide py-3 border-b border-white/10"
                  style={{
                    gridColumn: `${L + 2} / span ${R}`,
                    color: rightColor,
                    backgroundColor: `${rightColor}14`,
                  }}
                >
                  {rightBrand}
                </div>
              </div>

              {/* 代际列标题 */}
              <div
                className="grid"
                style={{ gridTemplateColumns: colTemplate, height: HEADER_H }}
              >
                {leftCols.map((c, i) => (
                  <div
                    key={`l-${i}`}
                    className="flex items-center justify-center text-center px-0.5 text-[9px] md:text-[10px] font-semibold leading-tight border-b border-r border-white/5"
                    style={{ gridColumn: i + 1, color: `${leftColor}cc` }}
                  >
                    {c}
                  </div>
                ))}
                <div
                  className="flex items-center justify-center text-[9px] text-zinc-500 border-b border-white/5"
                  style={{ gridColumn: L + 1 }}
                >
                  性能
                </div>
                {rightCols.map((c, i) => (
                  <div
                    key={`r-${i}`}
                    className="flex items-center justify-center text-center px-0.5 text-[9px] md:text-[10px] font-semibold leading-tight border-b border-l border-white/5"
                    style={{ gridColumn: L + 2 + i, color: `${rightColor}cc` }}
                  >
                    {c}
                  </div>
                ))}
              </div>
            </div>

            {/* 主体网格 */}
            <div
              className="grid relative"
              style={{
                gridTemplateColumns: colTemplate,
                gridAutoRows: `${ROW_H}px`,
                height: bodyHeight,
              }}
            >
              {/* 列背景 + 分隔线 */}
              {Array.from({ length: L + R }, (_, col) => {
                const brand = colBrand(col);
                const color = brandColors[brand];
                return (
                  <div
                    key={`bg-${col}`}
                    className="border-r border-white/4"
                    style={{
                      gridColumn: gridColumn(col),
                      gridRow: `1 / span ${rowCount}`,
                      backgroundColor: `${color}06`,
                    }}
                  />
                );
              })}

              {/* 中轴：性能渐变条（顶部箭头 + 渐变主体，与天梯图一致） */}
              <div
                className="relative"
                style={{ gridColumn: L + 1, gridRow: `1 / span ${rowCount}` }}
              >
                {/* 顶部箭头三角 */}
                <div
                  className="absolute left-1/2 top-0 -translate-x-1/2"
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: `${AXIS_W / 2}px solid transparent`,
                    borderRight: `${AXIS_W / 2}px solid transparent`,
                    borderBottom: `${ARROW_H}px solid #ffd31a`,
                  }}
                />
                {/* 渐变主体 */}
                <div
                  className="absolute left-1/2 -translate-x-1/2"
                  style={{
                    width: AXIS_W,
                    top: ARROW_H,
                    bottom: 0,
                    background: AXIS_GRADIENT,
                  }}
                >
                  <span
                    className="absolute left-1/2 -translate-x-1/2 font-bold text-white [writing-mode:vertical-rl] [text-orientation:upright]"
                    style={{ top: 24, fontSize: 15, letterSpacing: "0.25em" }}
                  >
                    高性能
                  </span>
                  <span
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-white [writing-mode:vertical-rl] [text-orientation:upright]"
                    style={{ fontSize: 15, letterSpacing: "0.25em" }}
                  >
                    中性能
                  </span>
                  <span
                    className="absolute left-1/2 -translate-x-1/2 font-bold text-white [writing-mode:vertical-rl] [text-orientation:upright]"
                    style={{ bottom: 24, fontSize: 15, letterSpacing: "0.25em" }}
                  >
                    低性能
                  </span>
                </div>
              </div>

              {/* 型号格子 */}
              {placements.map(([name, col, row]) => {
                return (
                  <div
                    key={`${name}-${col}-${row}`}
                    className="group relative flex items-center justify-center px-0.5"
                    style={{ gridColumn: gridColumn(col), gridRow: row + 1 }}
                  >
                    <span
                      className="w-full text-center text-[10px] md:text-[12px] leading-none whitespace-normal wrap-break-word cursor-default"
                      style={{ color: "#e4e4e7" }}
                      title={name}
                    >
                      {name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <p className="max-w-600 mx-auto mt-5 text-center text-xs text-zinc-600">
          本数据仅供参考，按性能从高到低排列（2026/06）
        </p>
      </div>
    </div>
  );
}
