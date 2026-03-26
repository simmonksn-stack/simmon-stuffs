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

export function getEngagementRate(
  likes: number,
  comments: number,
  reposts: number,
  impressions: number
): number {
  if (impressions === 0) return 0;
  return ((likes + comments * 2 + reposts * 3) / impressions) * 100;
}

export function getWeekString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function pillarColor(pillar: string): string {
  switch (pillar) {
    case "Execução":
      return "text-blue-400";
    case "Família":
      return "text-emerald-400";
    case "Climate-tech":
      return "text-amber-400";
    default:
      return "text-slate-400";
  }
}

export function pillarBgColor(pillar: string): string {
  switch (pillar) {
    case "Execução":
      return "bg-blue-500/20 text-blue-400";
    case "Família":
      return "bg-emerald-500/20 text-emerald-400";
    case "Climate-tech":
      return "bg-amber-500/20 text-amber-400";
    default:
      return "bg-slate-500/20 text-slate-400";
  }
}

export function scoreColor(score: number): string {
  if (score >= 8) return "text-emerald-400";
  if (score >= 6) return "text-amber-400";
  return "text-red-400";
}
