"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { updateCompetition, deleteCompetition } from "@/lib/actions";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { toast } from "@/hooks/use-toast";
import {
  Radio,
  Eye,
  Trophy,
  CheckCircle2,
  XCircle,
  Trash2,
  AlertTriangle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

const statusOptions = [
  {
    value: "DRAFT",
    label: "Borrador",
    description: "Solo vos podés verla. Ideal para preparar todo antes de publicar.",
    icon: Eye,
    color: "bg-gray-500/15 text-gray-400 border-gray-500/20",
  },
  {
    value: "PUBLISHED",
    label: "Publicada",
    description: "Visible para todos. Los atletas pueden inscribirse.",
    icon: Radio,
    color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  },
  {
    value: "LIVE",
    label: "En vivo",
    description: "La competencia está activa. El leaderboard se actualiza en tiempo real.",
    icon: Trophy,
    color: "bg-[#ff4d00]/15 text-[#ff4d00] border-[#ff4d00]/20",
  },
  {
    value: "FINISHED",
    label: "Finalizada",
    description: "Resultados definitivos. Leaderboard congelado.",
    icon: CheckCircle2,
    color: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  },
  {
    value: "CANCELLED",
    label: "Cancelada",
    description: "La competencia fue cancelada. Ya no aparece públicamente.",
    icon: XCircle,
    color: "bg-red-500/15 text-red-400 border-red-500/20",
  },
];

export default function SettingsPage() {
  const params = useParams();
  const router = useRouter();
  const competitionId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { t } = useI18n();
  const d = t.dashboard.settingsPage;

  async function handleStatusChange(status: string) {
    setLoading(true);
    try {
      await updateCompetition(competitionId, { status: status as any });
      toast({
        title: "Estado actualizado",
        description: `La competencia ahora está ${status.toLowerCase()}.`,
        variant: "success",
      });
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  }

  async function handleDelete() {
    if (!confirm(d.deleteConfirm)) return;
    setDeleting(true);
    try {
      await deleteCompetition(competitionId);
      toast({ title: "Competencia eliminada", variant: "success" });
      router.push("/dashboard/competitions");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <PageHeader title={d.title} description={d.description} />

      {/* Status Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4">
          Estado de la competencia
        </h2>

        {statusOptions.map((status, i) => {
          const Icon = status.icon;
          return (
            <motion.button
              key={status.value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handleStatusChange(status.value)}
              disabled={loading}
              className="w-full flex items-start gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-left transition-all hover:border-white/[0.12] hover:bg-white/[0.04] disabled:opacity-50 group"
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${status.color}`}>
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{status.label}</span>
                  <ArrowRight
                    size={14}
                    className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
                <p className="text-sm text-text-secondary mt-0.5">{status.description}</p>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-red-500/15 bg-red-500/[0.03] p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
            <AlertTriangle size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-red-400">{d.dangerTitle}</h3>
            <p className="text-sm text-red-300/70">{d.dangerDescription}</p>
          </div>
        </div>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="inline-flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-5 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
        >
          {deleting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Trash2 size={16} />
          )}
          {d.deleteButton}
        </button>
      </motion.div>
    </div>
  );
}
