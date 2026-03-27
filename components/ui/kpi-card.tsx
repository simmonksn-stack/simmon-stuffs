"use client";

import type { ReactNode } from "react";

interface KpiCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  subtitle?: string;
  color?: string;
}

export function KpiCard({ label, value, icon, subtitle, color = "text-white" }: KpiCardProps) {
  return (
    <div className="rounded-lg border border-slate-700/50 bg-slate-800 p-4">
      <div className="flex items-center gap-2 text-sm text-slate-400">
        {icon}
        <span>{label}</span>
      </div>
      <p className={`mt-1 font-mono text-2xl font-bold ${color}`}>{value}</p>
      {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
}
