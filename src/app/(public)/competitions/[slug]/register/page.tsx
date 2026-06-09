"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  Wallet,
  Trophy,
  ChevronRight,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  Users,
  UserCircle,
  Mail,
  Phone,
  Dumbbell,
} from "lucide-react";

export default function RegisterPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [competition, setCompetition] = useState<any>(null);

  if (!competition) {
    fetch(`/api/competitions/slug/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setCompetition(data);
        setCategories(data.categories || []);
      });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);

    const res = await fetch("/api/competitions/register", {
      method: "POST",
      body: JSON.stringify({
        slug,
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        gender: form.get("gender"),
        birthDate: form.get("birthDate"),
        boxName: form.get("boxName"),
        categoryId: form.get("categoryId"),
      }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    setLoading(false);

    if (data.paymentUrl) {
      window.location.href = data.paymentUrl;
    } else if (data.success) {
      setSubmitted(true);
      setTimeout(() => router.push(`/competitions/${slug}/leaderboard`), 2000);
    } else {
      alert(data.error || "Error al registrar");
    }
  }

  if (!competition) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#ff4d00]" />
      </div>
    );
  }

  const isFree = competition.registrationFee === 0;

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 size={48} />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">¡Inscripción confirmada!</h1>
            <p className="text-text-secondary">
              Te inscribiste exitosamente a{" "}
              <span className="text-white font-medium">{competition.name}</span>.
            </p>
          </div>
          <Link
            href={`/competitions/${slug}/leaderboard`}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ff4d00] to-[#ff6b35] px-6 py-3 text-sm font-semibold text-white"
          >
            Ver leaderboard
            <ChevronRight size={16} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#ff4d00]/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[#8b5cf6]/4 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-lg px-4 py-12">
        {/* Back link */}
        <Link
          href={`/competitions/${slug}`}
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Volver a la competencia
        </Link>

        {/* Competition header card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-6 mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff4d00] to-[#ff6b35]">
              <Trophy size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{competition.name}</h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-text-secondary">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-[#ff4d00]" />
              {new Date(competition.startDate).toLocaleDateString("es-AR")}
            </span>
            {competition.location && (
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-[#ff4d00]" />
                {competition.location}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Wallet size={14} className="text-[#ff4d00]" />
              {isFree ? "Gratuita" : `$${(competition.registrationFee / 100).toFixed(2)} ${competition.currency}`}
            </span>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <UserCircle size={20} className="text-[#ff4d00]" />
            Datos del atleta
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Nombre completo *</label>
              <input
                name="name"
                required
                placeholder="Juan Pérez"
                className="flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-[#ff4d00]/50 focus:ring-1 focus:ring-[#ff4d00]/20 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Email *</label>
              <input
                name="email"
                type="email"
                required
                placeholder="juan@email.com"
                className="flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-[#ff4d00]/50 focus:ring-1 focus:ring-[#ff4d00]/20 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Teléfono</label>
              <div className="relative">
                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  name="phone"
                  placeholder="+54 11 1234 5678"
                  className="flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] pl-10 pr-4 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-[#ff4d00]/50 focus:ring-1 focus:ring-[#ff4d00]/20 transition-all"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Género *</label>
                <div className="relative">
                  <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                  <select
                    name="gender"
                    required
                    className="w-full appearance-none rounded-xl border border-white/[0.08] bg-white/[0.03] pl-10 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff4d00]/50 transition-all"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="MALE">Masculino</option>
                    <option value="FEMALE">Femenino</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Categoría *</label>
                <div className="relative">
                  <Dumbbell size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                  <select
                    name="categoryId"
                    required
                    className="w-full appearance-none rounded-xl border border-white/[0.08] bg-white/[0.03] pl-10 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff4d00]/50 transition-all"
                  >
                    <option value="">Seleccionar...</option>
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Box / Affiliate</label>
              <input
                name="boxName"
                placeholder="CrossFit Buenos Aires"
                className="flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-[#ff4d00]/50 focus:ring-1 focus:ring-[#ff4d00]/20 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Fecha de nacimiento</label>
              <input
                name="birthDate"
                type="date"
                className="flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white focus:outline-none focus:border-[#ff4d00]/50 focus:ring-1 focus:ring-[#ff4d00]/20 transition-all"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="group w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff4d00] to-[#ff6b35] px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#ff4d00]/20 transition-all hover:shadow-[#ff4d00]/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Procesando...
                  </>
                ) : isFree ? (
                  <>
                    Inscribirme gratis
                    <ChevronRight size={18} className="transition-transform group-hover:translate-x-0.5" />
                  </>
                ) : (
                  <>
                    Pagar e inscribirme
                    <span className="opacity-80">
                      (${(competition.registrationFee / 100).toFixed(2)})
                    </span>
                    <ChevronRight size={18} className="transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </div>

            <p className="text-center text-xs text-text-muted">
              Al inscribirte aceptás los términos y condiciones del evento.
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
