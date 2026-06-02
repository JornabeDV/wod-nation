import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const registrations = await db.registration.findMany({
    where: { competitionId: id },
    include: { athlete: true, category: true },
    orderBy: { registeredAt: "desc" },
  });
  return NextResponse.json(registrations);
}
