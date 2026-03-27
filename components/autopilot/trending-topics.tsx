"use client";

import { useState } from "react";
import { Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { pillarBgColor } from "@/lib/utils";
import type { PillarTrending } from "@/lib/types";

interface TrendingTopicsProps {
  onTopicsLoaded?: (topics: PillarTrending[]) => void;
}

export function TrendingTopics({ onTopicsLoaded }: TrendingTopicsProps) {
  const [topics, setTopics] = useState<PillarTrending[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchTopics() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/trending", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao buscar trending topics");
        return;
      }
      const pilares = data.pilares ?? [];
      setTopics(pilares);
      onTopicsLoaded?.(pilares);
    } catch {
      setError("Falha na conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-amber-400" />
          Trending Topics
        </h4>
        <button
          onClick={fetchTopics}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-md bg-amber-600/20 px-3 py-1.5 text-xs font-medium text-amber-400 hover:bg-amber-600/30 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Buscando..." : "Buscar Trending Topics"}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400 mb-3">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {topics.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((pillar) => (
            <div key={pillar.pilar} className="rounded-lg border border-slate-700 bg-slate-900 p-3">
              <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium mb-2 ${pillarBgColor(pillar.pilar)}`}>
                {pillar.pilar}
              </span>
              <div className="space-y-2">
                {pillar.temas.map((t, i) => (
                  <div key={i} className="text-xs">
                    <p className="font-medium text-white">{t.tema}</p>
                    <p className="text-slate-500 mt-0.5">{t.angulo}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && topics.length === 0 && !error && (
        <p className="text-xs text-slate-500">
          Clique em &quot;Buscar Trending Topics&quot; para ver temas quentes dos seus pilares.
        </p>
      )}
    </div>
  );
}
