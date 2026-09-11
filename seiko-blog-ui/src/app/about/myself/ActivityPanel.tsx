"use client";

import { useMemo } from "react";

const WEEKS = 52;
const DAYS = 7;
const LEVELS = [
  "bg-stone-200",
  "bg-emerald-200",
  "bg-emerald-400",
  "bg-emerald-600",
  "bg-emerald-700",
];

const WEEKDAY_LABELS = ["星期一", "", "", "星期四", "", "", "星期日"];

function createRng(seed: number) {
  let s = seed;
  return () => {
    s = Math.imul(s ^ (s >>> 15), s | 1);
    s ^= s + Math.imul(s ^ (s >>> 7), s | 61);
    return ((s ^ (s >>> 14)) >>> 0) / 4294967296;
  };
}

interface Cell {
  level: number;
  count: number;
  date: Date;
}

function generateCells(seed: number, endDate: Date): Cell[][] {
  const rng = createRng(seed);
  const cells: Cell[][] = [];
  const end = new Date(endDate);
  const totalDays = WEEKS * DAYS;

  for (let week = 0; week < WEEKS; week++) {
    const weekCells: Cell[] = [];
    for (let day = 0; day < DAYS; day++) {
      const offset = week * DAYS + day;
      const date = new Date(end);
      date.setDate(date.getDate() - (totalDays - 1 - offset));

      const r = rng();
      let level: number;
      if (r < 0.45) level = 0;
      else if (r < 0.7) level = 1;
      else if (r < 0.85) level = 2;
      else if (r < 0.95) level = 3;
      else level = 4;

      const count = level === 0 ? 0 : Math.floor(rng() * level * 5) + level;

      weekCells.push({ level, count, date });
    }
    cells.push(weekCells);
  }
  return cells;
}

function generateMonths(endDate: Date): string[] {
  const months: string[] = [];
  const year = endDate.getFullYear();
  const month = endDate.getMonth();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(year, month - i, 1);
    months.push(
      d.toLocaleDateString("zh-CN", { month: "short" }).replace("月", "")
    );
  }
  return months;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ActivityPanel() {
  const today = useMemo(() => new Date(), []);
  const cells = useMemo(() => generateCells(2026, today), [today]);
  const months = useMemo(() => generateMonths(today), [today]);

  return (
    <section className="flex h-full w-screen shrink-0 flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-7xl mx-auto">
        <h2 className="mb-4 text-center font-bold text-stone-900 text-3xl sm:text-4xl">
          活跃度
        </h2>

        <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8">
          <div className="overflow-x-auto">
            <div className="min-w-fit">
              <div className="mb-3 flex justify-between pl-14 text-sm text-stone-400">
                {months.map((m, i) => (
                  <span
                    key={i}
                    className={`flex-1 ${
                      i === 0
                        ? "text-left"
                        : i === months.length - 1
                          ? "text-right"
                          : "text-center"
                    }`}
                  >
                    {m}月
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <div className="flex w-12 flex-col gap-1 text-sm text-stone-400">
                  {WEEKDAY_LABELS.map((day, i) => (
                    <div
                      key={i}
                      className="h-5 flex items-center justify-end leading-none"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className="flex w-full gap-1">
                  {cells.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-1 flex-col gap-1">
                      {week.map((cell, dayIndex) => (
                        <div
                          key={dayIndex}
                          className={`h-5 w-full rounded-sm ${LEVELS[cell.level]}`}
                          title={`${cell.count} 个贡献：${formatDate(cell.date)}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
