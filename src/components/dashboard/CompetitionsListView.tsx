"use client";

import Link from "next/link";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { AnimatedTable } from "@/components/dashboard/AnimatedTable";
import { PlusCircle, ArrowRight, Trophy } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

interface CompetitionRow {
  id: string;
  name: string;
  startDate: Date;
  location: string;
  athletes: number;
  status: any;
}

interface CompetitionsListViewProps {
  competitions: CompetitionRow[];
}

export function CompetitionsListView({ competitions }: CompetitionsListViewProps) {
  const { t, locale } = useI18n();

  const dateFormatter = new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const formattedCompetitions = competitions.map((c) => ({
    ...c,
    date: dateFormatter.format(new Date(c.startDate)),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.dashboard.competitions.title}
        description={t.dashboard.competitions.description}
        actions={
          <Link
            href="/dashboard/competitions/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-glow transition-colors"
          >
            <PlusCircle size={16} />
            {t.dashboard.competitions.newButton}
          </Link>
        }
      />

      {formattedCompetitions.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface-raised p-16 text-center">
          <Trophy size={40} className="mx-auto mb-4 text-text-muted" />
          <h3 className="text-lg font-semibold mb-2">{t.dashboard.competitions.empty.title}</h3>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            {t.dashboard.competitions.empty.description}
          </p>
          <Link
            href="/dashboard/competitions/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-glow transition-colors"
          >
            <PlusCircle size={16} />
            {t.dashboard.competitions.empty.cta}
          </Link>
        </div>
      ) : (
        <AnimatedTable
          data={formattedCompetitions}
          columns={[
            {
              key: "name",
              header: t.dashboard.competitions.table.name,
              cell: (row) => <div className="font-medium">{row.name}</div>,
            },
            {
              key: "date",
              header: t.dashboard.competitions.table.date,
              cell: (row) => <span className="text-text-secondary">{row.date}</span>,
            },
            {
              key: "location",
              header: t.dashboard.competitions.table.location,
              cell: (row) => <span className="text-text-secondary">{row.location}</span>,
            },
            {
              key: "athletes",
              header: t.dashboard.competitions.table.athletes,
              cell: (row) => <span className="text-text-secondary">{row.athletes}</span>,
            },
            {
              key: "status",
              header: t.dashboard.competitions.table.status,
              cell: (row) => <StatusBadge status={row.status} />,
            },
            {
              key: "actions",
              header: "",
              width: "60px",
              cell: (row) => (
                <Link
                  href={`/dashboard/competitions/${row.id}`}
                  className="inline-flex p-2 rounded-lg hover:bg-surface-elevated text-text-muted hover:text-text transition-colors"
                >
                  <ArrowRight size={16} />
                </Link>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}
