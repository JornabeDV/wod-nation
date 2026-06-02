"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { submitScore } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function ScoresPage() {
  const params = useParams();
  const competitionId = params.id as string;
  const [wodId, setWodId] = useState("");
  const [categoryId, setCategoryId] = useState("");

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>WOD</Label>
              <WODSelect competitionId={competitionId} value={wodId} onChange={setWodId} />
            </div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <CategorySelect competitionId={competitionId} value={categoryId} onChange={setCategoryId} />
            </div>
          </div>
        </CardContent>
      </Card>

      {wodId && categoryId && (
        <ScoreEntryTable competitionId={competitionId} wodId={wodId} categoryId={categoryId} />
      )}
    </div>
  );
}

function WODSelect({
  competitionId,
  value,
  onChange,
}: {
  competitionId: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [wods, setWods] = useState<any[]>([]);

  if (wods.length === 0) {
    fetch(`/api/competitions/${competitionId}/wods`)
      .then((r) => r.json())
      .then(setWods);
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
    >
      <option value="">Seleccionar...</option>
      {wods.map((wod) => (
        <option key={wod.id} value={wod.id}>
          {wod.name}
        </option>
      ))}
    </select>
  );
}

function CategorySelect({
  competitionId,
  value,
  onChange,
}: {
  competitionId: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [categories, setCategories] = useState<any[]>([]);

  if (categories.length === 0) {
    fetch(`/api/competitions/${competitionId}/categories`)
      .then((r) => r.json())
      .then(setCategories);
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
    >
      <option value="">Seleccionar...</option>
      {categories.map((cat) => (
        <option key={cat.id} value={cat.id}>
          {cat.name}
        </option>
      ))}
    </select>
  );
}

function ScoreEntryTable({
  competitionId,
  wodId,
  categoryId,
}: {
  competitionId: string;
  wodId: string;
  categoryId: string;
}) {
  const [athletes, setAthletes] = useState<any[]>([]);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);

  if (!loaded) {
    fetch(`/api/competitions/${competitionId}/registrations`)
      .then((r) => r.json())
      .then((regs) => {
        const filtered = regs.filter((r: any) => r.categoryId === categoryId);
        setAthletes(filtered);
        setLoaded(true);
      });
  }

  async function saveScore(athleteId: string) {
    const rawScore = scores[athleteId];
    if (!rawScore) return;

    let value = 0;
    // Simple parsing: if contains ":" treat as time in seconds
    if (rawScore.includes(":")) {
      const parts = rawScore.split(":").map(Number);
      if (parts.length === 2) value = parts[0] * 60 + parts[1];
      else if (parts.length === 3) value = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else {
      value = Number(rawScore) || 0;
    }

    await submitScore({
      competitionId,
      wodId,
      categoryId,
      athleteId,
      rawScore,
      value,
    });
  }

  return (
    <Card>
      <CardContent className="p-0">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-2 text-left font-medium">Atleta</th>
              <th className="px-4 py-2 text-left font-medium">Score</th>
              <th className="px-4 py-2 text-left font-medium">Acción</th>
            </tr>
          </thead>
          <tbody>
            {athletes.map((reg: any) => (
              <tr key={reg.athleteId} className="border-t">
                <td className="px-4 py-2">{reg.athlete.name}</td>
                <td className="px-4 py-2">
                  <Input
                    value={scores[reg.athleteId] || ""}
                    onChange={(e) =>
                      setScores((prev) => ({ ...prev, [reg.athleteId]: e.target.value }))
                    }
                    placeholder="150 reps / 10:23"
                    className="h-8 w-40"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveScore(reg.athleteId);
                    }}
                  />
                </td>
                <td className="px-4 py-2">
                  <Button size="sm" variant="outline" onClick={() => saveScore(reg.athleteId)}>
                    Guardar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
