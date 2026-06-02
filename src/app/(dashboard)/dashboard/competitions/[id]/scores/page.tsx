"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { submitScore } from "@/lib/actions";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Input } from "@/components/ui/input";

export default function ScoresPage() {
  const params = useParams();
  const competitionId = params.id as string;
  const [wodId, setWodId] = useState("");
  const [categoryId, setCategoryId] = useState("");

  return (
    <div className="space-y-6">
      <PageHeader title="Score Entry" description="Enter scores by WOD and category." />

      <div className="rounded-xl border border-border bg-surface-raised p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium mb-2 block">WOD</label>
            <WODSelect competitionId={competitionId} value={wodId} onChange={setWodId} />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Category</label>
            <CategorySelect competitionId={competitionId} value={categoryId} onChange={setCategoryId} />
          </div>
        </div>
      </div>

      {wodId && categoryId && (
        <ScoreEntryTable competitionId={competitionId} wodId={wodId} categoryId={categoryId} />
      )}
    </div>
  );
}

function WODSelect({ competitionId, value, onChange }: { competitionId: string; value: string; onChange: (v: string) => void }) {
  const [wods, setWods] = useState<any[]>([]);

  if (wods.length === 0) {
    fetch(`/api/competitions/${competitionId}/wods`)
      .then((r) => r.json())
      .then(setWods);
  }

  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="flex h-9 w-full rounded-lg border border-border bg-surface px-3 py-1 text-sm">
      <option value="">Select...</option>
      {wods.map((wod) => (
        <option key={wod.id} value={wod.id}>{wod.name}</option>
      ))}
    </select>
  );
}

function CategorySelect({ competitionId, value, onChange }: { competitionId: string; value: string; onChange: (v: string) => void }) {
  const [categories, setCategories] = useState<any[]>([]);

  if (categories.length === 0) {
    fetch(`/api/competitions/${competitionId}/categories`)
      .then((r) => r.json())
      .then(setCategories);
  }

  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="flex h-9 w-full rounded-lg border border-border bg-surface px-3 py-1 text-sm">
      <option value="">Select...</option>
      {categories.map((cat) => (
        <option key={cat.id} value={cat.id}>{cat.name}</option>
      ))}
    </select>
  );
}

function ScoreEntryTable({ competitionId, wodId, categoryId }: { competitionId: string; wodId: string; categoryId: string }) {
  const [athletes, setAthletes] = useState<any[]>([]);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);

  if (!loaded) {
    fetch(`/api/competitions/${competitionId}/registrations`)
      .then((r) => r.json())
      .then((regs) => {
        setAthletes(regs.filter((r: any) => r.categoryId === categoryId));
        setLoaded(true);
      });
  }

  async function saveScore(athleteId: string) {
    const rawScore = scores[athleteId];
    if (!rawScore) return;

    let value = 0;
    if (rawScore.includes(":")) {
      const parts = rawScore.split(":").map(Number);
      if (parts.length === 2) value = parts[0] * 60 + parts[1];
      else if (parts.length === 3) value = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else {
      value = Number(rawScore) || 0;
    }

    await submitScore({ competitionId, wodId, categoryId, athleteId, rawScore, value });
  }

  return (
    <div className="rounded-xl border border-border bg-surface-raised overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Athlete</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Score</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Action</th>
            </tr>
          </thead>
          <tbody>
            {athletes.map((reg: any) => (
              <tr key={reg.athleteId} className="border-b border-border/50 hover:bg-surface-elevated/50 transition-colors">
                <td className="px-4 py-3">{reg.athlete.name}</td>
                <td className="px-4 py-3">
                  <Input
                    value={scores[reg.athleteId] || ""}
                    onChange={(e) => setScores((prev) => ({ ...prev, [reg.athleteId]: e.target.value }))}
                    placeholder="150 reps / 10:23"
                    className="h-8 w-40"
                    onKeyDown={(e) => { if (e.key === "Enter") saveScore(reg.athleteId); }}
                  />
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => saveScore(reg.athleteId)}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text hover:border-border-hover transition-colors"
                  >
                    Save
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
