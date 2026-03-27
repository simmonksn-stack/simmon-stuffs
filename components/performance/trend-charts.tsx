"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { Post } from "@/lib/types";

interface TrendChartsProps {
  posts: Post[];
}

function groupByWeek(posts: Post[]): { week: string; impressions: number; followers: number }[] {
  const sorted = [...posts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const weeks: Record<string, { impressions: number; followers: number }> = {};

  for (const post of sorted) {
    const d = new Date(post.date);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const key = weekStart.toISOString().split("T")[0];

    if (!weeks[key]) weeks[key] = { impressions: 0, followers: 0 };
    weeks[key].impressions += post.impressions;
    weeks[key].followers += post.followers_gained;
  }

  return Object.entries(weeks).map(([week, data]) => ({
    week: new Date(week).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
    ...data,
  }));
}

export function TrendCharts({ posts }: TrendChartsProps) {
  if (posts.length < 2) return null;

  const data = groupByWeek(posts);

  const tooltipStyle = {
    contentStyle: { backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8 },
    labelStyle: { color: "#e2e8f0" },
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div>
        <h4 className="mb-3 text-sm font-medium text-slate-300">Impressions por semana</h4>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="week" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Line type="monotone" dataKey="impressions" stroke="#60a5fa" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div>
        <h4 className="mb-3 text-sm font-medium text-slate-300">Followers ganhos por semana</h4>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="week" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Line type="monotone" dataKey="followers" stroke="#34d399" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
