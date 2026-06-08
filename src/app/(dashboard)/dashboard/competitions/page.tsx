import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { CompetitionsListView } from "@/components/dashboard/CompetitionsListView";

export default async function CompetitionsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

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

  const competitions = profile.competitions.map((comp) => ({
    id: comp.id,
    name: comp.name,
    startDate: comp.startDate,
    location: comp.location || "—",
    athletes: comp._count.registrations,
    status: comp.status.toLowerCase() as any,
  }));

  return <CompetitionsListView competitions={competitions} />;
}
