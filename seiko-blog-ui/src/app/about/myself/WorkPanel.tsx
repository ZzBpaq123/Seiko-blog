"use client";

import { useEffect, useRef, useCallback } from "react";

interface AMapMap {
  add(marker: AMapMarker): void;
  destroy(): void;
}

interface AMapMarker {
  position: [number, number];
}

interface AMapMapOptions {
  zoom?: number;
  center?: [number, number];
  viewMode?: "2D" | "3D";
  mapStyle?: string;
}

interface AMapPixelCtor {
  x: number;
  y: number;
}

interface AMapMarkerOptions {
  position: [number, number];
  content?: string | HTMLElement;
  offset?: AMapPixelCtor;
}

interface AMapStatic {
  Map: new (container: string | HTMLElement, opts?: AMapMapOptions) => AMapMap;
  Marker: new (opts: AMapMarkerOptions) => AMapMarker;
  Pixel: new (x: number, y: number) => AMapPixelCtor;
}

/** 从全局读取高德地图 SDK（脚本动态注入到 window.AMap） */
function getAMap(): AMapStatic | undefined {
  return (window as unknown as { AMap?: AMapStatic }).AMap;
}

/** 经纬度坐标 [经度, 纬度] */
const SHIJIAZHUANG: [number, number] = [114.438426, 38.040975];

/** 标记点主题色 */
const MARKER_COLOR = "#3b82f6";

export default function WorkPanel() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<AMapMap | null>(null);

  const loadScript = useCallback((src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src*="${src.split("?")[0]}"]`)) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });
  }, []);

  const createMap = useCallback(() => {
    const AMap = getAMap();
    if (!mapRef.current || !AMap) return;

    const map = new AMap.Map(mapRef.current, {
      zoom: 11,
      center: SHIJIAZHUANG,
      viewMode: "3D",
      mapStyle: "amap://styles/dark",
    });
    mapInstanceRef.current = map;

    const styleId = "work-ripple-marker-style";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        .work-ripple-marker {
          position: relative;
          width: 14px;
          height: 14px;
        }
        .work-ripple-marker::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          background: ${MARKER_COLOR};
          border-radius: 50%;
          transform: translate(-50%, -50%);
          box-shadow: 0 0 8px ${MARKER_COLOR}, 0 0 16px ${MARKER_COLOR}80;
        }
        .work-ripple {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          border: 2px solid ${MARKER_COLOR};
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: work-ripple-effect 2s ease-out infinite;
        }
        .work-ripple:nth-child(2) { animation-delay: 0.6s; }
        .work-ripple:nth-child(3) { animation-delay: 1.2s; }
        @keyframes work-ripple-effect {
          0% { width: 100%; height: 100%; opacity: 0.8; }
          100% { width: 320%; height: 320%; opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    const container = document.createElement("div");
    container.className = "work-ripple-marker";
    for (let i = 0; i < 3; i++) {
      const ripple = document.createElement("div");
      ripple.className = "work-ripple";
      container.appendChild(ripple);
    }

    const marker = new AMap.Marker({
      position: SHIJIAZHUANG,
      content: container,
      offset: new AMap.Pixel(-7, -7),
    });
    map.add(marker);
  }, []);

  useEffect(() => {
    const mapKey = process.env.NEXT_PUBLIC_AMAP_KEY;
    if (!mapKey) {
      console.warn("未配置 NEXT_PUBLIC_AMAP_KEY，跳过工作地图加载");
      return;
    }
    loadScript(`https://webapi.amap.com/maps?v=2.0&key=${mapKey}`)
      .then(() => createMap())
      .catch((err) => console.error("高德地图加载失败:", err));

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
    };
  }, [loadScript, createMap]);

  return (
    <section className="flex h-full w-screen shrink-0 flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl mx-auto">
        <h2 className="mb-6 font-bold text-white text-3xl sm:text-4xl">
          我的工作地
        </h2>

        <div className="mb-6 space-y-3">
          <p className="text-lg leading-relaxed text-gray-300 sm:text-xl">
            目前我在{" "}
            <span className="font-semibold text-blue-400">河北 石家庄</span>{" "}
            从事{" "}
            <span className="font-semibold text-blue-400">全栈开发工程师</span>{" "}
            岗位
          </p>
        </div>

        {/* 小地图 - 定位到石家庄 */}
        <div className="overflow-hidden rounded-2xl border border-white/10 shadow-[0_0_40px_rgba(59,130,246,0.15)]">
          <div ref={mapRef} className="h-70 w-full sm:h-90" />
        </div>
      </div>
    </section>
  );
}
