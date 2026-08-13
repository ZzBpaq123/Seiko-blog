"use client";

import { useEffect, useState, useRef } from "react";

interface RunningTimeProps {
  startDate: string;
}

interface TimeData {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function secondsToTime(totalSeconds: number): TimeData {
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return { days, hours, minutes, seconds };
}

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

const ANIM_DURATION = 5000;

export default function RunningTime({ startDate }: RunningTimeProps) {
  const [time, setTime] = useState<TimeData>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const rafRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const start = new Date(startDate);
    const targetSeconds = Math.floor((Date.now() - start.getTime()) / 1000);
    const animStart = performance.now();

    function animate(now: number) {
      const progress = Math.min((now - animStart) / ANIM_DURATION, 1);
      const eased = easeOutExpo(progress);
      setTime(secondsToTime(Math.floor(targetSeconds * eased)));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        intervalRef.current = setInterval(() => {
          setTime(
            secondsToTime(Math.floor((Date.now() - start.getTime()) / 1000)),
          );
        }, 1000);
      }
    }

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startDate]);

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        <span>{time.days}</span>
        <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">
          天
        </span>
        <span>{String(time.hours).padStart(2, "0")}</span>
        <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">
          时
        </span>
        <span>{String(time.minutes).padStart(2, "0")}</span>
        <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">
          分
        </span>
        <span>{String(time.seconds).padStart(2, "0")}</span>
        <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">
          秒
        </span>
      </div>
    </div>
  );
}
