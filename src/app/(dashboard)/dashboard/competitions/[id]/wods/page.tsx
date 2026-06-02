"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { createWOD, deleteWOD } from "@/lib/actions";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function WODsPage() {
  const params = useParams();
  const competitionId = params.id as string;
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    await createWOD({
      competitionId,
      name: form.get("name") as string,
      description: (form.get("description") as string) || undefined,
      scoringType: form.get("scoringType") as any,
      timeCapMinutes: form.get("timeCapMinutes") ? Number(form.get("timeCapMinutes")) : undefined,
      standards: (form.get("standards") as string) || undefined,
    });
    setLoading(false);
    (e.target as HTMLFormElement).reset();
  }

  return (
    <div className="space-y-6">
      <PageHeader title="WODs" description="Define workouts and scoring rules." />

      <div className="rounded-xl border border-border bg-surface-raised p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" placeholder="WOD 1" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scoringType">Scoring Type *</Label>
              <select id="scoringType" name="scoringType" required className="flex h-9 w-full rounded-lg border border-border bg-surface px-3 py-1 text-sm">
                <option value="AMRAP">AMRAP (reps)</option>
                <option value="FOR_TIME">For Time</option>
                <option value="EMOM">EMOM (rounds)</option>
                <option value="MAX_WEIGHT">Max Weight</option>
                <option value="POINTS">Points</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeCapMinutes">Time Cap (min)</Label>
              <Input id="timeCapMinutes" name="timeCapMinutes" type="number" min="1" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="standards">Standards</Label>
            <textarea id="standards" name="standards" rows={3} className="flex w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-glow transition-colors disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add WOD"}
            </button>
          </div>
        </form>
      </div>

      <WODsList competitionId={competitionId} />
    </div>
  );
}

function WODsList({ competitionId }: { competitionId: string }) {
  const [wods, setWods] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  if (!loaded) {
    fetch(`/api/competitions/${competitionId}/wods`)
      .then((r) => r.json())
      .then((data) => {
        setWods(data);
        setLoaded(true);
      });
  }

  return (
    <div className="space-y-3">
      {!loaded ? (
        <p className="text-sm text-text-secondary">Loading...</p>
      ) : wods.length === 0 ? (
        <p className="text-sm text-text-secondary">No WODs yet.</p>
      ) : (
        wods.map((wod) => (
          <div
            key={wod.id}
            className="flex items-center justify-between rounded-xl border border-border bg-surface-raised p-4"
          >
            <div>
              <p className="font-medium">{wod.name}</p>
              <p className="text-xs text-text-muted">{wod.scoringType}{wod.timeCapMinutes ? ` · ${wod.timeCapMinutes}min cap` : ""}</p>
            </div>
            <button
              onClick={() => deleteWOD(wod.id, competitionId).then(() => setLoaded(false))}
              className="text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}
