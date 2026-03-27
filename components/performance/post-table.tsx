"use client";

import { useState } from "react";
import { ArrowUpDown, ExternalLink, Trash2 } from "lucide-react";
import type { Post } from "@/lib/types";
import { formatDate, formatNumber, pillarBgColor, scoreColor, truncateText } from "@/lib/utils";

type SortKey = "date" | "score" | "impressions" | "followers_gained";

interface PostTableProps {
  posts: Post[];
  onDelete: (id: string) => void;
}

export function PostTable({ posts, onDelete }: PostTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDesc, setSortDesc] = useState(true);

  if (posts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-700 p-8 text-center text-sm text-slate-500">
        Nenhum post cadastrado ainda. Adicione seu primeiro post acima.
      </div>
    );
  }

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDesc(!sortDesc);
    } else {
      setSortKey(key);
      setSortDesc(true);
    }
  }

  const sorted = [...posts].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case "date":
        cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case "score":
        cmp = (a.score ?? 0) - (b.score ?? 0);
        break;
      case "impressions":
        cmp = a.impressions - b.impressions;
        break;
      case "followers_gained":
        cmp = a.followers_gained - b.followers_gained;
        break;
    }
    return sortDesc ? -cmp : cmp;
  });

  const SortBtn = ({ label, field }: { label: string; field: SortKey }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-white transition-colors"
    >
      {label}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700 text-left">
            <th className="pb-2 pr-3"><SortBtn label="Data" field="date" /></th>
            <th className="pb-2 pr-3 text-xs font-medium text-slate-400">Título</th>
            <th className="pb-2 pr-3 text-xs font-medium text-slate-400">Pilar</th>
            <th className="pb-2 pr-3"><SortBtn label="Impressions" field="impressions" /></th>
            <th className="pb-2 pr-3"><SortBtn label="Followers" field="followers_gained" /></th>
            <th className="pb-2 pr-3 text-xs font-medium text-slate-400">React.</th>
            <th className="pb-2 pr-3 text-xs font-medium text-slate-400">Coment.</th>
            <th className="pb-2 pr-3 text-xs font-medium text-slate-400">Saves</th>
            <th className="pb-2 pr-3 text-xs font-medium text-slate-400">Sends</th>
            <th className="pb-2 pr-3"><SortBtn label="Score" field="score" /></th>
            <th className="pb-2 w-16"></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((post) => (
            <tr key={post.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
              <td className="py-2.5 pr-3 font-mono text-xs text-slate-400">{formatDate(post.date)}</td>
              <td className="py-2.5 pr-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-white">{truncateText(post.title, 35)}</span>
                  <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-400">
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </td>
              <td className="py-2.5 pr-3">
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${pillarBgColor(post.pillar)}`}>
                  {post.pillar.split(" & ")[0]}
                </span>
              </td>
              <td className="py-2.5 pr-3 font-mono text-xs">{formatNumber(post.impressions)}</td>
              <td className="py-2.5 pr-3 font-mono text-xs text-emerald-400">+{post.followers_gained}</td>
              <td className="py-2.5 pr-3 font-mono text-xs">{formatNumber(post.reactions)}</td>
              <td className="py-2.5 pr-3 font-mono text-xs">{post.comments}</td>
              <td className="py-2.5 pr-3 font-mono text-xs">{post.saves}</td>
              <td className="py-2.5 pr-3 font-mono text-xs">{post.sends}</td>
              <td className="py-2.5 pr-3">
                {post.score !== null ? (
                  <span className={`font-mono text-sm font-bold ${scoreColor(post.score)}`}>
                    {post.score.toFixed(1)}
                  </span>
                ) : (
                  <span className="text-xs text-slate-600">—</span>
                )}
              </td>
              <td className="py-2.5">
                <button
                  onClick={() => onDelete(post.id)}
                  className="rounded p-1 text-slate-500 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
