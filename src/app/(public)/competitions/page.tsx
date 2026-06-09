import Link from "next/link";
import { db } from "@/lib/db";
import { CompetitionStatus } from "@prisma/client";
import {
  Calendar,
  MapPin,
  Users,
  Wallet,
  Trophy,
  Radio,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

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

export default async function CompetitionsPage() {
  const competitions = await db.competition.findMany({
    where: {
      status: { notIn: [CompetitionStatus.DRAFT, CompetitionStatus.CANCELLED] },
    },
    orderBy: { startDate: "desc" },
    include: {
      _count: { select: { registrations: true } },
      categories: { select: { id: true } },
      organizer: { select: { boxName: true } },
    },
  });

  const now = new Date();

  const upcoming = competitions.filter((c) => new Date(c.startDate) > now);
  const live = competitions.filter((c) => c.status === CompetitionStatus.LIVE);
  const finished = competitions.filter((c) => c.status === CompetitionStatus.FINISHED);

  return (
    <div className="relative">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#ff4d00]/[0.07] via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#ff4d00]/5 blur-[120px] -translate-y-1/2" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-12 pb-10 sm:pt-20 sm:pb-16">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Competencias
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl">
            Descubrí las próximas competencias de CrossFit y fitness en tu región. Inscribite, competí y seguí tu progreso.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 pb-20 space-y-16">
        {/* Live */}
        {live.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff4d00] opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-[#ff4d00]" />
              </div>
              <h2 className="text-xl font-bold">En vivo ahora</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {live.map((comp) => (
                <CompetitionCard key={comp.id} competition={comp} />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Calendar size={20} className="text-[#ff4d00]" />
              Próximas competencias
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcoming.map((comp) => (
                <CompetitionCard key={comp.id} competition={comp} />
              ))}
            </div>
          </section>
        )}

        {/* Finished */}
        {finished.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Trophy size={20} className="text-blue-400" />
              Competencias finalizadas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {finished.map((comp) => (
                <CompetitionCard key={comp.id} competition={comp} />
              ))}
            </div>
          </section>
        )}

        {competitions.length === 0 && (
          <div className="text-center py-20 text-text-muted">
            <Trophy size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">No hay competencias públicas disponibles</p>
            <p className="text-sm mt-1">Vuelve pronto para ver nuevos eventos</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CompetitionCard({
  competition,
}: {
  competition: any;
}) {
  const status = statusConfig(competition.status);
  const isFree = competition.registrationFee === 0;

  return (
    <Link
      href={`/competitions/${competition.slug}`}
      className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all hover:border-white/[0.12] hover:bg-white/[0.04] hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between mb-4">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${status.color}`}
        >
          {competition.status === "LIVE" && (
            <Radio size={10} />
          )}
          {competition.status !== "LIVE" && competition.status !== "FINISHED" && (
            <CheckCircle2 size={10} />
          )}
          {competition.status === "FINISHED" && (
            <Trophy size={10} />
          )}
          {status.label}
        </span>
        <span className="text-xs text-text-muted">
          {competition.categories.length} cat.
        </span>
      </div>

      <h3 className="text-lg font-bold mb-2 group-hover:text-[#ff4d00] transition-colors">
        {competition.name}
      </h3>

      <div className="space-y-2 text-sm text-text-secondary mb-5">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-[#ff4d00] shrink-0" />
          <span>
            {new Date(competition.startDate).toLocaleDateString("es-AR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
        {competition.location && (
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-[#ff4d00] shrink-0" />
            <span className="truncate">{competition.location}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Users size={14} className="text-[#ff4d00] shrink-0" />
          <span>{competition._count.registrations} atleta{competition._count.registrations !== 1 ? "s" : ""} inscripto{competition._count.registrations !== 1 ? "s" : ""}</span>
        </div>
        <div className="flex items-center gap-2">
          <Wallet size={14} className="text-[#ff4d00] shrink-0" />
          <span>
            {isFree
              ? "Gratuita"
              : `$${(competition.registrationFee / 100).toFixed(2)} ${competition.currency}`}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-text-muted">
          {competition.organizer?.boxName || "WODNation"}
        </span>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-[#ff4d00] opacity-0 group-hover:opacity-100 transition-opacity">
          Ver más <ArrowRight size={14} />
        </span>
      </div>
    </Link>
  );
}
