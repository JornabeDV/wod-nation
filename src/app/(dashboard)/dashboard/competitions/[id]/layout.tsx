import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { CompetitionTabs } from "@/components/layout/competition-tabs";

export default async function CompetitionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/");

  const { id } = await params;

  const competition = await db.competition.findUnique({
    where: { id },
    include: { organizer: true },
  });

  if (!competition || competition.organizer.userId !== session.user.id) {
    notFound();
  }

  const tabs = [
    { label: "General", href: `/dashboard/competitions/${id}` },
    { label: "Categorías", href: `/dashboard/competitions/${id}/categories` },
    { label: "WODs", href: `/dashboard/competitions/${id}/wods` },
    { label: "Atletas", href: `/dashboard/competitions/${id}/athletes` },
    { label: "Puntajes", href: `/dashboard/competitions/${id}/scores` },
    { label: "Configuración", href: `/dashboard/competitions/${id}/settings` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{competition.name}</h1>
        <p className="text-muted-foreground">
          {competition.location} — {new Date(competition.startDate).toLocaleDateString("es-AR")}
        </p>
      </div>

      <CompetitionTabs tabs={tabs} />

      {children}
    </div>
  );
}
