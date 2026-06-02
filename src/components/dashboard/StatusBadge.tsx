"use client";

import { cn } from "@/lib/utils";

const variants = {
  draft: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  published: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  live: "bg-green-500/10 text-green-400 border-green-500/20",
  finished: "bg-text-muted/10 text-text-muted border-text-muted/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
  paid: "bg-green-500/10 text-green-400 border-green-500/20",
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  free: "bg-text-muted/10 text-text-muted border-text-muted/20",
};

export function StatusBadge({
  status,
  className,
}: {
  status: keyof typeof variants;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider",
        variants[status] || variants.draft,
        className
      )}
    >
      {status}
    </span>
  );
}
