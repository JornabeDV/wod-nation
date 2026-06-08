"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { createCategory, deleteCategory } from "@/lib/actions";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n/provider";

export default function CategoriesPage() {
  const params = useParams();
  const competitionId = params.id as string;
  const [loading, setLoading] = useState(false);
  const { t } = useI18n();
  const d = t.dashboard.categoriesPage;

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
      <PageHeader title={d.title} description={d.description} />

      <div className="rounded-xl border border-border bg-surface-raised p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="name">{d.name}</Label>
              <Input id="name" name="name" placeholder={d.namePlaceholder} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">{d.gender}</Label>
              <select id="gender" name="gender" className="flex h-9 w-full rounded-lg border border-border bg-surface px-3 py-1 text-sm">
                <option value="">—</option>
                <option value="MALE">{t.dashboard.newCompetition.categories.gender.male}</option>
                <option value="FEMALE">{t.dashboard.newCompetition.categories.gender.female}</option>
                <option value="MIXED">{t.dashboard.newCompetition.categories.gender.mixed}</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="divisionType">{d.division}</Label>
              <select id="divisionType" name="divisionType" className="flex h-9 w-full rounded-lg border border-border bg-surface px-3 py-1 text-sm">
                <option value="CUSTOM">{t.dashboard.newCompetition.categories.division.custom}</option>
                <option value="RX">{t.dashboard.newCompetition.categories.division.rx}</option>
                <option value="SCALED">{t.dashboard.newCompetition.categories.division.scaled}</option>
                <option value="ELITE">{t.dashboard.newCompetition.categories.division.elite}</option>
                <option value="MASTER">{t.dashboard.newCompetition.categories.division.master}</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxAthletes">{d.maxAthletes}</Label>
              <Input id="maxAthletes" name="maxAthletes" type="number" min="1" />
            </div>
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

      <CategoriesList competitionId={competitionId} />
    </div>
  );
}

function CategoriesList({ competitionId }: { competitionId: string }) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const { t } = useI18n();
  const d = t.dashboard.categoriesPage;

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
        <p className="text-sm text-text-secondary">{t.dashboard.common.loading}</p>
      ) : categories.length === 0 ? (
        <p className="text-sm text-text-secondary">{d.empty}</p>
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
              {t.dashboard.common.delete}
            </button>
          </div>
        ))
      )}
    </div>
  );
}
