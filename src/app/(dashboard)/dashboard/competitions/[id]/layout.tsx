import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { CompetitionTabs } from "@/components/layout/competition-tabs";

export default async function CompetitionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const competition = await db.competition.findUnique({
    where: { id },
    include: { organizer: true },
  });

  if (!competition || competition.organizer.userId !== session.user.id) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={competition.name}
        description={`${competition.location || "No location"} · ${new Date(
          competition.startDate
        ).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}`}
        backHref="/dashboard/competitions"
      />

      <CompetitionTabs competitionId={id} />

      {children}
    </div>
  );
}
