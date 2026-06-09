import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, email: true, role: true, image: true },
  });

  if (!user) {
    return NextResponse.json({ user: null }, { status: 404 });
  }

  return NextResponse.json({ user });
}
