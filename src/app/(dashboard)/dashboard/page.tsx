import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Users, DollarSign, Calendar } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/");

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen de tus competencias y actividad reciente.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Competencias</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompetitions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Atletas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAthletes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Próximas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingCompetitions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Competencias recientes</h2>
        <Button asChild size="sm">
          <Link href="/dashboard/competitions/new">Nueva competencia</Link>
        </Button>
      </div>

      {profile.competitions.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Aún no creaste ninguna competencia.</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/competitions/new">Crear la primera</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {profile.competitions.map((comp) => (
            <Link key={comp.id} href={`/dashboard/competitions/${comp.id}`}>
              <Card className="transition-colors hover:bg-accent">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{comp.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(comp.startDate).toLocaleDateString("es-AR")} —{" "}
                      {comp._count.registrations} inscriptos
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      comp.status === "LIVE"
                        ? "bg-green-100 text-green-700"
                        : comp.status === "FINISHED"
                        ? "bg-zinc-100 text-zinc-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {comp.status}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
