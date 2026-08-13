# 足迹模块高德地图标点取坐标方案

> 目标：`seiko-manage` 足迹新增/编辑页（`FootprintForm`）的经度/纬度字段，从手工输入改为在高德地图上点击标点自动回填，同时保留手工输入作为兜底。

## 背景

- 现有表单：`seiko-manage/src/components/forms/FootprintForm.tsx`，`lat`/`lng` 为两个受控 `input type="number"` state，提交时转 `Number` 后放入 `FootprintCreateDTO`。
- 前台站点（`seiko-blog-ui`）的足迹地图（`src/app/footprint/FootprintClient.tsx`）和 `WorkPanel` 已在用高德 JS API 2.0，加载方式为动态注入 `https://webapi.amap.com/maps?v=2.0&key=xxx` 脚本，从 `window.AMap` 读取 SDK。
- **坐标系一致性**：前台用高德地图渲染足迹点，说明存量 `lat`/`lng` 数据就是 GCJ-02（高德坐标系）。管理端也用高德取点，天然一致，无需坐标转换。

## 方案概述

新增一个可复用的 `AMapPicker` 组件，嵌入足迹表单经纬度输入框上方/下方：

1. 地图点击 → 放置/移动 Marker → 回填 `lng`、`lat` state。
2. 手工修改输入框 → 反向移动 Marker 并平移地图（双向同步）。
3. （可选增强）点击后调用高德逆地理编码，自动回填城市/省份字段。
4. 地图加载失败时降级为纯输入框，不阻塞表单。

## 关键设计

### 1. Key 与安全密钥配置

高德 JS API 2.0 除 `key` 外还要求配置安全密钥 `securityJsCode`（在脚本加载前设置 `window._AMapSecurityConfig`）。生产环境的 key 还受域名白名单限制。

在 `seiko-manage/.env.local` 新增：

```bash
NEXT_PUBLIC_AMAP_KEY=你的key
NEXT_PUBLIC_AMAP_SECURITY_CODE=你的安全密钥
```

> 前台 `seiko-blog-ui` 中现有的 key（`67b870fa...5754cc`）是硬编码的。若两个应用部署在同一域名下可复用；否则需在高德控制台为该 key 的域名白名单加入管理端域名，或申请独立 key。建议借此机会把前台的 key 也收敛到环境变量。

### 2. SDK 加载 Hook：`useAMap`

新建 `seiko-manage/src/hooks/useAMap.ts`，复用前台 `WorkPanel` 的动态脚本注入模式，封装为 Hook：

- 加载前设置 `window._AMapSecurityConfig = { securityJsCode }`。
- 脚本 URL：`https://webapi.amap.com/maps?v=2.0&key=${key}`。
- 去重：已存在相同 script 标签时直接 resolve。
- 返回 `{ AMap, ready, error }`，供组件消费。

### 3. `AMapPicker` 组件

新建 `seiko-manage/src/components/AMapPicker.tsx`：

**Props**：

```ts
interface AMapPickerProps {
  lng: string;                 // 受控，与表单 state 一致（字符串，空串表示未设置）
  lat: string;
  onChange: (lng: string, lat: string) => void;
  onLocate?: (info: { city?: string; province?: string }) => void; // 逆地理回填，可选
  height?: string;             // 默认 "h-72"
}
```

**内部行为**：

- `useEffect` 内初始化 `new AMap.Map(container, { zoom, center })`，卸载时 `map.destroy()`（参照 `WorkPanel` 的 cleanup 写法）。
- 初始中心：已有坐标用现有坐标（zoom 12）；无坐标用中国中心 `[104.06, 35.86]`（zoom 4）。
- 已有坐标时立即放置 Marker。
- `map.on('click', e => ...)`：`e.lnglat.getLng()/getLat()`，保留 6 位小数，移动/创建 Marker，调 `onChange`。
- Marker 设置 `draggable: true`，拖拽结束同样回调 `onChange`。
- 监听 props 变化：当 `lng`/`lat` 是合法数值且与当前 Marker 位置不同（外部手工输入），移动 Marker 并 `map.setCenter`。
- 加载失败（key 无效/网络问题）：渲染提示文案 + 隐藏地图，输入框照常可用。

### 4. 表单集成

修改 `FootprintForm.tsx`：

- 在经纬度 `grid` 上方插入：

```tsx
<AMapPicker
  lng={lng}
  lat={lat}
  onChange={(newLng, newLat) => { setLng(newLng); setLat(newLat); }}
/>
```

- 两个输入框保留，标签改为“经度 / 纬度（可点击地图选取）”。

布局建议：把原 `grid-cols-1 sm:grid-cols-2` 的经纬度一行改为整行地图 + 一行只读展示（或只读 input），视觉上更像“从地图选取”。若保留可编辑 input 则实现双向同步即可。

### 5.（可选增强）逆地理编码自动回填城市/省份

- 加载 SDK 时追加插件：`&plugin=AMap.ReGeocoder`（JS API 2.0 也支持 `AMap.plugin(['AMap.ReGeocoder'], cb)` 动态加载）。
- 点击地图后调 `regeo(lnglat)`，从返回的 `addressComponent` 取 `city`/`province`，经 `onLocate` 回填表单。
- **局限**：高德逆地理对境外坐标支持差（足迹有 `international` 类型），境外点需保持手工填写。因此该功能定位为“国内便利增强”，不要做成强校验或覆盖用户已填内容——只在字段为空时回填，或由用户点“自动填充”按钮触发。

### 6. TypeScript 类型

前台项目是在组件文件内手写 `AMapMap`/`AMapMarker` 等最小接口（见 `WorkPanel.tsx`）。管理端照做，把本次用到的接口（`Map`、`Marker`、`LngLat`、`click` 事件、`setCenter`、`setFitView` 等）定义在 `useAMap.ts` 或单独的 `src/types/amap.d.ts` 中，不引入 `@types/amap-js-api` 之类完整类型包（项目现有风格如此）。

## 改动文件清单

| 文件 | 改动 |
| --- | --- |
| `seiko-manage/.env.local` | 新增 `NEXT_PUBLIC_AMAP_KEY`、`NEXT_PUBLIC_AMAP_SECURITY_CODE` |
| `seiko-manage/src/types/amap.d.ts`（新增） | 高德 SDK 最小类型声明 |
| `seiko-manage/src/hooks/useAMap.ts`（新增） | SDK 动态加载 Hook |
| `seiko-manage/src/components/AMapPicker.tsx`（新增） | 地图标点组件 |
| `seiko-manage/src/components/forms/FootprintForm.tsx` | 接入 `AMapPicker`，调整经纬度区域布局 |

后端与数据库零改动。

## 注意事项

- **SSR**：组件文件已 `"use client"`，SDK 加载和 `new AMap.Map` 都必须放在 `useEffect` 内，避免在服务端渲染期访问 `window`/`document`。
- **卸载清理**：`useEffect` cleanup 中 `map.destroy()`，防止路由切换后内存泄漏与重复初始化。
- **React Compiler**：项目启用了 React Compiler，无需手写 `useMemo`/`useCallback`；但地图实例等非序列化对象应放 `useRef`，不要进 state。
- **坐标精度**：回调值用 `toFixed(6)`，避免浮点长串进入输入框。
- **key 域名白名单**：本地 `localhost:3001` 需在 key 白名单内，否则本地调试会直接报 `INVALID_USER_KEY`。
- **降级**：地图加载失败只影响选点交互，`lat`/`lng` 输入框始终可用，表单提交逻辑不变。
