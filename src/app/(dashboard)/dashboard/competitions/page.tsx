import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { DataTable } from "@/components/dashboard/DataTable";
import { PlusCircle, ArrowRight, Trophy } from "lucide-react";

export default async function CompetitionsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const profile = await db.organizerProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      competitions: {
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { registrations: true } },
        },
      },
    },
  });

  if (!profile) redirect("/dashboard");

  const competitions = profile.competitions.map((comp) => ({
    id: comp.id,
    name: comp.name,
    date: new Date(comp.startDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    location: comp.location || "—",
    athletes: comp._count.registrations,
    status: comp.status.toLowerCase() as any,
    slug: comp.slug,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Competitions"
        description="Manage all your competitions from one place."
        actions={
          <Link
            href="/dashboard/competitions/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-glow transition-colors"
          >
            <PlusCircle size={16} />
            New Competition
          </Link>
        }
      />

      {competitions.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface-raised p-16 text-center">
          <Trophy size={40} className="mx-auto mb-4 text-text-muted" />
          <h3 className="text-lg font-semibold mb-2">No competitions yet</h3>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            Create your first competition to start managing athletes, WODs, and
            leaderboards.
          </p>
          <Link
            href="/dashboard/competitions/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-glow transition-colors"
          >
            <PlusCircle size={16} />
            Create Competition
          </Link>
        </div>
      ) : (
        <DataTable
          data={competitions}
          columns={[
            {
              key: "name",
              header: "Name",
              cell: (row) => (
                <div className="font-medium">{row.name}</div>
              ),
            },
            {
              key: "date",
              header: "Date",
              cell: (row) => (
                <span className="text-text-secondary">{row.date}</span>
              ),
            },
            {
              key: "location",
              header: "Location",
              cell: (row) => (
                <span className="text-text-secondary">{row.location}</span>
              ),
            },
            {
              key: "athletes",
              header: "Athletes",
              cell: (row) => (
                <span className="text-text-secondary">{row.athletes}</span>
              ),
            },
            {
              key: "status",
              header: "Status",
              cell: (row) => <StatusBadge status={row.status} />,
            },
            {
              key: "actions",
              header: "",
              width: "60px",
              cell: (row) => (
                <Link
                  href={`/dashboard/competitions/${row.id}`}
                  className="inline-flex p-2 rounded-lg hover:bg-surface-elevated text-text-muted hover:text-text transition-colors"
                >
                  <ArrowRight size={16} />
                </Link>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}
