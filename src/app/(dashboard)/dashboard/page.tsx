import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardHomeView } from "@/components/dashboard/DashboardHomeView";

import { AthleteDashboardView } from "@/components/athlete/AthleteDashboardView";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  let profile = await db.organizerProfile.findUnique({
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
    profile = await db.organizerProfile.create({
      data: { userId: session.user.id },
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
    redirect("/onboarding");
  }

  if (!profile.hasCompletedOnboarding) {
    redirect("/onboarding");
  }

  const totalCompetitions = profile.competitions.length;
  const totalAthletes = profile.competitions.reduce(
    (sum, c) => sum + c._count.registrations,
    0
  );
  const upcomingCompetitions = profile.competitions.filter(
    (c) => new Date(c.startDate) > new Date()
  );

  const competitions = profile.competitions.map((comp) => ({
    id: comp.id,
    name: comp.name,
    startDate: comp.startDate,
    registrations: comp._count.registrations,
    status: comp.status.toLowerCase(),
  }));

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-lg font-semibold mb-4">Mis inscripciones</h2>
        <AthleteDashboardView />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Mis competencias</h2>
        <DashboardHomeView
          userName={session.user.name}
          totalCompetitions={totalCompetitions}
          totalAthletes={totalAthletes}
          upcomingCount={upcomingCompetitions.length}
          competitions={competitions}
          showHeader={false}
        />
      </div>
    </div>
  );
}
