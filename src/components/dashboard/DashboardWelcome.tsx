"use client";

import { useI18n } from "@/lib/i18n/provider";
import { DashboardTour } from "./DashboardTour";

interface DashboardWelcomeProps {
  userName?: string | null;
}

export function DashboardWelcome({ userName }: DashboardWelcomeProps) {
  const { t } = useI18n();
  const firstName = userName?.split(" ")[0] || "";
  const welcome = t.dashboard.home.welcome.replace(
    "{name}",
    firstName || t.dashboard.header.userFallback
  );

  return (
    <div className="space-y-4">
      <DashboardTour />
      <div data-tour="welcome">
        <h1 className="text-2xl font-bold tracking-tight">
          {t.dashboard.home.title}
        </h1>
        <p className="text-text-secondary mt-1">{welcome}</p>
      </div>
    </div>
  );
}
