"use client";

import type { ForecastResult } from "@/lib/types";

interface ScenarioCardsProps {
  forecast: ForecastResult;
}

export function ScenarioCards({ forecast }: ScenarioCardsProps) {
  const scenarios = [
    {
      label: "Conservador",
      subtitle: "1x/semana, p25",
      eta: forecast.eta_conservative,
      color: "border-red-500/30 bg-red-500/5",
      textColor: "text-red-400",
      icon: "🔴",
    },
    {
      label: "Base",
      subtitle: "2x/semana, média",
      eta: forecast.eta_base,
      color: "border-amber-500/30 bg-amber-500/5",
      textColor: "text-amber-400",
      icon: "🟡",
    },
    {
      label: "Agressivo",
      subtitle: "3x/semana, p75",
      eta: forecast.eta_aggressive,
      color: "border-emerald-500/30 bg-emerald-500/5",
      textColor: "text-emerald-400",
      icon: "🟢",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {scenarios.map((s) => (
        <div key={s.label} className={`rounded-lg border p-4 ${s.color}`}>
          <div className="flex items-center gap-2 mb-2">
            <span>{s.icon}</span>
            <div>
              <p className={`text-sm font-semibold ${s.textColor}`}>{s.label}</p>
              <p className="text-xs text-slate-500">{s.subtitle}</p>
            </div>
          </div>
          <p className="font-mono text-lg font-bold text-white">
            {s.eta ?? "Além de 24 meses"}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {s.eta ? "Projeção para atingir meta" : "Meta não atingida no período"}
          </p>
        </div>
      ))}
    </div>
  );
}
