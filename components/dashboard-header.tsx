"use client";

import type { Post, WeeklySnapshot } from "@/lib/types";
import { KpiCard } from "./kpi-card";
import { formatNumber } from "@/lib/utils";
import { Users, FileText, Heart, Sparkles } from "lucide-react";

interface DashboardHeaderProps {
  posts: Post[];
  weekly: WeeklySnapshot[];
}

export function DashboardHeader({ posts, weekly }: DashboardHeaderProps) {
  const latestWeek = weekly.length > 0 ? weekly[weekly.length - 1] : null;
  const prevWeek = weekly.length > 1 ? weekly[weekly.length - 2] : null;

  const followers = latestWeek?.follower_count ?? 0;
  const followerChange = latestWeek && prevWeek
    ? ((latestWeek.follower_count - prevWeek.follower_count) / prevWeek.follower_count * 100).toFixed(1)
    : null;

  const avgLikes = posts.length > 0
    ? Math.round(posts.reduce((s, p) => s + p.likes, 0) / posts.length)
    : 0;

  const analyzedPosts = posts.filter((p) => p.analysis);
  const avgScore = analyzedPosts.length > 0
    ? (analyzedPosts.reduce((s, p) => s + (p.analysis?.overall_score ?? 0), 0) / analyzedPosts.length).toFixed(1)
    : "—";

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      <KpiCard
        title="Followers"
        value={formatNumber(followers)}
        change={followerChange ? `${followerChange}%` : undefined}
        trend={
          followerChange
            ? Number(followerChange) > 0
              ? "up"
              : Number(followerChange) < 0
              ? "down"
              : "neutral"
            : undefined
        }
        icon={<Users className="h-5 w-5" />}
      />
      <KpiCard
        title="Posts"
        value={String(posts.length)}
        icon={<FileText className="h-5 w-5" />}
      />
      <KpiCard
        title="Avg Likes"
        value={formatNumber(avgLikes)}
        icon={<Heart className="h-5 w-5" />}
      />
      <KpiCard
        title="Avg Score"
        value={String(avgScore)}
        icon={<Sparkles className="h-5 w-5" />}
      />
    </div>
  );
}
