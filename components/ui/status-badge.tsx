"use client";

interface StatusBadgeProps {
  emoji: string;
  label: string;
  color: string;
}

export function StatusBadge({ emoji, label, color }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${color}`}>
      <span>{emoji}</span>
      <span>{label}</span>
    </span>
  );
}
