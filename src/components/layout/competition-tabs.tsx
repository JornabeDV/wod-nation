"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  Layers,
  Dumbbell,
  Users,
  PenTool,
  Settings,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

const tabIcons = {
  overview: LayoutGrid,
  categories: Layers,
  wods: Dumbbell,
  athletes: Users,
  scores: PenTool,
  settings: Settings,
};

export function CompetitionTabs({ competitionId }: { competitionId: string }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const d = t.dashboard.competition.tabs;

  const tabs = [
    { key: "overview", label: d.overview, href: "" },
    { key: "categories", label: d.categories, href: "/categories" },
    { key: "wods", label: d.wods, href: "/wods" },
    { key: "athletes", label: d.athletes, href: "/athletes" },
    { key: "scores", label: d.scores, href: "/scores" },
    { key: "settings", label: d.settings, href: "/settings" },
  ] as const;

  const base = `/dashboard/competitions/${competitionId}`;

  return (
    <div className="flex gap-1 p-1 rounded-xl bg-surface-raised border border-border overflow-x-auto">
      {tabs.map((tab) => {
        const href = `${base}${tab.href}`;
        const isActive = pathname === href || (tab.href !== "" && pathname.startsWith(href + "/"));
        const Icon = tabIcons[tab.key];
        return (
          <Link
            key={tab.key}
            href={href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
              isActive
                ? "bg-surface-elevated text-text"
                : "text-text-secondary hover:text-text hover:bg-surface-elevated"
            )}
          >
            <Icon size={16} />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
