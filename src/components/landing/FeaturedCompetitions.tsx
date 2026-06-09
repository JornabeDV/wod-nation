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
import { motion } from "framer-motion";

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

export async function FeaturedCompetitions() {
  const competitions = await db.competition.findMany({
    where: {
      status: { notIn: [CompetitionStatus.DRAFT, CompetitionStatus.CANCELLED] },
    },
    orderBy: { startDate: "desc" },
    take: 6,
    include: {
      _count: { select: { registrations: true } },
      categories: { select: { id: true } },
      organizer: { select: { boxName: true } },
    },
  });

  const now = new Date();

  const live = competitions.filter((c) => c.status === CompetitionStatus.LIVE);
  const upcoming = competitions.filter(
    (c) => c.status === CompetitionStatus.PUBLISHED && new Date(c.startDate) > now
  );
  const recentlyFinished = competitions.filter(
    (c) => c.status === CompetitionStatus.FINISHED
  );

  const featured = [...live, ...upcoming, ...recentlyFinished].slice(0, 6);

  if (featured.length === 0) {
    return null;
  }

  return (
    <section className="py-24 sm:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Competencias <span className="text-gradient-primary">disponibles</span>
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Encontrá el evento perfecto para vos. Desde competencias locales hasta torneos regionales.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {featured.map((comp, i) => {
            const status = statusConfig(comp.status);
            const isFree = comp.registrationFee === 0;

            return (
              <Link
                key={comp.id}
                href={`/competitions/${comp.slug}`}
                className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all hover:border-white/[0.12] hover:bg-white/[0.04] hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between mb-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${status.color}`}
                  >
                    {comp.status === "LIVE" && <Radio size={10} />}
                    {comp.status === "FINISHED" && <Trophy size={10} />}
                    {comp.status === "PUBLISHED" && <CheckCircle2 size={10} />}
                    {status.label}
                  </span>
                  <span className="text-xs text-text-muted">
                    {comp.categories.length} cat.
                  </span>
                </div>

                <h3 className="text-lg font-bold mb-2 group-hover:text-[#ff4d00] transition-colors">
                  {comp.name}
                </h3>

                <div className="space-y-2 text-sm text-text-secondary mb-5">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-[#ff4d00] shrink-0" />
                    <span>
                      {new Date(comp.startDate).toLocaleDateString("es-AR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  {comp.location && (
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-[#ff4d00] shrink-0" />
                      <span className="truncate">{comp.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-[#ff4d00] shrink-0" />
                    <span>
                      {comp._count.registrations} atleta
                      {comp._count.registrations !== 1 ? "s" : ""} inscripto
                      {comp._count.registrations !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wallet size={14} className="text-[#ff4d00] shrink-0" />
                    <span>
                      {isFree
                        ? "Gratuita"
                        : `$${(comp.registrationFee / 100).toFixed(2)} ${comp.currency}`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-muted">
                    {comp.organizer?.boxName || "WODNation"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-[#ff4d00] opacity-0 group-hover:opacity-100 transition-opacity">
                    Ver más <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center">
          <Link
            href="/competitions"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-raised px-6 py-3 text-sm font-medium text-text-secondary transition-all hover:border-border-hover hover:text-text"
          >
            Ver todas las competencias
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
