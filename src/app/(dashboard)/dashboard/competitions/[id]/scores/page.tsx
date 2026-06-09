"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { submitScore } from "@/lib/actions";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { toast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n/provider";
import {
  Save,
  Users,
  Dumbbell,
  ChevronDown,
  Loader2,
  CheckCircle2,
  Zap,
} from "lucide-react";

export default function ScoresPage() {
  const params = useParams();
  const competitionId = params.id as string;
  const { t } = useI18n();
  const d = t.dashboard.scoresPage;

  const [wods, setWods] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [athletes, setAthletes] = useState<any[]>([]);
  const [selectedWod, setSelectedWod] = useState<string>("");
  const [selectedCat, setSelectedCat] = useState<string>("");
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [scores, setScores] = useState<Record<string, { raw: string; val: string; notes: string; judge: string }>>({});

  // Load data
  useEffect(() => {
    Promise.all([
      fetch(`/api/competitions/${competitionId}/wods`).then((r) => r.json()),
      fetch(`/api/competitions/${competitionId}/categories`).then((r) => r.json()),
      fetch(`/api/competitions/${competitionId}/registrations`).then((r) => r.json()),
    ]).then(([w, c, r]) => {
      setWods(w);
      setCategories(c);
      setAthletes(r);
      if (w.length > 0) setSelectedWod(w[0].id);
      if (c.length > 0) setSelectedCat(c[0].id);
    });
  }, [competitionId]);

  // Filter athletes by category
  const filteredAthletes = athletes.filter((a) => a.categoryId === selectedCat);

  // Load scores
  useEffect(() => {
    if (!selectedWod || !selectedCat) return;
    fetch(`/api/competitions/${competitionId}/scores?wodId=${selectedWod}&categoryId=${selectedCat}`)
      .then((r) => r.json())
      .then((data: any[]) => {
        const map: Record<string, { raw: string; val: string; notes: string; judge: string }> = {};
        data.forEach((s) => {
          map[s.athleteId] = {
            raw: s.rawScore,
            val: s.value?.toString() || "",
            notes: s.notes || "",
            judge: s.judgeName || "",
          };
        });
        setScores(map);
        setSaved({});
      });
  }, [competitionId, selectedWod, selectedCat]);

  async function handleSave(athleteId: string) {
    const sc = scores[athleteId];
    if (!sc || !sc.raw.trim()) return;

    setSaving((prev) => ({ ...prev, [athleteId]: true }));
    try {
      await submitScore({
        competitionId,
        wodId: selectedWod,
        categoryId: selectedCat,
        athleteId,
        rawScore: sc.raw,
        value: parseFloat(sc.val) || 0,
        notes: sc.notes || undefined,
        judgeName: sc.judge || undefined,
      });
      setSaved((prev) => ({ ...prev, [athleteId]: true }));
      setTimeout(() => setSaved((prev) => ({ ...prev, [athleteId]: false })), 2000);
    } catch {
      toast({ title: d.toast.errorTitle, description: d.toast.errorDescription, variant: "destructive" });
    }
    setSaving((prev) => ({ ...prev, [athleteId]: false }));
  }

  const wod = wods.find((w) => w.id === selectedWod);

  return (
    <div className="space-y-8">
      <PageHeader title={d.title} description={d.description} />

      {/* Selectors */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary flex items-center gap-1.5">
            <Dumbbell size={12} />
            WOD
          </label>
          <div className="relative">
            <select
              value={selectedWod}
              onChange={(e) => setSelectedWod(e.target.value)}
              className="flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 pr-10 text-sm text-white focus:outline-none focus:border-[#ff4d00]/50 transition-all appearance-none"
            >
              {wods.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary flex items-center gap-1.5">
            <Users size={12} />
            Categoría
          </label>
          <div className="relative">
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 pr-10 text-sm text-white focus:outline-none focus:border-[#ff4d00]/50 transition-all appearance-none"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          </div>
        </div>
      </div>

      {wod && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-3 flex items-center gap-3 text-sm text-text-secondary"
        >
          <Zap size={14} className="text-[#ff4d00] shrink-0" />
          <span>
            {d.typesLabel} <span className="text-white font-medium">{wod.scoringType}</span>
            {wod.timeCapMinutes && (
              <span className="ml-3">{d.timeCapLabel} <span className="text-white font-medium">{wod.timeCapMinutes} min</span></span>
            )}
          </span>
        </motion.div>
      )}

      {/* Score cards */}
      <div className="grid gap-3">
        {filteredAthletes.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
            <Users size={32} className="mx-auto mb-3 text-text-muted" />
            <p className="text-text-secondary">{d.table.empty}</p>
          </div>
        ) : (
          filteredAthletes.map((athlete, i) => {
            const sc = scores[athlete.athleteId] || { raw: "", val: "", notes: "", judge: "" };
            return (
              <motion.div
                key={athlete.athleteId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:border-white/[0.12] hover:bg-white/[0.04] transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3 shrink-0 w-44">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#ff4d00]/20 to-[#ff6b35]/10 text-[#ff4d00] font-bold text-sm">
                      {athlete.athlete.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-sm truncate">{athlete.athlete.name}</span>
                  </div>

                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <input
                      value={sc.raw}
                      onChange={(e) =>
                        setScores((prev) => ({
                          ...prev,
                          [athlete.athleteId]: { ...sc, raw: e.target.value },
                        }))
                      }
                      placeholder={d.table.rawPlaceholder}
                      className="h-10 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-[#ff4d00]/50 focus:ring-1 focus:ring-[#ff4d00]/20 transition-all"
                    />
                    <input
                      value={sc.val}
                      onChange={(e) =>
                        setScores((prev) => ({
                          ...prev,
                          [athlete.athleteId]: { ...sc, val: e.target.value },
                        }))
                      }
                      placeholder={d.table.valPlaceholder}
                      className="h-10 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-[#ff4d00]/50 focus:ring-1 focus:ring-[#ff4d00]/20 transition-all"
                    />
                    <input
                      value={sc.judge}
                      onChange={(e) =>
                        setScores((prev) => ({
                          ...prev,
                          [athlete.athleteId]: { ...sc, judge: e.target.value },
                        }))
                      }
                      placeholder={d.table.judgePlaceholder}
                      className="h-10 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-[#ff4d00]/50 focus:ring-1 focus:ring-[#ff4d00]/20 transition-all"
                    />
                    <input
                      value={sc.notes}
                      onChange={(e) =>
                        setScores((prev) => ({
                          ...prev,
                          [athlete.athleteId]: { ...sc, notes: e.target.value },
                        }))
                      }
                      placeholder={d.table.notesPlaceholder}
                      className="h-10 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-[#ff4d00]/50 focus:ring-1 focus:ring-[#ff4d00]/20 transition-all"
                    />
                  </div>

                  <button
                    onClick={() => handleSave(athlete.athleteId)}
                    disabled={saving[athlete.athleteId] || !sc.raw.trim()}
                    className="shrink-0 flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.05] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-white/[0.08] disabled:opacity-40 disabled:hover:bg-white/[0.05]"
                  >
                    {saving[athlete.athleteId] ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : saved[athlete.athleteId] ? (
                      <>
                        <CheckCircle2 size={14} className="text-emerald-400" />
                        <span className="text-emerald-400">{d.table.saved}</span>
                      </>
                    ) : (
                      <>
                        <Save size={14} />
                        {d.table.save}
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
