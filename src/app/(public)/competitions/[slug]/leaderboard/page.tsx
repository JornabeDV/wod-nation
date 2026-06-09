"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import {
  Maximize2,
  Minimize2,
  Trophy,
  Medal,
  Award,
  Clock,
  Gavel,
  Radio,
  RefreshCw,
} from "lucide-react";
import { LeaderboardExport } from "@/components/leaderboard/LeaderboardExport";
import { CertificateGenerator } from "@/components/certificates/CertificateGenerator";
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
        <div
          className={`h-16 w-16 rounded-full ${color} flex items-center justify-center text-2xl font-bold shadow-lg`}
        >
          {rank === 1 ? (
            <Trophy size={28} />
          ) : rank === 2 ? (
            <Medal size={24} />
          ) : (
            <Award size={24} />
          )}
        </div>
        <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-surface-raised border border-border flex items-center justify-center text-xs font-bold">
          {rank}
        </div>
      </div>
      <div className="text-center mb-2">
        <div className="font-semibold text-sm truncate max-w-[120px]">{name}</div>
        <div className="text-xs text-text-muted truncate max-w-[120px]">
          {box || "—"}
        </div>
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

function LiveIndicator({
  isConnected,
  isRefreshing,
}: {
  isConnected: boolean;
  isRefreshing: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex items-center justify-center">
        <div
          className={`h-2.5 w-2.5 rounded-full ${
            isConnected ? "bg-emerald-500" : "bg-amber-500"
          }`}
        />
        {isConnected && (
          <div className="absolute h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping opacity-75" />
        )}
      </div>
      <span
        className={`text-xs font-medium ${
          isConnected ? "text-emerald-400" : "text-amber-400"
        }`}
      >
        {isConnected ? "LIVE" : "Polling"}
      </span>
      <RefreshCw
        size={12}
        className={`text-text-muted transition-transform ${
          isRefreshing ? "animate-spin" : ""
        }`}
      />
    </div>
  );
}

export default function LeaderboardPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [competition, setCompetition] = useState<any>(null);
  const [categoryId, setCategoryId] = useState<string>("");
  const [fullscreen, setFullscreen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [sseConnected, setSseConnected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const sseRef = useRef<EventSource | null>(null);

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

  // SWR for initial data + fallback polling
  const leaderboardUrl =
    competition && categoryId
      ? `/api/competitions/${competition.id}/leaderboard?categoryId=${categoryId}`
      : null;

  const { data: leaderboard, mutate } = useSWR(leaderboardUrl, fetcher, {
    refreshInterval: sseConnected ? 0 : 10000,
    onSuccess: () => setLastUpdated(new Date()),
  });

  // SSE for real-time updates
  useEffect(() => {
    if (!competition) return;

    const es = new EventSource(`/api/competitions/${competition.id}/events`);
    sseRef.current = es;

    es.onopen = () => setSseConnected(true);

    es.onmessage = (event) => {
      if (event.data.startsWith("ping")) return;
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "score_updated") {
          setIsRefreshing(true);
          mutate().then(() => {
            setLastUpdated(new Date());
            setTimeout(() => setIsRefreshing(false), 600);
          });
        }
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      setSseConnected(false);
      es.close();
      // Reconnect after 3s
      setTimeout(() => {
        if (sseRef.current === es) {
          sseRef.current = null;
        }
      }, 3000);
    };

    return () => {
      es.close();
      sseRef.current = null;
    };
  }, [competition, mutate]);

  const top3 = leaderboard?.rows?.slice(0, 3) || [];

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
    <div className="min-h-screen bg-background print:bg-white print:text-black">
      {/* Header */}
      <div className="border-b border-border print:hidden">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
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
            <div className="flex items-center gap-3 flex-wrap">
              <LiveIndicator isConnected={sseConnected} isRefreshing={isRefreshing} />
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <Clock size={14} />
                {lastUpdated.toLocaleTimeString()}
              </div>
              <LeaderboardExport
                competitionName={competition.name}
                categoryName={
                  competition.categories.find((c: any) => c.id === categoryId)?.name || ""
                }
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

      {/* Print header (visible only when printing) */}
      <div className="hidden print:block px-8 py-6">
        <h1 className="text-2xl font-bold">{competition.name}</h1>
        <p className="text-sm text-gray-600">
          Leaderboard —{" "}
          {competition.categories.find((c: any) => c.id === categoryId)?.name || ""}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Generated {new Date().toLocaleString()}
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Podium */}
        {leaderboard && top3.length > 0 && (
          <div className="flex items-end justify-center gap-4 sm:gap-8 mb-10 print:hidden">
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
          <div className="rounded-xl border border-border bg-surface-raised overflow-hidden print:border-gray-300 print:bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-sm print:text-black">
                <thead>
                  <tr className="border-b border-border bg-surface print:bg-gray-100 print:border-gray-300">
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase w-16 print:text-gray-600">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase print:text-gray-600">
                      Athlete
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase print:text-gray-600">
                      Box
                    </th>
                    {leaderboard.wods.map((wod: any) => (
                      <th
                        key={wod.id}
                        className="px-4 py-3 text-center text-xs font-medium text-text-muted uppercase print:text-gray-600"
                      >
                        {wod.name}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-center text-xs font-medium text-text-muted uppercase print:text-gray-600">
                      Total
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-text-muted uppercase print:hidden w-24"></th>
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
                        className="border-b border-border/50 hover:bg-surface-elevated/30 transition-colors print:border-gray-200 print:hover:bg-transparent"
                      >
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                              row.overallRank === 1
                                ? "bg-yellow-500/20 text-yellow-400 print:bg-yellow-100 print:text-yellow-700"
                                : row.overallRank === 2
                                ? "bg-gray-400/20 text-gray-400 print:bg-gray-100 print:text-gray-700"
                                : row.overallRank === 3
                                ? "bg-orange-500/20 text-orange-400 print:bg-orange-100 print:text-orange-700"
                                : "text-text-muted print:text-gray-500"
                            }`}
                          >
                            {row.overallRank}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium">{row.athleteName}</td>
                        <td className="px-4 py-3 text-text-secondary print:text-gray-600">
                          {row.boxName || "—"}
                        </td>
                        {row.wodScores.map((ws: any) => (
                          <td key={ws.wodId} className="px-4 py-3 text-center">
                            <div>{ws.rawScore}</div>
                            <div className="text-xs text-text-muted print:text-gray-500">
                              ({ws.points} pts)
                            </div>
                          </td>
                        ))}
                        <td className="px-4 py-3 text-center font-bold">
                          {row.totalPoints}
                        </td>
                        <td className="px-4 py-3 print:hidden">
                          <CertificateGenerator
                            athleteName={row.athleteName}
                            competitionName={competition.name}
                            categoryName={competition.categories.find((c: any) => c.id === categoryId)?.name}
                            date={new Date(competition.startDate).toLocaleDateString("es-AR")}
                            rank={row.overallRank}
                          />
                        </td>
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

        <p className="text-center text-xs text-text-muted mt-4 print:hidden">
          {sseConnected
            ? "Connected via real-time stream"
            : "Auto-refreshes every 10 seconds"}
        </p>
      </div>
    </div>
  );
}
