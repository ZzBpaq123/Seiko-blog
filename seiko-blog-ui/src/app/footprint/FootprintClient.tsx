"use client";

import { useEffect, useRef, useCallback } from "react";
import type { FootprintVO } from "@/api/types";

// 高德地图类型声明 - 使用接口而非 namespace
interface AMapMap {
  add(
    overlays: AMapMarker | AMapMarker[] | AMapCircleMarker | AMapCircleMarker[],
  ): void;
  setFitView(overlays?: AMapMarker[]): void;
  destroy(): void;
  on(event: string, callback: (e: { target: AMapMarker }) => void): void;
}

interface AMapMarker {
  getExtData(): unknown;
  getPosition(): [number, number];
  on(event: string, callback: (e: { target: AMapMarker }) => void): void;
}

interface AMapCircleMarker {
  getExtData(): unknown;
  getCenter(): [number, number];
  on(event: string, callback: (e: { target: AMapCircleMarker }) => void): void;
}

interface AMapInfoWindow {
  open(map: AMapMap, position: [number, number] | AMapLngLat): void;
  close(): void;
  setContent(content: string): void;
}

interface AMapLngLat {
  lng: number;
  lat: number;
}

interface AMapPixel {
  x: number;
  y: number;
}

interface AMapMapOptions {
  zoom?: number;
  center?: [number, number];
  viewMode?: "2D" | "3D";
  pitch?: number;
  mapStyle?: string;
}

interface AMapMarkerOptions {
  position: [number, number];
  title?: string;
  content?: string | HTMLElement;
  offset?: AMapPixel;
  extData?: unknown;
}

interface AMapCircleMarkerOptions {
  center: [number, number];
  radius: number;
  fillColor?: string;
  fillOpacity?: number;
  strokeColor?: string;
  strokeWeight?: number;
  extData?: unknown;
}

interface AMapSize {
  width: number;
  height: number;
}

interface AMapInfoWindowOptions {
  content?: string;
  offset?: AMapPixel;
  isCustom?: boolean;
  closeWhenClickMap?: boolean;
  size?: AMapSize;
}

interface AMapStatic {
  Map: new (container: string | HTMLElement, opts?: AMapMapOptions) => AMapMap;
  Marker: new (opts: AMapMarkerOptions) => AMapMarker;
  CircleMarker: new (opts: AMapCircleMarkerOptions) => AMapCircleMarker;
  InfoWindow: new (opts: AMapInfoWindowOptions) => AMapInfoWindow;
  LngLat: new (lng: number, lat: number) => AMapLngLat;
  Pixel: new (x: number, y: number) => AMapPixel;
  Size: new (width: number, height: number) => AMapSize;
}

declare global {
  interface Window {
    AMap: AMapStatic;
    AMapUI?: {
      load: (
        modules: string[],
        callback: (result: Record<string, unknown>) => void,
      ) => void;
    };
    carouselState?: Record<
      string,
      { currentIndex: number; total: number; intervalId?: number }
    >;
    carouselGoTo?: (id: string, index: number) => void;
    initCarousel?: (id: string, total: number) => void;
    startAutoPlay?: (id: string) => void;
    stopAutoPlay?: (id: string) => void;
  }
}

interface FootprintClientProps {
  footprints: FootprintVO[];
}

