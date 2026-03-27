import type { Post } from "./types";

export function getBenchmarkImpressions(posts: Post[]): number {
  if (posts.length === 0) return 10000;
  const sorted = [...posts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);
  const sum = sorted.reduce((acc, p) => acc + p.impressions, 0);
  return sum / sorted.length || 10000;
}

export function calculateScore(post: Post, benchmarkImpressions: number): number {
  if (post.impressions === 0) return 0;

  const conversionRate = post.followers_gained / post.impressions;
  const deepEngagement = post.comments / post.impressions;
  const perceivedValue = (post.saves + post.sends) / post.impressions;
  const lightEngagement = post.reactions / post.impressions;
  const reachScore = post.impressions / benchmarkImpressions;

  const rawScore =
    conversionRate * 30 +
    deepEngagement * 25 +
    perceivedValue * 25 +
    lightEngagement * 10 +
    reachScore * 10;

  // Normalization: calibrated so that the benchmark post (78k impressions,
  // 46 followers, 39 comments, 142 saves, 53 sends, 343 reactions) scores ~8.5
  const normalizationFactor = 85;
  const score = rawScore * normalizationFactor;

  return Math.min(10, Math.max(0, Math.round(score * 10) / 10));
}

export function recalculateAllScores(posts: Post[]): Post[] {
  const benchmark = getBenchmarkImpressions(posts);
  return posts.map((p) => ({
    ...p,
    score: calculateScore(p, benchmark),
  }));
}
