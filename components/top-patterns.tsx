"use client";

import type { Post } from "@/lib/types";
import { TrendingUp, Sparkles } from "lucide-react";

interface TopPatternsProps {
  posts: Post[];
}

interface Pattern {
  label: string;
  detail: string;
  impact: string;
}

function identifyPatterns(posts: Post[]): Pattern[] {
  const patterns: Pattern[] = [];

  if (posts.length < 2) return patterns;

  // Check image vs no-image performance
  const withImage = posts.filter((p) => p.image_attached);
  const withoutImage = posts.filter((p) => !p.image_attached);
  if (withImage.length > 0 && withoutImage.length > 0) {
    const avgWithImg = withImage.reduce((s, p) => s + p.likes, 0) / withImage.length;
    const avgWithout = withoutImage.reduce((s, p) => s + p.likes, 0) / withoutImage.length;
    if (avgWithImg > avgWithout * 1.2) {
      patterns.push({
        label: "Posts com imagem",
        detail: `performam ${Math.round(((avgWithImg / avgWithout) - 1) * 100)}% melhor em likes`,
        impact: "positivo",
      });
    } else if (avgWithout > avgWithImg * 1.2) {
      patterns.push({
        label: "Posts sem imagem",
        detail: `performam ${Math.round(((avgWithout / avgWithImg) - 1) * 100)}% melhor — texto puro está funcionando`,
        impact: "positivo",
      });
    }
  }

  // Check pillar performance
  const pillarAvgs: Record<string, { likes: number; count: number }> = {};
  for (const post of posts) {
    if (!pillarAvgs[post.pillar]) pillarAvgs[post.pillar] = { likes: 0, count: 0 };
    pillarAvgs[post.pillar].likes += post.likes;
    pillarAvgs[post.pillar].count += 1;
  }

  const avgByPillar = Object.entries(pillarAvgs)
    .map(([pillar, data]) => ({
      pillar,
      avg: data.likes / data.count,
    }))
    .sort((a, b) => b.avg - a.avg);

  if (avgByPillar.length >= 2) {
    const top = avgByPillar[0];
    const bottom = avgByPillar[avgByPillar.length - 1];
    if (top.avg > bottom.avg * 1.3) {
      patterns.push({
        label: `Pilar "${top.pillar}" é o top performer`,
        detail: `Média de ${Math.round(top.avg)} likes vs ${Math.round(bottom.avg)} de "${bottom.pillar}"`,
        impact: "positivo",
      });
    }
  }

  // Check post length patterns
  const avgLen = posts.reduce((s, p) => s + p.post_text.length, 0) / posts.length;
  const shortPosts = posts.filter((p) => p.post_text.length < avgLen);
  const longPosts = posts.filter((p) => p.post_text.length >= avgLen);

  if (shortPosts.length > 0 && longPosts.length > 0) {
    const avgShort = shortPosts.reduce((s, p) => s + p.likes + p.comments * 2, 0) / shortPosts.length;
    const avgLong = longPosts.reduce((s, p) => s + p.likes + p.comments * 2, 0) / longPosts.length;

    if (avgLong > avgShort * 1.2) {
      patterns.push({
        label: "Posts mais longos engajam mais",
        detail: "Textos detalhados com narrativa geram mais interação",
        impact: "positivo",
      });
    } else if (avgShort > avgLong * 1.2) {
      patterns.push({
        label: "Posts curtos e diretos engajam mais",
        detail: "Considere manter textos concisos e impactantes",
        impact: "positivo",
      });
    }
  }

  // Check question pattern
  const withQuestion = posts.filter((p) => p.post_text.includes("?"));
  const withoutQuestion = posts.filter((p) => !p.post_text.includes("?"));
  if (withQuestion.length > 0 && withoutQuestion.length > 0) {
    const avgQ = withQuestion.reduce((s, p) => s + p.comments, 0) / withQuestion.length;
    const avgNoQ = withoutQuestion.reduce((s, p) => s + p.comments, 0) / withoutQuestion.length;
    if (avgQ > avgNoQ * 1.2) {
      patterns.push({
        label: "Posts com pergunta geram mais comentários",
        detail: `+${Math.round(((avgQ / avgNoQ) - 1) * 100)}% em comentários quando há pergunta`,
        impact: "positivo",
      });
    }
  }

  // AI score patterns
  const analyzed = posts.filter((p) => p.analysis);
  if (analyzed.length >= 2) {
    const highScore = analyzed.filter((p) => p.analysis!.overall_score >= 8);
    const lowScore = analyzed.filter((p) => p.analysis!.overall_score < 7);
    if (highScore.length > 0 && lowScore.length > 0) {
      const avgHighLikes = highScore.reduce((s, p) => s + p.likes, 0) / highScore.length;
      const avgLowLikes = lowScore.reduce((s, p) => s + p.likes, 0) / lowScore.length;
      if (avgHighLikes > avgLowLikes) {
        patterns.push({
          label: "Score AI alto = mais likes",
          detail: `Posts com score ≥8 têm média de ${Math.round(avgHighLikes)} likes vs ${Math.round(avgLowLikes)}`,
          impact: "positivo",
        });
      }
    }
  }

  return patterns.slice(0, 5);
}

export function TopPatterns({ posts }: TopPatternsProps) {
  const patterns = identifyPatterns(posts);

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 sm:p-6">
      <h3 className="mb-4 flex items-center gap-2 font-bold tracking-tight">
        <Sparkles className="h-4 w-4 text-blue-400" />
        Padrões Identificados
      </h3>
      {patterns.length === 0 ? (
        <p className="text-sm text-slate-500">
          Adicione mais posts para identificar padrões.
        </p>
      ) : (
        <ul className="space-y-3">
          {patterns.map((pattern, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              <div>
                <span className="font-medium text-slate-200">
                  {pattern.label}
                </span>
                <p className="text-slate-400">{pattern.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
