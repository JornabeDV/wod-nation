import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PublicCompetitionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const competition = await db.competition.findUnique({
    where: { slug },
    include: {
      categories: { orderBy: { order: "asc" } },
      wods: { orderBy: { order: "asc" } },
    },
  });

  if (!competition || competition.status === "DRAFT") {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{competition.name}</h1>
        {competition.description && (
          <p className="text-muted-foreground">{competition.description}</p>
        )}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span>{new Date(competition.startDate).toLocaleDateString("es-AR")}</span>
          {competition.location && <span>📍 {competition.location}</span>}
          {competition.registrationFee > 0 && (
            <span>
              💰 Inscripción: ${(competition.registrationFee / 100).toFixed(2)} {competition.currency}
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <Button asChild>
          <Link href={`/competitions/${competition.slug}/register`}>Inscribirme</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/competitions/${competition.slug}/leaderboard`}>Leaderboard</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Categorías</CardTitle>
          </CardHeader>
          <CardContent>
            {competition.categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay categorías definidas.</p>
            ) : (
              <ul className="space-y-2">
                {competition.categories.map((cat) => (
                  <li key={cat.id} className="text-sm">
                    {cat.name}
                    {cat.maxAthletes ? ` (cupo: ${cat.maxAthletes})` : ""}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>WODs</CardTitle>
          </CardHeader>
          <CardContent>
            {competition.wods.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay WODs definidos.</p>
            ) : (
              <ul className="space-y-3">
                {competition.wods.map((wod) => (
                  <li key={wod.id} className="text-sm">
                    <p className="font-medium">{wod.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {wod.scoringType}
                      {wod.timeCapMinutes ? ` — ${wod.timeCapMinutes} min cap` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
