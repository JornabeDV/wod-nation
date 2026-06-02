"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { updateCompetition, deleteCompetition } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  const params = useParams();
  const router = useRouter();
  const competitionId = params.id as string;
  const [loading, setLoading] = useState(false);

  async function handleStatusChange(status: string) {
    setLoading(true);
    await updateCompetition(competitionId, { status: status as any });
    setLoading(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("¿Estás seguro de eliminar esta competencia?")) return;
    setLoading(true);
    await deleteCompetition(competitionId);
    router.push("/dashboard/competitions");
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Estado de la competencia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {["DRAFT", "PUBLISHED", "LIVE", "FINISHED", "CANCELLED"].map((status) => (
              <Button
                key={status}
                size="sm"
                variant="outline"
                disabled={loading}
                onClick={() => handleStatusChange(status)}
              >
                Cambiar a {status}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Zona de peligro</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Eliminar una competencia borra todos sus datos permanentemente.
          </p>
          <Button
            variant="destructive"
            size="sm"
            className="mt-4"
            disabled={loading}
            onClick={handleDelete}
          >
            Eliminar competencia
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
