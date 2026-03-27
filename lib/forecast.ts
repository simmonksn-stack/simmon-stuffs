import type { Post, ForecastPoint, ForecastResult } from "./types";

function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (idx - lower);
}

function average(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function generateForecast(
  posts: Post[],
  currentFollowers: number,
  target: number,
  targetDate: string
): ForecastResult {
  const followersPerPost = posts.length > 0
    ? posts.map((p) => p.followers_gained)
    : [15]; // default when no data

  const fppConservative = posts.length > 0 ? percentile(followersPerPost, 25) : 10;
  const fppBase = posts.length > 0 ? average(followersPerPost) : 15;
  const fppAggressive = posts.length > 0 ? percentile(followersPerPost, 75) : 25;

  const ORGANIC_RATE = 0.002; // 0.2% per week
  const targetDateObj = new Date(targetDate);
  const now = new Date();

  const points: ForecastPoint[] = [];
  let conservative = currentFollowers;
  let base = currentFollowers;
  let aggressive = currentFollowers;

  let etaConservative: string | null = null;
  let etaBase: string | null = null;
  let etaAggressive: string | null = null;

  // Project month by month (up to 24 months)
  for (let m = 0; m < 24; m++) {
    const monthDate = new Date(now);
    monthDate.setMonth(monthDate.getMonth() + m + 1);
    const weeksInMonth = 4.33;

    // Conservative: 1x/week
    const conservativeGrowth = fppConservative * 1 * weeksInMonth + conservative * ORGANIC_RATE * weeksInMonth;
    conservative += conservativeGrowth;

    // Base: 2x/week
    const baseGrowth = fppBase * 2 * weeksInMonth + base * ORGANIC_RATE * weeksInMonth;
    base += baseGrowth;

    // Aggressive: 3x/week
    const aggressiveGrowth = fppAggressive * 3 * weeksInMonth + aggressive * ORGANIC_RATE * weeksInMonth;
    aggressive += aggressiveGrowth;

    const monthStr = monthDate.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });

    points.push({
      month: monthStr,
      conservative: Math.round(conservative),
      base: Math.round(base),
      aggressive: Math.round(aggressive),
    });

    if (!etaConservative && conservative >= target) {
      etaConservative = monthStr;
    }
    if (!etaBase && base >= target) {
      etaBase = monthStr;
    }
    if (!etaAggressive && aggressive >= target) {
      etaAggressive = monthStr;
    }
  }

  // Recommendation logic
  let recommendation: string;
  const targetMonth = targetDateObj.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });

  if (etaBase && new Date(points.find((p) => p.month === etaBase)?.month ? targetDateObj : now) >= now) {
    // Check if base scenario reaches target before target date
    const baseReachMonth = points.findIndex((p) => p.base >= target);
    const targetReachMonth = points.findIndex((p) => {
      const d = new Date(now);
      d.setMonth(d.getMonth() + points.indexOf(p) + 1);
      return d >= targetDateObj;
    });

    if (baseReachMonth !== -1 && (targetReachMonth === -1 || baseReachMonth <= targetReachMonth)) {
      recommendation = "2x/semana é suficiente. Foque em qualidade.";
    } else if (etaAggressive) {
      const aggReachMonth = points.findIndex((p) => p.aggressive >= target);
      if (aggReachMonth !== -1 && (targetReachMonth === -1 || aggReachMonth <= targetReachMonth)) {
        recommendation = "Precisa de 3x/semana OU melhorar engajamento por post.";
      } else {
        recommendation = "Meta agressiva. Considere: (a) viral posts, (b) collabs, (c) ajustar meta.";
      }
    } else {
      recommendation = "Meta agressiva. Considere: (a) viral posts, (b) collabs, (c) ajustar meta.";
    }
  } else if (etaAggressive) {
    recommendation = "Precisa de 3x/semana OU melhorar engajamento por post.";
  } else {
    recommendation = "Meta agressiva. Considere: (a) viral posts, (b) collabs, (c) ajustar meta.";
  }

  return {
    points,
    eta_conservative: etaConservative,
    eta_base: etaBase,
    eta_aggressive: etaAggressive,
    recommendation,
  };
}
