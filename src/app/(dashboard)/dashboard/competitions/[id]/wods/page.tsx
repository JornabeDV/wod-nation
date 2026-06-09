"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { createWOD, deleteWOD } from "@/lib/actions";
import { ScoringType } from "@prisma/client";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { toast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n/provider";
import {
  Dumbbell,
  Plus,
  Trash2,
  Clock,
  Zap,
  Loader2,
  Hash,
  AlignLeft,
} from "lucide-react";

export default function WODsPage() {
  const params = useParams();
  const competitionId = params.id as string;
  const { t } = useI18n();
  const d = t.dashboard.wodsPage;

  const [wods, setWods] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`/api/competitions/${competitionId}/wods`)
      .then((r) => r.json())
      .then((data) => {
        setWods(data);
        setLoaded(true);
      });
  }, [competitionId]);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = form.get("name") as string;
    setLoading(true);
    try {
      await createWOD({
        competitionId,
        name,
        description: (form.get("description") as string) || undefined,
        scoringType: (form.get("scoringType") as ScoringType) || "AMRAP",
        timeCapMinutes: parseInt(form.get("timeCapMinutes") as string) || undefined,
      });
      toast({
        title: d.toast.createdTitle,
        description: d.toast.createdDescription.replace("{name}", name),
        variant: "success",
      });
      (e.target as HTMLFormElement).reset();
      fetch(`/api/competitions/${competitionId}/wods`)
        .then((r) => r.json())
        .then(setWods);
    } catch {
      toast({ title: d.toast.errorTitle, description: d.toast.errorDescription, variant: "destructive" });
    }
    setLoading(false);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`${d.confirmDelete} "${name}"?`)) return;
    await deleteWOD(id, competitionId);
    setWods((prev) => prev.filter((w) => w.id !== id));
    toast({ title: d.toast.deleted, variant: "info" });
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <PageHeader title={d.title} description={d.description} />

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-5 flex items-center gap-2">
          <Plus size={14} />
          {d.addTitle}
        </h2>

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-1.5">
                <Dumbbell size={12} />
                {d.name}
              </label>
              <input
                name="name"
                required
                placeholder="WOD 1"
                className="flex h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-[#ff4d00]/50 focus:ring-1 focus:ring-[#ff4d00]/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-1.5">
                <Zap size={12} />
                {d.scoringType}
              </label>
              <select
                name="scoringType"
                required
                className="flex h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white focus:outline-none focus:border-[#ff4d00]/50 transition-all"
              >
                <option value="AMRAP">{d.types.reps}</option>
                <option value="FOR_TIME">{d.types.time}</option>
                <option value="MAX_WEIGHT">{d.types.weight}</option>
                <option value="POINTS">{d.types.points}</option>
                <option value="EMOM">EMOM</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-1.5">
                <Clock size={12} />
                {d.timeCap}
              </label>
              <input
                name="timeCapMinutes"
                type="number"
                min={1}
                placeholder="min"
                className="flex h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-[#ff4d00]/50 focus:ring-1 focus:ring-[#ff4d00]/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-1.5">
                <Hash size={12} />
                {d.orderLabel || "Orden"}
              </label>
              <input
                name="order"
                type="number"
                defaultValue={wods.length + 1}
                className="flex h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-[#ff4d00]/50 focus:ring-1 focus:ring-[#ff4d00]/20 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary flex items-center gap-1.5">
              <AlignLeft size={12} />
              {d.descriptionLabel}
            </label>
            <textarea
              name="description"
              rows={2}
              placeholder="21-15-9 Thrusters (43/30kg) y Pull-ups..."
              className="flex w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-[#ff4d00]/50 focus:ring-1 focus:ring-[#ff4d00]/20 transition-all resize-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ff4d00] to-[#ff6b35] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#ff4d00]/20 transition-all hover:shadow-[#ff4d00]/30 disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {loading ? d.adding : d.add}
            </button>
          </div>
        </form>
      </motion.div>

      {/* List */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4 flex items-center gap-2">
          <Dumbbell size={14} />
          {wods.length} WOD{wods.length !== 1 ? "s" : ""}
        </h2>

        {!loaded ? (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
            <Loader2 size={24} className="animate-spin mx-auto text-text-muted" />
          </div>
        ) : wods.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
            <Dumbbell size={32} className="mx-auto mb-3 text-text-muted" />
            <p className="text-text-secondary">No hay WODs todavía.</p>
          </div>
        ) : (
          wods.map((wod, i) => (
            <motion.div
              key={wod.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="group relative rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 hover:border-white/[0.12] hover:bg-white/[0.04] transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#ff4d00]/20 to-[#ff6b35]/10 text-[#ff4d00] text-xs font-bold">
                      {wod.order || i + 1}
                    </span>
                    <h3 className="font-semibold text-base truncate">{wod.name}</h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-secondary flex-wrap ml-11">
                    <span className="flex items-center gap-1">
                      <Zap size={10} className="text-[#ff4d00]" />
                      {wod.scoringType}
                    </span>
                    {wod.timeCapMinutes && (
                      <span className="flex items-center gap-1">
                        <Clock size={10} className="text-[#ff4d00]" />
                        {wod.timeCapMinutes} min
                      </span>
                    )}
                  </div>
                  {wod.description && (
                    <p className="text-sm text-text-secondary mt-2 ml-11 leading-relaxed">{wod.description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(wod.id, wod.name)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-text-muted"
                  title={d.delete}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
