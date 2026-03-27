"use client";

import { useState } from "react";
import { Download, Upload, FileSpreadsheet, X, Check, AlertTriangle } from "lucide-react";
import { exportAllData, importAllData } from "@/lib/storage";
import { parseLinkedInXlsx } from "@/lib/xlsx-parser";
import type { Post, ContentPillar } from "@/lib/types";
import { PILLARS } from "@/lib/types";
import { pillarBgColor } from "@/lib/utils";

interface ExportImportProps {
  onImport: () => void;
  onAddPosts: (posts: Post[]) => void;
}

export function ExportImport({ onImport, onAddPosts }: ExportImportProps) {
  const [preview, setPreview] = useState<{ posts: Post[]; warnings: string[] } | null>(null);
  const [editingPosts, setEditingPosts] = useState<Post[]>([]);

  function handleExport() {
    const json = exportAllData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `linkedin-strategy-board-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleJsonImport() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          importAllData(ev.target?.result as string);
          onImport();
        } catch {
          alert("Erro ao importar arquivo. Verifique se é um JSON válido.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  function handleXlsxImport() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx,.xls,.csv";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const buffer = ev.target?.result as ArrayBuffer;
          const result = parseLinkedInXlsx(buffer);
          setPreview(result);
          setEditingPosts(result.posts);
        } catch (err) {
          alert(`Erro ao ler arquivo: ${err instanceof Error ? err.message : "formato inválido"}`);
        }
      };
      reader.readAsArrayBuffer(file);
    };
    input.click();
  }

  function handleConfirmImport() {
    if (editingPosts.length === 0) return;
    onAddPosts(editingPosts);
    setPreview(null);
    setEditingPosts([]);
  }

  function updatePostPillar(id: string, pillar: ContentPillar) {
    setEditingPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, pillar } : p))
    );
  }

  function removePost(id: string) {
    setEditingPosts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleXlsxImport}
          className="flex items-center gap-1.5 rounded-md bg-emerald-600/20 border border-emerald-600/30 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-600/30 transition-colors"
        >
          <FileSpreadsheet className="h-3.5 w-3.5" />
          Importar LinkedIn XLSX
        </button>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 rounded-md border border-slate-600 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          Exportar JSON
        </button>
        <button
          onClick={handleJsonImport}
          className="flex items-center gap-1.5 rounded-md border border-slate-600 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 transition-colors"
        >
          <Upload className="h-3.5 w-3.5" />
          Importar JSON
        </button>
      </div>

      {/* XLSX Preview Modal */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-xl border border-slate-700 bg-slate-800 shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4 shrink-0">
              <div>
                <h3 className="font-semibold text-white">
                  Importar LinkedIn Analytics
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {editingPosts.length} post{editingPosts.length !== 1 ? "s" : ""} encontrado{editingPosts.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button onClick={() => setPreview(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Warnings */}
            {preview.warnings.length > 0 && (
              <div className="border-b border-slate-700 px-6 py-3 shrink-0">
                {preview.warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-amber-400">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Table */}
            <div className="overflow-auto flex-1 px-6 py-4">
              {editingPosts.length === 0 ? (
                <p className="text-center text-sm text-slate-500 py-8">
                  Nenhum post encontrado no arquivo.
                </p>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-700 text-left">
                      <th className="pb-2 pr-3 font-medium text-slate-400">Data</th>
                      <th className="pb-2 pr-3 font-medium text-slate-400">Título</th>
                      <th className="pb-2 pr-3 font-medium text-slate-400">Pilar</th>
                      <th className="pb-2 pr-3 font-medium text-slate-400 text-right">Impr.</th>
                      <th className="pb-2 pr-3 font-medium text-slate-400 text-right">React.</th>
                      <th className="pb-2 pr-3 font-medium text-slate-400 text-right">Coment.</th>
                      <th className="pb-2 pr-3 font-medium text-slate-400 text-right">Saves</th>
                      <th className="pb-2 pr-3 font-medium text-slate-400 text-right">Sends</th>
                      <th className="pb-2 pr-3 font-medium text-slate-400 text-right">Follow.</th>
                      <th className="pb-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {editingPosts.map((post) => (
                      <tr key={post.id} className="border-b border-slate-800">
                        <td className="py-2 pr-3 font-mono text-slate-400">{post.date}</td>
                        <td className="py-2 pr-3 text-white max-w-[200px] truncate">{post.title}</td>
                        <td className="py-2 pr-3">
                          <select
                            value={post.pillar}
                            onChange={(e) => updatePostPillar(post.id, e.target.value as ContentPillar)}
                            className="rounded border border-slate-600 bg-slate-900 px-1.5 py-0.5 text-xs text-white"
                          >
                            {PILLARS.map((p) => (
                              <option key={p} value={p}>{p.split(" & ")[0]}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 pr-3 font-mono text-right">{post.impressions.toLocaleString()}</td>
                        <td className="py-2 pr-3 font-mono text-right">{post.reactions}</td>
                        <td className="py-2 pr-3 font-mono text-right">{post.comments}</td>
                        <td className="py-2 pr-3 font-mono text-right">{post.saves}</td>
                        <td className="py-2 pr-3 font-mono text-right">{post.sends}</td>
                        <td className="py-2 pr-3 font-mono text-right text-emerald-400">
                          {post.followers_gained > 0 ? `+${post.followers_gained}` : "—"}
                        </td>
                        <td className="py-2">
                          <button
                            onClick={() => removePost(post.id)}
                            className="text-slate-500 hover:text-red-400"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-slate-700 px-6 py-4 shrink-0">
              <p className="text-xs text-slate-500">
                Revise os pilares e remova posts que não deseja importar. Campos zerados podem ser editados depois.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPreview(null)}
                  className="rounded-md border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmImport}
                  disabled={editingPosts.length === 0}
                  className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 transition-colors disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                  Importar {editingPosts.length} post{editingPosts.length !== 1 ? "s" : ""}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
