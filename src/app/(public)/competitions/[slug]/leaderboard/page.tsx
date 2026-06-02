"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function LeaderboardPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [competition, setCompetition] = useState<any>(null);
  const [categoryId, setCategoryId] = useState<string>("");

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

  const { data: leaderboard, error } = useSWR(
    competition && categoryId
      ? `/api/competitions/${competition.id}/leaderboard?categoryId=${categoryId}`
      : null,
    fetcher,
    { refreshInterval: 10000 }
  );

  if (!competition) {
    return <p className="text-center text-sm text-muted-foreground">Cargando...</p>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">{competition.name}</h1>
        <p className="text-muted-foreground">Leaderboard en vivo</p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {competition.categories.map((cat: any) => (
          <button
            key={cat.id}
            onClick={() => setCategoryId(cat.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              categoryId === cat.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-center text-sm text-destructive">Error al cargar leaderboard.</p>
      )}

      {leaderboard ? (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-3 py-2 text-left font-medium">#</th>
                <th className="px-3 py-2 text-left font-medium">Atleta</th>
                <th className="px-3 py-2 text-left font-medium">Box</th>
                {leaderboard.wods.map((wod: any) => (
                  <th key={wod.id} className="px-3 py-2 text-center font-medium">
                    {wod.name}
                  </th>
                ))}
                <th className="px-3 py-2 text-center font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.rows.map((row: any) => (
                <tr key={row.athleteId} className="border-t">
                  <td className="px-3 py-2 font-bold">{row.overallRank}</td>
                  <td className="px-3 py-2">{row.athleteName}</td>
                  <td className="px-3 py-2 text-muted-foreground">{row.boxName || "—"}</td>
                  {row.wodScores.map((ws: any) => (
                    <td key={ws.wodId} className="px-3 py-2 text-center">
                      <div>{ws.rawScore}</div>
                      <div className="text-xs text-muted-foreground">({ws.points} pts)</div>
                    </td>
                  ))}
                  <td className="px-3 py-2 text-center font-bold">{row.totalPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-sm text-muted-foreground">Cargando leaderboard...</p>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Se actualiza automáticamente cada 10 segundos.
      </p>
    </div>
  );
}
