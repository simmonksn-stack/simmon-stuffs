"use client";

import { Lightbulb } from "lucide-react";

interface CadenceRecommendationProps {
  recommendation: string;
}

export function CadenceRecommendation({ recommendation }: CadenceRecommendationProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
      <Lightbulb className="h-5 w-5 shrink-0 text-blue-400 mt-0.5" />
      <div>
        <p className="text-sm font-medium text-blue-300">Recomendação de cadência</p>
        <p className="mt-1 text-sm text-slate-300">{recommendation}</p>
      </div>
    </div>
  );
}
