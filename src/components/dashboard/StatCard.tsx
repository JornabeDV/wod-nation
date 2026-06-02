"use client";

import { motion } from "framer-motion";
import { Trophy, Users, DollarSign, Calendar, LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  trophy: Trophy,
  users: Users,
  dollar: DollarSign,
  calendar: Calendar,
};

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: string;
  delay?: number;
}

export function StatCard({
  label,
  value,
  change,
  changeType = "neutral",
  icon,
  delay = 0,
}: StatCardProps) {
  const Icon = iconMap[icon] || Trophy;

  const changeColors = {
    positive: "text-green-400",
    negative: "text-red-400",
    neutral: "text-text-muted",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-xl border border-border bg-surface-raised p-5 hover:border-border-hover transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm text-text-secondary">{label}</span>
        <div className="p-2 rounded-lg bg-surface-elevated text-text-muted">
          <Icon size={16} />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold tracking-tight">{value}</span>
        {change && (
          <span className={`text-xs font-medium ${changeColors[changeType]}`}>
            {change}
          </span>
        )}
      </div>
    </motion.div>
  );
}
