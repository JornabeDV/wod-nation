"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Trophy,
  Calendar,
  MapPin,
  Wallet,
  CheckCircle2,
  Clock,
  ArrowRight,
  Loader2,
  Radio,
} from "lucide-react";

export function AthleteDashboardView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/my-competitions")
      .then((r) => r.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#ff4d00]" />
      </div>
    );
  }

  const registrations = data?.registrations || [];

  const upcoming = registrations.filter(
    (r: any) =>
      r.competition.status === "PUBLISHED" || r.competition.status === "LIVE"
  );
  const finished = registrations.filter(
    (r: any) => r.competition.status === "FINISHED"
  );

  return (
    <div className="space-y-10">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Competencias"
          value={registrations.length}
          icon={Trophy}
        />
        <StatCard
          label="Próximas"
          value={upcoming.length}
          icon={Calendar}
        />
        <StatCard
          label="Finalizadas"
          value={finished.length}
          icon={CheckCircle2}
        />
      </div>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <section>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-[#ff4d00]" />
            Mis próximas competencias
          </h2>
          <div className="space-y-3">
            {upcoming.map((reg: any, i: number) => (
              <RegistrationCard key={reg.id} reg={reg} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Finished */}
      {finished.length > 0 && (
        <section>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-blue-400" />
            Competencias finalizadas
          </h2>
          <div className="space-y-3">
            {finished.map((reg: any, i: number) => (
              <RegistrationCard key={reg.id} reg={reg} index={i} />
            ))}
          </div>
        </section>
      )}

      {registrations.length === 0 && (
        <div className="text-center py-16 text-text-muted">
          <Trophy size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg mb-2">Aún no te inscribiste a ninguna competencia</p>
          <Link
            href="/competitions"
            className="inline-flex items-center gap-2 text-[#ff4d00] hover:underline"
          >
            Explorar competencias <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: any;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ff4d00]/10 text-[#ff4d00]">
          <Icon size={18} />
        </div>
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <p className="text-sm text-text-muted">{label}</p>
    </motion.div>
  );
}

function RegistrationCard({ reg, index }: { reg: any; index: number }) {
  const comp = reg.competition;
  const isLive = comp.status === "LIVE";
  const isFree = comp.registrationFee === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 hover:border-white/[0.12] transition-colors"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-base">{comp.name}</h3>
            {isLive && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#ff4d00]/15 text-[#ff4d00] px-2 py-0.5 text-[10px] font-medium">
                <Radio size={8} />
                EN VIVO
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary">
            <span className="flex items-center gap-1">
              <Calendar size={12} className="text-[#ff4d00]" />
              {new Date(comp.startDate).toLocaleDateString("es-AR")}
            </span>
            {comp.location && (
              <span className="flex items-center gap-1">
                <MapPin size={12} className="text-[#ff4d00]" />
                {comp.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Wallet size={12} className="text-[#ff4d00]" />
              {isFree ? "Gratuita" : `$${(comp.registrationFee / 100).toFixed(2)}`}
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 size={12} className="text-emerald-400" />
              {reg.category.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/competitions/${comp.slug}/leaderboard`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-medium text-white hover:bg-white/[0.06] transition-colors"
          >
            <Trophy size={12} />
            Leaderboard
          </Link>
          {comp.status !== "FINISHED" && (
            <Link
              href={`/competitions/${comp.slug}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#ff4d00] to-[#ff6b35] px-3 py-2 text-xs font-medium text-white hover:shadow-[#ff4d00]/20 transition-all"
            >
              Ver <ArrowRight size={12} />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}
