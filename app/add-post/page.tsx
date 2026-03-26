"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ContentPillar } from "@/lib/types";
import { ArrowLeft, Loader2, Check } from "lucide-react";
import Link from "next/link";

const PILLARS: ContentPillar[] = ["Execução", "Família", "Climate-tech"];

export default function AddPostPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    post_text: "",
    post_url: "",
    pillar: "Execução" as ContentPillar,
    likes: "",
    comments: "",
    reposts: "",
    impressions: "",
    image_attached: false,
  });

  function update(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.post_text.trim()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Erro ao salvar");

      setSuccess(true);
      setTimeout(() => router.push("/"), 1000);
    } catch {
      alert("Erro ao salvar post. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  if (success) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
          <Check className="h-8 w-8 text-emerald-400" />
        </div>
        <p className="text-lg font-medium text-emerald-400">Post salvo!</p>
        <p className="text-sm text-slate-500">Redirecionando ao dashboard...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/"
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold tracking-tight">Adicionar Post</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 sm:p-6">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-slate-500">
            Conteúdo
          </h2>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-slate-400">
                Texto do Post *
              </label>
              <textarea
                value={form.post_text}
                onChange={(e) => update("post_text", e.target.value)}
                required
                rows={8}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Cole o texto completo do post aqui..."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-slate-400">
                  Data de Publicação *
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => update("date", e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-400">
                  Pilar de Conteúdo *
                </label>
                <select
                  value={form.pillar}
                  onChange={(e) => update("pillar", e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {PILLARS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-400">
                URL do Post
              </label>
              <input
                type="url"
                value={form.post_url}
                onChange={(e) => update("post_url", e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="https://linkedin.com/..."
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-400">
              <input
                type="checkbox"
                checked={form.image_attached}
                onChange={(e) => update("image_attached", e.target.checked)}
                className="rounded border-slate-600 bg-slate-800"
              />
              Post tem imagem/carrossel
            </label>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 sm:p-6">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-slate-500">
            Métricas
          </h2>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm text-slate-400">Likes</label>
              <input
                type="number"
                min="0"
                value={form.likes}
                onChange={(e) => update("likes", e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">
                Comentários
              </label>
              <input
                type="number"
                min="0"
                value={form.comments}
                onChange={(e) => update("comments", e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">
                Reposts
              </label>
              <input
                type="number"
                min="0"
                value={form.reposts}
                onChange={(e) => update("reposts", e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">
                Impressões
              </label>
              <input
                type="number"
                min="0"
                value={form.impressions}
                onChange={(e) => update("impressions", e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link
            href="/"
            className="rounded-lg border border-slate-700 px-6 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving || !form.post_text.trim()}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Salvar Post
          </button>
        </div>
      </form>
    </div>
  );
}
