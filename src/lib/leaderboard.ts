import { ScoringType } from "@prisma/client";
import { db } from "./db";

export interface LeaderboardRow {
  athleteId: string;
  athleteName: string;
  boxName: string | null;
  wodScores: {
    wodId: string;
    wodName: string;
    rawScore: string;
    rank: number;
    points: number;
  }[];
  totalPoints: number;
  overallRank: number;
}

export async function getLeaderboard(competitionId: string, categoryId: string) {
  const wods = await db.wOD.findMany({
    where: { competitionId },
    orderBy: { order: "asc" },
  });

  const registrations = await db.registration.findMany({
    where: { competitionId, categoryId, status: "CONFIRMED" },
    include: { athlete: true },
  });

  const allScores = await db.score.findMany({
    where: { competitionId, categoryId },
  });

  const athleteMap = new Map(registrations.map((r) => [r.athleteId, r.athlete]));

  const rows: LeaderboardRow[] = [];

  for (const reg of registrations) {
    const athlete = reg.athlete;
    const wodScores = wods.map((wod) => {
      const score = allScores.find(
        (s) => s.wodId === wod.id && s.athleteId === athlete.id
      );
      return {
        wodId: wod.id,
        wodName: wod.name,
        rawScore: score?.rawScore ?? "—",
        rank: 0,
        points: 0,
      };
    });

    rows.push({
      athleteId: athlete.id,
      athleteName: athlete.name,
      boxName: athlete.boxName,
      wodScores,
      totalPoints: 0,
      overallRank: 0,
    });
  }

  // Calculate ranks per WOD
  for (const wod of wods) {
    const wodScores = allScores.filter((s) => s.wodId === wod.id);
    const sorted = [...wodScores].sort((a, b) => {
      if (a.value == null && b.value == null) return 0;
      if (a.value == null) return 1;
      if (b.value == null) return -1;
      if (wod.scoringType === ScoringType.FOR_TIME) {
        return a.value - b.value;
      }
      return b.value - a.value;
    });

    let currentRank = 1;
    let previousValue: number | null = null;

    for (let i = 0; i < sorted.length; i++) {
      const score = sorted[i];
      if (score.value == null) continue;

      if (previousValue !== null && score.value !== previousValue) {
        currentRank = i + 1;
      }
      previousValue = score.value;

      const row = rows.find((r) => r.athleteId === score.athleteId);
      if (row) {
        const ws = row.wodScores.find((w) => w.wodId === wod.id);
        if (ws) {
          ws.rank = currentRank;
          ws.points = currentRank;
        }
      }
    }
  }

  // Calculate totals and sort
  for (const row of rows) {
    row.totalPoints = row.wodScores.reduce((sum, ws) => sum + ws.points, 0);
  }

  rows.sort((a, b) => a.totalPoints - b.totalPoints);

  let overallRank = 1;
  let previousTotal = -1;
  for (let i = 0; i < rows.length; i++) {
    if (previousTotal !== -1 && rows[i].totalPoints !== previousTotal) {
      overallRank = i + 1;
    }
    previousTotal = rows[i].totalPoints;
    rows[i].overallRank = overallRank;
  }

  return { wods, rows };
}
