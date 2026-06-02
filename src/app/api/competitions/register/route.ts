import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createPaymentPreference } from "@/lib/mercadopago";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, name, email, phone, gender, birthDate, boxName, categoryId } = body;

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

    // Create athlete
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

    // Create registration
    const registration = await db.registration.create({
      data: {
        competitionId: competition.id,
        categoryId,
        athleteId: athlete.id,
        paymentStatus: competition.registrationFee > 0 ? "PENDING" : "FREE",
      },
    });

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
