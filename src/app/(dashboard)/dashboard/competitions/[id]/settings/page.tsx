"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { updateCompetition, deleteCompetition } from "@/lib/actions";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useI18n } from "@/lib/i18n/provider";

export default function SettingsPage() {
  const params = useParams();
  const router = useRouter();
  const competitionId = params.id as string;
  const [loading, setLoading] = useState(false);
  const { t } = useI18n();
  const d = t.dashboard.settingsPage;

  async function handleStatusChange(status: string) {
    setLoading(true);
    await updateCompetition(competitionId, { status: status as any });
    setLoading(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(d.deleteConfirm)) return;
    setLoading(true);
    await deleteCompetition(competitionId);
    router.push("/dashboard/competitions");
  }

  return (
    <div className="space-y-6">
      <PageHeader title={d.title} description={d.description} />

      <div className="rounded-xl border border-border bg-surface-raised p-5">
        <h3 className="text-sm font-medium mb-4">{d.statusTitle}</h3>
        <div className="flex flex-wrap gap-2">
          {["DRAFT", "PUBLISHED", "LIVE", "FINISHED", "CANCELLED"].map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              disabled={loading}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary hover:text-text hover:border-border-hover transition-colors disabled:opacity-50"
            >
              {d.setStatus.replace("{status}", status)}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
        <h3 className="text-sm font-medium text-red-400 mb-2">{d.dangerTitle}</h3>
        <p className="text-sm text-text-secondary mb-4">
          {d.dangerDescription}
        </p>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
        >
          {d.deleteButton}
        </button>
      </div>
    </div>
  );
}
