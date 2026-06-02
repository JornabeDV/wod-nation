"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { createManualRegistration } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function AthletesPage() {
  const params = useParams();
  const competitionId = params.id as string;
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);

    await createManualRegistration({
      competitionId,
      categoryId: form.get("categoryId") as string,
      name: form.get("name") as string,
      email: (form.get("email") as string) || undefined,
      phone: (form.get("phone") as string) || undefined,
      gender: (form.get("gender") as string) || undefined,
      birthDate: (form.get("birthDate") as string) || undefined,
      boxName: (form.get("boxName") as string) || undefined,
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
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" name="phone" />
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
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="categoryId">Categoría *</Label>
                <CategorySelect competitionId={competitionId} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="boxName">Box / Affiliate</Label>
                <Input id="boxName" name="boxName" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Fecha de nacimiento</Label>
                <Input id="birthDate" name="birthDate" type="date" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Agregando..." : "Agregar atleta"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <RegistrationsList competitionId={competitionId} />
    </div>
  );
}

function CategorySelect({ competitionId }: { competitionId: string }) {
  const [categories, setCategories] = useState<any[]>([]);

  if (categories.length === 0) {
    fetch(`/api/competitions/${competitionId}/categories`)
      .then((r) => r.json())
      .then(setCategories);
  }

  return (
    <select
      id="categoryId"
      name="categoryId"
      required
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

function RegistrationsList({ competitionId }: { competitionId: string }) {
  const [regs, setRegs] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  if (!loaded) {
    fetch(`/api/competitions/${competitionId}/registrations`)
      .then((r) => r.json())
      .then((data) => {
        setRegs(data);
        setLoaded(true);
      });
  }

  return (
    <div className="space-y-3">
      {!loaded ? (
        <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : regs.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay atletas inscriptos aún.</p>
      ) : (
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Nombre</th>
                <th className="px-4 py-2 text-left font-medium">Categoría</th>
                <th className="px-4 py-2 text-left font-medium">Pago</th>
              </tr>
            </thead>
            <tbody>
              {regs.map((reg: any) => (
                <tr key={reg.id} className="border-t">
                  <td className="px-4 py-2">{reg.athlete.name}</td>
                  <td className="px-4 py-2">{reg.category.name}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        reg.paymentStatus === "PAID" || reg.paymentStatus === "FREE"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {reg.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
