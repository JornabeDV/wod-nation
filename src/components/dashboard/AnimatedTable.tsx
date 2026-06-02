"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Column<T> {
  key: string;
  header: string;
  width?: string;
  cell: (row: T) => ReactNode;
}

interface AnimatedTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  className?: string;
}

export function AnimatedTable<T extends { id: string }>({
  columns,
  data,
  emptyMessage = "No data found.",
  className,
}: AnimatedTableProps<T>) {
  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl border border-border bg-surface-raised p-12 text-center"
      >
        <p className="text-text-secondary">{emptyMessage}</p>
      </motion.div>
    );
  }

  return (
    <div className={cn("rounded-xl border border-border bg-surface-raised overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider"
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  "border-b border-border/50 transition-colors hover:bg-surface-elevated/50",
                  i === data.length - 1 && "border-b-0"
                )}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    {col.cell(row)}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
