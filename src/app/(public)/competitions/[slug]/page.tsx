import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Wallet,
  Users,
  Trophy,
  Clock,
  Dumbbell,
  ChevronRight,
  Gavel,
  Swords,
  Radio,
  CheckCircle2,
} from "lucide-react";
import { QRCodeButton } from "@/components/QRCode";
import { CompetitionStatus } from "@prisma/client";

function statusConfig(status: CompetitionStatus) {
  const configs = {
    DRAFT: { label: "Borrador", color: "bg-gray-500/15 text-gray-400 border-gray-500/20" },
    PUBLISHED: { label: "Inscripciones abiertas", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
    LIVE: { label: "En vivo", color: "bg-[#ff4d00]/15 text-[#ff4d00] border-[#ff4d00]/20" },
    FINISHED: { label: "Finalizada", color: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
    CANCELLED: { label: "Cancelada", color: "bg-red-500/15 text-red-400 border-red-500/20" },
  };
  return configs[status] || configs.DRAFT;
}

function scoringConfig(type: string) {
  const configs: Record<string, { label: string; icon: typeof Clock }> = {
    FOR_TIME: { label: "For Time", icon: Clock },
    AMRAP: { label: "AMRAP", icon: Trophy },
    EMOM: { label: "EMOM", icon: Clock },
    MAX_WEIGHT: { label: "Max Weight", icon: Dumbbell },
    POINTS: { label: "Points", icon: Trophy },
  };
  return configs[type] || { label: type, icon: Dumbbell };
}

export default async function PublicCompetitionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const competition = await db.competition.findUnique({
    where: { slug },
    include: {
      categories: { orderBy: { order: "asc" } },
      wods: { orderBy: { order: "asc" } },
      _count: { select: { registrations: true } },
    },
  });

  if (!competition || competition.status === "DRAFT") {
    notFound();
  }

  const status = statusConfig(competition.status);
  const athleteCount = competition._count.registrations;
  const isFree = competition.registrationFee === 0;
  const registrationUrl = `/competitions/${competition.slug}/register`;
  const leaderboardUrl = `/competitions/${competition.slug}/leaderboard`;
  const judgeUrl = `/competitions/${competition.slug}/judge`;
  const bracketsUrl = `/competitions/${competition.slug}/brackets`;
  const publicUrl = `${process.env.NEXTAUTH_URL}/competitions/${competition.slug}`;

  return (
    <div className="relative">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Hero gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#ff4d00]/[0.07] via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#ff4d00]/5 blur-[120px] -translate-y-1/2" />
        <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full bg-[#8b5cf6]/5 blur-[100px] -translate-y-1/2" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-12 pb-16 sm:pt-20 sm:pb-24">
          {/* Status badge */}
          <div className="mb-6">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${status.color}`}
            >
              {competition.status === "LIVE" && (
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
                </span>
              )}
              {competition.status !== "LIVE" && <CheckCircle2 size={12} />}
              {status.label}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-5">
            {competition.name}
          </h1>

          {competition.description && (
            <p className="text-lg sm:text-xl text-text-secondary max-w-2xl leading-relaxed mb-8">
              {competition.description}
            </p>
          )}

          {/* Stats bar */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-text-secondary">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-[#ff4d00]" />
              <span>{new Date(competition.startDate).toLocaleDateString("es-AR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}</span>
            </div>
            {competition.location && (
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-[#ff4d00]" />
                <span>{competition.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Wallet size={16} className="text-[#ff4d00]" />
              <span>
                {isFree
                  ? "Inscripción gratuita"
                  : `Inscripción: $${(competition.registrationFee / 100).toFixed(2)} ${competition.currency}`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={16} className="text-[#ff4d00]" />
              <span>{athleteCount} atleta{athleteCount !== 1 ? "s" : ""} inscripto{athleteCount !== 1 ? "s" : ""}</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              href={registrationUrl}
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ff4d00] to-[#ff6b35] px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#ff4d00]/25 transition-all hover:shadow-[#ff4d00]/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              {isFree ? "Inscribirme gratis" : "Inscribirme ahora"}
              <ChevronRight
                size={18}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>

            {competition.status === "LIVE" || competition.status === "FINISHED" ? (
              <Link
                href={leaderboardUrl}
                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-6 py-3.5 text-sm font-medium text-white transition-all hover:bg-white/[0.06] hover:border-white/[0.12]"
              >
                <Radio size={16} className="text-emerald-400" />
                Ver leaderboard
              </Link>
            ) : (
              <Link
                href={leaderboardUrl}
                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-6 py-3.5 text-sm font-medium text-white transition-all hover:bg-white/[0.06] hover:border-white/[0.12]"
              >
                <Trophy size={16} className="text-[#ff4d00]" />
                Leaderboard
              </Link>
            )}

            <Link
              href={bracketsUrl}
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-6 py-3.5 text-sm font-medium text-white transition-all hover:bg-white/[0.06] hover:border-white/[0.12]"
            >
              <Swords size={16} />
              Eliminatorias
            </Link>

            <Link
              href={judgeUrl}
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-6 py-3.5 text-sm font-medium text-white transition-all hover:bg-white/[0.06] hover:border-white/[0.12]"
            >
              <Gavel size={16} />
              Modo Juez
            </Link>

            <QRCodeButton url={`${publicUrl}/register`} label="QR" />
          </div>
        </div>
      </div>

      {/* Content sections */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pb-12 space-y-16">
        {/* Categories */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff4d00]/10 text-[#ff4d00]">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Categorías</h2>
              <p className="text-sm text-text-muted">
                {competition.categories.length} categoría{competition.categories.length !== 1 ? "s" : ""} disponible{competition.categories.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {competition.categories.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 text-center">
              <p className="text-text-muted">Aún no hay categorías definidas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {competition.categories.map((cat) => (
                <div
                  key={cat.id}
                  className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all hover:border-white/[0.12] hover:bg-white/[0.04]"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-base">{cat.name}</h3>
                    <span className="inline-flex items-center rounded-lg bg-white/[0.04] px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-text-muted">
                      {cat.divisionType}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-text-muted">
                    {cat.gender && (
                      <span className="inline-flex items-center gap-1">
                        <Users size={10} />
                        {cat.gender === "MALE"
                          ? "Masculino"
                          : cat.gender === "FEMALE"
                          ? "Femenino"
                          : "Mixto"}
                      </span>
                    )}
                    {cat.maxAthletes && (
                      <span className="inline-flex items-center gap-1">
                        <Trophy size={10} />
                        Cupo: {cat.maxAthletes}
                      </span>
                    )}
                    {(cat.minAge || cat.maxAge) && (
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={10} />
                        {cat.minAge && cat.maxAge
                          ? `${cat.minAge}-${cat.maxAge} años`
                          : cat.minAge
                          ? `+${cat.minAge} años`
                          : `Hasta ${cat.maxAge} años`}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* WODs */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff4d00]/10 text-[#ff4d00]">
              <Dumbbell size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold">WODs</h2>
              <p className="text-sm text-text-muted">
                {competition.wods.length} workout{competition.wods.length !== 1 ? "s" : ""} programado{competition.wods.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {competition.wods.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 text-center">
              <p className="text-text-muted">Aún no hay WODs definidos.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {competition.wods.map((wod, i) => {
                const sc = scoringConfig(wod.scoringType);
                const Icon = sc.icon;
                return (
                  <div
                    key={wod.id}
                    className="group flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all hover:border-white/[0.12] hover:bg-white/[0.04]"
                  >
                    {/* Order number */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff4d00]/20 to-[#ff6b35]/10 text-[#ff4d00] font-bold text-lg">
                      {i + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-base">{wod.name}</h3>
                        <span className="inline-flex items-center gap-1 rounded-lg bg-white/[0.04] px-2 py-0.5 text-[11px] font-medium text-text-muted">
                          <Icon size={10} />
                          {sc.label}
                        </span>
                      </div>
                      {wod.description && (
                        <p className="text-sm text-text-secondary truncate">
                          {wod.description}
                        </p>
                      )}
                    </div>

                    {wod.timeCapMinutes && (
                      <div className="hidden sm:flex items-center gap-1.5 text-sm text-text-muted shrink-0">
                        <Clock size={14} className="text-[#ff4d00]" />
                        <span>{wod.timeCapMinutes} min cap</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Bottom CTA */}
        <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#ff4d00]/10 via-[#0a0a0a] to-[#8b5cf6]/5 p-8 sm:p-12 text-center">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-[#ff4d00]/10 blur-[100px]" />

          <div className="relative">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff4d00] to-[#ff6b35] shadow-xl shadow-[#ff4d00]/20 mb-6">
              <Trophy size={32} className="text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              ¿Listo para competir?
            </h2>
            <p className="text-text-secondary max-w-md mx-auto mb-8">
              Inscribite ahora y formá parte de{" "}
              <span className="text-white font-medium">{competition.name}</span>.
              {isFree
                ? " La inscripción es completamente gratuita."
                : ` El costo de inscripción es $${(competition.registrationFee / 100).toFixed(2)} ${competition.currency}.`}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href={registrationUrl}
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ff4d00] to-[#ff6b35] px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#ff4d00]/25 transition-all hover:shadow-[#ff4d00]/40 hover:scale-[1.02] active:scale-[0.98]"
              >
                {isFree ? "Inscribirme gratis" : "Inscribirme ahora"}
                <ChevronRight
                  size={18}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>
              <Link
                href={leaderboardUrl}
                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-6 py-3.5 text-sm font-medium text-white transition-all hover:bg-white/[0.06]"
              >
                <Trophy size={16} />
                Ver leaderboard
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
