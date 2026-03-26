"use client";

import type { PostAnalysis } from "@/lib/types";
import { scoreColor } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";

interface PostAnalysisCardProps {
  analysis: PostAnalysis;
}

function ScoreBadge({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg bg-slate-800 px-3 py-2">
      <span className="text-xs text-slate-400">{label}</span>
      <span className={`font-mono text-lg font-bold ${scoreColor(score)}`}>
        {score}/10
      </span>
    </div>
  );
}

export function PostAnalysisCard({ analysis }: PostAnalysisCardProps) {
  return (
    <div className="space-y-4 rounded-lg border border-slate-700 bg-slate-800/50 p-4">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        <ScoreBadge label="Gancho" score={analysis.hook_score} />
        <ScoreBadge label="Estrutura" score={analysis.structure_score} />
        <ScoreBadge label="Tom" score={analysis.tone_score} />
        <ScoreBadge label="Engajamento" score={analysis.engagement_score} />
        <ScoreBadge label="Pilar" score={analysis.pillar_alignment} />
      </div>

      <div className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-3">
        <span className="text-sm text-slate-400">Score geral:</span>
        <span
          className={`font-mono text-xl font-bold ${scoreColor(
            analysis.overall_score
          )}`}
        >
          {analysis.overall_score}/10
        </span>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
          <div>
            <span className="font-medium text-emerald-400">O que funcionou:</span>{" "}
            <span className="text-slate-300">{analysis.what_worked}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <div>
            <span className="font-medium text-amber-400">O que melhorar:</span>{" "}
            <span className="text-slate-300">{analysis.what_to_improve}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
          <div>
            <span className="font-medium text-blue-400">Recomendação:</span>{" "}
            <span className="text-slate-300">{analysis.recommendation}</span>
          </div>
        </div>
      </div>

      <details className="text-xs text-slate-500">
        <summary className="cursor-pointer hover:text-slate-400">
          Detalhes por dimensão
        </summary>
        <div className="mt-2 space-y-1 pl-2">
          <p><strong>Gancho:</strong> {analysis.hook_analysis}</p>
          <p><strong>Estrutura:</strong> {analysis.structure_analysis}</p>
          <p><strong>Tom:</strong> {analysis.tone_analysis}</p>
          <p><strong>Engajamento:</strong> {analysis.engagement_analysis}</p>
        </div>
      </details>
    </div>
  );
}
