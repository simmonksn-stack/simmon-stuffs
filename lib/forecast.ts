import type { WeeklySnapshot, ForecastPoint, ForecastResult } from "./types";

function linearRegression(points: { x: number; y: number }[]): {
  slope: number;
  intercept: number;
} {
  const n = points.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumXX += p.x * p.x;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

export function generateForecast(
  snapshots: WeeklySnapshot[],
  goal: number = 20000
): ForecastResult {
  if (snapshots.length < 4) {
    return {
      points: snapshots.map((s) => ({
        week: s.week_start,
        optimistic: s.follower_count,
        base: s.follower_count,
        pessimistic: s.follower_count,
        actual: s.follower_count,
      })),
      eta_base: null,
      eta_optimistic: null,
      eta_pessimistic: null,
      insufficient_data: true,
    };
  }

  const sorted = [...snapshots].sort(
    (a, b) =>
      new Date(a.week_start).getTime() - new Date(b.week_start).getTime()
  );

  const baseDate = new Date(sorted[0].week_start).getTime();
  const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

  const regressionPoints = sorted.map((s) => ({
    x: (new Date(s.week_start).getTime() - baseDate) / WEEK_MS,
    y: s.follower_count,
  }));

  const { slope, intercept } = linearRegression(regressionPoints);

  const actualPoints: ForecastPoint[] = sorted.map((s) => ({
    week: s.week_start,
    optimistic: s.follower_count,
    base: s.follower_count,
    pessimistic: s.follower_count,
    actual: s.follower_count,
  }));

  const lastSnapshot = sorted[sorted.length - 1];
  const lastDate = new Date(lastSnapshot.week_start);
  const lastWeekIndex =
    (lastDate.getTime() - baseDate) / WEEK_MS;

  const forecastWeeks = 52;
  const forecastPoints: ForecastPoint[] = [];

  for (let i = 1; i <= forecastWeeks; i++) {
    const weekIndex = lastWeekIndex + i;
    const forecastDate = new Date(
      lastDate.getTime() + i * WEEK_MS
    );
    const weekStr = forecastDate.toISOString().split("T")[0];

    const baseValue = Math.round(intercept + slope * weekIndex);
    const optimisticValue = Math.round(
      intercept + slope * 1.2 * weekIndex
    );
    const pessimisticValue = Math.round(
      intercept + slope * 0.8 * weekIndex
    );

    forecastPoints.push({
      week: weekStr,
      base: Math.max(baseValue, lastSnapshot.follower_count),
      optimistic: Math.max(optimisticValue, lastSnapshot.follower_count),
      pessimistic: Math.max(pessimisticValue, lastSnapshot.follower_count),
    });
  }

  const allPoints = [...actualPoints, ...forecastPoints];

  const findEta = (scenario: "base" | "optimistic" | "pessimistic"): string | null => {
    for (const point of forecastPoints) {
      if (point[scenario] >= goal) {
        return point.week;
      }
    }
    return null;
  };

  return {
    points: allPoints,
    eta_base: findEta("base"),
    eta_optimistic: findEta("optimistic"),
    eta_pessimistic: findEta("pessimistic"),
    insufficient_data: false,
  };
}
