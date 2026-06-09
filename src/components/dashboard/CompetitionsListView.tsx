"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { AnimatedTable } from "@/components/dashboard/AnimatedTable";
import { PlusCircle, ArrowRight, Trophy, Copy } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { duplicateCompetition } from "@/lib/actions";
import { toast } from "@/hooks/use-toast";

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
  const router = useRouter();
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
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ff4d00] to-[#ff6b35] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#ff4d00]/20 hover:shadow-[#ff4d00]/30 transition-all"
          >
            <PlusCircle size={16} />
            {t.dashboard.competitions.newButton}
          </Link>
        }
      />

      {formattedCompetitions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-16 text-center"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ff4d00]/10 text-[#ff4d00] mb-4">
            <Trophy size={28} />
          </div>
          <h3 className="text-lg font-semibold mb-2">{t.dashboard.competitions.empty.title}</h3>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            {t.dashboard.competitions.empty.description}
          </p>
          <Link
            href="/dashboard/competitions/new"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ff4d00] to-[#ff6b35] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#ff4d00]/20 hover:shadow-[#ff4d00]/30 transition-all"
          >
            <PlusCircle size={16} />
            {t.dashboard.competitions.empty.cta}
          </Link>
        </motion.div>
      ) : (
        <AnimatedTable
          data={formattedCompetitions}
          onRowClick={(row) => router.push(`/dashboard/competitions/${row.id}`)}
          columns={[
            {
              key: "name",
              header: t.dashboard.competitions.table.name,
              cell: (row) => (
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ff4d00]/10 text-[#ff4d00]">
                    <Trophy size={14} />
                  </div>
                  <span className="font-medium">{row.name}</span>
                </div>
              ),
            },
            {
              key: "date",
              header: t.dashboard.competitions.table.date,
              cell: (row) => <span className="text-text-secondary text-sm">{row.date}</span>,
            },
            {
              key: "location",
              header: t.dashboard.competitions.table.location,
              cell: (row) => <span className="text-text-secondary text-sm">{row.location}</span>,
            },
            {
              key: "athletes",
              header: t.dashboard.competitions.table.athletes,
              cell: (row) => (
                <span className="text-text-secondary text-sm">
                  {row.athletes} atleta{row.athletes !== 1 ? "s" : ""}
                </span>
              ),
            },
            {
              key: "status",
              header: t.dashboard.competitions.table.status,
              cell: (row) => <StatusBadge status={row.status} />,
            },
            {
              key: "actions",
              header: "",
              width: "100px",
              cell: (row) => (
                <div className="flex items-center gap-1">
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        const newComp = await duplicateCompetition(row.id);
                        toast({
                          title: "Competencia duplicada",
                          description: `"${newComp.name}" lista para editar.`,
                          variant: "success",
                        });
                        router.push(`/dashboard/competitions/${newComp.id}`);
                      } catch (err: any) {
                        toast({
                          title: "Error",
                          description: err.message || "No se pudo duplicar",
                          variant: "destructive",
                        });
                      }
                    }}
                    className="inline-flex p-2 rounded-lg hover:bg-surface-elevated text-text-muted hover:text-text transition-colors"
                    title="Duplicar"
                  >
                    <Copy size={14} />
                  </button>
                  <Link
                    href={`/dashboard/competitions/${row.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex p-2 rounded-lg hover:bg-surface-elevated text-text-muted hover:text-text transition-colors"
                  >
                    <ArrowRight size={16} />
                  </Link>
                </div>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}
