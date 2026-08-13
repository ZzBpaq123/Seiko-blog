"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Clock, X } from "lucide-react";

export type CalendarPrecision = "year" | "month" | "day" | "hour" | "minute" | "second";

interface CalendarPickerProps {
  /** 当前值（受控）。格式随 precision 变化：day → YYYY-MM-DD，second → YYYY-MM-DD HH:mm:ss */
  value?: string;
  /** 值变化回调 */
  onChange: (value: string) => void;
  /** 选择精度，默认 day */
  precision?: CalendarPrecision;
  /** 占位提示 */
  placeholder?: string;
  /** 标签（渲染在输入框上方，与现有表单风格一致） */
  label?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 作用于外层容器的额外类名 */
  className?: string;
  /** 是否允许清空，默认 true */
  clearable?: boolean;
}

const RANK: Record<CalendarPrecision, number> = {
  year: 1,
  month: 2,
  day: 3,
  hour: 4,
  minute: 5,
  second: 6,
};

const WEEK_DAYS = ["日", "一", "二", "三", "四", "五", "六"];

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function parseInput(value: string | undefined, precision: CalendarPrecision): Date | null {
  if (!value) return null;
  const normalized = value.replace(" ", "T");
  let date: Date;
  switch (precision) {
    case "year":
      date = new Date(Number(normalized.slice(0, 4)), 0, 1);
      break;
    case "month":
      date = new Date(Number(normalized.slice(0, 4)), Number(normalized.slice(5, 7)) - 1, 1);
      break;
    default:
      date = new Date(normalized);
  }
  return isNaN(date.getTime()) ? null : date;
}

function formatOutput(date: Date, precision: CalendarPrecision): string {
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const h = pad(date.getHours());
  const min = pad(date.getMinutes());
  const s = pad(date.getSeconds());
  switch (precision) {
    case "year":
      return `${y}`;
    case "month":
      return `${y}-${m}`;
    case "day":
      return `${y}-${m}-${d}`;
    case "hour":
      return `${y}-${m}-${d} ${h}`;
    case "minute":
      return `${y}-${m}-${d} ${h}:${min}`;
    case "second":
      return `${y}-${m}-${d} ${h}:${min}:${s}`;
  }
}

function formatDisplay(value: string | undefined, precision: CalendarPrecision, placeholder: string): string {
  if (!value) return placeholder;
  const date = parseInput(value, precision);
  if (!date) return placeholder;
  return formatOutput(date, precision);
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function buildDayGrid(viewDate: Date): Date[] {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const startOffset = firstDayOfMonth.getDay();
  const start = new Date(year, month, 1 - startOffset);
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    days.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  }
  return days;
}

interface TimeColumnProps {
  label: string;
  options: number[];
  value: number;
  onChange: (value: number) => void;
}

