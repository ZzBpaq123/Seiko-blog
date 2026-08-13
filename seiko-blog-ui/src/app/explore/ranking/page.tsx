import type { Metadata } from "next";
import { hardwareGrids } from "@/data/hardware";
import RankingClient from "./RankingClient";

export const metadata: Metadata = {
  title: "排行 - Seiko Blog",
  description: "CPU 与显卡性能天梯排行榜",
};

export default function RankingPage() {
  return <RankingClient grids={hardwareGrids} />;
}
