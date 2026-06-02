"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { createCompetition } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewCompetitionPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!session?.user?.id) return;

    const form = new FormData(e.currentTarget);
    setLoading(true);

    try {
      const comp = await createCompetition({
        name: form.get("name") as string,
        description: (form.get("description") as string) || undefined,
        location: (form.get("location") as string) || undefined,
        startDate: form.get("startDate") as string,
        endDate: (form.get("endDate") as string) || undefined,
        registrationDeadline: (form.get("registrationDeadline") as string) || undefined,
        registrationFee: Number(form.get("registrationFee")) || 0,
        maxAthletes: Number(form.get("maxAthletes")) || undefined,
        organizerId: session.user.id,
      });
      router.push(`/dashboard/competitions/${comp.id}`);
    } catch (err) {
      alert("Error al crear la competencia");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nueva competencia</h1>
        <p className="text-muted-foreground">
          Completá los datos básicos. Luego podrás agregar categorías y WODs.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información general</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input id="name" name="name" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Input id="description" name="description" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input id="location" name="location" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Fecha de inicio *</Label>
                <Input id="startDate" name="startDate" type="datetime-local" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Fecha de fin</Label>
                <Input id="endDate" name="endDate" type="datetime-local" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="registrationDeadline">Cierre de inscripción</Label>
              <Input id="registrationDeadline" name="registrationDeadline" type="datetime-local" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="registrationFee">Precio de inscripción ($ ARS)</Label>
                <Input id="registrationFee" name="registrationFee" type="number" min="0" defaultValue="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxAthletes">Cupo máximo</Label>
                <Input id="maxAthletes" name="maxAthletes" type="number" min="1" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creando..." : "Crear competencia"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
