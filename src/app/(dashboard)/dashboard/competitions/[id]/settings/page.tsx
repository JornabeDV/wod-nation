"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { updateCompetition, deleteCompetition } from "@/lib/actions";
import { PageHeader } from "@/components/dashboard/PageHeader";

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
    if (!confirm("Are you sure you want to delete this competition? This cannot be undone.")) return;
    setLoading(true);
    await deleteCompetition(competitionId);
    router.push("/dashboard/competitions");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage competition status and danger zone." />

      <div className="rounded-xl border border-border bg-surface-raised p-5">
        <h3 className="text-sm font-medium mb-4">Competition Status</h3>
        <div className="flex flex-wrap gap-2">
          {["DRAFT", "PUBLISHED", "LIVE", "FINISHED", "CANCELLED"].map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              disabled={loading}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary hover:text-text hover:border-border-hover transition-colors disabled:opacity-50"
            >
              Set {status}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
        <h3 className="text-sm font-medium text-red-400 mb-2">Danger Zone</h3>
        <p className="text-sm text-text-secondary mb-4">
          Deleting a competition permanently removes all data including athletes, scores, and registrations.
        </p>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
        >
          Delete Competition
        </button>
      </div>
    </div>
  );
}
