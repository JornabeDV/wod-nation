"use server";

import { db } from "./db";

export interface BracketNode {
  id: string;
  round: number;
  position: number;
  athlete1?: { id: string; name: string } | null;
  athlete2?: { id: string; name: string } | null;
  winner?: { id: string; name: string } | null;
  score1?: string | null;
  score2?: string | null;
}

export async function getBracketMatches(competitionId: string, categoryId: string) {
  const matches = await db.bracketMatch.findMany({
    where: { competitionId, categoryId },
    include: {
      athlete1: { select: { id: true, name: true } },
      athlete2: { select: { id: true, name: true } },
      winner: { select: { id: true, name: true } },
    },
    orderBy: [{ round: "asc" }, { position: "asc" }],
  });

  return matches;
}

export async function generateBracket(competitionId: string, categoryId: string) {
  // Get confirmed registrations for this category
  const registrations = await db.registration.findMany({
    where: { competitionId, categoryId, status: "CONFIRMED" },
    include: { athlete: { select: { id: true, name: true } } },
  });

  const athletes = registrations.map((r) => r.athlete);
  if (athletes.length < 2) {
    throw new Error("Se necesitan al menos 2 atletas para generar un bracket");
  }

  // Delete existing bracket matches
  await db.bracketMatch.deleteMany({ where: { competitionId, categoryId } });

  // Determine bracket size (next power of 2)
  const size = Math.pow(2, Math.ceil(Math.log2(athletes.length)));
  const rounds = Math.log2(size);

  // Shuffle athletes randomly for seeding
  const shuffled = [...athletes].sort(() => Math.random() - 0.5);

  // Create first round matches
  const firstRoundMatches: { round: number; position: number; athlete1Id?: string; athlete2Id?: string }[] = [];
  for (let i = 0; i < size / 2; i++) {
    const a1 = shuffled[i * 2];
    const a2 = shuffled[i * 2 + 1];
    firstRoundMatches.push({
      round: 1,
      position: i,
      athlete1Id: a1?.id,
      athlete2Id: a2?.id,
    });
  }

  // Create empty matches for subsequent rounds
  const allMatches = [...firstRoundMatches];
  for (let r = 2; r <= rounds; r++) {
    const matchCount = size / Math.pow(2, r);
    for (let p = 0; p < matchCount; p++) {
      allMatches.push({ round: r, position: p });
    }
  }

  await db.bracketMatch.createMany({
    data: allMatches.map((m) => ({
      competitionId,
      categoryId,
      round: m.round,
      position: m.position,
      athlete1Id: m.athlete1Id || null,
      athlete2Id: m.athlete2Id || null,
    })),
  });

  return getBracketMatches(competitionId, categoryId);
}

export async function updateBracketMatch(
  matchId: string,
  data: { score1?: string; score2?: string; winnerId?: string }
) {
  const match = await db.bracketMatch.update({
    where: { id: matchId },
    data: {
      score1: data.score1,
      score2: data.score2,
      winnerId: data.winnerId,
    },
    include: {
      athlete1: { select: { id: true, name: true } },
      athlete2: { select: { id: true, name: true } },
      winner: { select: { id: true, name: true } },
    },
  });

  // Advance winner to next round
  if (data.winnerId && match.round < 10) {
    const nextRound = match.round + 1;
    const nextPosition = Math.floor(match.position / 2);
    const isFirstSlot = match.position % 2 === 0;

    const nextMatch = await db.bracketMatch.findUnique({
      where: {
        competitionId_categoryId_round_position: {
          competitionId: match.competitionId,
          categoryId: match.categoryId,
          round: nextRound,
          position: nextPosition,
        },
      },
    });

    if (nextMatch) {
      await db.bracketMatch.update({
        where: { id: nextMatch.id },
        data: isFirstSlot
          ? { athlete1Id: data.winnerId }
          : { athlete2Id: data.winnerId },
      });
    }
  }

  return match;
}
