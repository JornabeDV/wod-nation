"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { createCategory, deleteCategory } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function CategoriesPage() {
  const params = useParams();
  const competitionId = params.id as string;
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);

    await createCategory({
      competitionId,
      name: form.get("name") as string,
      gender: (form.get("gender") as string) || undefined,
      divisionType: (form.get("divisionType") as string) || undefined,
      minAge: form.get("minAge") ? Number(form.get("minAge")) : undefined,
      maxAge: form.get("maxAge") ? Number(form.get("maxAge")) : undefined,
      maxAthletes: form.get("maxAthletes") ? Number(form.get("maxAthletes")) : undefined,
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
                <Input id="name" name="name" placeholder="RX Masculino" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Género</Label>
                <select
                  id="gender"
                  name="gender"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  <option value="">—</option>
                  <option value="MALE">Masculino</option>
                  <option value="FEMALE">Femenino</option>
                  <option value="MIXED">Mixto</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="divisionType">División</Label>
                <select
                  id="divisionType"
                  name="divisionType"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  <option value="CUSTOM">Custom</option>
                  <option value="RX">RX</option>
                  <option value="SCALED">Scaled</option>
                  <option value="ELITE">Elite</option>
                  <option value="MASTER">Master</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxAthletes">Cupo</Label>
                <Input id="maxAthletes" name="maxAthletes" type="number" min="1" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Agregando..." : "Agregar categoría"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <CategoriesList competitionId={competitionId} />
    </div>
  );
}

function CategoriesList({ competitionId }: { competitionId: string }) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  if (!loaded) {
    fetch(`/api/competitions/${competitionId}/categories`)
      .then((r) => r.json())
      .then((data) => {
        setCategories(data);
        setLoaded(true);
      });
  }

  return (
    <div className="space-y-3">
      {!loaded ? (
        <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : categories.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay categorías aún.</p>
      ) : (
        categories.map((cat) => (
          <Card key={cat.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{cat.name}</p>
                <p className="text-xs text-muted-foreground">
                  {cat.gender} — {cat.divisionType}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => deleteCategory(cat.id, competitionId).then(() => setLoaded(false))}
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
