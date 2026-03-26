"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
}

export function KpiCard({ title, value, change, trend, icon }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">{title}</span>
        {icon && <span className="text-slate-500">{icon}</span>}
      </div>
      <div className="mt-2 font-mono text-2xl font-bold tabular-nums sm:text-3xl">
        {value}
      </div>
      {change && (
        <div className="mt-1 flex items-center gap-1 text-sm">
          {trend === "up" && (
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          )}
          {trend === "down" && (
            <TrendingDown className="h-4 w-4 text-red-400" />
          )}
          {trend === "neutral" && (
            <Minus className="h-4 w-4 text-slate-400" />
          )}
          <span
            className={
              trend === "up"
                ? "text-emerald-400"
                : trend === "down"
                ? "text-red-400"
                : "text-slate-400"
            }
          >
            {change}
          </span>
        </div>
      )}
    </div>
  );
}
