import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const competition = await db.competition.findUnique({
    where: { slug },
    include: {
      categories: { orderBy: { order: "asc" } },
      wods: { orderBy: { order: "asc" } },
    },
  });

  if (!competition || competition.status === "DRAFT") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(competition);
}
