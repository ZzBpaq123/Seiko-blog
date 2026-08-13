import type { Metadata } from "next";
import { games } from "@/data/games";
import GameClient from "./GameClient";

export const metadata: Metadata = {
  title: "游戏 - Seiko Blog",
  description: "探索游戏的世界",
};

export default function GamePage() {
  return <GameClient initialGames={games} />;
}