function TimeColumn({ label, options, value, onChange }: TimeColumnProps) {
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "center" });
  }, [value]);

  return (
    <div className="flex flex-col items-center">
      <span className="text-xs text-(--muted) mb-1.5 font-medium">{label}</span>
      <div className="h-36 overflow-y-auto w-12 rounded-md border border-(--border) bg-(--input-bg) no-scrollbar">
        {options.map((n) => {
          const active = n === value;
          return (
            <button
              key={n}
              ref={active ? activeRef : null}
              type="button"
              onClick={() => onChange(n)}
              className={[
                "w-full px-2 py-1.5 text-sm text-center transition-colors",
                active
                  ? "bg-(--primary) text-(--primary-foreground) font-medium"
                  : "text-(--foreground) hover:bg-(--hover-bg)",
              ].join(" ")}
            >
              {pad(n)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * 统一日历选择器。
 *
 * - `precision` 控制选择粒度：year / month / day / hour / minute / second。
 * - day 及以下精度点击日期即提交并关闭；含时间的精度需在面板内选择时间后点击确认。
 * - 样式跟随后台主题变量与 `.input` 风格，支持暗色模式。
 */
export default function CalendarPicker({
  value,
  onChange,
  precision = "day",
  placeholder = "请选择",
  label,
  disabled = false,
  className = "",
  clearable = true,
}: CalendarPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState<Date>(() => parseInput(value, precision) ?? new Date());
  const [viewMode, setViewMode] = useState<"days" | "months" | "years">(
    precision === "year" ? "years" : precision === "month" ? "months" : "days"
  );
  const [draft, setDraft] = useState<Date | null>(() => parseInput(value, precision));

  const showTime = RANK[precision] >= RANK.hour;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const commit = (date: Date) => {
    onChange(formatOutput(date, precision));
  };

  const handleOpen = () => {
    if (disabled) return;
    const date = parseInput(value, precision) ?? new Date();
    setViewDate(date);
    setDraft(parseInput(value, precision));
    setViewMode(precision === "year" ? "years" : precision === "month" ? "months" : "days");
    setOpen(true);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setDraft(null);
  };

  const handleNow = () => {
    const now = new Date();
    setViewDate(now);
    setDraft(now);
    commit(now);
    if (!showTime) setOpen(false);
  };

  const handleConfirm = () => {
    if (draft) commit(draft);
    setOpen(false);
  };

  const handleDayClick = (date: Date) => {
    const base = draft ? new Date(draft.getTime()) : new Date(date.getTime());
    base.setFullYear(date.getFullYear());
    base.setMonth(date.getMonth());
    base.setDate(date.getDate());
    if (!draft) {
      base.setHours(0, 0, 0, 0);
    }
    setDraft(base);
    if (!showTime) {
      commit(base);
      setOpen(false);
    }
  };

  const handleMonthClick = (month: number) => {
    const nextView = new Date(viewDate);
    nextView.setMonth(month);
    setViewDate(nextView);
    if (precision === "month") {
      const selected = new Date(draft ?? nextView);
      selected.setFullYear(nextView.getFullYear());
      selected.setMonth(month);
      selected.setDate(1);
      setDraft(selected);
      commit(selected);
      setOpen(false);
    } else {
      setViewMode("days");
    }
  };

  const handleYearClick = (year: number) => {
    const nextView = new Date(viewDate);
    nextView.setFullYear(year);
    setViewDate(nextView);
    if (precision === "year") {
      const selected = new Date(draft ?? nextView);
      selected.setFullYear(year);
      selected.setMonth(0);
      selected.setDate(1);
      setDraft(selected);
      commit(selected);
      setOpen(false);
    } else {
      setViewMode("months");
    }
  };

  const setTime = (part: "setHours" | "setMinutes" | "setSeconds", val: number) => {
    const next = new Date(draft ?? new Date());
    next[part](val);
    setDraft(next);
  };

  const renderHeader = () => {
    if (viewMode === "years") {
      const startYear = Math.floor(viewDate.getFullYear() / 12) * 12;
      return (
        <div className="flex items-center justify-between px-1 mb-3">
          <button
            type="button"
            className="p-1 rounded-md hover:bg-(--hover-bg) text-(--muted)"
            onClick={() => setViewDate(new Date(viewDate.getFullYear() - 12, viewDate.getMonth(), 1))}
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium text-(--foreground)">
            {startYear} - {startYear + 11}
          </span>
          <button
            type="button"
            className="p-1 rounded-md hover:bg-(--hover-bg) text-(--muted)"
            onClick={() => setViewDate(new Date(viewDate.getFullYear() + 12, viewDate.getMonth(), 1))}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      );
    }

    if (viewMode === "months") {
      return (
        <div className="flex items-center justify-between px-1 mb-3">
          <button
            type="button"
            className="p-1 rounded-md hover:bg-(--hover-bg) text-(--muted)"
            onClick={() => setViewDate(new Date(viewDate.getFullYear() - 1, viewDate.getMonth(), 1))}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            className="text-sm font-medium text-(--foreground) hover:text-(--primary)"
            onClick={() => setViewMode("years")}
          >
            {viewDate.getFullYear()}年
          </button>
          <button
            type="button"
            className="p-1 rounded-md hover:bg-(--hover-bg) text-(--muted)"
            onClick={() => setViewDate(new Date(viewDate.getFullYear() + 1, viewDate.getMonth(), 1))}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between px-1 mb-3">
        <button
          type="button"
          className="p-1 rounded-md hover:bg-(--hover-bg) text-(--muted)"
          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
        >
          <ChevronLeft size={16} />
        </button>
        <div className="flex items-center gap-1 text-sm font-medium text-(--foreground)">
          <button
            type="button"
            className="hover:text-(--primary)"
            onClick={() => setViewMode("years")}
          >
            {viewDate.getFullYear()}年
          </button>
          <button
            type="button"
            className="hover:text-(--primary)"
            onClick={() => setViewMode("months")}
          >
            {viewDate.getMonth() + 1}月
          </button>
        </div>
        <button
          type="button"
          className="p-1 rounded-md hover:bg-(--hover-bg) text-(--muted)"
          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    );
  };

  const renderBody = () => {
    if (viewMode === "years") {
      const startYear = Math.floor(viewDate.getFullYear() / 12) * 12;
      const years = Array.from({ length: 12 }, (_, i) => startYear + i);
      return (
        <div className="grid grid-cols-4 gap-2">
          {years.map((year) => {
            const active = draft?.getFullYear() === year;
            return (
              <button
                key={year}
                type="button"
                onClick={() => handleYearClick(year)}
                className={[
                  "py-2 text-sm rounded-md transition-colors",
                  active
                    ? "bg-(--primary) text-(--primary-foreground) font-medium"
                    : "text-(--foreground) hover:bg-(--hover-bg)",
                ].join(" ")}
              >
                {year}
              </button>
            );
          })}
        </div>
      );
    }

    if (viewMode === "months") {
      return (
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 12 }, (_, i) => {
            const active = draft?.getFullYear() === viewDate.getFullYear() && draft?.getMonth() === i;
            return (
              <button
                key={i}
                type="button"
                onClick={() => handleMonthClick(i)}
                className={[
                  "py-2 text-sm rounded-md transition-colors",
                  active
                    ? "bg-(--primary) text-(--primary-foreground) font-medium"
                    : "text-(--foreground) hover:bg-(--hover-bg)",
                ].join(" ")}
              >
                {i + 1}月
              </button>
            );
          })}
        </div>
      );
    }

    const grid = buildDayGrid(viewDate);
    const today = new Date();

    return (
      <div>
        <div className="grid grid-cols-7 mb-1">
          {WEEK_DAYS.map((d) => (
            <div key={d} className="text-center text-xs text-(--muted) py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {grid.map((date, idx) => {
            const inMonth = date.getMonth() === viewDate.getMonth();
            const active = draft ? isSameDay(date, draft) : false;
            const isToday = isSameDay(date, today);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleDayClick(date)}
                className={[
                  "h-8 w-8 mx-auto rounded-full text-sm transition-colors flex items-center justify-center",
                  active
                    ? "bg-(--primary) text-(--primary-foreground) font-medium"
                    : inMonth
                      ? "text-(--foreground) hover:bg-(--hover-bg)"
                      : "text-gray-300 dark:text-slate-600 hover:bg-(--hover-bg)",
                  isToday && !active ? "ring-1 ring-(--primary) text-(--primary)" : "",
                ].join(" ")}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTime = () => {
    if (!showTime) return null;
    const date = draft ?? new Date();
    return (
      <div className="w-auto border-l border-border pl-3 flex flex-col">
        <div className="flex items-center gap-1 text-xs text-(--muted) mb-2">
          <Clock size={12} />
          <span>时间</span>
        </div>
        <div className="flex justify-center gap-2 flex-1">
          <TimeColumn label="时" options={Array.from({ length: 24 }, (_, i) => i)} value={date.getHours()} onChange={(v) => setTime("setHours", v)} />
          {RANK[precision] >= RANK.minute && (
            <TimeColumn label="分" options={Array.from({ length: 60 }, (_, i) => i)} value={date.getMinutes()} onChange={(v) => setTime("setMinutes", v)} />
          )}
          {RANK[precision] >= RANK.second && (
            <TimeColumn label="秒" options={Array.from({ length: 60 }, (_, i) => i)} value={date.getSeconds()} onChange={(v) => setTime("setSeconds", v)} />
          )}
        </div>
      </div>
    );
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && <label className="block text-sm font-medium text-gray-600 mb-1.5">{label}</label>}
      <div
        onClick={handleOpen}
        className={[
          "input flex items-center cursor-pointer select-none gap-2",
          disabled ? "cursor-not-allowed opacity-70" : "",
        ].join(" ")}
      >
        <Calendar size={16} className="text-(--muted) shrink-0" />
        <span className={`truncate flex-1 ${value ? "text-(--foreground)" : "text-gray-400"}`}>
          {formatDisplay(value, precision, placeholder)}
        </span>
        {clearable && value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="p-0.5 rounded-full hover:bg-(--hover-bg) text-(--muted) shrink-0"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {open && (
        <div
          className={[
            "absolute z-30 mt-1.5 bg-card-bg border border-border rounded-xl shadow-lg p-3 animate-dialog-in",
            showTime ? "w-[28rem]" : "w-80",
          ].join(" ")}
        >
          {renderHeader()}
          <div className="flex gap-3">
            <div className="flex-1 min-w-0">{renderBody()}</div>
            {showTime && renderTime()}
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <div className="flex gap-2">
              <button type="button" onClick={handleNow} className="btn btn-sm btn-secondary">
                此刻
              </button>
              {clearable && (
                <button type="button" onClick={handleClear} className="btn btn-sm btn-secondary">
                  清空
                </button>
              )}
            </div>
            <button type="button" onClick={handleConfirm} className="btn btn-sm btn-primary">
              确认
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
