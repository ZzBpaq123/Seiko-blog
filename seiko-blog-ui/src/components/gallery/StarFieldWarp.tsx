"use client";

import { useEffect, useRef } from "react";

interface WarpStar {
  x: number;
  y: number;
  z: number;
  size: number;
  color: string;
}

interface StarFieldWarpProps {
  onComplete: () => void;
}

const COLORS = [
  "#ffffff",
  "#ffffff",
  "#ffffff",
  "#ffffff",
  "#ffffff",
  "#a5d8ff",
  "#fff4e0",
];
const FOV = 300;
const MAX_DEPTH = 2000;
const STAR_COUNT = 600;
const DURATION = 3000;
const HOLD_MS = 400; // 白屏停留时间，给页面跳转留出缓冲

export default function StarFieldWarp({ onComplete }: StarFieldWarpProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const onCompleteRef = useRef(onComplete);
  const hasCompletedRef = useRef(false);

  // 在 effect 中同步回调，避免在 render 阶段读写 ref
  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) {
      onCompleteRef.current();
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let centerX = 0;
    let centerY = 0;
    let dpr = 1;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;

      width = rect.width;
      height = rect.height;
      centerX = width / 2;
      centerY = height / 2;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();

    const stars: WarpStar[] = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: (Math.random() - 0.5) * width * 4,
        y: (Math.random() - 0.5) * height * 4,
        z: Math.random() * MAX_DEPTH,
        size: 0.5 + Math.random() * 1.5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    }

    const startTime = performance.now();

    const render = (timestamp: number) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / DURATION, 1);

      let speed: number;
      if (progress <= 0) {
        speed = 0.5;
      } else {
        const t = progress;
        const ease =
          (Math.pow(2, 10 * (t - 1)) - Math.pow(2, -10)) /
          (1 - Math.pow(2, -10));
        speed = 0.5 + ease * 150;
      }

      ctx.fillStyle = `rgba(5, 13, 26, ${0.1 + progress * 0.4})`;
      ctx.fillRect(0, 0, width, height);

      for (const star of stars) {
        star.z -= speed;

        if (star.z <= 0) {
          star.z = MAX_DEPTH;
          star.x = (Math.random() - 0.5) * width * 4;
          star.y = (Math.random() - 0.5) * height * 4;
        }

        const scale = FOV / star.z;
        const x2d = star.x * scale + centerX;
        const y2d = star.y * scale + centerY;

        if (
          x2d < -100 ||
          x2d > width + 100 ||
          y2d < -100 ||
          y2d > height + 100
        ) {
          continue;
        }

        const trailLength = speed * 2;
        const prevZ = star.z + trailLength;
        const prevScale = FOV / prevZ;
        const prevX = star.x * prevScale + centerX;
        const prevY = star.y * prevScale + centerY;

        const distFromCenter = Math.sqrt(
          Math.pow((x2d - centerX) / centerX, 2) +
            Math.pow((y2d - centerY) / centerY, 2),
        );

        const brightness =
          Math.max(0.3, 1 - distFromCenter * 0.5) + progress * 0.5;
        const lineWidth = Math.max(0.5, star.size * scale * (1 + progress));

        const blueShift = Math.min(progress * 2, 0.6);
        const r = Math.floor(255 * (1 - blueShift * 0.3));
        const g = Math.floor(255 * (1 - blueShift * 0.1));
        const b = Math.floor(255 * (1 - blueShift * 0));

        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x2d, y2d);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${Math.min(brightness, 1)})`;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      if (progress > 0.3) {
        const glowRadius =
          ((progress - 0.3) / 0.7) * Math.max(width, height) * 0.8;
        const glowOpacity = ((progress - 0.3) / 0.7) * 0.8;
        const gradient = ctx.createRadialGradient(
          centerX,
          centerY,
          0,
          centerX,
          centerY,
          glowRadius,
        );
        gradient.addColorStop(0, `rgba(200, 230, 255, ${glowOpacity})`);
        gradient.addColorStop(0.5, `rgba(150, 200, 255, ${glowOpacity * 0.5})`);
        gradient.addColorStop(1, "rgba(150, 200, 255, 0)");
        ctx.fillStyle = gradient;
        ctx.globalCompositeOperation = "screen";
        ctx.fillRect(0, 0, width, height);
        ctx.globalCompositeOperation = "source-over";
      }

      if (progress > 0.75) {
        const whiteOpacity = (progress - 0.75) / 0.25;
        ctx.fillStyle = `rgba(255, 255, 255, ${whiteOpacity})`;
        ctx.fillRect(0, 0, width, height);
      }

      if (progress >= 1) {
        if (!hasCompletedRef.current) {
          hasCompletedRef.current = true;
          // 白屏多停留 HOLD_MS，给页面跳转留出缓冲
          setTimeout(() => onCompleteRef.current(), HOLD_MS);
        }
        return;
      }

      rafRef.current = requestAnimationFrame(render);
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
    };
  }, []); // 空依赖，只执行一次

  return (
    <div
      className="fixed inset-0 z-[60] overflow-hidden bg-slate-950"
      aria-busy="true"
      aria-live="polite"
      aria-label="穿越动画播放中"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ display: "block" }}
      />
    </div>
  );
}
