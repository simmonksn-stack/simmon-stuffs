"use client";

import { Trophy, TrendingDown, BarChart3, Users } from "lucide-react";
import { KpiCard } from "@/components/ui/kpi-card";
import type { Post } from "@/lib/types";

interface SummaryCardsProps {
  posts: Post[];
}

export function SummaryCards({ posts }: SummaryCardsProps) {
  if (posts.length === 0) return null;

  const scored = posts.filter((p) => p.score !== null);
  const avgScore = scored.length > 0
    ? scored.reduce((sum, p) => sum + (p.score ?? 0), 0) / scored.length
    : 0;

  const bestPost = scored.length > 0
    ? scored.reduce((best, p) => ((p.score ?? 0) > (best.score ?? 0) ? p : best))
    : null;

  const worstPost = scored.length > 0
    ? scored.reduce((worst, p) => ((p.score ?? 0) < (worst.score ?? 0) ? p : worst))
    : null;

  const totalFollowers = posts.reduce((sum, p) => sum + p.followers_gained, 0);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        label="Score médio"
        value={avgScore.toFixed(1)}
        icon={<BarChart3 className="h-4 w-4" />}
        subtitle={`${scored.length} posts avaliados`}
        color={avgScore >= 7 ? "text-emerald-400" : avgScore >= 4 ? "text-amber-400" : "text-red-400"}
      />
      <KpiCard
        label="Melhor post"
        value={bestPost ? `${bestPost.score?.toFixed(1)}` : "—"}
        icon={<Trophy className="h-4 w-4" />}
        subtitle={bestPost ? bestPost.title.substring(0, 30) : "Sem dados"}
        color="text-emerald-400"
      />
      <KpiCard
        label="Pior post"
        value={worstPost ? `${worstPost.score?.toFixed(1)}` : "—"}
        icon={<TrendingDown className="h-4 w-4" />}
        subtitle={worstPost ? worstPost.title.substring(0, 30) : "Sem dados"}
        color="text-red-400"
      />
      <KpiCard
        label="Total followers ganhos"
        value={`+${totalFollowers}`}
        icon={<Users className="h-4 w-4" />}
        subtitle={`${posts.length} posts`}
        color="text-blue-400"
      />
    </div>
  );
}
