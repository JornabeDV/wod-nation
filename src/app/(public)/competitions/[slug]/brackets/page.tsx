"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Swords } from "lucide-react";
import { BracketView } from "@/components/brackets/BracketView";

export default function PublicBracketsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [competition, setCompetition] = useState<any>(null);
  const [categoryId, setCategoryId] = useState("");
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/competitions/slug/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setCompetition(data);
        if (data.categories?.[0]) setCategoryId(data.categories[0].id);
      });
  }, [slug]);

  useEffect(() => {
    if (!competition || !categoryId) return;
    fetch(`/api/competitions/${competition.id}/brackets?categoryId=${categoryId}`)
      .then((r) => r.json())
      .then((data) => setMatches(data.matches || []));
  }, [competition, categoryId]);

  if (!competition) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="animate-pulse text-white/50">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="border-b border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <h1 className="text-2xl font-bold">{competition.name}</h1>
          <p className="text-text-secondary text-sm mt-1">Eliminatorias</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex gap-2 mb-6">
          {competition.categories.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => setCategoryId(cat.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                categoryId === cat.id
                  ? "bg-[#ff4d00] text-white"
                  : "bg-white/[0.03] text-text-secondary hover:text-white border border-white/[0.06]"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {matches.length === 0 ? (
          <div className="text-center py-20 text-text-muted">
            <Swords size={32} className="mx-auto mb-3 opacity-50" />
            <p>No hay bracket disponible para esta categoría.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
            <BracketView matches={matches} readOnly />
          </div>
        )}
      </div>
    </div>
  );
}
