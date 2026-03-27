"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { PILLARS } from "@/lib/types";
import type { Post, ContentPillar } from "@/lib/types";
import { generateId } from "@/lib/utils";

interface PostFormProps {
  onSubmit: (post: Post) => void;
}

export function PostForm({ onSubmit }: PostFormProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    url: "",
    date: new Date().toISOString().split("T")[0],
    pillar: PILLARS[0] as ContentPillar,
    impressions: "",
    members_reached: "",
    followers_gained: "",
    reactions: "",
    comments: "",
    reposts: "",
    saves: "",
    sends: "",
    profile_viewers: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const post: Post = {
      id: generateId(),
      title: form.title,
      url: form.url,
      date: form.date,
      pillar: form.pillar,
      impressions: Number(form.impressions) || 0,
      members_reached: Number(form.members_reached) || 0,
      followers_gained: Number(form.followers_gained) || 0,
      reactions: Number(form.reactions) || 0,
      comments: Number(form.comments) || 0,
      reposts: Number(form.reposts) || 0,
      saves: Number(form.saves) || 0,
      sends: Number(form.sends) || 0,
      profile_viewers: form.profile_viewers ? Number(form.profile_viewers) : null,
      score: null,
      created_at: new Date().toISOString(),
    };
    onSubmit(post);
    setForm({
      title: "",
      url: "",
      date: new Date().toISOString().split("T")[0],
      pillar: PILLARS[0],
      impressions: "",
      members_reached: "",
      followers_gained: "",
      reactions: "",
      comments: "",
      reposts: "",
      saves: "",
      sends: "",
      profile_viewers: "",
    });
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-dashed border-slate-600 px-4 py-3 text-sm text-slate-400 hover:border-blue-500 hover:text-blue-400 transition-colors w-full justify-center"
      >
        <Plus className="h-4 w-4" />
        Adicionar post
      </button>
    );
  }

  const inputClass =
    "w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-slate-700 bg-slate-900 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Novo post</h3>
        <button type="button" onClick={() => setOpen(false)} className="text-slate-400 hover:text-white">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <label className="block text-xs text-slate-400 mb-1">Título/Tema *</label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Ex: Avaliação de performance de 10 pessoas"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">URL do post *</label>
          <input
            required
            type="url"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="https://linkedin.com/posts/..."
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Data *</label>
          <input
            required
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Pilar *</label>
          <select
            value={form.pillar}
            onChange={(e) => setForm({ ...form, pillar: e.target.value as ContentPillar })}
            className={inputClass}
          >
            {PILLARS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Impressions *</label>
          <input
            required
            type="number"
            value={form.impressions}
            onChange={(e) => setForm({ ...form, impressions: e.target.value })}
            placeholder="0"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Members reached *</label>
          <input
            required
            type="number"
            value={form.members_reached}
            onChange={(e) => setForm({ ...form, members_reached: e.target.value })}
            placeholder="0"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Followers gained *</label>
          <input
            required
            type="number"
            value={form.followers_gained}
            onChange={(e) => setForm({ ...form, followers_gained: e.target.value })}
            placeholder="0"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Reactions *</label>
          <input
            required
            type="number"
            value={form.reactions}
            onChange={(e) => setForm({ ...form, reactions: e.target.value })}
            placeholder="0"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Comments *</label>
          <input
            required
            type="number"
            value={form.comments}
            onChange={(e) => setForm({ ...form, comments: e.target.value })}
            placeholder="0"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Reposts *</label>
          <input
            required
            type="number"
            value={form.reposts}
            onChange={(e) => setForm({ ...form, reposts: e.target.value })}
            placeholder="0"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Saves *</label>
          <input
            required
            type="number"
            value={form.saves}
            onChange={(e) => setForm({ ...form, saves: e.target.value })}
            placeholder="0"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Sends *</label>
          <input
            required
            type="number"
            value={form.sends}
            onChange={(e) => setForm({ ...form, sends: e.target.value })}
            placeholder="0"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Profile viewers</label>
          <input
            type="number"
            value={form.profile_viewers}
            onChange={(e) => setForm({ ...form, profile_viewers: e.target.value })}
            placeholder="Opcional"
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
        >
          Salvar post
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
