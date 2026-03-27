"use client";

import { useState } from "react";
import { Check, Pen, Loader2 } from "lucide-react";
import { pillarBgColor } from "@/lib/utils";
import type { LineupItem } from "@/lib/types";

interface LineupCardsProps {
  lineup: LineupItem[];
  onApprove: (id: string) => void;
  onWritePost: (item: LineupItem) => void;
}

export function LineupCards({ lineup, onApprove, onWritePost }: LineupCardsProps) {
  const pending = lineup.filter((l) => !l.approved);
  const approved = lineup.filter((l) => l.approved);

  if (lineup.length === 0) return null;

  return (
    <div className="space-y-4">
      {pending.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-slate-300 mb-3">
            Lineup sugerido ({pending.length} posts)
          </h4>
          <div className="grid gap-3 sm:grid-cols-2">
            {pending.map((item) => (
              <LineupCard key={item.id} item={item} onApprove={onApprove} onWritePost={onWritePost} />
            ))}
          </div>
        </div>
      )}

      {approved.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-emerald-400 mb-3">
            Aprovados ({approved.length})
          </h4>
          <div className="grid gap-3 sm:grid-cols-2">
            {approved.map((item) => (
              <LineupCard key={item.id} item={item} onApprove={onApprove} onWritePost={onWritePost} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LineupCard({
  item,
  onApprove,
  onWritePost,
}: {
  item: LineupItem;
  onApprove: (id: string) => void;
  onWritePost: (item: LineupItem) => void;
}) {
  return (
    <div className={`rounded-lg border p-4 ${item.approved ? "border-emerald-500/30 bg-emerald-500/5" : "border-slate-700 bg-slate-900"}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${pillarBgColor(item.pilar)}`}>
          {item.pilar.split(" & ")[0]}
        </span>
        <span className="text-xs text-slate-500">{item.dia}</span>
      </div>

      <h5 className="font-medium text-white text-sm mb-1">{item.tema}</h5>
      <p className="text-xs text-slate-400 italic mb-2">&quot;{item.hook}&quot;</p>

      <ul className="space-y-1 mb-3">
        {item.estrutura.map((e, i) => (
          <li key={i} className="text-xs text-slate-500 flex gap-1.5">
            <span className="text-slate-600">•</span>
            {e}
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-16 rounded-full bg-slate-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${(item.score_confianca / 10) * 100}%` }}
            />
          </div>
          <span className="text-xs text-slate-500 font-mono">{item.score_confianca}/10</span>
        </div>
        <div className="flex gap-1.5">
          {!item.approved && (
            <button
              onClick={() => onApprove(item.id)}
              className="flex items-center gap-1 rounded-md bg-emerald-600/20 px-2.5 py-1 text-xs text-emerald-400 hover:bg-emerald-600/30 transition-colors"
            >
              <Check className="h-3 w-3" />
              Aprovar
            </button>
          )}
          <button
            onClick={() => onWritePost(item)}
            className="flex items-center gap-1 rounded-md bg-blue-600/20 px-2.5 py-1 text-xs text-blue-400 hover:bg-blue-600/30 transition-colors"
          >
            <Pen className="h-3 w-3" />
            Escrever
          </button>
        </div>
      </div>

      {item.draft && (
        <div className="mt-3 rounded-md border border-slate-700 bg-slate-800 p-3">
          <p className="text-xs text-slate-300 whitespace-pre-wrap">{item.draft}</p>
        </div>
      )}
    </div>
  );
}
