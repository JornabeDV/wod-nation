import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("categoryId");

  if (!categoryId) {
    return NextResponse.json({ error: "categoryId required" }, { status: 400 });
  }

  const matches = await db.bracketMatch.findMany({
    where: { competitionId: id, categoryId },
    include: {
      athlete1: { select: { id: true, name: true } },
      athlete2: { select: { id: true, name: true } },
      winner: { select: { id: true, name: true } },
    },
    orderBy: [{ round: "asc" }, { position: "asc" }],
  });

  return NextResponse.json({ matches });
}
