"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { createCategory, deleteCategory } from "@/lib/actions";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      <PageHeader title="Categories" description="Define divisions for your competition." />

      <div className="rounded-xl border border-border bg-surface-raised p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" placeholder="RX Masculino" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <select id="gender" name="gender" className="flex h-9 w-full rounded-lg border border-border bg-surface px-3 py-1 text-sm">
                <option value="">—</option>
                <option value="MALE">Masculino</option>
                <option value="FEMALE">Femenino</option>
                <option value="MIXED">Mixto</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="divisionType">División</Label>
              <select id="divisionType" name="divisionType" className="flex h-9 w-full rounded-lg border border-border bg-surface px-3 py-1 text-sm">
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
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-glow transition-colors disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Category"}
            </button>
          </div>
        </form>
      </div>

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
        <p className="text-sm text-text-secondary">Loading...</p>
      ) : categories.length === 0 ? (
        <p className="text-sm text-text-secondary">No categories yet.</p>
      ) : (
        categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center justify-between rounded-xl border border-border bg-surface-raised p-4"
          >
            <div>
              <p className="font-medium">{cat.name}</p>
              <p className="text-xs text-text-muted">{cat.gender} · {cat.divisionType}</p>
            </div>
            <button
              onClick={() => deleteCategory(cat.id, competitionId).then(() => setLoaded(false))}
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
