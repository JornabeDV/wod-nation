import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const categories = await db.category.findMany({
    where: { competitionId: id },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(categories);
}
