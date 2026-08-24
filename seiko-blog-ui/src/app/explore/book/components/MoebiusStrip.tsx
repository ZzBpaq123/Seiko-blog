"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface MoebiusStripProps {
  scrollBoost?: number;
  reducedMotion?: boolean;
  isDark?: boolean;
}

const RADIUS = 1.5;
const WIDTH = 0.35;
const SEGMENTS_U = 128;
const SEGMENTS_V = 16;

function createMoebiusGeometry() {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= SEGMENTS_U; i++) {
    const u = (i / SEGMENTS_U) * Math.PI * 2;

    for (let j = 0; j <= SEGMENTS_V; j++) {
      const v = ((j / SEGMENTS_V) - 0.5) * WIDTH * 2;

      const halfU = u / 2;
      const cosU = Math.cos(u);
      const sinU = Math.sin(u);
      const cosHalfU = Math.cos(halfU);
      const sinHalfU = Math.sin(halfU);

      const x = (RADIUS + v * cosHalfU) * cosU;
      const y = (RADIUS + v * cosHalfU) * sinU;
      const z = v * sinHalfU;

      positions.push(x, y, z);
      uvs.push(i / SEGMENTS_U, j / SEGMENTS_V);
    }
  }

  for (let i = 0; i < SEGMENTS_U; i++) {
    for (let j = 0; j < SEGMENTS_V; j++) {
      const a = i * (SEGMENTS_V + 1) + j;
      const b = a + SEGMENTS_V + 1;
      const c = a + 1;
      const d = b + 1;

      indices.push(a, b, c);
      indices.push(c, b, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

export default function MoebiusStrip({
  scrollBoost = 0,
  reducedMotion = false,
  isDark = false,
}: MoebiusStripProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const boostRef = useRef(scrollBoost);

  const geometry = useMemo(() => createMoebiusGeometry(), []);
  const color = isDark ? "#fbbf24" : "#92400e";

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    boostRef.current += (scrollBoost - boostRef.current) * 0.08;

    if (!reducedMotion) {
      mesh.rotation.z += delta * (0.25 + boostRef.current * 1.2);
      mesh.rotation.y += delta * (0.08 + boostRef.current * 0.3);
    }

    const scale = 1 + boostRef.current * 0.06;
    mesh.scale.setScalar(scale);
  });

  return (
    <mesh ref={meshRef} geometry={geometry} rotation={[Math.PI / 2.5, 0, 0]}>
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.35}
        wireframe
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
