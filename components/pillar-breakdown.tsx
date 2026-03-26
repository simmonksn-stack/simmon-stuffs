"use client";

import type { Post, PillarStats, ContentPillar } from "@/lib/types";
import { pillarBgColor, scoreColor, formatNumber } from "@/lib/utils";

interface PillarBreakdownProps {
  posts: Post[];
}

function computeStats(posts: Post[]): PillarStats[] {
  const pillars: ContentPillar[] = ["Execução", "Família", "Climate-tech"];

  return pillars.map((pillar) => {
    const pillarPosts = posts.filter((p) => p.pillar === pillar);
    const count = pillarPosts.length;
    if (count === 0) {
      return {
        pillar,
        count: 0,
        avg_likes: 0,
        avg_comments: 0,
        avg_impressions: 0,
        avg_score: 0,
        engagement_rate: 0,
      };
    }

    const totalLikes = pillarPosts.reduce((s, p) => s + p.likes, 0);
    const totalComments = pillarPosts.reduce((s, p) => s + p.comments, 0);
    const totalImpressions = pillarPosts.reduce((s, p) => s + p.impressions, 0);
    const scores = pillarPosts
      .filter((p) => p.analysis)
      .map((p) => p.analysis!.overall_score);
    const avgScore = scores.length > 0
      ? scores.reduce((s, v) => s + v, 0) / scores.length
      : 0;

    const engagementRate = totalImpressions > 0
      ? ((totalLikes + totalComments * 2) / totalImpressions) * 100
      : 0;

    return {
      pillar,
      count,
      avg_likes: Math.round(totalLikes / count),
      avg_comments: Math.round(totalComments / count),
      avg_impressions: Math.round(totalImpressions / count),
      avg_score: Number(avgScore.toFixed(1)),
      engagement_rate: Number(engagementRate.toFixed(1)),
    };
  });
}

export function PillarBreakdown({ posts }: PillarBreakdownProps) {
  const stats = computeStats(posts);
  const maxEngagement = Math.max(...stats.map((s) => s.engagement_rate), 1);

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 sm:p-6">
      <h3 className="mb-4 font-bold tracking-tight">Performance por Pilar</h3>
      <div className="space-y-4">
        {stats.map((s) => (
          <div key={s.pillar} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${pillarBgColor(s.pillar)}`}>
                {s.pillar}
              </span>
              <span className="font-mono text-xs text-slate-400">
                {s.count} post{s.count !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full rounded-full transition-all ${
                  s.pillar === "Execução"
                    ? "bg-blue-500"
                    : s.pillar === "Família"
                    ? "bg-emerald-500"
                    : "bg-amber-500"
                }`}
                style={{
                  width: `${(s.engagement_rate / maxEngagement) * 100}%`,
                }}
              />
            </div>
            <div className="flex gap-4 text-xs text-slate-500">
              <span>Eng: {s.engagement_rate}%</span>
              <span>Avg ♥ {formatNumber(s.avg_likes)}</span>
              <span>Avg 💬 {formatNumber(s.avg_comments)}</span>
              {s.avg_score > 0 && (
                <span className={scoreColor(s.avg_score)}>
                  Score: {s.avg_score}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
