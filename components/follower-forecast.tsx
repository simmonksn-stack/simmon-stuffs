"use client";

import { useMemo } from "react";
import type { WeeklySnapshot } from "@/lib/types";
import { generateForecast } from "@/lib/forecast";
import { formatNumber, formatDateShort } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import { Target } from "lucide-react";

interface FollowerForecastProps {
  weekly: WeeklySnapshot[];
}

export function FollowerForecast({ weekly }: FollowerForecastProps) {
  const goal = Number(process.env.NEXT_PUBLIC_FOLLOWER_GOAL) || 20000;

  const forecast = useMemo(() => generateForecast(weekly, goal), [weekly, goal]);

  if (weekly.length === 0) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 sm:p-6">
        <h3 className="font-bold tracking-tight">Forecast de Followers</h3>
        <p className="mt-2 text-sm text-slate-500">
          Adicione dados semanais para ver o forecast.
        </p>
      </div>
    );
  }

  if (forecast.insufficient_data) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 sm:p-6">
        <h3 className="font-bold tracking-tight">Forecast de Followers</h3>
        <p className="mt-2 text-sm text-amber-400">
          Adicione mais semanas para forecast preciso (mínimo 4 pontos, atual: {weekly.length}).
        </p>
        <div className="mt-4 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecast.points}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="week"
                tickFormatter={(v) => formatDateShort(v)}
                stroke="#64748b"
                fontSize={11}
              />
              <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => formatNumber(v)} />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: "#3B82F6", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // Thin out forecast points for display
  const displayPoints = forecast.points.filter((_, i) => {
    if (i < weekly.length) return true; // show all actual
    return (i - weekly.length) % 4 === 0; // every 4 weeks for forecast
  });

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-bold tracking-tight">Forecast de Followers</h3>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <Target className="h-3 w-3 text-blue-400" />
            <span>Meta: {formatNumber(goal)}</span>
          </div>
          {forecast.eta_base && (
            <span>ETA base: {formatDateShort(forecast.eta_base)}</span>
          )}
          {!forecast.eta_base && (
            <span className="text-amber-400">Meta fora do horizonte de 12 meses</span>
          )}
        </div>
      </div>

      <div className="h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={displayPoints}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="week"
              tickFormatter={(v) => formatDateShort(v)}
              stroke="#64748b"
              fontSize={11}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickFormatter={(v) => formatNumber(v)}
              domain={["dataMin - 500", "auto"]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              labelFormatter={(v) => formatDateShort(String(v))}
              formatter={(value: number, name: string) => [
                formatNumber(value),
                name === "actual"
                  ? "Real"
                  : name === "base"
                  ? "Base"
                  : name === "optimistic"
                  ? "Otimista"
                  : "Pessimista",
              ]}
            />
            <Legend
              formatter={(value) =>
                value === "actual"
                  ? "Real"
                  : value === "base"
                  ? "Base"
                  : value === "optimistic"
                  ? "Otimista"
                  : "Pessimista"
              }
            />
            <ReferenceLine
              y={goal}
              stroke="#3B82F6"
              strokeDasharray="8 4"
              label={{
                value: `Meta ${formatNumber(goal)}`,
                position: "insideTopRight",
                fill: "#3B82F6",
                fontSize: 11,
              }}
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ fill: "#3B82F6", r: 3 }}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="optimistic"
              stroke="#10B981"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="base"
              stroke="#F59E0B"
              strokeWidth={1.5}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="pessimistic"
              stroke="#EF4444"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {(forecast.eta_optimistic || forecast.eta_base || forecast.eta_pessimistic) && (
        <div className="mt-3 flex flex-wrap gap-4 text-xs">
          {forecast.eta_optimistic && (
            <span className="text-emerald-400">
              Otimista: {formatDateShort(forecast.eta_optimistic)}
            </span>
          )}
          {forecast.eta_base && (
            <span className="text-amber-400">
              Base: {formatDateShort(forecast.eta_base)}
            </span>
          )}
          {forecast.eta_pessimistic && (
            <span className="text-red-400">
              Pessimista: {formatDateShort(forecast.eta_pessimistic)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
