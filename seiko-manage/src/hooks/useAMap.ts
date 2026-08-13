"use client";

import { useEffect, useState } from "react";

const SCRIPT_BASE = "https://webapi.amap.com/maps";

let loadingPromise: Promise<AMapStatic> | null = null;

function loadAMapScript(): Promise<AMapStatic> {
  if (window.AMap) return Promise.resolve(window.AMap);
  if (loadingPromise) return loadingPromise;

  const key = process.env.NEXT_PUBLIC_AMAP_KEY;
  const securityCode = process.env.NEXT_PUBLIC_AMAP_SECURITY_CODE;
  if (!key) {
    return Promise.reject(new Error("未配置 NEXT_PUBLIC_AMAP_KEY"));
  }
  if (securityCode) {
    window._AMapSecurityConfig = { securityJsCode: securityCode };
  }

  loadingPromise = new Promise<AMapStatic>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src^="${SCRIPT_BASE}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(window.AMap!));
      existing.addEventListener("error", () =>
        reject(new Error("高德地图脚本加载失败")),
      );
      return;
    }
    const script = document.createElement("script");
    script.src = `${SCRIPT_BASE}?v=2.0&key=${key}`;
    script.async = true;
    script.onload = () => resolve(window.AMap!);
    script.onerror = () => {
      loadingPromise = null;
      reject(new Error("高德地图脚本加载失败"));
    };
    document.head.appendChild(script);
  });

  return loadingPromise;
}

export function useAMap() {
  const [AMap, setAMap] = useState<AMapStatic | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadAMapScript()
      .then((sdk) => {
        if (!cancelled) setAMap(sdk);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "高德地图加载失败");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { AMap, ready: AMap !== null, error };
}
