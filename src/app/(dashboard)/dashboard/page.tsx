import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import {
  Trophy,
  TrendingUp,
  PlusCircle,
  ArrowRight,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const profile = await db.organizerProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      competitions: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          _count: { select: { registrations: true } },
        },
      },
    },
  });

  if (!profile) {
    await db.organizerProfile.create({
      data: { userId: session.user.id },
    });
    redirect("/dashboard");
  }

  const totalCompetitions = profile.competitions.length;
  const totalAthletes = profile.competitions.reduce(
    (sum, c) => sum + c._count.registrations,
    0
  );
  const upcomingCompetitions = profile.competitions.filter(
    (c) => new Date(c.startDate) > new Date()
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-text-secondary mt-1">
          Welcome back, {session.user.name?.split(" ")[0] || "Organizer"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Competitions"
          value={totalCompetitions}
          icon="trophy"
          change="+2 this month"
          changeType="positive"
          delay={0}
        />
        <StatCard
          label="Total Athletes"
          value={totalAthletes}
          icon="users"
          change="+12 this week"
          changeType="positive"
          delay={0.1}
        />
        <StatCard
          label="Upcoming"
          value={upcomingCompetitions.length}
          icon="calendar"
          change="Next: 3 days"
          changeType="neutral"
          delay={0.2}
        />
        <StatCard
          label="Revenue"
          value="$0"
          icon="dollar"
          change="0%"
          changeType="neutral"
          delay={0.3}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/dashboard/competitions/new"
          className="group flex items-center gap-4 rounded-xl border border-border bg-surface-raised p-5 hover:border-border-hover transition-all"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <PlusCircle size={20} />
          </div>
          <div>
            <div className="font-medium">New Competition</div>
            <div className="text-xs text-text-secondary">Create in under 5 min</div>
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
            <div className="font-medium">Manage Competitions</div>
            <div className="text-xs text-text-secondary">Edit, publish, track</div>
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
            <div className="font-medium">View Analytics</div>
            <div className="text-xs text-text-secondary">Registrations & revenue</div>
          </div>
          <ArrowRight
            size={16}
            className="ml-auto text-text-muted group-hover:text-text transition-colors"
          />
        </Link>
      </div>

      {/* Recent Competitions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Competitions</h2>
          <Link
            href="/dashboard/competitions"
            className="text-sm text-primary hover:text-primary-glow transition-colors"
          >
            View all
          </Link>
        </div>

        {profile.competitions.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface-raised p-12 text-center">
            <Trophy size={32} className="mx-auto mb-3 text-text-muted" />
            <p className="text-text-secondary mb-4">No competitions yet.</p>
            <Link
              href="/dashboard/competitions/new"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-glow transition-colors"
            >
              <PlusCircle size={16} />
              Create your first
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {profile.competitions.map((comp) => (
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
                      {new Date(comp.startDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                      · {comp._count.registrations} athletes
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
