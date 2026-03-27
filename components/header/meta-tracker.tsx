"use client";

import { useState, useEffect } from "react";
import { Target, Calendar, TrendingUp } from "lucide-react";
import { getSettings, saveSettings } from "@/lib/storage";
import { daysRemaining, progressPercent, statusIndicator, formatNumber } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import type { BoardSettings } from "@/lib/types";

interface MetaTrackerProps {
  onSettingsChange?: (settings: BoardSettings) => void;
}

export function MetaTracker({ onSettingsChange }: MetaTrackerProps) {
  const [settings, setSettings] = useState<BoardSettings>({
    current_followers: 9475,
    target_followers: 20000,
    target_date: "2026-10-31",
  });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  function handleSave(updated: BoardSettings) {
    setSettings(updated);
    saveSettings(updated);
    setEditing(false);
    onSettingsChange?.(updated);
  }

  const progress = progressPercent(settings.current_followers, 9475, settings.target_followers);
  const days = daysRemaining(settings.target_date);
  const status = statusIndicator(settings.current_followers, settings.target_followers, settings.target_date);

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/80 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            LinkedIn Strategy Board
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Simmon Nam &middot; CPO @ Musa
          </p>
        </div>
        <StatusBadge emoji={status.emoji} label={status.label} color={status.color} />
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">
            <span className="font-mono font-semibold text-white">
              {formatNumber(settings.current_followers)}
            </span>{" "}
            followers
          </span>
          <span className="text-slate-400">
            Meta:{" "}
            <span className="font-mono font-semibold text-emerald-400">
              {formatNumber(settings.target_followers)}
            </span>
          </span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
          <span className="font-mono">{progress.toFixed(1)}% concluído</span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {days} dias restantes
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-4">
        <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm">
          <TrendingUp className="h-4 w-4 text-slate-400" />
          <span className="text-slate-400">Faltam</span>
          <span className="font-mono font-semibold text-white">
            {formatNumber(settings.target_followers - settings.current_followers)}
          </span>
          <span className="text-slate-400">followers</span>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className="flex items-center gap-1.5 rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
        >
          <Target className="h-4 w-4" />
          Editar meta
        </button>
      </div>

      {editing && (
        <EditForm settings={settings} onSave={handleSave} onCancel={() => setEditing(false)} />
      )}
    </div>
  );
}

function EditForm({
  settings,
  onSave,
  onCancel,
}: {
  settings: BoardSettings;
  onSave: (s: BoardSettings) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(settings);

  return (
    <div className="mt-4 grid gap-3 rounded-lg border border-slate-700 bg-slate-900 p-4 sm:grid-cols-3">
      <div>
        <label className="block text-xs text-slate-400 mb-1">Followers atuais</label>
        <input
          type="number"
          value={form.current_followers}
          onChange={(e) => setForm({ ...form, current_followers: Number(e.target.value) })}
          className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 font-mono text-sm text-white focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-xs text-slate-400 mb-1">Meta de followers</label>
        <input
          type="number"
          value={form.target_followers}
          onChange={(e) => setForm({ ...form, target_followers: Number(e.target.value) })}
          className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 font-mono text-sm text-white focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-xs text-slate-400 mb-1">Data meta</label>
        <input
          type="date"
          value={form.target_date}
          onChange={(e) => setForm({ ...form, target_date: e.target.value })}
          className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div className="flex gap-2 sm:col-span-3">
        <button
          onClick={() => onSave(form)}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 transition-colors"
        >
          Salvar
        </button>
        <button
          onClick={onCancel}
          className="rounded-md border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
