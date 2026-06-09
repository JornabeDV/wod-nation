import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { createPaymentPreference } from "@/lib/mercadopago";
import { sendEmail, isEmailConfigured } from "@/lib/email";
import { newRegistrationEmailTemplate } from "@/lib/email-templates";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, name, email, phone, gender, birthDate, boxName, categoryId } = body;

    const session = await getServerSession(authOptions);
    const isAthleteUser = (session?.user as any)?.role === "ATHLETE";

    const competition = await db.competition.findUnique({ where: { slug } });
    if (!competition) {
      return NextResponse.json({ error: "Competencia no encontrada" }, { status: 404 });
    }

    if (competition.status !== "PUBLISHED" && competition.status !== "LIVE") {
      return NextResponse.json({ error: "Inscripciones cerradas" }, { status: 400 });
    }

    // Check category capacity
    const category = await db.category.findUnique({ where: { id: categoryId } });
    if (!category || category.competitionId !== competition.id) {
      return NextResponse.json({ error: "Categoría inválida" }, { status: 400 });
    }

    if (category.maxAthletes) {
      const count = await db.registration.count({ where: { categoryId } });
      if (count >= category.maxAthletes) {
        return NextResponse.json({ error: "Cupo lleno" }, { status: 400 });
      }
    }

    let athleteId: string;

    if (isAthleteUser && session?.user?.id) {
      // Try to find existing athlete for this user
      const existingAthlete = await db.athlete.findUnique({
        where: { userId: session.user.id },
      });

      if (existingAthlete) {
        // Update athlete data if provided
        athleteId = existingAthlete.id;
        if (name || email || phone || boxName || gender || birthDate) {
          await db.athlete.update({
            where: { id: athleteId },
            data: {
              name: name || undefined,
              email: email || undefined,
              phone: phone || undefined,
              boxName: boxName || undefined,
              gender: gender || undefined,
              birthDate: birthDate ? new Date(birthDate) : undefined,
            },
          });
        }
      } else {
        const newAthlete = await db.athlete.create({
          data: {
            userId: session.user.id,
            name: name || session.user.name || "Sin nombre",
            email: email || session.user.email || undefined,
            phone,
            gender,
            birthDate: birthDate ? new Date(birthDate) : null,
            boxName,
          },
        });
        athleteId = newAthlete.id;
      }
    } else {
      // Anonymous registration
      const athlete = await db.athlete.create({
        data: {
          name,
          email,
          phone,
          gender,
          birthDate: birthDate ? new Date(birthDate) : null,
          boxName,
        },
      });
      athleteId = athlete.id;
    }

    // Create registration
    const registration = await db.registration.create({
      data: {
        competitionId: competition.id,
        categoryId,
        athleteId,
        paymentStatus: competition.registrationFee > 0 ? "PENDING" : "FREE",
      },
    });

    // Send notification email to organizer
    try {
      const organizer = await db.organizerProfile.findUnique({
        where: { id: competition.organizerId },
        include: { user: { select: { email: true, name: true } } },
      });

      if (organizer?.user?.email && isEmailConfigured()) {
        const athleteRecord = await db.athlete.findUnique({ where: { id: athleteId } });
        const { html, subject, text } = newRegistrationEmailTemplate(
          competition.name,
          athleteRecord?.name || "Atleta",
          category.name,
          organizer.user.name
        );
        await sendEmail({
          to: organizer.user.email,
          subject,
          html,
          text,
        });
      }
    } catch (emailErr) {
      console.error("[Registration] Failed to send notification email:", emailErr);
    }

    if (competition.registrationFee > 0) {
      const preference = await createPaymentPreference({
        title: `Inscripción - ${competition.name}`,
        price: competition.registrationFee,
        registrationId: registration.id,
        competitionSlug: competition.slug,
      });

      await db.registration.update({
        where: { id: registration.id },
        data: { paymentId: preference.id },
      });

      return NextResponse.json({ paymentUrl: preference.init_point });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Error" }, { status: 500 });
  }
}
