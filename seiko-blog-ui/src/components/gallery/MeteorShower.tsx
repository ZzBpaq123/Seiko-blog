"use client";

import { useEffect, useRef } from "react";

interface Meteor {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  decay: number;
  width: number;
}

interface MeteorShowerProps {
  className?: string;
  maxMeteors?: number;
  spawnRate?: number; // 每帧生成概率 (0-1)
}

export default function MeteorShower({
  className,
  maxMeteors = 3,
  spawnRate = 0.015,
}: MeteorShowerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const meteorsRef = useRef<Meteor[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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
    };

    const spawnMeteor = (): Meteor => {
      // 流星从屏幕上方或右方出现，向左下方划过
      const startFromTop = Math.random() > 0.3;
      let x: number;
      let y: number;

      if (startFromTop) {
        x = Math.random() * width * 1.2;
        y = -50;
      } else {
        x = width + 50;
        y = Math.random() * height * 0.5;
      }

      const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.3; // 约 45度，略有变化
      const length = 80 + Math.random() * 120;
      const speed = 8 + Math.random() * 6;

      return {
        x,
        y,
        length,
        speed,
        angle,
        opacity: 0.6 + Math.random() * 0.4,
        decay: 0.008 + Math.random() * 0.008,
        width: 1 + Math.random() * 1.5,
      };
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 生成新流星
      if (meteorsRef.current.length < maxMeteors && Math.random() < spawnRate) {
        meteorsRef.current.push(spawnMeteor());
      }

      // 更新并绘制流星
      const remaining: Meteor[] = [];
      for (const m of meteorsRef.current) {
        m.x -= Math.cos(m.angle) * m.speed;
        m.y += Math.sin(m.angle) * m.speed;
        m.opacity -= m.decay;

        if (
          m.opacity <= 0 ||
          m.x < -m.length * 2 ||
          m.y > height + m.length * 2
        ) {
          continue;
        }

        remaining.push(m);

        const tailX = m.x + Math.cos(m.angle) * m.length;
        const tailY = m.y - Math.sin(m.angle) * m.length;

        // 绘制流星尾巴（渐变）
        const gradient = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${m.opacity})`);
        gradient.addColorStop(0.1, `rgba(200, 230, 255, ${m.opacity * 0.8})`);
        gradient.addColorStop(0.5, `rgba(150, 200, 255, ${m.opacity * 0.3})`);
        gradient.addColorStop(1, `rgba(150, 200, 255, 0)`);

        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = m.width;
        ctx.lineCap = "round";
        ctx.stroke();

        // 流星头部光点
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.width * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${m.opacity})`;
        ctx.fill();

        // 头部辉光
        const glow = ctx.createRadialGradient(
          m.x,
          m.y,
          0,
          m.x,
          m.y,
          m.width * 4,
        );
        glow.addColorStop(0, `rgba(200, 230, 255, ${m.opacity * 0.4})`);
        glow.addColorStop(1, "rgba(200, 230, 255, 0)");
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.width * 4, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
      }

      meteorsRef.current = remaining;
      rafRef.current = requestAnimationFrame(render);
    };

    resize();

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
  }, [maxMeteors, spawnRate]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block" }}
    />
  );
}
