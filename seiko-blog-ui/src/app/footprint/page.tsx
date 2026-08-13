import type { Metadata } from "next";
import { getFootprintList } from "@/api/footprint";
import FootprintClient from "./FootprintClient";

export const metadata: Metadata = {
  title: "足迹 - Seiko Blog",
  description: "记录走过的每一个角落",
};

export const revalidate = 300;

export default async function FootprintPage() {
  const footprints = await getFootprintList().catch(() => []);

  return <FootprintClient footprints={footprints} />;
}
