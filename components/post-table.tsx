"use client";

import { useState } from "react";
import type { Post } from "@/lib/types";
import { formatDateShort, truncateText, pillarBgColor, scoreColor, formatNumber } from "@/lib/utils";
import { PostAnalysisCard } from "./post-analysis-card";
import { ChevronDown, ChevronRight, Heart, MessageCircle, Eye, Loader2, Sparkles, Trash2 } from "lucide-react";

interface PostTableProps {
  posts: Post[];
  onAnalyze: (post: Post) => void;
  onDelete: (id: string) => void;
  analyzingId: string | null;
}

export function PostTable({ posts, onAnalyze, onDelete, analyzingId }: PostTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"date" | "likes" | "comments" | "impressions" | "score">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = [...posts].sort((a, b) => {
    const dir = sortDir === "desc" ? -1 : 1;
    switch (sortBy) {
      case "date":
        return dir * (new Date(a.date).getTime() - new Date(b.date).getTime());
      case "likes":
        return dir * (a.likes - b.likes);
      case "comments":
        return dir * (a.comments - b.comments);
      case "impressions":
        return dir * (a.impressions - b.impressions);
      case "score":
        return dir * ((a.analysis?.overall_score ?? 0) - (b.analysis?.overall_score ?? 0));
      default:
        return 0;
    }
  });

  function toggleSort(col: typeof sortBy) {
    if (sortBy === col) {
      setSortDir(sortDir === "desc" ? "asc" : "desc");
    } else {
      setSortBy(col);
      setSortDir("desc");
    }
  }

  function SortHeader({ col, label }: { col: typeof sortBy; label: string }) {
    return (
      <button
        onClick={() => toggleSort(col)}
        className={`text-left text-xs font-medium uppercase tracking-wider ${
          sortBy === col ? "text-blue-400" : "text-slate-500"
        }`}
      >
        {label} {sortBy === col && (sortDir === "desc" ? "↓" : "↑")}
      </button>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-900">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800">
            <th className="w-8 px-3 py-3"></th>
            <th className="px-3 py-3 text-left">
              <SortHeader col="date" label="Data" />
            </th>
            <th className="hidden px-3 py-3 text-left sm:table-cell">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Preview</span>
            </th>
            <th className="px-3 py-3 text-left">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Pilar</span>
            </th>
            <th className="px-3 py-3 text-right">
              <SortHeader col="likes" label="♥" />
            </th>
            <th className="hidden px-3 py-3 text-right sm:table-cell">
              <SortHeader col="comments" label="💬" />
            </th>
            <th className="hidden px-3 py-3 text-right md:table-cell">
              <SortHeader col="impressions" label="👁" />
            </th>
            <th className="px-3 py-3 text-right">
              <SortHeader col="score" label="Score" />
            </th>
            <th className="w-20 px-3 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((post) => {
            const isExpanded = expandedId === post.id;
            return (
              <tr key={post.id} className="group border-b border-slate-800/50">
                <td className="px-3 py-3">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : post.id)}
                    className="text-slate-500 hover:text-slate-300"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                </td>
                <td className="whitespace-nowrap px-3 py-3 font-mono text-xs text-slate-400">
                  {formatDateShort(post.date)}
                </td>
                <td className="hidden max-w-xs px-3 py-3 sm:table-cell">
                  <span className="text-slate-300">
                    {truncateText(post.post_text, 60)}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${pillarBgColor(post.pillar)}`}>
                    {post.pillar}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-right font-mono tabular-nums text-slate-300">
                  {formatNumber(post.likes)}
                </td>
                <td className="hidden whitespace-nowrap px-3 py-3 text-right font-mono tabular-nums text-slate-300 sm:table-cell">
                  {formatNumber(post.comments)}
                </td>
                <td className="hidden whitespace-nowrap px-3 py-3 text-right font-mono tabular-nums text-slate-300 md:table-cell">
                  {formatNumber(post.impressions)}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-right">
                  {post.analysis ? (
                    <span className={`font-mono font-bold ${scoreColor(post.analysis.overall_score)}`}>
                      {post.analysis.overall_score}
                    </span>
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {!post.analysis && (
                      <button
                        onClick={() => onAnalyze(post)}
                        disabled={analyzingId === post.id}
                        className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-blue-400 disabled:opacity-50"
                        title="Analisar com AI"
                      >
                        {analyzingId === post.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(post.id)}
                      className="rounded p-1 text-slate-600 transition-colors hover:bg-slate-800 hover:text-red-400"
                      title="Deletar post"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
                {isExpanded && (
                  <td colSpan={9} className="px-3 py-3">
                    {post.analysis ? (
                      <PostAnalysisCard analysis={post.analysis} />
                    ) : (
                      <div className="rounded-lg border border-dashed border-slate-700 p-4 text-center text-sm text-slate-500">
                        Post ainda não analisado.{" "}
                        <button
                          onClick={() => onAnalyze(post)}
                          disabled={analyzingId === post.id}
                          className="text-blue-400 hover:underline disabled:opacity-50"
                        >
                          {analyzingId === post.id ? "Analisando..." : "Analisar agora"}
                        </button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
