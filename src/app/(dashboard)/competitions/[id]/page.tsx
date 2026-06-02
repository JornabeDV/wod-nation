import { db } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{competition.status}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Inscriptos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{competition._count.registrations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Categorías</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{competition.categories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">WODs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{competition.wods.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Links públicos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={publicUrl}
              className="flex-1 rounded-md border bg-muted px-3 py-2 text-sm"
            />
            <Button asChild size="sm" variant="outline">
              <Link href={`/competitions/${competition.slug}`} target="_blank">
                Ver
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={`${publicUrl}/leaderboard`}
              className="flex-1 rounded-md border bg-muted px-3 py-2 text-sm"
            />
            <Button asChild size="sm" variant="outline">
              <Link href={`/competitions/${competition.slug}/leaderboard`} target="_blank">
                Ver Leaderboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Categorías</CardTitle>
          </CardHeader>
          <CardContent>
            {competition.categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay categorías aún.</p>
            ) : (
              <ul className="space-y-2">
                {competition.categories.map((cat) => (
                  <li key={cat.id} className="flex items-center justify-between text-sm">
                    <span>{cat.name}</span>
                    <span className="text-xs text-muted-foreground">{cat.divisionType}</span>
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
              <p className="text-sm text-muted-foreground">No hay WODs aún.</p>
            ) : (
              <ul className="space-y-2">
                {competition.wods.map((wod) => (
                  <li key={wod.id} className="flex items-center justify-between text-sm">
                    <span>{wod.name}</span>
                    <span className="text-xs text-muted-foreground">{wod.scoringType}</span>
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
