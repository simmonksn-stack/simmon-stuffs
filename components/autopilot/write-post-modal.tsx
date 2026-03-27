"use client";

import { useState } from "react";
import { X, Loader2, Copy, Check } from "lucide-react";
import type { LineupItem } from "@/lib/types";

interface WritePostModalProps {
  item: LineupItem;
  onClose: () => void;
  onSaveDraft: (id: string, draft: string) => void;
}

export function WritePostModal({ item, onClose, onSaveDraft }: WritePostModalProps) {
  const [draft, setDraft] = useState(item.draft ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function generateDraft() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/write-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tema: item.tema,
          pilar: item.pilar,
          hook: item.hook,
          estrutura: item.estrutura,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao gerar post");
        return;
      }
      setDraft(data.draft);
    } catch {
      setError("Falha na conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-slate-700 bg-slate-800 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
          <div>
            <h3 className="font-semibold text-white">Escrever Post</h3>
            <p className="text-xs text-slate-400 mt-0.5">{item.tema}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="rounded-lg border border-slate-700 bg-slate-900 p-3 text-xs text-slate-400">
            <p><strong className="text-slate-300">Hook:</strong> {item.hook}</p>
            <p className="mt-1"><strong className="text-slate-300">Estrutura:</strong> {item.estrutura.join(" → ")}</p>
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="O rascunho do post aparecerá aqui..."
            rows={12}
            className="w-full rounded-md border border-slate-600 bg-slate-900 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none resize-none"
          />

          <div className="flex items-center justify-between">
            <button
              onClick={generateDraft}
              disabled={loading}
              className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                "Gerar Rascunho com IA"
              )}
            </button>
            <div className="flex gap-2">
              {draft && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-md border border-slate-600 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copiado!" : "Copiar"}
                </button>
              )}
              <button
                onClick={() => {
                  onSaveDraft(item.id, draft);
                  onClose();
                }}
                disabled={!draft}
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 transition-colors disabled:opacity-50"
              >
                Salvar Rascunho
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
