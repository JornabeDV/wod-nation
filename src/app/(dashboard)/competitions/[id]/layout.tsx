import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { cn } from "@/lib/utils";

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

      <nav className="flex gap-4 overflow-x-auto border-b pb-px">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-medium transition-colors",
              "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  );
}
