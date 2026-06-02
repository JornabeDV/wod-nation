"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [competition, setCompetition] = useState<any>(null);

  if (!competition) {
    fetch(`/api/competitions/slug/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setCompetition(data);
        setCategories(data.categories || []);
      });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);

    const res = await fetch("/api/competitions/register", {
      method: "POST",
      body: JSON.stringify({
        slug,
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        gender: form.get("gender"),
        birthDate: form.get("birthDate"),
        boxName: form.get("boxName"),
        categoryId: form.get("categoryId"),
      }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    setLoading(false);

    if (data.paymentUrl) {
      window.location.href = data.paymentUrl;
    } else if (data.success) {
      router.push(`/competitions/${slug}/register/success`);
    } else {
      alert(data.error || "Error al registrar");
    }
  }

  if (!competition) {
    return <p className="text-sm text-muted-foreground">Cargando...</p>;
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Inscripción</h1>
        <p className="text-muted-foreground">{competition.name}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del atleta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo *</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" name="phone" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="gender">Género *</Label>
                <select
                  id="gender"
                  name="gender"
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  <option value="">Seleccionar...</option>
                  <option value="MALE">Masculino</option>
                  <option value="FEMALE">Femenino</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryId">Categoría *</Label>
                <select
                  id="categoryId"
                  name="categoryId"
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  <option value="">Seleccionar...</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="boxName">Box / Affiliate</Label>
              <Input id="boxName" name="boxName" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthDate">Fecha de nacimiento</Label>
              <Input id="birthDate" name="birthDate" type="date" />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? "Procesando..."
                : competition.registrationFee > 0
                ? `Pagar e inscribirme ($${(competition.registrationFee / 100).toFixed(2)})`
                : "Inscribirme gratis"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
