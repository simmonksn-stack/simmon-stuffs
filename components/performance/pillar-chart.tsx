"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { Post, ContentPillar } from "@/lib/types";
import { PILLARS } from "@/lib/types";
import { pillarChartColor } from "@/lib/utils";

interface PillarChartProps {
  posts: Post[];
}

export function PillarChart({ posts }: PillarChartProps) {
  if (posts.length === 0) return null;

  const data = PILLARS.map((pillar) => {
    const pillarPosts = posts.filter((p) => p.pillar === pillar);
    const scored = pillarPosts.filter((p) => p.score !== null);
    return {
      name: pillar.split(" & ")[0],
      fullName: pillar,
      avgScore: scored.length > 0
        ? scored.reduce((s, p) => s + (p.score ?? 0), 0) / scored.length
        : 0,
      count: pillarPosts.length,
    };
  }).filter((d) => d.count > 0);

  if (data.length === 0) return null;

  return (
    <div>
      <h4 className="mb-3 text-sm font-medium text-slate-300">Performance por pilar</h4>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <XAxis
              dataKey="name"
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 10]}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
              labelStyle={{ color: "#e2e8f0" }}
              formatter={(value: number) => [value.toFixed(1), "Score médio"]}
            />
            <Bar dataKey="avgScore" radius={[4, 4, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.fullName} fill={pillarChartColor(entry.fullName)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
