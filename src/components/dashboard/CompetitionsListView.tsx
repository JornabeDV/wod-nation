"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.dashboard.competitions.title}</h1>
        <p className="text-text-secondary mt-1">{t.dashboard.competitions.description}</p>
      </div>

      {formattedCompetitions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 text-text-muted"
        >
          <Trophy size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg mb-2">{t.dashboard.competitions.empty.title}</p>
          <Link
            href="/dashboard/competitions/new"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            {t.dashboard.competitions.empty.cta} <ArrowRight size={16} />
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
