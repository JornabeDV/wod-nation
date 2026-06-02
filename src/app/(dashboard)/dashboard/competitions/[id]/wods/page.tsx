"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { createWOD, deleteWOD } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

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
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input id="name" name="name" placeholder="WOD 1" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scoringType">Tipo de puntuación *</Label>
                <select
                  id="scoringType"
                  name="scoringType"
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
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
                <Label htmlFor="description">Descripción</Label>
                <Input id="description" name="description" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="standards">Estándares</Label>
              <textarea
                id="standards"
                name="standards"
                rows={3}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Agregando..." : "Agregar WOD"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

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
        <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : wods.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay WODs aún.</p>
      ) : (
        wods.map((wod) => (
          <Card key={wod.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{wod.name}</p>
                <p className="text-xs text-muted-foreground">
                  {wod.scoringType}
                  {wod.timeCapMinutes ? ` — ${wod.timeCapMinutes} min cap` : ""}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => deleteWOD(wod.id, competitionId).then(() => setLoaded(false))}
              >
                Eliminar
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