export default function FootprintClient({ footprints }: FootprintClientProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<AMapMap | null>(null);

  // 动态加载脚本
  const loadScript = useCallback((src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      // 检查是否已加载
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

  // 创建地图
  const createMap = useCallback((footprints: FootprintVO[]) => {
    if (!mapRef.current || !window.AMap) return;

    // 初始化地图
    const map = new window.AMap.Map(mapRef.current, {
      zoom: 4,
      center: [105, 35],
      viewMode: "2D",
      mapStyle: "amap://styles/dark",
    });

    mapInstanceRef.current = map;

    // 马卡龙粉色系
    const macaronPink = "#B8F1ED";

    const infoWindow = new window.AMap.InfoWindow({
      offset: new window.AMap.Pixel(0, -20),
      isCustom: true,
      closeWhenClickMap: true,
    });

    // 添加涟漪动画样式 + InfoWindow 样式覆盖
    const styleId = "ripple-marker-style";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        .ripple-marker {
          position: relative;
          width: 12px;
          height: 12px;
        }
        .ripple-marker::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          background: ${macaronPink};
          border-radius: 50%;
          transform: translate(-50%, -50%);
          box-shadow: 0 0 8px ${macaronPink}, 0 0 16px ${macaronPink}80;
        }
        .ripple {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          border: 2px solid ${macaronPink};
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: ripple-effect 2s ease-out infinite;
        }
        .ripple:nth-child(2) { animation-delay: 0.5s; }
        .ripple:nth-child(3) { animation-delay: 1s; }
        @keyframes ripple-effect {
          0% { width: 100%; height: 100%; opacity: 0.8; }
          100% { width: 300%; height: 300%; opacity: 0; }
        }
        /* 覆盖高德地图 InfoWindow 默认样式 */
        .amap-info-outer {
          background: transparent !important;
          box-shadow: none !important;
          border: none !important;
          border-radius: 0 !important;
          padding: 0 !important;
        }
        .amap-info-content {
          background: transparent !important;
          padding: 0 !important;
          border: none !important;
          border-radius: 0 !important;
          box-shadow: none !important;
        }
        .amap-info-sharp {
          border-top-color: #1a1a2e !important;
        }
        .amap-info-close {
          display: none !important;
        }
        /* InfoWindow 从中心向左右展开动画 */
        @keyframes info-window-expand {
          0% {
            transform: scaleX(0);
            opacity: 0;
          }
          100% {
            transform: scaleX(1);
            opacity: 1;
          }
        }
        .info-window-animated {
          transform-origin: center bottom;
          animation: info-window-expand 0.3s ease-out forwards;
        }
        .info-window-animated .info-window-content {
          opacity: 0;
          animation: info-window-content-fade 0.2s ease-out 0.15s forwards;
        }
        @keyframes info-window-content-fade {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    const markers: AMapMarker[] = [];

    footprints.forEach((footprint) => {
      if (!footprint.lat || !footprint.lng) return;

      // 创建自定义 DOM Marker 实现涟漪效果
      const container = document.createElement("div");
      container.className = "ripple-marker";

      // 添加3层涟漪
      for (let i = 0; i < 3; i++) {
        const ripple = document.createElement("div");
        ripple.className = "ripple";
        container.appendChild(ripple);
      }

      const marker = new window.AMap.Marker({
        position: [footprint.lng, footprint.lat],
        content: container,
        offset: new window.AMap.Pixel(-6, -6),
        extData: footprint,
      });

      // 点击事件
      marker.on("click", (e) => {
        const data = e.target.getExtData() as FootprintVO;
        const images = data.image ? [data.image] : [];
        const idStr = String(data.id);

        const content = `
          <div class="info-window-animated" style="transform-origin: center bottom; width: 320px;">
            <div class="info-window-content" style="width: 320px; background: #1a1a2e; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.4);">
              ${
                images.length > 0
                  ? `<div style="position: relative; width: 100%; height: 220px; overflow: hidden;" id="carousel-${idStr}">
                <!-- 图片容器 -->
                <div class="carousel-images" style="display: flex; transition: transform 0.3s ease; height: 100%;">
                  ${images.map((img: string) => `<img src="${img}" style="width: 100%; height: 100%; object-fit: cover; flex-shrink: 0;"  alt=""/>`).join("")}
                </div>

                <!-- 图片计数器 -->
                ${images.length > 1 ? `<div class="carousel-counter" style="position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.6); color: white; padding: 2px 8px; border-radius: 10px; font-size: 12px; z-index: 10;">1 / ${images.length}</div>` : ""}

                <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 16px; background: linear-gradient(transparent, rgba(26,26,46,0.95));">
                  <div style="font-weight: 600; font-size: 18px; color: ${macaronPink}; margin-bottom: 6px;">
                    ${data.city}
                  </div>
                  <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: #d0d0d0; margin-bottom: 6px;">
                    <span>${data.province ? `${data.province} · ` : ""}${data.country}</span>
                    <span style="color: #808080;">|</span>
                    <span style="color: #b0b0b0;">${data.footprintDate}</span>
                  </div>
                  ${data.description ? `<div style="font-size: 12px; color: #a0a0a0; margin-top: 8px; line-height: 1.4;">${data.description}</div>` : ""}
                </div>
              </div>`
                  : `<div style="padding: 12px;">
                <div style="font-weight: 600; font-size: 16px; color: ${macaronPink}; margin-bottom: 4px;">
                  ${data.city}
                </div>
                <div style="font-size: 13px; color: #a0a0a0; margin-bottom: 8px;">
                  ${data.province ? `${data.province} · ` : ""}${data.country}
                </div>
                <div style="font-size: 12px; color: #808080; margin-bottom: 4px;">
                  ${data.footprintDate}
                </div>
                ${data.description ? `<div style="font-size: 12px; color: #a0a0a0; margin-top: 8px;">${data.description}</div>` : ""}
              </div>`
              }
            </div>
          </div>
        `;

        // 停止之前卡片的自动轮播
        if (currentOpenCardId && window.stopAutoPlay) {
          window.stopAutoPlay(String(currentOpenCardId));
        }
        currentOpenCardId = data.id;

        infoWindow.setContent(content);
        infoWindow.open(map, e.target.getPosition());

        // 初始化轮播状态
        if (images.length > 0) {
          if (window.initCarousel) {
            window.initCarousel(idStr, images.length);
          }
        }
      });

      markers.push(marker);
    });

    map.add(markers);

    // 自适应视图
    if (markers.length > 0) {
      map.setFitView(markers);
    }

    // 存储当前打开的卡片 ID，用于关闭时停止轮播
    let currentOpenCardId: number | null = null;

    // 点击地图空白处关闭信息窗
    map.on("click", () => {
      // 停止当前卡片的自动轮播
      if (currentOpenCardId && window.stopAutoPlay) {
        window.stopAutoPlay(String(currentOpenCardId));
      }
      currentOpenCardId = null;
      infoWindow.close();
    });
  }, []);

  // 初始化高德地图
  const initAMap = useCallback(
    (footprints: FootprintVO[]) => {
      const mapKey = process.env.NEXT_PUBLIC_AMAP_KEY;
      if (!mapKey) {
        console.warn("未配置 NEXT_PUBLIC_AMAP_KEY，跳过足迹地图加载");
        return;
      }

      // 动态加载高德地图 JS API
      loadScript(`https://webapi.amap.com/maps?v=2.0&key=${mapKey}`)
        .then(() => {
          // 加载 UI 组件库
          return loadScript("https://webapi.amap.com/ui/1.1/main.js?v=1.1.1");
        })
        .then(() => {
          // 创建地图实例
          createMap(footprints);
        })
        .catch((err) => {
          console.error("高德地图加载失败:", err);
        });
    },
    [loadScript, createMap],
  );

  useEffect(() => {
    // 定义轮播控制函数
    window.carouselState = {};
    window.carouselGoTo = (id: string, index: number) => {
      const container = document.getElementById(`carousel-${id}`);
      if (!container) return;
      const imagesContainer = container.querySelector(
        ".carousel-images",
      ) as HTMLElement;
      const counter = container.querySelector(
        ".carousel-counter",
      ) as HTMLElement;
      if (imagesContainer) {
        imagesContainer.style.transform = `translateX(-${index * 100}%)`;
      }
      if (counter) {
        counter.textContent = `${index + 1} / ${window.carouselState![id]?.total || 1}`;
      }
      window.carouselState![id] = {
        ...window.carouselState![id],
        currentIndex: index,
      };
    };
    window.initCarousel = (id: string, total: number) => {
      // 先清除之前的定时器
      if (window.stopAutoPlay) {
        window.stopAutoPlay(id);
      }
      window.carouselState![id] = { currentIndex: 0, total };
      // 启动自动轮播
      if (total > 1 && window.startAutoPlay) {
        window.startAutoPlay(id);
      }
    };
    window.startAutoPlay = (id: string) => {
      const state = window.carouselState?.[id];
      if (!state || state.total <= 1) return;
      // 清除已有定时器
      if (state.intervalId) {
        window.clearInterval(state.intervalId);
      }
      // 设置新的自动轮播定时器 (3秒切换)
      const intervalId = window.setInterval(() => {
        const currentState = window.carouselState?.[id];
        if (!currentState) return;
        const nextIndex =
          currentState.currentIndex < currentState.total - 1
            ? currentState.currentIndex + 1
            : 0;
        window.carouselGoTo?.(id, nextIndex);
      }, 3000);
      window.carouselState![id] = { ...state, intervalId };
    };
    window.stopAutoPlay = (id: string) => {
      const state = window.carouselState?.[id];
      if (state?.intervalId) {
        window.clearInterval(state.intervalId);
        window.carouselState![id] = { ...state, intervalId: undefined };
      }
    };

    // 使用服务端传入的足迹数据初始化地图
    if (footprints.length > 0) {
      initAMap(footprints);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
      }
      // 清理所有轮播定时器
      if (window.carouselState) {
        Object.keys(window.carouselState).forEach((id) => {
          if (window.stopAutoPlay) {
            window.stopAutoPlay(id);
          }
        });
      }
      // 清理轮播函数
      delete window.carouselState;
      delete window.carouselGoTo;
      delete window.initCarousel;
      delete window.startAutoPlay;
      delete window.stopAutoPlay;
    };
  }, [initAMap, footprints]);

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black -mt-14 -mb-16">
      {/* 地图容器 - 铺满屏幕 */}
      <div ref={mapRef} className="w-full h-screen" />
    </main>
  );
}
