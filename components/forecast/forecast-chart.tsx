"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import type { ForecastResult } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

interface ForecastChartProps {
  forecast: ForecastResult;
  target: number;
}

export function ForecastChart({ forecast, target }: ForecastChartProps) {
  const tooltipStyle = {
    contentStyle: {
      backgroundColor: "#1e293b",
      border: "1px solid #334155",
      borderRadius: 8,
    },
    labelStyle: { color: "#e2e8f0" },
  };

  return (
    <div>
      <h4 className="mb-3 text-sm font-medium text-slate-300">Projeção de crescimento</h4>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={forecast.points} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
            <XAxis
              dataKey="month"
              tick={{ fill: "#94a3b8", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval={2}
            />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => formatNumber(v)}
            />
            <Tooltip
              {...tooltipStyle}
              formatter={(value: number, name: string) => {
                const labels: Record<string, string> = {
                  conservative: "Conservador (1x/sem)",
                  base: "Base (2x/sem)",
                  aggressive: "Agressivo (3x/sem)",
                };
                return [formatNumber(value), labels[name] ?? name];
              }}
            />
            <Legend
              formatter={(value) => {
                const labels: Record<string, string> = {
                  conservative: "Conservador (1x/sem)",
                  base: "Base (2x/sem)",
                  aggressive: "Agressivo (3x/sem)",
                };
                return <span className="text-xs">{labels[value] ?? value}</span>;
              }}
            />
            <ReferenceLine
              y={target}
              stroke="#34d399"
              strokeDasharray="4 4"
              label={{ value: `Meta: ${formatNumber(target)}`, fill: "#34d399", fontSize: 11, position: "right" }}
            />
            <Line
              type="monotone"
              dataKey="conservative"
              stroke="#f87171"
              strokeWidth={1.5}
              strokeDasharray="6 3"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="base"
              stroke="#fbbf24"
              strokeWidth={2.5}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="aggressive"
              stroke="#34d399"
              strokeWidth={1.5}
              strokeDasharray="6 3"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
