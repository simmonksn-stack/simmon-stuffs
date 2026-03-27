export type ContentPillar =
  | "Produto & Execução"
  | "Operador & Bastidores"
  | "Bastidores de Empresa"
  | "Pai & Família"
  | "Líder & Liderança";

export const PILLARS: ContentPillar[] = [
  "Produto & Execução",
  "Operador & Bastidores",
  "Bastidores de Empresa",
  "Pai & Família",
  "Líder & Liderança",
];

export interface Post {
  id: string;
  title: string;
  url: string;
  date: string;
  pillar: ContentPillar;
  impressions: number;
  members_reached: number;
  followers_gained: number;
  reactions: number;
  comments: number;
  reposts: number;
  saves: number;
  sends: number;
  profile_viewers: number | null;
  score: number | null;
  created_at: string;
}

export interface BoardSettings {
  current_followers: number;
  target_followers: number;
  target_date: string;
}

export interface LineupItem {
  id: string;
  dia: string;
  pilar: ContentPillar;
  tema: string;
  hook: string;
  estrutura: string[];
  timing: string;
  score_confianca: number;
  approved: boolean;
  draft: string | null;
}

export interface TrendingTopic {
  tema: string;
  relevancia: string;
  angulo: string;
}

export interface PillarTrending {
  pilar: string;
  temas: TrendingTopic[];
}

export interface ForecastPoint {
  month: string;
  conservative: number;
  base: number;
  aggressive: number;
}

export interface ForecastResult {
  points: ForecastPoint[];
  eta_conservative: string | null;
  eta_base: string | null;
  eta_aggressive: string | null;
  recommendation: string;
}

export interface PillarStats {
  pillar: ContentPillar;
  count: number;
  avg_score: number;
  avg_impressions: number;
  avg_followers_gained: number;
  total_followers_gained: number;
}
