"use client";

import { useEffect, useState } from "react";
import { FileText, MessageSquare, Images, Image as ImageIcon, Eye } from "lucide-react";
import { getCreationTrend, getStats } from "@/api/stats";
import { getPostList } from "@/api/post";
import CreationTrendChart from "@/components/CreationTrendChart";
import ReadDotMatrixChart, { type ReadDotItem } from "@/components/ReadDotMatrixChart";
import { ApiBusinessError } from "@/utils/request";
import { notifyError } from "@/utils/toast";
import type { CreationTrendVO, StatsVO } from "@/types";

/** 将较大的数值格式化为带 k 的紧凑形式，如 12500 → 12.5k */
function formatCount(value: number): string {
  if (value < 1000) return String(value);
  return `${(value / 1000).toFixed(1)}k`;
}

interface StatCard {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

function buildStatCards(stats: StatsVO): StatCard[] {
  return [
    { label: "文章总数", value: String(stats.postCount), icon: <FileText size={20} />, color: "bg-blue-50 text-blue-600" },
    { label: "评论总数", value: String(stats.commentCount), icon: <MessageSquare size={20} />, color: "bg-green-50 text-green-600" },
    { label: "相册数", value: String(stats.albumCount), icon: <Images size={20} />, color: "bg-orange-50 text-orange-600" },
    { label: "照片数", value: String(stats.photoCount), icon: <ImageIcon size={20} />, color: "bg-purple-50 text-purple-600" },
    { label: "总阅读量", value: formatCount(stats.totalReadNum), icon: <Eye size={20} />, color: "bg-cyan-50 text-cyan-600" },
  ];
}

const recentActivities = [
  { action: "发布了文章", target: "《Next.js 15 新特性详解》", time: "2 小时前" },
  { action: "回复了评论", target: "用户 Alice 的评论", time: "4 小时前" },
  { action: "添加了足迹", target: "日本 · 东京", time: "1 天前" },
  { action: "上传了照片", target: "相册「夏日海边」", time: "2 天前" },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsVO | null>(null);
  const [loading, setLoading] = useState(true);
  const [trendData, setTrendData] = useState<CreationTrendVO[]>([]);
  const [trendLoading, setTrendLoading] = useState(true);
  const [trendDays, setTrendDays] = useState(7);
  const [readDots, setReadDots] = useState<ReadDotItem[]>([]);
  const [readDotsLoading, setReadDotsLoading] = useState(true);

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch((err) => {
        const message = err instanceof ApiBusinessError ? err.message : "加载统计数据失败";
        notifyError(message);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getCreationTrend(trendDays)
      .then(setTrendData)
      .catch((err) => {
        const message = err instanceof ApiBusinessError ? err.message : "加载新建趋势失败";
        notifyError(message);
      })
      .finally(() => setTrendLoading(false));
  }, [trendDays]);

  useEffect(() => {
    getPostList({ page: 1, size: 100 })
      .then((res) => {
        const dots = res.records.map((p) => ({ title: p.title, readNum: p.readNum ?? 0 }));
        // 随机打乱顺序，让点阵呈散点分布
        for (let i = dots.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [dots[i], dots[j]] = [dots[j], dots[i]];
        }
        setReadDots(dots);
      })
      .catch((err) => {
        const message = err instanceof ApiBusinessError ? err.message : "加载阅读量数据失败";
        notifyError(message);
      })
      .finally(() => setReadDotsLoading(false));
  }, []);

  const cards = stats ? buildStatCards(stats) : [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">仪表盘</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {loading
          ? Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-6 w-16 bg-gray-100 rounded animate-pulse" />
                    <div className="h-3 w-12 bg-gray-100 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))
          : cards.map((stat) => (
              <div key={stat.label} className="card p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-xs text-gray-500">{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left column: Recent Activity + Creation Trend */}
        <div className="space-y-4">
          {/* Recent Activity */}
          <div className="card">
            <h2 className="text-lg font-semibold text-foreground mb-4">最近动态</h2>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                  <div className="flex-1">
                    <span className="text-sm text-gray-600">{activity.action} </span>
                    <span className="text-sm font-medium text-foreground">{activity.target}</span>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Creation Trend */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">内容新建趋势</h2>
              <select
                className="input py-1.5 px-2 text-sm w-24! mr-[5px]!"
                value={trendDays}
                onChange={(e) => {
                  const days = Number(e.target.value);
                  setTrendDays(days);
                  setTrendLoading(true);
                }}
              >
                <option value={7}>近 7 天</option>
                <option value={14}>近 14 天</option>
                <option value={30}>近 30 天</option>
              </select>
            </div>
            <CreationTrendChart data={trendData} loading={trendLoading} />
          </div>
        </div>

        {/* Right column: System Info + Read Dot Matrix */}
        <div className="space-y-4">
          {/* System Info */}
          <div className="card">
            <h2 className="text-lg font-semibold text-foreground mb-4">系统信息</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">系统版本</span>
                <span className="font-medium text-foreground">v1.0.0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">前端版本</span>
                <span className="font-medium text-foreground">Next.js 16.1.6</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">后端版本</span>
                <span className="font-medium text-foreground">Spring Boot 3.4.0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">数据库</span>
                <span className="font-medium text-foreground">MySQL 8.x</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">运行状态</span>
                <span className="badge badge-green">正常</span>
              </div>
            </div>
          </div>

          {/* Read Count Dot Matrix */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">文章阅读量分布</h2>
              <span className="text-xs text-gray-400">点越大阅读量越高</span>
            </div>
            <ReadDotMatrixChart data={readDots} loading={readDotsLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
