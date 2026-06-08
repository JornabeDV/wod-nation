"use server";

import { db } from "./db";
import { revalidatePath } from "next/cache";
import { CompetitionStatus, ScoringType } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { broadcast } from "./events";
import { sendEmail, isEmailConfigured } from "./email";
import { passwordResetEmailTemplate } from "./email-templates";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  const existing = await db.user.findUnique({
    where: { email: data.email },
  });

  if (existing) {
    throw new Error("El email ya está registrado");
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);

  const user = await db.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
    },
  });

  await db.organizerProfile.create({
    data: { userId: user.id },
  });

  return { success: true, userId: user.id };
}

export async function createCompetition(data: {
  name: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  registrationDeadline?: string;
  registrationFee?: number;
  maxAthletes?: number;
  organizerId: string;
}) {
  const baseSlug = slugify(data.name);
  let slug = baseSlug;
  let counter = 1;

  while (await db.competition.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  const comp = await db.competition.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      location: data.location,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      registrationDeadline: data.registrationDeadline
        ? new Date(data.registrationDeadline)
        : null,
      registrationFee: data.registrationFee ?? 0,
      maxAthletes: data.maxAthletes,
      organizerId: data.organizerId,
    },
  });

  revalidatePath("/dashboard/competitions");
  return comp;
}

export async function updateCompetition(
  id: string,
  data: {
    name?: string;
    description?: string;
    location?: string;
    startDate?: string;
    endDate?: string | null;
    registrationDeadline?: string | null;
    registrationFee?: number;
    maxAthletes?: number | null;
    status?: CompetitionStatus;
  }
) {
  const comp = await db.competition.update({
    where: { id },
    data: {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate === null ? null : data.endDate ? new Date(data.endDate) : undefined,
      registrationDeadline:
        data.registrationDeadline === null
          ? null
          : data.registrationDeadline
          ? new Date(data.registrationDeadline)
          : undefined,
      maxAthletes: data.maxAthletes === null ? null : data.maxAthletes,
    },
  });

  revalidatePath(`/dashboard/competitions/${id}`);
  return comp;
}

export async function deleteCompetition(id: string) {
  await db.competition.delete({ where: { id } });
  revalidatePath("/dashboard/competitions");
}

export async function createCategory(data: {
  competitionId: string;
  name: string;
  gender?: string;
  divisionType?: string;
  minAge?: number;
  maxAge?: number;
  maxAthletes?: number;
}) {
  const category = await db.category.create({
    data: {
      competitionId: data.competitionId,
      name: data.name,
      gender: data.gender as any,
      divisionType: (data.divisionType as any) ?? "CUSTOM",
      minAge: data.minAge,
      maxAge: data.maxAge,
      maxAthletes: data.maxAthletes,
    },
  });
  revalidatePath(`/dashboard/competitions/${data.competitionId}/categories`);
  return category;
}

export async function deleteCategory(id: string, competitionId: string) {
  await db.category.delete({ where: { id } });
  revalidatePath(`/dashboard/competitions/${competitionId}/categories`);
}

export async function createWOD(data: {
  competitionId: string;
  name: string;
  description?: string;
  scoringType: ScoringType;
  timeCapMinutes?: number;
  standards?: string;
}) {
  const count = await db.wOD.count({ where: { competitionId: data.competitionId } });
  const wod = await db.wOD.create({
    data: {
      ...data,
      order: count,
    },
  });
  revalidatePath(`/dashboard/competitions/${data.competitionId}/wods`);
  return wod;
}

export async function deleteWOD(id: string, competitionId: string) {
  await db.wOD.delete({ where: { id } });
  revalidatePath(`/dashboard/competitions/${competitionId}/wods`);
}

export async function submitScore(data: {
  competitionId: string;
  wodId: string;
  categoryId: string;
  athleteId: string;
  rawScore: string;
  value: number;
  notes?: string;
  judgeName?: string;
}) {
  const score = await db.score.upsert({
    where: {
      wodId_athleteId: {
        wodId: data.wodId,
        athleteId: data.athleteId,
      },
    },
    update: {
      rawScore: data.rawScore,
      value: data.value,
      notes: data.notes,
      judgeName: data.judgeName,
    },
    create: {
      competitionId: data.competitionId,
      wodId: data.wodId,
      categoryId: data.categoryId,
      athleteId: data.athleteId,
      rawScore: data.rawScore,
      value: data.value,
      notes: data.notes,
      judgeName: data.judgeName,
    },
  });

  revalidatePath(`/dashboard/competitions/${data.competitionId}/scores`);
  revalidatePath(`/competitions/${data.competitionId}/leaderboard`);

  broadcast(data.competitionId, {
    type: "score_updated",
    wodId: data.wodId,
    athleteId: data.athleteId,
    rawScore: data.rawScore,
  });

  return score;
}

export async function createManualRegistration(data: {
  competitionId: string;
  categoryId: string;
  name: string;
  email?: string;
  phone?: string;
  gender?: string;
  birthDate?: string;
  boxName?: string;
}) {
  const athlete = await db.athlete.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      gender: data.gender as any,
      birthDate: data.birthDate ? new Date(data.birthDate) : null,
      boxName: data.boxName,
    },
  });

  const registration = await db.registration.create({
    data: {
      competitionId: data.competitionId,
      categoryId: data.categoryId,
      athleteId: athlete.id,
      paymentStatus: "FREE",
    },
  });

  revalidatePath(`/dashboard/competitions/${data.competitionId}/athletes`);
  return { athlete, registration };
}


export async function requestPasswordReset(email: string) {
  const user = await db.user.findUnique({ where: { email } });

  // Don't reveal if user exists for security
  if (!user) {
    return { success: true };
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await db.user.update({
    where: { id: user.id },
    data: {
      resetToken: token,
      resetTokenExpires: expires,
    },
  });

  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  const { html, subject, text } = passwordResetEmailTemplate(resetUrl, user.name);

  const emailConfigured = isEmailConfigured();

  if (emailConfigured) {
    try {
      await sendEmail({ to: email, subject, html, text });
    } catch {
      // Even if email fails, don't leak that user exists
    }
  } else {
    // Log for development/testing until Resend is configured
    console.log("\n🔐 PASSWORD RESET LINK (Resend not configured)\n");
    console.log(`   Email: ${email}`);
    console.log(`   URL:   ${resetUrl}\n`);
  }

  return { success: true, emailConfigured };
}

export async function resetPassword(token: string, newPassword: string) {
  if (!token || newPassword.length < 6) {
    throw new Error("Token inválido o contraseña demasiado corta");
  }

  const user = await db.user.findUnique({
    where: { resetToken: token },
  });

  if (!user || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
    throw new Error("El link de recuperación expiró o es inválido");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await db.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpires: null,
    },
  });

  return { success: true };
}
