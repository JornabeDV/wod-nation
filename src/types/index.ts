import { CompetitionStatus, ScoringType, Gender, DivisionType, RegistrationStatus, PaymentStatus } from "@prisma/client";

export type { CompetitionStatus, ScoringType, Gender, DivisionType, RegistrationStatus, PaymentStatus };

export interface LeaderboardEntry {
  athleteId: string;
  athleteName: string;
  boxName: string | null;
  scores: {
    wodId: string;
    wodName: string;
    rawScore: string;
    rank: number;
    points: number;
  }[];
  totalPoints: number;
  overallRank: number;
}
