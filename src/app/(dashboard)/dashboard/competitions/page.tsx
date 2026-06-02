import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function CompetitionsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/");

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Competencias</h1>
          <p className="text-muted-foreground">
            Administrá todas tus competencias desde aquí.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/competitions/new">Nueva competencia</Link>
        </Button>
      </div>

      {profile.competitions.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No tenés competencias aún.</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/competitions/new">Crear la primera</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {profile.competitions.map((comp) => (
            <Link key={comp.id} href={`/dashboard/competitions/${comp.id}`}>
              <Card className="transition-colors hover:bg-accent">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{comp.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(comp.startDate).toLocaleDateString("es-AR")} —{" "}
                      {comp.location || "Sin ubicación"} —{" "}
                      {comp._count.registrations} inscriptos
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      comp.status === "LIVE"
                        ? "bg-green-100 text-green-700"
                        : comp.status === "FINISHED"
                        ? "bg-zinc-100 text-zinc-700"
                        : comp.status === "PUBLISHED"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-amber-100 text-amber-700"
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
