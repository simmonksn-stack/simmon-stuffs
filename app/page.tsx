"use client";

import { useEffect, useState, useCallback } from "react";
import type { Post, LineupItem, BoardSettings, PillarTrending, PillarStats } from "@/lib/types";
import { PILLARS } from "@/lib/types";
import { getPosts, savePosts, getSettings, getLineup, saveLineup, deletePost as storageDelete } from "@/lib/storage";
import { recalculateAllScores } from "@/lib/score";
import { generateForecast } from "@/lib/forecast";
import { generateId } from "@/lib/utils";

import { MetaTracker } from "@/components/header/meta-tracker";
import { Section } from "@/components/ui/section";
import { PostForm } from "@/components/performance/post-form";
import { PostTable } from "@/components/performance/post-table";
import { SummaryCards } from "@/components/performance/summary-cards";
import { PillarChart } from "@/components/performance/pillar-chart";
import { TrendCharts } from "@/components/performance/trend-charts";
import { ExportImport } from "@/components/performance/export-import";
import { TrendingTopics } from "@/components/autopilot/trending-topics";
import { GranolaContext } from "@/components/autopilot/granola-context";
import { LineupCards } from "@/components/autopilot/lineup-cards";
import { WritePostModal } from "@/components/autopilot/write-post-modal";
import { ForecastChart } from "@/components/forecast/forecast-chart";
import { ScenarioCards } from "@/components/forecast/scenario-cards";
import { CadenceRecommendation } from "@/components/forecast/cadence-recommendation";
import { MonthlyTable } from "@/components/forecast/monthly-table";

import { Loader2, Zap, RefreshCw } from "lucide-react";

