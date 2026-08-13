"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
  color: string;
  offsetX: number;
  offsetY: number;
}

interface StarFieldProps {
  className?: string;
}

const COLORS = [
  "#ffffff",
  "#ffffff",
  "#ffffff",
  "#ffffff",
  "#ffffff",
  "#ffffff",
  "#ffffff",
  "#ffffff",
  "#a5d8ff",
  "#fff4e0",
];

export default function StarField({ className }: StarFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const starsRef = useRef<Star[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const starCount = isMobile ? 200 : 400;

    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;

      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // 重新初始化星星
      const stars: Star[] = [];
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.max(0.5, Math.random() * 2 + 0.5),
          baseOpacity: 0.2 + Math.random() * 0.7,
          twinkleSpeed: 0.5 + Math.random() * 1.5,
          twinklePhase: Math.random() * Math.PI * 2,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          offsetX: 0,
          offsetY: 0,
        });
      }
      starsRef.current = stars;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / width - 0.5) * 2;
      mouseRef.current.y = ((e.clientY - rect.top) / height - 0.5) * 2;
    };

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const render = (timestamp: number) => {
      ctx.clearRect(0, 0, width, height);

      // 绘制径向渐变背景
      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.8,
      );
      gradient.addColorStop(0, "#0c1a33");
      gradient.addColorStop(0.5, "#050d1a");
      gradient.addColorStop(1, "#020617");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (const star of starsRef.current) {
        // 视差偏移
        const parallaxX = mx * star.size * 8;
        const parallaxY = my * star.size * 8;

        let opacity = star.baseOpacity;
        if (!prefersReduced) {
          const twinkle = Math.sin(
            timestamp * 0.001 * star.twinkleSpeed + star.twinklePhase,
          );
          opacity = star.baseOpacity + twinkle * 0.3;
        }
        const clampedOpacity = Math.max(0.1, Math.min(1, opacity));

        const renderX = star.x + parallaxX;
        const renderY = star.y + parallaxY;

        // 绘制星星
        ctx.beginPath();
        ctx.arc(renderX, renderY, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = clampedOpacity;
        ctx.fill();

        // 大星星画十字光芒
        if (star.size > 1.5) {
          const rayLen = star.size * 3;
          ctx.globalAlpha = clampedOpacity * 0.4;
          ctx.strokeStyle = star.color;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(renderX - rayLen, renderY);
          ctx.lineTo(renderX + rayLen, renderY);
          ctx.moveTo(renderX, renderY - rayLen);
          ctx.lineTo(renderX, renderY + rayLen);
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(render);
    };

    resize();

    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    window.addEventListener("mousemove", handleMouseMove);
    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block" }}
    />
  );
}
