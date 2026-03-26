"use client";

import Link from "next/link";
import { FileQuestion } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  onAction?: () => void;
  actionLabel?: string;
}

export function EmptyState({
  title,
  description,
  ctaLabel,
  ctaHref,
  onAction,
  actionLabel,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/50 px-6 py-12 text-center">
      <FileQuestion className="mb-4 h-12 w-12 text-slate-600" />
      <h3 className="text-lg font-semibold text-slate-300">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      <div className="mt-4 flex gap-3">
        {ctaLabel && ctaHref && (
          <Link
            href={ctaHref}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
          >
            {ctaLabel}
          </Link>
        )}
        {onAction && actionLabel && (
          <button
            onClick={onAction}
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
