import { db } from "@/lib/db";
import { CompetitionOverviewView } from "@/components/dashboard/CompetitionOverviewView";

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
      organizer: {
        include: {
          user: { select: { name: true } },
        },
      },
      _count: { select: { registrations: true } },
    },
  });

  if (!competition) return null;

  return (
    <CompetitionOverviewView
      competition={{
        slug: competition.slug,
        status: competition.status.toLowerCase(),
        registrationsCount: competition._count.registrations,
        categories: competition.categories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          divisionType: cat.divisionType,
        })),
        wods: competition.wods.map((wod) => ({
          id: wod.id,
          name: wod.name,
          scoringType: wod.scoringType,
        })),
        organizer: {
          id: competition.organizer.id,
          name: competition.organizer.user.name,
        },
      }}
    />
  );
}
