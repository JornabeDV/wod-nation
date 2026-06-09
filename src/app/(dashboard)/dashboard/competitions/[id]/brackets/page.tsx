"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Swords, Shuffle } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { BracketView } from "@/components/brackets/BracketView";
import { generateBracketAction, getBracketMatchesAction, updateBracketMatchAction } from "@/lib/bracket-actions";
import { toast } from "@/hooks/use-toast";

export default function BracketsPage() {
  const params = useParams();
  const competitionId = params.id as string;
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/competitions/${competitionId}/categories`)
      .then((r) => r.json())
      .then((data) => {
        setCategories(data);
        if (data[0]) setCategoryId(data[0].id);
      });
  }, [competitionId]);

  useEffect(() => {
    if (!categoryId) return;
    loadMatches();
  }, [competitionId, categoryId]);

  async function loadMatches() {
    const data = await getBracketMatchesAction(competitionId, categoryId);
    setMatches(data);
  }

  async function handleGenerate() {
    setLoading(true);
    try {
      await generateBracketAction(competitionId, categoryId);
      await loadMatches();
      toast({ title: "Bracket generado", variant: "success" });
    } catch (err: any) {
      toast({ title: err.message || "Error", variant: "destructive" });
    }
    setLoading(false);
  }

  async function handleUpdateMatch(matchId: string, winnerId: string, score1: string, score2: string) {
    await updateBracketMatchAction(matchId, { winnerId, score1, score2 });
    await loadMatches();
    toast({ title: "Resultado guardado", variant: "success" });
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Eliminatorias" description="Gestiona bracket de eliminación directa" />

      <div className="flex items-center gap-4">
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="h-9 rounded-lg border border-border bg-surface px-3 text-sm"
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <button
          onClick={handleGenerate}
          disabled={loading || !categoryId}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#ff4d00] to-[#ff6b35] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-[#ff4d00]/20 hover:shadow-[#ff4d00]/30 transition-all disabled:opacity-50"
        >
          <Shuffle size={16} />
          {loading ? "Generando..." : "Generar bracket"}
        </button>
      </div>

      {matches.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-border bg-surface-raised p-16 text-center"
        >
          <Swords size={40} className="mx-auto mb-4 text-text-muted" />
          <h3 className="text-lg font-semibold mb-2">No hay bracket generado</h3>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            Seleccioná una categoría y generá el bracket de eliminación directa.
          </p>
        </motion.div>
      ) : (
        <div className="rounded-xl border border-border bg-surface-raised p-6">
          <BracketView matches={matches} onUpdateMatch={handleUpdateMatch} />
        </div>
      )}
    </div>
  );
}
