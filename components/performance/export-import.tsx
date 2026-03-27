"use client";

import { Download, Upload } from "lucide-react";
import { exportAllData, importAllData } from "@/lib/storage";

interface ExportImportProps {
  onImport: () => void;
}

export function ExportImport({ onImport }: ExportImportProps) {
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

  function handleImport() {
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

  return (
    <div className="flex gap-2">
      <button
        onClick={handleExport}
        className="flex items-center gap-1.5 rounded-md border border-slate-600 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 transition-colors"
      >
        <Download className="h-3.5 w-3.5" />
        Exportar JSON
      </button>
      <button
        onClick={handleImport}
        className="flex items-center gap-1.5 rounded-md border border-slate-600 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 transition-colors"
      >
        <Upload className="h-3.5 w-3.5" />
        Importar JSON
      </button>
    </div>
  );
}
