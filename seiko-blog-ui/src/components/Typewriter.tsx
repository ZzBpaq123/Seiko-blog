"use client";

import { useState, useEffect, useCallback } from "react";

interface TypewriterProps {
  text: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
}

export default function Typewriter({
  text,
  typingSpeed = 150,
  deletingSpeed = 80,
  pauseDuration = 1500,
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState("");
  const [phase, setPhase] = useState<"typing" | "paused" | "deleting">(
    "typing",
  );
  const [index, setIndex] = useState(0);

  const reset = useCallback(() => {
    setIndex(0);
    setDisplayText("");
    setPhase("typing");
  }, []);

  useEffect(() => {
    let rafId: number;
    let lastTime = 0;
    let accumulatedTime = 0;

    const animate = (currentTime: number) => {
      if (lastTime === 0) lastTime = currentTime;
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      accumulatedTime += deltaTime;

      const currentSpeed =
        phase === "typing"
          ? typingSpeed
          : phase === "deleting"
            ? deletingSpeed
            : pauseDuration;

      if (accumulatedTime >= currentSpeed) {
        accumulatedTime = 0;

        if (phase === "typing") {
          if (index < text.length) {
            setDisplayText(text.slice(0, index + 1));
            setIndex((prev) => prev + 1);
          } else {
            setPhase("paused");
          }
        } else if (phase === "paused") {
          setPhase("deleting");
        } else if (phase === "deleting") {
          if (index > 0) {
            setDisplayText(text.slice(0, index - 1));
            setIndex((prev) => prev - 1);
          } else {
            reset();
          }
        }
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafId);
  }, [text, typingSpeed, deletingSpeed, pauseDuration, phase, index, reset]);

  return (
    <span className="inline-flex h-[1.2em] items-center">
      <span className="whitespace-nowrap">{displayText}</span>
      <span className="animate-cursor-blink ml-1 inline-block h-[1em] w-[3px] bg-current"></span>
    </span>
  );
}
