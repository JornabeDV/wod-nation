import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { CompetitionTabs } from "@/components/layout/competition-tabs";
import { CompetitionHeader } from "@/components/dashboard/CompetitionHeader";

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
      <CompetitionHeader
        name={competition.name}
        location={competition.location}
        startDate={competition.startDate}
      />

      <CompetitionTabs competitionId={id} />

      {children}
    </div>
  );
}
