"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Check } from "lucide-react";
import Link from "next/link";

export default function WeeklyUpdatePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Default to Monday of current week
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

  const [form, setForm] = useState({
    week_start: monday.toISOString().split("T")[0],
    follower_count: "",
    profile_views: "",
    search_appearances: "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.follower_count) return;

    setSaving(true);
    try {
      const res = await fetch("/api/weekly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Erro ao salvar");

      setSuccess(true);
      setTimeout(() => router.push("/"), 1000);
    } catch {
      alert("Erro ao salvar dados semanais. Tente novamente.");
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
        <p className="text-lg font-medium text-emerald-400">Dados salvos!</p>
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
        <h1 className="text-xl font-bold tracking-tight">Update Semanal</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 sm:p-6">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-slate-500">
            Dados da Semana
          </h2>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-slate-400">
                Início da Semana *
              </label>
              <input
                type="date"
                value={form.week_start}
                onChange={(e) => update("week_start", e.target.value)}
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm text-slate-400">
                  Total de Followers *
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.follower_count}
                  onChange={(e) => update("follower_count", e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="ex: 12500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-400">
                  Views do Perfil
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.profile_views}
                  onChange={(e) => update("profile_views", e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-400">
                  Aparições em Busca
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.search_appearances}
                  onChange={(e) => update("search_appearances", e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
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
            disabled={saving || !form.follower_count}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Salvar Update
          </button>
        </div>
      </form>
    </div>
  );
}
