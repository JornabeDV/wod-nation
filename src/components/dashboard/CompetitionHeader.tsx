"use client";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { useI18n } from "@/lib/i18n/provider";

interface CompetitionHeaderProps {
  name: string;
  location: string | null;
  startDate: Date;
}

export function CompetitionHeader({ name, location, startDate }: CompetitionHeaderProps) {
  const { t, locale } = useI18n();

  const dateFormatter = new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const description = `${location || t.dashboard.competition.noLocation} · ${dateFormatter.format(new Date(startDate))}`;

  return (
    <PageHeader
      title={name}
      description={description}
      backHref="/dashboard/competitions"
    />
  );
}
