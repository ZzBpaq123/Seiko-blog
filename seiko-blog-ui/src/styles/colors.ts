// 标签云配色方案（Material Design 风格）
export const TAG_COLORS = [
  { main: "#FF6B6B", hover: "#FF5252" }, // 珊瑚红
  { main: "#4ECDC4", hover: "#3DBDB4" }, // 蒂芙尼青
  { main: "#95A5F5", hover: "#7B8CE8" }, // 紫罗兰
  { main: "#FFA726", hover: "#FB8C00" }, // 活力橙
  { main: "#42A5F5", hover: "#2196F3" }, // 天蓝
  { main: "#EC407A", hover: "#D81B60" }, // 玫红
  { main: "#66BB6A", hover: "#4CAF50" }, // 草绿
  { main: "#AB47BC", hover: "#9C27B0" }, // 紫水晶
  { main: "#26C6DA", hover: "#00BCD4" }, // 青绿
  { main: "#EF5350", hover: "#E53935" }, // 石榴红
  { main: "#9CCC65", hover: "#8BC34A" }, // 莱姆绿
  { main: "#5C6BC0", hover: "#3F51B5" }, // 靛蓝
  { main: "#FFCA28", hover: "#FFC107" }, // 金黄
  { main: "#26A69A", hover: "#009688" }, // 水鸭色
  { main: "#7E57C2", hover: "#673AB7" }, // 深紫
  { main: "#8D6E63", hover: "#795548" }, // 咖啡棕
  { main: "#F06292", hover: "#E91E63" }, // 粉红
  { main: "#29B6F6", hover: "#03A9F4" }, // 湖蓝
  { main: "#FFA000", hover: "#FF8F00" }, // 琥珀橙
  { main: "#8BC34A", hover: "#7CB342" }, // 苹果绿
] as const;

// 获取标签颜色（循环使用）
export function getTagColor(index: number): (typeof TAG_COLORS)[number] {
  return TAG_COLORS[index % TAG_COLORS.length];
}
