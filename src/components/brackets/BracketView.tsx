"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";

interface BracketAthlete {
  id: string;
  name: string;
}

interface BracketMatch {
  id: string;
  round: number;
  position: number;
  athlete1: BracketAthlete | null;
  athlete2: BracketAthlete | null;
  winner: BracketAthlete | null;
  score1: string | null;
  score2: string | null;
}

interface BracketViewProps {
  matches: BracketMatch[];
  onUpdateMatch?: (matchId: string, winnerId: string, score1: string, score2: string) => void;
  readOnly?: boolean;
}

export function BracketView({ matches, onUpdateMatch, readOnly = false }: BracketViewProps) {
  const rounds = Array.from(new Set(matches.map((m) => m.round))).sort((a, b) => a - b);
  const roundNames: Record<number, string> = {
    1: "Octavos",
    2: "Cuartos",
    3: "Semifinal",
    4: "Final",
    5: "Gran Final",
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex items-start gap-8 min-w-max px-4 py-6">
        {rounds.map((round, roundIdx) => {
          const roundMatches = matches.filter((m) => m.round === round);
          return (
            <div key={round} className="flex flex-col justify-center gap-6" style={{ minHeight: 300 }}>
              <div className="text-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                  {roundNames[round] || `Ronda ${round}`}
                </span>
              </div>
              {roundMatches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  roundIdx={roundIdx}
                  onUpdate={onUpdateMatch}
                  readOnly={readOnly}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MatchCard({
  match,
  roundIdx,
  onUpdate,
  readOnly,
}: {
  match: BracketMatch;
  roundIdx: number;
  onUpdate?: (matchId: string, winnerId: string, score1: string, score2: string) => void;
  readOnly: boolean;
}) {
  const [score1, setScore1] = useState(match.score1 || "");
  const [score2, setScore2] = useState(match.score2 || "");
  const [winnerId, setWinnerId] = useState(match.winner?.id || "");

  const isWinner = (id?: string | null) => winnerId && id === winnerId;

  function save() {
    if (!winnerId || !onUpdate) return;
    onUpdate(match.id, winnerId, score1, score2);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: roundIdx * 0.1 }}
      className="w-56 rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden"
    >
      <div className="px-3 py-2 border-b border-white/[0.06] flex items-center justify-between">
        <span className="text-[10px] text-text-muted uppercase tracking-wider">
          Match {match.position + 1}
        </span>
        {match.winner && <Trophy size={12} className="text-[#ff4d00]" />}
      </div>

      <div className="divide-y divide-white/[0.04]">
        {[match.athlete1, match.athlete2].map((athlete, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-2 px-3 py-2.5 transition-colors ${
              isWinner(athlete?.id) ? "bg-[#ff4d00]/10" : ""
            }`}
          >
            {!readOnly && athlete && (
              <button
                onClick={() => setWinnerId(athlete.id)}
                className={`h-4 w-4 rounded-full border transition-colors ${
                  winnerId === athlete.id
                    ? "bg-[#ff4d00] border-[#ff4d00]"
                    : "border-white/20 hover:border-[#ff4d00]"
                }`}
              />
            )}
            <span className={`text-sm flex-1 truncate ${isWinner(athlete?.id) ? "font-medium text-white" : "text-text-secondary"}`}>
              {athlete?.name || "—"}
            </span>
            {!readOnly ? (
              <input
                type="text"
                value={idx === 0 ? score1 : score2}
                onChange={(e) => (idx === 0 ? setScore1(e.target.value) : setScore2(e.target.value))}
                placeholder="—"
                className="w-12 text-right text-xs font-mono bg-transparent text-white focus:outline-none"
              />
            ) : (
              <span className="text-xs font-mono text-text-muted">
                {idx === 0 ? match.score1 : match.score2 || "—"}
              </span>
            )}
          </div>
        ))}
      </div>

      {!readOnly && match.athlete1 && match.athlete2 && winnerId && (
        <button
          onClick={save}
          className="w-full py-1.5 text-xs font-medium text-[#ff4d00] hover:bg-[#ff4d00]/10 transition-colors"
        >
          Guardar
        </button>
      )}
    </motion.div>
  );
}
