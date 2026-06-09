import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const athlete = await db.athlete.findUnique({
    where: { userId: session.user.id },
    include: {
      registrations: {
        include: {
          competition: {
            include: {
              categories: { select: { id: true, name: true } },
              wods: { select: { id: true, name: true, scoringType: true } },
              _count: { select: { registrations: true } },
            },
          },
          category: { select: { id: true, name: true } },
          athlete: {
            include: {
              scores: {
                include: { wod: { select: { name: true, scoringType: true } } },
              },
            },
          },
        },
        orderBy: { registeredAt: "desc" },
      },
    },
  });

  if (!athlete) {
    return NextResponse.json({ registrations: [] });
  }

  return NextResponse.json({ registrations: athlete.registrations });
}
