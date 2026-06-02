"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, Minimize2, Trophy, Medal, Award, Clock, Gavel } from "lucide-react";
import { LeaderboardExport } from "@/components/leaderboard/LeaderboardExport";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function PodiumPlace({
  rank,
  name,
  box,
  points,
  color,
  height,
  delay,
}: {
  rank: number;
  name: string;
  box: string | null;
  points: number;
  color: string;
  height: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center"
    >
      <div className="mb-3 relative">
        <div className={`h-16 w-16 rounded-full ${color} flex items-center justify-center text-2xl font-bold shadow-lg`}>
          {rank === 1 ? <Trophy size={28} /> : rank === 2 ? <Medal size={24} /> : <Award size={24} />}
        </div>
        <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-surface-raised border border-border flex items-center justify-center text-xs font-bold">
          {rank}
        </div>
      </div>
      <div className="text-center mb-2">
        <div className="font-semibold text-sm truncate max-w-[120px]">{name}</div>
        <div className="text-xs text-text-muted truncate max-w-[120px]">{box || "—"}</div>
      </div>
      <motion.div
        initial={{ height: 0 }}
        animate={{ height }}
        transition={{ duration: 0.8, delay: delay + 0.2, ease: [0.22, 1, 0.36, 1] }}
        className={`w-24 ${color} rounded-t-lg flex items-end justify-center pb-3`}
      >
        <span className="text-sm font-bold">{points} pts</span>
      </motion.div>
    </motion.div>
  );
}

export default function LeaderboardPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [competition, setCompetition] = useState<any>(null);
  const [categoryId, setCategoryId] = useState<string>("");
  const [fullscreen, setFullscreen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetch(`/api/competitions/slug/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setCompetition(data);
        if (data.categories?.[0]) {
          setCategoryId(data.categories[0].id);
        }
      });
  }, [slug]);

  const { data: leaderboard } = useSWR(
    competition && categoryId
      ? `/api/competitions/${competition.id}/leaderboard?categoryId=${categoryId}`
      : null,
    fetcher,
    { refreshInterval: 10000, onSuccess: () => setLastUpdated(new Date()) }
  );

  const top3 = leaderboard?.rows?.slice(0, 3) || [];
  const rest = leaderboard?.rows?.slice(3) || [];

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  if (!competition) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-text-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl sm:text-3xl font-bold tracking-tight"
              >
                {competition.name}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-text-secondary text-sm mt-1"
              >
                Live Leaderboard
              </motion.p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <Clock size={14} />
                Updated {lastUpdated.toLocaleTimeString()}
              </div>
              <LeaderboardExport
                competitionName={competition.name}
                categoryName={competition.categories.find((c: any) => c.id === categoryId)?.name || ""}
                leaderboardData={leaderboard}
              />
              <Link
                href={`/competitions/${slug}/judge`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-text-secondary hover:text-text hover:border-border-hover transition-colors"
              >
                <Gavel size={14} />
                Judge
              </Link>
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-lg hover:bg-surface-raised text-text-muted hover:text-text transition-colors"
              >
                {fullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {competition.categories.map((cat: any, i: number) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setCategoryId(cat.id)}
                className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  categoryId === cat.id
                    ? "bg-primary text-white"
                    : "bg-surface-raised text-text-secondary hover:text-text border border-border hover:border-border-hover"
                }`}
              >
                {cat.name}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Podium */}
        {leaderboard && top3.length > 0 && (
          <div className="flex items-end justify-center gap-4 sm:gap-8 mb-10">
            {top3[1] && (
              <PodiumPlace
                rank={2}
                name={top3[1].athleteName}
                box={top3[1].boxName}
                points={top3[1].totalPoints}
                color="bg-gradient-to-t from-gray-600/30 to-gray-400/20"
                height="120px"
                delay={0.2}
              />
            )}
            {top3[0] && (
              <PodiumPlace
                rank={1}
                name={top3[0].athleteName}
                box={top3[0].boxName}
                points={top3[0].totalPoints}
                color="bg-gradient-to-t from-yellow-600/30 to-yellow-400/20"
                height="160px"
                delay={0.1}
              />
            )}
            {top3[2] && (
              <PodiumPlace
                rank={3}
                name={top3[2].athleteName}
                box={top3[2].boxName}
                points={top3[2].totalPoints}
                color="bg-gradient-to-t from-orange-700/30 to-orange-500/20"
                height="100px"
                delay={0.3}
              />
            )}
          </div>
        )}

        {/* Table */}
        {leaderboard ? (
          <div className="rounded-xl border border-border bg-surface-raised overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface">
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase w-16">#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Athlete</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Box</th>
                    {leaderboard.wods.map((wod: any) => (
                      <th key={wod.id} className="px-4 py-3 text-center text-xs font-medium text-text-muted uppercase">
                        {wod.name}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-center text-xs font-medium text-text-muted uppercase">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {leaderboard.rows.map((row: any, i: number) => (
                      <motion.tr
                        key={row.athleteId}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.02 }}
                        className="border-b border-border/50 hover:bg-surface-elevated/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                              row.overallRank === 1
                                ? "bg-yellow-500/20 text-yellow-400"
                                : row.overallRank === 2
                                ? "bg-gray-400/20 text-gray-400"
                                : row.overallRank === 3
                                ? "bg-orange-500/20 text-orange-400"
                                : "text-text-muted"
                            }`}
                          >
                            {row.overallRank}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium">{row.athleteName}</td>
                        <td className="px-4 py-3 text-text-secondary">{row.boxName || "—"}</td>
                        {row.wodScores.map((ws: any) => (
                          <td key={ws.wodId} className="px-4 py-3 text-center">
                            <div>{ws.rawScore}</div>
                            <div className="text-xs text-text-muted">({ws.points} pts)</div>
                          </td>
                        ))}
                        <td className="px-4 py-3 text-center font-bold">{row.totalPoints}</td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 text-text-muted">Loading leaderboard...</div>
        )}

        <p className="text-center text-xs text-text-muted mt-4">
          Auto-refreshes every 10 seconds
        </p>
      </div>
    </div>
  );
}
