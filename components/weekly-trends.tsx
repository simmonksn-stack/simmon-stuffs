"use client";

import type { Post } from "@/lib/types";

interface WeeklyTrendsProps {
  posts: Post[];
}

export function WeeklyTrends({ posts }: WeeklyTrendsProps) {
  const analyzed = posts.filter((p) => p.analysis);

  if (analyzed.length < 2) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 sm:p-6">
        <h3 className="mb-4 font-bold tracking-tight">Recomendações Semanais</h3>
        <p className="text-sm text-slate-500">
          Analise pelo menos 2 posts para gerar recomendações consolidadas.
        </p>
      </div>
    );
  }

  // Generate recommendations from analyzed posts
  const recommendations: string[] = [];

  // Pillar distribution check
  const pillarCounts: Record<string, number> = {};
  for (const p of posts) {
    pillarCounts[p.pillar] = (pillarCounts[p.pillar] || 0) + 1;
  }

  const totalPosts = posts.length;
  const pillarPcts = Object.entries(pillarCounts).map(([pillar, count]) => ({
    pillar,
    pct: Math.round((count / totalPosts) * 100),
    count,
  }));

  // Find best performing pillar by engagement
  const pillarEngagement: Record<string, { total: number; count: number }> = {};
  for (const p of posts) {
    if (!pillarEngagement[p.pillar]) pillarEngagement[p.pillar] = { total: 0, count: 0 };
    pillarEngagement[p.pillar].total += p.likes + p.comments * 2;
    pillarEngagement[p.pillar].count += 1;
  }

  const bestPillar = Object.entries(pillarEngagement)
    .map(([pillar, data]) => ({ pillar, avg: data.total / data.count }))
    .sort((a, b) => b.avg - a.avg)[0];

  if (bestPillar) {
    const currentPct = pillarPcts.find((p) => p.pillar === bestPillar.pillar)?.pct ?? 0;
    if (currentPct < 45) {
      recommendations.push(
        `Seus posts de "${bestPillar.pillar}" têm o maior engajamento médio. Considere aumentar a frequência desse pilar (atualmente ${currentPct}% dos posts).`
      );
    }
  }

  // Score trend
  const sortedAnalyzed = [...analyzed].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const recentHalf = sortedAnalyzed.slice(Math.floor(sortedAnalyzed.length / 2));
  const olderHalf = sortedAnalyzed.slice(0, Math.floor(sortedAnalyzed.length / 2));

  if (recentHalf.length > 0 && olderHalf.length > 0) {
    const recentAvg =
      recentHalf.reduce((s, p) => s + (p.analysis?.overall_score ?? 0), 0) / recentHalf.length;
    const olderAvg =
      olderHalf.reduce((s, p) => s + (p.analysis?.overall_score ?? 0), 0) / olderHalf.length;

    if (recentAvg > olderAvg) {
      recommendations.push(
        `Qualidade em alta — score médio subiu de ${olderAvg.toFixed(1)} para ${recentAvg.toFixed(1)} nos posts mais recentes. Continue nessa direção.`
      );
    } else if (recentAvg < olderAvg - 0.5) {
      recommendations.push(
        `Score médio caiu de ${olderAvg.toFixed(1)} para ${recentAvg.toFixed(1)} nos posts recentes. Revise os ganchos e a estrutura narrativa.`
      );
    }
  }

  // Common weakness
  const weaknesses: Record<string, number> = {};
  for (const p of analyzed) {
    const a = p.analysis!;
    const scores = [
      { key: "gancho", score: a.hook_score },
      { key: "estrutura", score: a.structure_score },
      { key: "tom", score: a.tone_score },
      { key: "engajamento", score: a.engagement_score },
    ];
    const weakest = scores.sort((a, b) => a.score - b.score)[0];
    weaknesses[weakest.key] = (weaknesses[weakest.key] || 0) + 1;
  }

  const topWeakness = Object.entries(weaknesses).sort((a, b) => b[1] - a[1])[0];
  if (topWeakness) {
    const weaknessMap: Record<string, string> = {
      gancho: "Ganchos mais provocativos — teste começar com dado surpreendente ou pergunta direta.",
      estrutura: "Estrutura narrativa — garanta conflito > insight > takeaway em cada post.",
      tom: "Tom — mantenha a autenticidade, evite soar genérico ou corporativo.",
      engajamento: "Elementos de engajamento — inclua perguntas ou CTAs que convidem ao comentário.",
    };
    recommendations.push(
      `Ponto fraco mais comum: ${topWeakness[0]}. ${weaknessMap[topWeakness[0]] || "Foque em melhorar essa dimensão."}`
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "Continue postando com consistência. Os dados ainda estão se acumulando para gerar insights mais profundos."
    );
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 sm:p-6">
      <h3 className="mb-4 font-bold tracking-tight">Recomendações Semanais</h3>
      <div className="space-y-3">
        {recommendations.map((rec, i) => (
          <p key={i} className="text-sm leading-relaxed text-slate-300">
            {rec}
          </p>
        ))}
      </div>
    </div>
  );
}
