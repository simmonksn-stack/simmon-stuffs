"use client";

import { useEffect, useState, useCallback } from "react";
import type { Post, WeeklySnapshot } from "@/lib/types";
import { DashboardHeader } from "@/components/dashboard-header";
import { FollowerForecast } from "@/components/follower-forecast";
import { PostTable } from "@/components/post-table";
import { PillarBreakdown } from "@/components/pillar-breakdown";
import { TopPatterns } from "@/components/top-patterns";
import { WeeklyTrends } from "@/components/weekly-trends";
import { EmptyState } from "@/components/empty-state";
import { Loader2, AlertTriangle, Database } from "lucide-react";
import seedData from "@/data/seed.json";

export default function DashboardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [weekly, setWeekly] = useState<WeeklySnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [storageWarning, setStorageWarning] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [postsRes, weeklyRes, healthRes] = await Promise.all([
        fetch("/api/posts"),
        fetch("/api/weekly"),
        fetch("/api/health"),
      ]);

      const postsData = await postsRes.json();
      const weeklyData = await weeklyRes.json();
      const healthData = await healthRes.json();

      setPosts(postsData.posts || []);
      setWeekly(weeklyData.weekly || []);
      setStorageWarning(healthData.storage === "memory");
    } catch (err) {
      setError("Erro ao carregar dados. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleLoadSeed() {
    try {
      setLoading(true);
      await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seed", data: seedData }),
      });
      await fetchData();
    } catch {
      setError("Erro ao carregar dados de demo.");
      setLoading(false);
    }
  }

  async function handleAnalyze(post: Post) {
    setAnalyzingId(post.id);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_text: post.post_text,
          pillar: post.pillar,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro na análise");
      }

      const { analysis } = await res.json();

      // Update post with analysis
      await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_analysis",
          id: post.id,
          analysis,
        }),
      });

      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, analysis } : p))
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      alert(`Erro ao analisar post: ${message}`);
    } finally {
      setAnalyzingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Deletar este post?")) return;
    try {
      await fetch(`/api/posts?id=${id}`, { method: "DELETE" });
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Erro ao deletar post.");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <AlertTriangle className="h-12 w-12 text-red-400" />
        <p className="text-red-400">{error}</p>
        <button
          onClick={() => {
            setError(null);
            setLoading(true);
            fetchData();
          }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  const isEmpty = posts.length === 0 && weekly.length === 0;

  return (
    <div className="space-y-6">
      {storageWarning && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-400">
          <Database className="h-4 w-4 shrink-0" />
          <span>
            Storage em memória — dados serão perdidos ao reiniciar. Configure
            BLOB_READ_WRITE_TOKEN para persistência.
          </span>
        </div>
      )}

      {isEmpty ? (
        <EmptyState
          title="Nenhum dado ainda"
          description="Adicione posts e dados semanais para começar a trackear sua performance no LinkedIn."
          ctaLabel="Adicionar Post"
          ctaHref="/add-post"
          onAction={handleLoadSeed}
          actionLabel="Carregar Dados Demo"
        />
      ) : (
        <>
          <DashboardHeader posts={posts} weekly={weekly} />

          <FollowerForecast weekly={weekly} />

          <div className="grid gap-6 lg:grid-cols-2">
            <PillarBreakdown posts={posts} />
            <TopPatterns posts={posts} />
          </div>

          {posts.length > 0 && (
            <div>
              <h3 className="mb-3 font-bold tracking-tight">Posts</h3>
              <PostTable
                posts={posts}
                onAnalyze={handleAnalyze}
                onDelete={handleDelete}
                analyzingId={analyzingId}
              />
            </div>
          )}

          <WeeklyTrends posts={posts} />
        </>
      )}
    </div>
  );
}
