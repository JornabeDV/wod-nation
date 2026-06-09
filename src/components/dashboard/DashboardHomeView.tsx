"use client";

import Link from "next/link";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { DashboardTour } from "@/components/dashboard/DashboardTour";
import {
  Trophy,
  TrendingUp,
  PlusCircle,
  ArrowRight,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

interface CompetitionItem {
  id: string;
  name: string;
  startDate: Date;
  registrations: number;
  status: string;
}

interface DashboardHomeViewProps {
  userName?: string | null;
  totalCompetitions: number;
  totalAthletes: number;
  upcomingCount: number;
  competitions: CompetitionItem[];
  showHeader?: boolean;
}

export function DashboardHomeView({
  userName,
  totalCompetitions,
  totalAthletes,
  upcomingCount,
  competitions,
  showHeader = true,
}: DashboardHomeViewProps) {
  const { t, locale } = useI18n();

  const firstName = userName?.split(" ")[0] || "";
  const welcome = t.dashboard.home.welcome.replace("{name}", firstName || t.dashboard.header.userFallback);

  const dateFormatter = new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-8">
      {showHeader && (
        <>
          <DashboardTour />

          {/* Header */}
          <div data-tour="welcome">
            <h1 className="text-2xl font-bold tracking-tight">{t.dashboard.home.title}</h1>
            <p className="text-text-secondary mt-1">{welcome}</p>
          </div>
        </>
      )}

      {/* Stats — solo cuando hay competencias */}
      {competitions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-tour="stats">
          <StatCard
            label={t.dashboard.home.stats.totalCompetitions}
            value={totalCompetitions}
            icon="trophy"
            change="+2 this month"
            changeType="positive"
            delay={0}
          />
          <StatCard
            label={t.dashboard.home.stats.totalAthletes}
            value={totalAthletes}
            icon="users"
            change="+12 this week"
            changeType="positive"
            delay={0.1}
          />
          <StatCard
            label={t.dashboard.home.stats.upcoming}
            value={upcomingCount}
            icon="calendar"
            change="Next: 3 days"
            changeType="neutral"
            delay={0.2}
          />
          <StatCard
            label={t.dashboard.home.stats.revenue}
            value="$0"
            icon="dollar"
            change="0%"
            changeType="neutral"
            delay={0.3}
          />
        </div>
      )}

      {/* Quick Actions — solo cuando hay competencias */}
      {competitions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-tour="quick-actions">
          <Link
            href="/dashboard/competitions/new"
            className="group flex items-center gap-4 rounded-xl border border-border bg-surface-raised p-5 hover:border-border-hover transition-all"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <PlusCircle size={20} />
            </div>
            <div>
              <div className="font-medium">{t.dashboard.home.quickActions.newCompetition.title}</div>
              <div className="text-xs text-text-secondary">{t.dashboard.home.quickActions.newCompetition.subtitle}</div>
            </div>
            <ArrowRight
              size={16}
              className="ml-auto text-text-muted group-hover:text-text transition-colors"
            />
          </Link>

          <Link
            href="/dashboard/competitions"
            className="group flex items-center gap-4 rounded-xl border border-border bg-surface-raised p-5 hover:border-border-hover transition-all"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-blue/10 text-accent-blue">
              <Trophy size={20} />
            </div>
            <div>
              <div className="font-medium">{t.dashboard.home.quickActions.manageCompetitions.title}</div>
              <div className="text-xs text-text-secondary">{t.dashboard.home.quickActions.manageCompetitions.subtitle}</div>
            </div>
            <ArrowRight
              size={16}
              className="ml-auto text-text-muted group-hover:text-text transition-colors"
            />
          </Link>

          <Link
            href="/dashboard/competitions"
            className="group flex items-center gap-4 rounded-xl border border-border bg-surface-raised p-5 hover:border-border-hover transition-all"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-purple/10 text-accent-purple">
              <TrendingUp size={20} />
            </div>
            <div>
              <div className="font-medium">{t.dashboard.home.quickActions.viewAnalytics.title}</div>
              <div className="text-xs text-text-secondary">{t.dashboard.home.quickActions.viewAnalytics.subtitle}</div>
            </div>
            <ArrowRight
              size={16}
              className="ml-auto text-text-muted group-hover:text-text transition-colors"
            />
          </Link>
        </div>
      )}

      {/* Recent Competitions */}
      <div data-tour="recent-competitions">
        {competitions.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{t.dashboard.home.recentCompetitions.title}</h2>
            <Link
              href="/dashboard/competitions"
              className="text-sm text-primary hover:text-primary-glow transition-colors"
            >
              {t.dashboard.home.recentCompetitions.viewAll}
            </Link>
          </div>
        )}

        {competitions.length === 0 ? (
          <div className="text-center py-16 text-text-muted">
            <Trophy size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg mb-2">{t.dashboard.home.recentCompetitions.empty.title}</p>
            <Link
              href="/dashboard/competitions/new"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              {t.dashboard.home.recentCompetitions.empty.cta} <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {competitions.map((comp) => (
              <Link
                key={comp.id}
                href={`/dashboard/competitions/${comp.id}`}
                className="group flex items-center justify-between rounded-xl border border-border bg-surface-raised p-4 hover:border-border-hover transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-elevated text-text-muted group-hover:text-primary transition-colors">
                    <Trophy size={18} />
                  </div>
                  <div>
                    <div className="font-medium">{comp.name}</div>
                    <div className="text-xs text-text-secondary">
                      {dateFormatter.format(new Date(comp.startDate))}
                      {" · "}
                      {t.dashboard.home.recentCompetitions.athletes.replace("{count}", String(comp.registrations))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={comp.status.toLowerCase() as any} />
                  <ArrowRight
                    size={16}
                    className="text-text-muted group-hover:text-text transition-colors"
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
