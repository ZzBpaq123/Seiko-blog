"use client";

import { useState, useCallback, useEffect } from "react";
import StarFieldWarp from "./StarFieldWarp";

export default function GalleryEntrance({
  children,
  onDone,
}: {
  children: React.ReactNode;
  onDone?: () => void;
}) {
  const [phase, setPhase] = useState<"warp" | "fading" | "done">("warp");

  const handleComplete = useCallback(() => {
    setPhase("fading");
    setTimeout(() => setPhase("done"), 500);
  }, []);

  // 确保 warp 完全卸载（DOM 中已移除）后再通知外部
  useEffect(() => {
    if (phase === "done" && onDone) {
      onDone();
    }
  }, [phase, onDone]);

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden bg-slate-950">
      {/* 内容始终渲染在底层，星空在 warp 期间就开始初始化 */}
      <div className="absolute inset-0">{children}</div>

      {/* warp 覆盖层：完成后淡出，露出底层星空 */}
      {phase !== "done" && (
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            phase === "fading" ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <StarFieldWarp onComplete={handleComplete} />
        </div>
      )}
    </div>
  );
}