export default function StrategyBoard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [settings, setSettings] = useState<BoardSettings | null>(null);
  const [lineup, setLineup] = useState<LineupItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Autopilot state
  const [manualContext, setManualContext] = useState("");
  const [granolaContext, setGranolaContext] = useState("");
  const [trendingTopics, setTrendingTopics] = useState<PillarTrending[]>([]);
  const [generatingLineup, setGeneratingLineup] = useState(false);
  const [lineupError, setLineupError] = useState<string | null>(null);
  const [writingItem, setWritingItem] = useState<LineupItem | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const loadedPosts = recalculateAllScores(getPosts());
    setPosts(loadedPosts);
    savePosts(loadedPosts);
    setSettings(getSettings());
    setLineup(getLineup());
    setLoaded(true);
  }, []);

  const reloadData = useCallback(() => {
    const loadedPosts = recalculateAllScores(getPosts());
    setPosts(loadedPosts);
    setSettings(getSettings());
    setLineup(getLineup());
  }, []);

  // Post handlers
  function handleAddPost(post: Post) {
    const updated = [post, ...posts];
    const scored = recalculateAllScores(updated);
    setPosts(scored);
    savePosts(scored);
  }

  function handleDeletePost(id: string) {
    if (!confirm("Deletar este post?")) return;
    storageDelete(id);
    const remaining = posts.filter((p) => p.id !== id);
    const scored = recalculateAllScores(remaining);
    setPosts(scored);
    savePosts(scored);
  }

  // Lineup handlers
  function getPillarPerformance(): Record<string, PillarStats> {
    const stats: Record<string, PillarStats> = {};
    for (const pillar of PILLARS) {
      const pp = posts.filter((p) => p.pillar === pillar);
      const scored = pp.filter((p) => p.score !== null);
      stats[pillar] = {
        pillar,
        count: pp.length,
        avg_score: scored.length > 0 ? scored.reduce((s, p) => s + (p.score ?? 0), 0) / scored.length : 0,
        avg_impressions: pp.length > 0 ? pp.reduce((s, p) => s + p.impressions, 0) / pp.length : 0,
        avg_followers_gained: pp.length > 0 ? pp.reduce((s, p) => s + p.followers_gained, 0) / pp.length : 0,
        total_followers_gained: pp.reduce((s, p) => s + p.followers_gained, 0),
      };
    }
    return stats;
  }

  async function handleGenerateLineup() {
    setGeneratingLineup(true);
    setLineupError(null);
    try {
      const res = await fetch("/api/lineup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pillar_performance: getPillarPerformance(),
          granola_context: granolaContext,
          manual_context: manualContext,
          trending_topics: trendingTopics,
          cadencia: 2,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLineupError(data.error || "Erro ao gerar lineup");
        return;
      }
      const items: LineupItem[] = (data.lineup ?? []).map((l: Record<string, unknown>) => ({
        id: generateId(),
        dia: l.dia as string,
        pilar: l.pilar as string,
        tema: l.tema as string,
        hook: l.hook as string,
        estrutura: l.estrutura as string[],
        timing: l.timing as string,
        score_confianca: l.score_confianca as number,
        approved: false,
        draft: null,
      }));
      setLineup(items);
      saveLineup(items);
    } catch {
      setLineupError("Falha na conexão. Tente novamente.");
    } finally {
      setGeneratingLineup(false);
    }
  }

  function handleApproveLineup(id: string) {
    const updated = lineup.map((l) => (l.id === id ? { ...l, approved: true } : l));
    setLineup(updated);
    saveLineup(updated);
  }

  function handleSaveDraft(id: string, draft: string) {
    const updated = lineup.map((l) => (l.id === id ? { ...l, draft } : l));
    setLineup(updated);
    saveLineup(updated);
  }

  if (!loaded) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const s = settings ?? { current_followers: 9475, target_followers: 20000, target_date: "2026-10-31" };
  const forecast = generateForecast(posts, s.current_followers, s.target_followers, s.target_date);

  return (
    <div className="space-y-6">
      {/* Header: Meta Tracker */}
      <MetaTracker onSettingsChange={(ns) => setSettings(ns)} />

      {/* Bloco 1: Performance Tracker */}
      <Section title="Performance Tracker" subtitle="Analytics de todos os posts com score de qualidade 0-10">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <PostForm onSubmit={handleAddPost} />
            <ExportImport onImport={reloadData} />
          </div>

          <SummaryCards posts={posts} />

          <PostTable posts={posts} onDelete={handleDeletePost} />

          <div className="grid gap-4 lg:grid-cols-2">
            <PillarChart posts={posts} />
            <TrendCharts posts={posts} />
          </div>
        </div>
      </Section>

      {/* Bloco 2: Content Autopilot */}
      <Section title="Content Autopilot" subtitle="Lineup de conteúdo semanal baseado em contexto real + trending topics">
        <div className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-2">
            <GranolaContext
              manualContext={manualContext}
              onManualContextChange={setManualContext}
              onGranolaContext={setGranolaContext}
            />
            <TrendingTopics onTopicsLoaded={setTrendingTopics} />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerateLineup}
              disabled={generatingLineup}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:from-blue-500 hover:to-purple-500 transition-all disabled:opacity-50"
            >
              {generatingLineup ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Gerando lineup...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Gerar Lineup Semanal
                </>
              )}
            </button>
            {lineupError && (
              <span className="text-sm text-red-400">{lineupError}</span>
            )}
          </div>

          <LineupCards
            lineup={lineup}
            onApprove={handleApproveLineup}
            onWritePost={setWritingItem}
          />
        </div>
      </Section>

      {/* Bloco 3: Forecast Engine */}
      <Section title="Forecast Engine" subtitle="Projeção de quando você chega a 20k followers">
        <div className="space-y-4">
          <ScenarioCards forecast={forecast} />
          <ForecastChart forecast={forecast} target={s.target_followers} />
          <CadenceRecommendation recommendation={forecast.recommendation} />
          <MonthlyTable points={forecast.points} target={s.target_followers} />
        </div>
      </Section>

      {/* Write Post Modal */}
      {writingItem && (
        <WritePostModal
          item={writingItem}
          onClose={() => setWritingItem(null)}
          onSaveDraft={handleSaveDraft}
        />
      )}
    </div>
  );
}
