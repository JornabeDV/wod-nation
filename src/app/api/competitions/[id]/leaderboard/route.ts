import { NextRequest, NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/leaderboard";

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

  const result = await getLeaderboard(id, categoryId);
  return NextResponse.json(result);
}
