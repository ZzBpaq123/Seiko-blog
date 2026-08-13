"use client";
import { useEffect, useRef, useState } from "react";
import { TECHS } from "@/data/techs";

interface Pt {
  x: number;
  y: number;
  z: number;
}

function rotY(pts: Pt[], a: number): Pt[] {
  const c = Math.cos(a),
    s = Math.sin(a);
  return pts.map(({ x, y, z }) => ({ x: x * c + z * s, y, z: -x * s + z * c }));
}

function rotX(pts: Pt[], a: number): Pt[] {
  const c = Math.cos(a),
    s = Math.sin(a);
  return pts.map(({ x, y, z }) => ({ x, y: y * c - z * s, z: y * s + z * c }));
}

export default function TechSphere() {
  const SIZE = 220;
  const R = 96;
  const [positions, setPositions] = useState<Pt[]>([]);
  const ptsRef = useRef<Pt[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const n = TECHS.length;
    const phi = Math.PI * (3 - Math.sqrt(5));
    ptsRef.current = Array.from({ length: n }, (_, i) => {
      const y = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const t = phi * i;
      return { x: Math.cos(t) * r * R, y: y * R, z: Math.sin(t) * r * R };
    });
    setPositions([...ptsRef.current]);

    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ptsRef.current = rotY(rotX(ptsRef.current, dt * 0.22), dt * 0.48);
      setPositions([...ptsRef.current]);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div
      style={{
        width: SIZE,
        height: SIZE,
        position: "relative",
        margin: "0 auto",
      }}
    >
      {TECHS.map((tech, i) => {
        const p = positions[i];
        if (!p) return null;
        const fov = 300;
        const scale = fov / (fov - p.z);
        const cx = p.x * scale + SIZE / 2;
        const cy = p.y * scale + SIZE / 2;
        const opacity = ((p.z + R) / (R * 2)) * 0.65 + 0.35;
        // badge size scales with depth
        const boxSize = Math.round(28 * scale);
        const iconSize = Math.round(16 * scale);
        const radius = Math.round(6 * scale);
        return (
          <a
            key={tech.name}
            href={tech.url}
            target="_blank"
            rel="noopener noreferrer"
            title={tech.name}
            style={{
              position: "absolute",
              left: cx,
              top: cy,
              width: boxSize,
              height: boxSize,
              transform: "translate(-50%, -50%)",
              background: tech.bg,
              borderRadius: radius,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity,
              userSelect: "none",
              zIndex: Math.round(p.z + 100),
              boxShadow: `0 ${Math.round(1 * scale)}px ${Math.round(4 * scale)}px rgba(0,0,0,0.22)`,
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <svg
              viewBox="0 0 24 24"
              width={iconSize}
              height={iconSize}
              fill={"#ffffff"}
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d={tech.icon.path} />
            </svg>
          </a>
        );
      })}
    </div>
  );
}
