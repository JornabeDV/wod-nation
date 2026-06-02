"use server";

import { db } from "./db";
import { revalidatePath } from "next/cache";
import { CompetitionStatus, ScoringType } from "@prisma/client";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
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
