"use client";

import { useEffect, useRef } from "react";
import { useAMap } from "@/hooks/useAMap";

interface AMapPickerProps {
  lng: string;
  lat: string;
  onChange: (lng: string, lat: string) => void;
  height?: string;
}

const CHINA_CENTER: [number, number] = [104.06, 35.86];

function parsePosition(lng: string, lat: string): [number, number] | null {
  if (!lng.trim() || !lat.trim()) return null;
  const x = Number(lng);
  const y = Number(lat);
  if (Number.isNaN(x) || Number.isNaN(y)) return null;
  if (x < -180 || x > 180 || y < -90 || y > 90) return null;
  return [x, y];
}

function placeMarker(
  AMap: AMapStatic,
  map: AMapMap,
  markerRef: React.RefObject<AMapMarker | null>,
  pos: [number, number],
  onPick: (pos: [number, number]) => void,
) {
  if (markerRef.current) {
    markerRef.current.setPosition(pos);
    return;
  }
  const marker = new AMap.Marker({ position: pos, draggable: true });
  marker.on("dragend", () => {
    const p = marker.getPosition();
    onPick([
      Number(p.getLng().toFixed(6)),
      Number(p.getLat().toFixed(6)),
    ]);
  });
  map.add(marker);
  markerRef.current = marker;
}

export default function AMapPicker({
  lng,
  lat,
  onChange,
  height = "h-72",
}: AMapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<AMapMap | null>(null);
  const markerRef = useRef<AMapMarker | null>(null);
  const onChangeRef = useRef(onChange);
  const { AMap, ready, error } = useAMap();

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // 初始化地图（SDK 就绪后执行一次）
  useEffect(() => {
    if (!AMap || !containerRef.current || mapRef.current) return;

    const initial = parsePosition(lng, lat);
    const map = new AMap.Map(containerRef.current, {
      zoom: initial ? 12 : 4,
      center: initial ?? CHINA_CENTER,
      viewMode: "2D",
    });
    mapRef.current = map;

    if (initial) {
      placeMarker(AMap, map, markerRef, initial, (pos) =>
        onChangeRef.current(String(pos[0]), String(pos[1])),
      );
    }

    map.on("click", (e) => {
      const pos: [number, number] = [
        Number(e.lnglat.getLng().toFixed(6)),
        Number(e.lnglat.getLat().toFixed(6)),
      ];
      placeMarker(AMap, map, markerRef, pos, (p) =>
        onChangeRef.current(String(p[0]), String(p[1])),
      );
      onChangeRef.current(String(pos[0]), String(pos[1]));
    });

    return () => {
      map.destroy();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [AMap]);

  // 外部手工输入经纬度 -> 反向同步 Marker 与地图中心
  useEffect(() => {
    const map = mapRef.current;
    if (!AMap || !map) return;
    const pos = parsePosition(lng, lat);
    if (!pos) return;
    const current = markerRef.current?.getPosition();
    if (
      current &&
      current.getLng() === pos[0] &&
      current.getLat() === pos[1]
    ) {
      return;
    }
    placeMarker(AMap, map, markerRef, pos, (p) =>
      onChangeRef.current(String(p[0]), String(p[1])),
    );
    map.setCenter(pos);
  }, [AMap, lng, lat]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-32 rounded-lg border border-dashed border-gray-300 text-sm text-gray-400">
        地图加载失败（{error}），请手工输入经纬度
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className={`relative w-full ${height} rounded-lg overflow-hidden border border-gray-200`}>
        <div ref={containerRef} className="w-full h-full" />
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 text-sm text-gray-400">
            地图加载中...
          </div>
        )}
      </div>
      <p className="text-xs text-gray-400">点击地图选点，或拖动标记微调位置</p>
    </div>
  );
}
