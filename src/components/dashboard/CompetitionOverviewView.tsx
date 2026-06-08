"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import {
  Users,
  Layers,
  Dumbbell,
  ExternalLink,
  UserCircle,
} from "lucide-react";
import { QRCodeButton } from "@/components/QRCode";
import { useI18n } from "@/lib/i18n/provider";

interface Category {
  id: string;
  name: string;
  divisionType: string;
}

interface WOD {
  id: string;
  name: string;
  scoringType: string;
}

interface CompetitionOverviewViewProps {
  competition: {
    slug: string;
    status: string;
    registrationsCount: number;
    categories: Category[];
    wods: WOD[];
    organizer?: {
      id: string;
      name: string | null;
    };
  };
}

export function CompetitionOverviewView({ competition }: CompetitionOverviewViewProps) {
  const { t } = useI18n();
  const d = t.dashboard.competition;

  const publicUrl = `${process.env.NEXTAUTH_URL}/competitions/${competition.slug}`;

  const LinkRow = ({
    url,
    label,
  }: {
    url: string;
    label: string;
  }) => (
    <div className="flex items-center gap-3">
      <input
        readOnly
        value={url}
        className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-secondary focus:outline-none"
      />
      <Link
        href={url}
        target="_blank"
        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-text-secondary hover:text-text hover:border-border-hover transition-colors"
      >
        <ExternalLink size={14} />
        {d.publicLinks.open}
      </Link>
      <QRCodeButton url={url} label={d.publicLinks.qr} />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-surface-raised p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-secondary">{d.stats.status}</span>
            <StatusBadge status={competition.status.toLowerCase() as any} />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface-raised p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-secondary">{d.stats.athletes}</span>
            <Users size={16} className="text-text-muted" />
          </div>
          <div className="text-2xl font-bold">{competition.registrationsCount}</div>
        </div>
        <div className="rounded-xl border border-border bg-surface-raised p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-secondary">{d.stats.categories}</span>
            <Layers size={16} className="text-text-muted" />
          </div>
          <div className="text-2xl font-bold">{competition.categories.length}</div>
        </div>
        <div className="rounded-xl border border-border bg-surface-raised p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-secondary">{d.stats.wods}</span>
            <Dumbbell size={16} className="text-text-muted" />
          </div>
          <div className="text-2xl font-bold">{competition.wods.length}</div>
        </div>
      </div>

      {/* Organizer */}
      {competition.organizer && (
        <div className="rounded-xl border border-border bg-surface-raised p-5">
          <Link
            href={`/organizer/${competition.organizer.id}`}
            className="flex items-center gap-3 text-sm text-text-secondary hover:text-text transition-colors"
          >
            <UserCircle size={18} className="text-[#ff4d00]" />
            <span>
              Organizado por <span className="font-medium text-white">{competition.organizer.name}</span>
            </span>
            <ExternalLink size={14} className="ml-auto" />
          </Link>
        </div>
      )}

      {/* Public Links */}
      <div className="rounded-xl border border-border bg-surface-raised p-5">
        <h3 className="text-sm font-medium mb-4">{d.publicLinks.title}</h3>
        <div className="space-y-3">
          <LinkRow url={publicUrl} label={d.publicLinks.open} />
          <LinkRow url={`${publicUrl}/leaderboard`} label={d.publicLinks.leaderboard} />
          <LinkRow url={`${publicUrl}/judge`} label={d.publicLinks.judge} />
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-surface-raised p-5">
          <h3 className="text-sm font-medium mb-4">{d.sections.categories}</h3>
          {competition.categories.length === 0 ? (
            <p className="text-sm text-text-secondary">{d.sections.emptyCategories}</p>
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
          <h3 className="text-sm font-medium mb-4">{d.sections.wods}</h3>
          {competition.wods.length === 0 ? (
            <p className="text-sm text-text-secondary">{d.sections.emptyWods}</p>
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
