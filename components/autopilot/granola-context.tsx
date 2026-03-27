"use client";

import { useState } from "react";
import { BookOpen, RefreshCw, AlertCircle, Info } from "lucide-react";

interface GranolaContextProps {
  manualContext: string;
  onManualContextChange: (ctx: string) => void;
  onGranolaContext?: (ctx: string) => void;
}

export function GranolaContext({
  manualContext,
  onManualContextChange,
  onGranolaContext,
}: GranolaContextProps) {
  const [loading, setLoading] = useState(false);
  const [granolaData, setGranolaData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchGranola() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/granola", { method: "POST" });
      const data = await res.json();
      if (!data.available) {
        setError(data.error || "Granola não disponível");
        return;
      }
      const meetings = data.meetings;
      if (!meetings || (Array.isArray(meetings) && meetings.length === 0)) {
        setError("Nenhuma reunião encontrada nos últimos 7 dias.");
        return;
      }
      const summary = JSON.stringify(meetings, null, 2);
      setGranolaData(summary);
      onGranolaContext?.(summary);
    } catch {
      setError("Falha ao conectar com Granola.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h4 className="text-sm font-medium text-slate-300 flex items-center gap-1.5 mb-3">
        <BookOpen className="h-4 w-4 text-blue-400" />
        Contexto da Semana
      </h4>

      <div className="space-y-3">
        {/* Manual context - always visible and prominent */}
        <textarea
          value={manualContext}
          onChange={(e) => onManualContextChange(e.target.value)}
          placeholder="Descreva o que aconteceu na sua semana: decisões tomadas, situações vividas, conversas com filhos, insights de reuniões..."
          rows={4}
          className="w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none resize-none"
        />

        {/* Granola import - optional */}
        <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Info className="h-3 w-3" />
              Importar contexto do Granola (opcional)
            </span>
            <button
              onClick={fetchGranola}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-md bg-blue-600/20 px-3 py-1.5 text-xs font-medium text-blue-400 hover:bg-blue-600/30 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Importando..." : "Importar do Granola"}
            </button>
          </div>

          {error && (
            <div className="flex items-start gap-2 mt-2 text-xs text-amber-400">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {granolaData && (
            <div className="mt-2 rounded border border-blue-500/30 bg-blue-500/10 p-2 text-xs text-blue-300 max-h-28 overflow-y-auto">
              <p className="font-medium mb-1">Reuniões importadas:</p>
              <pre className="whitespace-pre-wrap text-slate-400">{granolaData}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
