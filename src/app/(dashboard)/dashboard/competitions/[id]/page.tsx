import { db } from "@/lib/db";
import Link from "next/link";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import {
  Users,
  Layers,
  Dumbbell,
  ExternalLink,
  Copy,
  Share2,
} from "lucide-react";
import { QRCodeButton } from "@/components/QRCode";

export default async function CompetitionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const competition = await db.competition.findUnique({
    where: { id },
    include: {
      categories: { orderBy: { order: "asc" } },
      wods: { orderBy: { order: "asc" } },
      _count: { select: { registrations: true } },
    },
  });

  if (!competition) return null;

  const publicUrl = `${process.env.NEXTAUTH_URL}/competitions/${competition.slug}`;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-surface-raised p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-secondary">Status</span>
            <StatusBadge status={competition.status.toLowerCase() as any} />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface-raised p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-secondary">Athletes</span>
            <Users size={16} className="text-text-muted" />
          </div>
          <div className="text-2xl font-bold">{competition._count.registrations}</div>
        </div>
        <div className="rounded-xl border border-border bg-surface-raised p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-secondary">Categories</span>
            <Layers size={16} className="text-text-muted" />
          </div>
          <div className="text-2xl font-bold">{competition.categories.length}</div>
        </div>
        <div className="rounded-xl border border-border bg-surface-raised p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-secondary">WODs</span>
            <Dumbbell size={16} className="text-text-muted" />
          </div>
          <div className="text-2xl font-bold">{competition.wods.length}</div>
        </div>
      </div>

      {/* Public Links */}
      <div className="rounded-xl border border-border bg-surface-raised p-5">
        <h3 className="text-sm font-medium mb-4">Public Links</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              readOnly
              value={publicUrl}
              className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-secondary focus:outline-none"
            />
            <Link
              href={`/competitions/${competition.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-text-secondary hover:text-text hover:border-border-hover transition-colors"
            >
              <ExternalLink size={14} />
              Open
            </Link>
            <QRCodeButton url={publicUrl} label="QR" />
          </div>
          <div className="flex items-center gap-3">
            <input
              readOnly
              value={`${publicUrl}/leaderboard`}
              className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-secondary focus:outline-none"
            />
            <Link
              href={`/competitions/${competition.slug}/leaderboard`}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-text-secondary hover:text-text hover:border-border-hover transition-colors"
            >
              <ExternalLink size={14} />
              Leaderboard
            </Link>
            <QRCodeButton url={`${publicUrl}/leaderboard`} label="QR" />
          </div>
          <div className="flex items-center gap-3">
            <input
              readOnly
              value={`${publicUrl}/judge`}
              className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-secondary focus:outline-none"
            />
            <Link
              href={`/competitions/${competition.slug}/judge`}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-text-secondary hover:text-text hover:border-border-hover transition-colors"
            >
              <ExternalLink size={14} />
              Judge
            </Link>
            <QRCodeButton url={`${publicUrl}/judge`} label="QR" />
          </div>
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-surface-raised p-5">
          <h3 className="text-sm font-medium mb-4">Categories</h3>
          {competition.categories.length === 0 ? (
            <p className="text-sm text-text-secondary">No categories yet.</p>
          ) : (
            <div className="space-y-2">
              {competition.categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                >
                  <span className="text-sm">{cat.name}</span>
                  <span className="text-xs text-text-muted px-2 py-0.5 rounded-full bg-surface">
                    {cat.divisionType}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-surface-raised p-5">
          <h3 className="text-sm font-medium mb-4">WODs</h3>
          {competition.wods.length === 0 ? (
            <p className="text-sm text-text-secondary">No WODs yet.</p>
          ) : (
            <div className="space-y-2">
              {competition.wods.map((wod) => (
                <div
                  key={wod.id}
                  className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                >
                  <span className="text-sm">{wod.name}</span>
                  <span className="text-xs text-text-muted px-2 py-0.5 rounded-full bg-surface">
                    {wod.scoringType}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
