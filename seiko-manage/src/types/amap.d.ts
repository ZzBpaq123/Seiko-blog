// 高德地图 JS API 2.0 最小类型声明（仅覆盖 AMapPicker 用到的接口）

interface AMapLngLat {
  getLng(): number;
  getLat(): number;
}

interface AMapMapClickEvent {
  lnglat: AMapLngLat;
}

interface AMapMarkerOptions {
  position: [number, number];
  draggable?: boolean;
}

interface AMapMarker {
  setPosition(position: [number, number]): void;
  getPosition(): AMapLngLat;
  on(event: string, callback: () => void): void;
}

interface AMapMapOptions {
  zoom?: number;
  center?: [number, number];
  viewMode?: "2D" | "3D";
}

interface AMapMap {
  add(overlay: AMapMarker): void;
  on(event: "click", callback: (e: AMapMapClickEvent) => void): void;
  setCenter(center: [number, number]): void;
  destroy(): void;
}

interface AMapStatic {
  Map: new (container: string | HTMLElement, opts?: AMapMapOptions) => AMapMap;
  Marker: new (opts: AMapMarkerOptions) => AMapMarker;
}

interface Window {
  AMap?: AMapStatic;
  _AMapSecurityConfig?: { securityJsCode: string };
}
