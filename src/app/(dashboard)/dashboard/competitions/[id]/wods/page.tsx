"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { createWOD, deleteWOD } from "@/lib/actions";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n/provider";

export default function WODsPage() {
  const params = useParams();
  const competitionId = params.id as string;
  const [loading, setLoading] = useState(false);
  const { t } = useI18n();
  const d = t.dashboard.wodsPage;
  const common = t.dashboard.common;
  const scoringTypes = t.dashboard.newCompetition.wods.scoringTypes;

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
      <PageHeader title={d.title} description={d.description} />

      <div className="rounded-xl border border-border bg-surface-raised p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="name">{d.name}</Label>
              <Input id="name" name="name" placeholder={d.namePlaceholder} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scoringType">{d.scoringType}</Label>
              <select id="scoringType" name="scoringType" required className="flex h-9 w-full rounded-lg border border-border bg-surface px-3 py-1 text-sm">
                <option value="AMRAP">{scoringTypes.amrap}</option>
                <option value="FOR_TIME">{scoringTypes.forTime}</option>
                <option value="EMOM">{scoringTypes.emom}</option>
                <option value="MAX_WEIGHT">{scoringTypes.maxWeight}</option>
                <option value="POINTS">{scoringTypes.points}</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeCapMinutes">{d.timeCap}</Label>
              <Input id="timeCapMinutes" name="timeCapMinutes" type="number" min="1" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{d.description}</Label>
              <Input id="description" name="description" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="standards">{d.standards}</Label>
            <textarea id="standards" name="standards" rows={3} className="flex w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-glow transition-colors disabled:opacity-50"
            >
              {loading ? d.adding : d.add}
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
  const { t } = useI18n();
  const d = t.dashboard.wodsPage;
  const timeCapSuffix = t.dashboard.newCompetition.wods.timeCapSuffix;

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
        <p className="text-sm text-text-secondary">{t.dashboard.common.loading}</p>
      ) : wods.length === 0 ? (
        <p className="text-sm text-text-secondary">{d.empty}</p>
      ) : (
        wods.map((wod) => (
          <div
            key={wod.id}
            className="flex items-center justify-between rounded-xl border border-border bg-surface-raised p-4"
          >
            <div>
              <p className="font-medium">{wod.name}</p>
              <p className="text-xs text-text-muted">{wod.scoringType}{wod.timeCapMinutes ? ` · ${wod.timeCapMinutes}${timeCapSuffix}` : ""}</p>
            </div>
            <button
              onClick={() => deleteWOD(wod.id, competitionId).then(() => setLoaded(false))}
              className="text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              {t.dashboard.common.delete}
            </button>
          </div>
        ))
      )}
    </div>
  );
}
