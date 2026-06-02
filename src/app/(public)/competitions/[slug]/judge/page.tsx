"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { submitScore } from "@/lib/actions";
import { CheckCircle2, Save, Timer, Dumbbell, ChevronDown, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function JudgeModePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [competition, setCompetition] = useState<any>(null);
  const [wodId, setWodId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch(`/api/competitions/slug/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setCompetition(data);
        if (data.categories?.[0]) setCategoryId(data.categories[0].id);
        if (data.wods?.[0]) setWodId(data.wods[0].id);
      });
  }, [slug]);

  if (!competition) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="animate-pulse text-white/50 text-lg">Cargando...</div>
      </div>
    );
  }

  const selectedWod = competition.wods.find((w: any) => w.id === wodId);
  const selectedCategory = competition.categories.find((c: any) => c.id === categoryId);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#050505]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <a
              href={`/competitions/${slug}`}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <ArrowLeft size={20} />
            </a>
            <div>
              <h1 className="text-lg font-bold leading-tight">{competition.name}</h1>
              <p className="text-xs text-white/50">Modo Juez</p>
            </div>
          </div>

          {/* WOD & Category selectors */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[10px] uppercase tracking-wider text-white/40 font-medium mb-1 block">
                WOD
              </label>
              <div className="relative">
                <select
                  value={wodId}
                  onChange={(e) => {
                    setWodId(e.target.value);
                    setSavedIds(new Set());
                  }}
                  className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-10 text-sm font-medium focus:outline-none focus:border-[#ff4d00]/50"
                >
                  {competition.wods.map((wod: any) => (
                    <option key={wod.id} value={wod.id}>
                      {wod.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="text-[10px] uppercase tracking-wider text-white/40 font-medium mb-1 block">
                Categoría
              </label>
              <div className="relative">
                <select
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    setSavedIds(new Set());
                  }}
                  className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-10 text-sm font-medium focus:outline-none focus:border-[#ff4d00]/50"
                >
                  {competition.categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
                />
              </div>
            </div>
          </div>

          {selectedWod && (
            <div className="mt-3 flex items-center gap-4 text-xs text-white/50">
              <span className="flex items-center gap-1">
                <Dumbbell size={12} />
                {selectedWod.scoringType}
              </span>
              {selectedWod.timeCapMinutes && (
                <span className="flex items-center gap-1">
                  <Timer size={12} />
                  {selectedWod.timeCapMinutes} min cap
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Athlete list */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        {wodId && categoryId && (
          <JudgeScoreList
            key={`${wodId}-${categoryId}`}
            competitionId={competition.id}
            wodId={wodId}
            categoryId={categoryId}
            savedIds={savedIds}
            setSavedIds={setSavedIds}
          />
        )}
      </div>
    </div>
  );
}

function JudgeScoreList({
  competitionId,
  wodId,
  categoryId,
  savedIds,
  setSavedIds,
}: {
  competitionId: string;
  wodId: string;
  categoryId: string;
  savedIds: Set<string>;
  setSavedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
}) {
  const [athletes, setAthletes] = useState<any[]>([]);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/competitions/${competitionId}/registrations`)
      .then((r) => r.json())
      .then((regs) => {
        const filtered = regs.filter((r: any) => r.categoryId === categoryId);
        setAthletes(filtered);
        // Pre-fill existing scores if any
        const existing: Record<string, string> = {};
        filtered.forEach((reg: any) => {
          if (reg.athlete?.scores) {
            const score = reg.athlete.scores.find((s: any) => s.wodId === wodId);
            if (score) existing[reg.athleteId] = score.rawScore;
          }
        });
        setScores(existing);
        setLoading(false);
      });
  }, [competitionId, categoryId, wodId]);

  async function saveScore(athleteId: string) {
    const rawScore = scores[athleteId];
    if (!rawScore) return;

    setSavingId(athleteId);
    let value = 0;
    if (rawScore.includes(":")) {
      const parts = rawScore.split(":").map(Number);
      if (parts.length === 2) value = parts[0] * 60 + parts[1];
      else if (parts.length === 3) value = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else {
      value = Number(rawScore) || 0;
    }

    try {
      await submitScore({ competitionId, wodId, categoryId, athleteId, rawScore, value });
      setSavedIds((prev) => new Set(prev).add(athleteId));
      toast({
        title: "Score guardado",
        description: `${athletes.find((a) => a.athleteId === athleteId)?.athlete.name} — ${rawScore}`,
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar el score. Intentá de nuevo.",
        variant: "destructive",
      });
    } finally {
      setSavingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-white/50">Cargando atletas...</div>
      </div>
    );
  }

  if (athletes.length === 0) {
    return (
      <div className="text-center py-20 text-white/40">
        <Dumbbell size={32} className="mx-auto mb-3 opacity-50" />
        <p>No hay atletas en esta categoría.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {athletes.map((reg, i) => {
          const isSaved = savedIds.has(reg.athleteId);
          const isSaving = savingId === reg.athleteId;

          return (
            <motion.div
              key={reg.athleteId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`rounded-2xl border p-4 transition-colors ${
                isSaved
                  ? "border-emerald-500/30 bg-emerald-950/20"
                  : "border-white/10 bg-white/[0.02]"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-semibold text-base">{reg.athlete.name}</div>
                  <div className="text-xs text-white/40">{reg.athlete.boxName || "—"}</div>
                </div>
                {isSaved && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-emerald-400"
                  >
                    <CheckCircle2 size={22} />
                  </motion.div>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  value={scores[reg.athleteId] || ""}
                  onChange={(e) =>
                    setScores((prev) => ({ ...prev, [reg.athleteId]: e.target.value }))
                  }
                  placeholder={
                    reg.athlete.scores?.find((s: any) => s.wodId === wodId)
                      ? "Editar score..."
                      : "Ej: 150 reps / 10:23"
                  }
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg font-mono font-semibold text-center placeholder:text-white/20 focus:outline-none focus:border-[#ff4d00]/50 focus:ring-1 focus:ring-[#ff4d00]/20 transition-all"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveScore(reg.athleteId);
                  }}
                />
                <button
                  onClick={() => saveScore(reg.athleteId)}
                  disabled={!scores[reg.athleteId] || isSaving}
                  className={`rounded-xl px-5 py-3 font-medium text-sm transition-all ${
                    isSaved
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-[#ff4d00] text-white hover:bg-[#ff4d00]/90 disabled:opacity-30 disabled:cursor-not-allowed"
                  }`}
                >
                  {isSaving ? (
                    <span className="animate-pulse">...</span>
                  ) : isSaved ? (
                    <Save size={18} />
                  ) : (
                    "Guardar"
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      <p className="text-center text-xs text-white/30 pt-4 pb-8">
        Presioná Enter para guardar rápidamente
      </p>
    </div>
  );
}
