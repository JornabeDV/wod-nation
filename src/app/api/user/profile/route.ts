import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const profile = await db.organizerProfile.findUnique({
    where: { userId: session.user.id },
    include: { user: { select: { name: true, email: true } } },
  });

  if (!profile) {
    return new Response("Not found", { status: 404 });
  }

  return Response.json({
    name: profile.user.name,
    email: profile.user.email,
    boxName: profile.boxName,
    phone: profile.phone,
    bio: profile.bio,
    website: profile.website,
    instagram: profile.instagram,
  });
}
