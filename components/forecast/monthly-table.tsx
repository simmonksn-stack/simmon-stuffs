"use client";

import type { ForecastPoint } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

interface MonthlyTableProps {
  points: ForecastPoint[];
  target: number;
}

export function MonthlyTable({ points, target }: MonthlyTableProps) {
  // Show max 12 months
  const display = points.slice(0, 12);

  return (
    <div>
      <h4 className="mb-3 text-sm font-medium text-slate-300">Projeção mês a mês</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-700 text-left">
              <th className="pb-2 pr-4 font-medium text-slate-400">Mês</th>
              <th className="pb-2 pr-4 font-medium text-red-400">Conservador</th>
              <th className="pb-2 pr-4 font-medium text-amber-400">Base</th>
              <th className="pb-2 font-medium text-emerald-400">Agressivo</th>
            </tr>
          </thead>
          <tbody>
            {display.map((p) => (
              <tr key={p.month} className="border-b border-slate-800">
                <td className="py-1.5 pr-4 text-slate-400">{p.month}</td>
                <td className={`py-1.5 pr-4 font-mono ${p.conservative >= target ? "text-emerald-400 font-bold" : "text-slate-300"}`}>
                  {formatNumber(p.conservative)}
                </td>
                <td className={`py-1.5 pr-4 font-mono ${p.base >= target ? "text-emerald-400 font-bold" : "text-slate-300"}`}>
                  {formatNumber(p.base)}
                </td>
                <td className={`py-1.5 font-mono ${p.aggressive >= target ? "text-emerald-400 font-bold" : "text-slate-300"}`}>
                  {formatNumber(p.aggressive)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
