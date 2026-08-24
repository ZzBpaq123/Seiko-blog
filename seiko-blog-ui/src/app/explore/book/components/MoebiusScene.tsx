"use client";

import { Canvas } from "@react-three/fiber";
import MoebiusStrip from "./MoebiusStrip";

interface MoebiusSceneProps {
  scrollBoost?: number;
  reducedMotion?: boolean;
  isDark?: boolean;
}

export default function MoebiusScene({
  scrollBoost = 0,
  reducedMotion = false,
  isDark = false,
}: MoebiusSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.2], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <MoebiusStrip
        scrollBoost={scrollBoost}
        reducedMotion={reducedMotion}
        isDark={isDark}
      />
    </Canvas>
  );
}
