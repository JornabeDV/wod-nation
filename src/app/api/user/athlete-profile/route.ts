import { NextRequest, NextResponse } from "next/server";
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
  });

  if (!athlete) {
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ athlete });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();

  const athlete = await db.athlete.update({
    where: { userId: session.user.id },
    data: {
      name: body.name || undefined,
      email: body.email || undefined,
      phone: body.phone || undefined,
      boxName: body.boxName || undefined,
      gender: body.gender || undefined,
      birthDate: body.birthDate ? new Date(body.birthDate) : undefined,
    },
  });

  return NextResponse.json({ athlete });
}
