import type { Metadata } from "next";
import MyselfClient from "./MyselfClient";

export const metadata: Metadata = {
  title: "关于我 - Seiko Blog",
  description: "认识一下 Seiko，了解技术栈与个人经历",
};

export default function MyselfPage() {
  return <MyselfClient />;
}
