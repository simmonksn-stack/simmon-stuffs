import type { ContentPillar } from "./types";

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString("pt-BR");
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export function daysRemaining(targetDate: string): number {
  const now = new Date();
  const target = new Date(targetDate);
  const diff = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function progressPercent(current: number, start: number, target: number): number {
  if (target <= start) return 100;
  return Math.min(100, Math.max(0, ((current - start) / (target - start)) * 100));
}

const PILLAR_COLORS: Record<ContentPillar, { text: string; bg: string; chart: string }> = {
  "Produto & Execução": { text: "text-blue-400", bg: "bg-blue-500/20 text-blue-400", chart: "#60a5fa" },
  "Operador & Bastidores": { text: "text-purple-400", bg: "bg-purple-500/20 text-purple-400", chart: "#c084fc" },
  "Bastidores de Empresa": { text: "text-amber-400", bg: "bg-amber-500/20 text-amber-400", chart: "#fbbf24" },
  "Pai & Família": { text: "text-emerald-400", bg: "bg-emerald-500/20 text-emerald-400", chart: "#34d399" },
  "Líder & Liderança": { text: "text-cyan-400", bg: "bg-cyan-500/20 text-cyan-400", chart: "#22d3ee" },
};

export function pillarColor(pillar: string): string {
  return PILLAR_COLORS[pillar as ContentPillar]?.text ?? "text-slate-400";
}

export function pillarBgColor(pillar: string): string {
  return PILLAR_COLORS[pillar as ContentPillar]?.bg ?? "bg-slate-500/20 text-slate-400";
}

export function pillarChartColor(pillar: string): string {
  return PILLAR_COLORS[pillar as ContentPillar]?.chart ?? "#94a3b8";
}

export function scoreColor(score: number): string {
  if (score >= 7) return "text-emerald-400";
  if (score >= 4) return "text-amber-400";
  return "text-red-400";
}

export function scoreBgColor(score: number): string {
  if (score >= 7) return "bg-emerald-500/20 text-emerald-400";
  if (score >= 4) return "bg-amber-500/20 text-amber-400";
  return "bg-red-500/20 text-red-400";
}

export function statusIndicator(
  current: number,
  target: number,
  targetDate: string
): { emoji: string; label: string; color: string } {
  const days = daysRemaining(targetDate);
  const remaining = target - current;
  if (remaining <= 0) return { emoji: "🟢", label: "Meta atingida!", color: "text-emerald-400" };

  const dailyRate = remaining / Math.max(days, 1);
  // ~15 followers/post, 2 posts/week = ~4.3/day
  if (dailyRate <= 5) return { emoji: "🟢", label: "No caminho", color: "text-emerald-400" };
  if (dailyRate <= 8) return { emoji: "🟡", label: "Ligeiramente atrás", color: "text-amber-400" };
  return { emoji: "🔴", label: "Muito atrás", color: "text-red-400" };
}
