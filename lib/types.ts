export interface PostAnalysis {
  hook_score: number;
  hook_analysis: string;
  structure_score: number;
  structure_analysis: string;
  tone_score: number;
  tone_analysis: string;
  engagement_score: number;
  engagement_analysis: string;
  pillar_alignment: number;
  overall_score: number;
  what_worked: string;
  what_to_improve: string;
  recommendation: string;
}

export type ContentPillar = "Execução" | "Família" | "Climate-tech";

export interface Post {
  id: string;
  date: string;
  post_text: string;
  post_url: string;
  pillar: ContentPillar;
  likes: number;
  comments: number;
  reposts: number;
  impressions: number;
  image_attached: boolean;
  analysis: PostAnalysis | null;
  created_at: string;
}

export interface WeeklySnapshot {
  id: string;
  week_start: string;
  follower_count: number;
  profile_views: number;
  search_appearances: number;
  created_at: string;
}

export interface ForecastPoint {
  week: string;
  optimistic: number;
  base: number;
  pessimistic: number;
  actual?: number;
}

export interface ForecastResult {
  points: ForecastPoint[];
  eta_base: string | null;
  eta_optimistic: string | null;
  eta_pessimistic: string | null;
  insufficient_data: boolean;
}

export interface PillarStats {
  pillar: ContentPillar;
  count: number;
  avg_likes: number;
  avg_comments: number;
  avg_impressions: number;
  avg_score: number;
  engagement_rate: number;
}
