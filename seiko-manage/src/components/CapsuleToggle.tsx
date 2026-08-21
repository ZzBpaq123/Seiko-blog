"use client";

interface CapsuleToggleProps {
  /** 当前是否启用（受控） */
  checked: boolean;
  /** 状态变化回调 */
  onChange: (checked: boolean) => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** 启用状态文案 */
  activeText?: string;
  /** 禁用状态文案 */
  inactiveText?: string;
}

/**
 * 胶囊切换开关（启用 / 禁用）
 * - 圆角药丸外形
 * - 滑动背景色块标识当前选中状态
 * - 仅小尺寸，受控组件
 */
export default function CapsuleToggle({
  checked,
  onChange,
  disabled = false,
  activeText = "启用",
  inactiveText = "禁用",
}: CapsuleToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={[
        "relative inline-flex h-7 w-24 items-center rounded-full border border-border bg-input-bg p-0.5",
        "transition-colors duration-200",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
      ].join(" ")}
    >
      {/* 滑动背景色块 */}
      <span
        className={[
          "absolute top-0.5 left-0.5 h-[calc(100%-4px)] w-[calc(50%-2px)] rounded-full bg-primary",
          "transition-transform duration-200 ease-out",
          checked ? "translate-x-full" : "translate-x-0",
        ].join(" ")}
      />
      <span
        className={[
          "relative z-10 w-1/2 text-center text-xs font-medium transition-colors duration-200 select-none",
          checked ? "text-muted" : "text-primary-foreground",
        ].join(" ")}
      >
        {inactiveText}
      </span>
      <span
        className={[
          "relative z-10 w-1/2 text-center text-xs font-medium transition-colors duration-200 select-none",
          checked ? "text-primary-foreground" : "text-muted",
        ].join(" ")}
      >
        {activeText}
      </span>
    </button>
  );
}
