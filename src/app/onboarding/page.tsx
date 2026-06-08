"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  UserCircle,
  Dumbbell,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MapPin,
  Calendar,
  Users,
  Zap,
} from "lucide-react";
import { completeOnboarding } from "@/lib/actions";
import { toast } from "@/hooks/use-toast";

const steps = [
  { id: "welcome", label: "Bienvenida" },
  { id: "profile", label: "Tu perfil" },
  { id: "competition", label: "Primera competencia" },
  { id: "done", label: "Listo" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    boxName: "",
    phone: "",
    bio: "",
  });
  const [competition, setCompetition] = useState({
    name: "",
    location: "",
    startDate: "",
  });

  function nextStep() {
    if (step < steps.length - 1) setStep((s) => s + 1);
  }

  function prevStep() {
    if (step > 0) setStep((s) => s - 1);
  }

  async function finish() {
    setLoading(true);
    try {
      await completeOnboarding({
        boxName: profile.boxName,
        phone: profile.phone,
        bio: profile.bio,
        competitionName: competition.name,
        competitionLocation: competition.location,
        competitionStartDate: competition.startDate,
      });
      toast({
        title: "¡Bienvenido a WODNation!",
        description: "Tu perfil y primera competencia están listos.",
        variant: "success",
      });
      router.push("/dashboard");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "No se pudo completar el onboarding",
        variant: "destructive",
      });
      setLoading(false);
    }
  }

  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a0a00] via-[#050505] to-[#050505]" />
        <motion.div
          animate={{ x: [0, 20, -10, 0], y: [0, -30, 15, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[#ff4d00]/8 blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, -30, 20, 0], y: [0, 20, -20, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#8b5cf6]/5 blur-[120px]"
        />
      </div>

      {/* Progress bar */}
      <div className="relative z-10 w-full h-1 bg-white/[0.04]">
        <motion.div
          className="h-full bg-gradient-to-r from-[#ff4d00] to-[#ff6b35]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      {/* Skip button */}
      {step < 3 && (
        <div className="relative z-10 flex justify-end px-6 pt-6">
          <button
            onClick={finish}
            disabled={loading}
            className="text-sm text-text-muted hover:text-text-secondary transition-colors"
          >
            Saltear por ahora →
          </button>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <WelcomeStep key="welcome" onNext={nextStep} />
            )}
            {step === 1 && (
              <ProfileStep
                key="profile"
                data={profile}
                onChange={setProfile}
                onNext={nextStep}
                onBack={prevStep}
              />
            )}
            {step === 2 && (
              <CompetitionStep
                key="competition"
                data={competition}
                onChange={setCompetition}
                onNext={nextStep}
                onBack={prevStep}
              />
            )}
            {step === 3 && (
              <DoneStep
                key="done"
                onFinish={finish}
                loading={loading}
                competitionName={competition.name}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Step indicators */}
      <div className="relative z-10 flex justify-center gap-2 pb-8">
        {steps.map((s, i) => (
          <div
            key={s.id}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              i === step
                ? "bg-[#ff4d00]/15 text-[#ff4d00]"
                : i < step
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-white/[0.03] text-text-muted"
            }`}
          >
            {i < step ? (
              <CheckCircle2 size={14} />
            ) : (
              <span className="w-4 h-4 flex items-center justify-center">{i + 1}</span>
            )}
            <span className="hidden sm:inline">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Step 1: Welcome ──
function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="text-center space-y-8"
    >
      <div className="space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff4d00] to-[#ff6b35] shadow-xl shadow-[#ff4d00]/20"
        >
          <Trophy size={36} className="text-white" />
        </motion.div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Bienvenido a{" "}
          <span className="text-gradient-primary">WODNation</span>
        </h1>
        <p className="text-text-secondary text-lg max-w-sm mx-auto leading-relaxed">
          La plataforma más simple para organizar competencias de CrossFit y fitness funcional.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
        {[
          { icon: Zap, label: "Crea eventos", desc: "En minutos" },
          { icon: Users, label: "Gestiona", desc: "Atletas" },
          { icon: Trophy, label: "Leaderboards", desc: "En vivo" },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center"
          >
            <item.icon size={20} className="mx-auto mb-2 text-[#ff4d00]" />
            <div className="text-sm font-medium">{item.label}</div>
            <div className="text-xs text-text-muted">{item.desc}</div>
          </motion.div>
        ))}
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        onClick={onNext}
        className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ff4d00] to-[#ff6b35] px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#ff4d00]/20 transition-all hover:shadow-[#ff4d00]/30 hover:scale-[1.02] active:scale-[0.98]"
      >
        Empezar
        <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
      </motion.button>
    </motion.div>
  );
}

// ── Step 2: Profile ──
function ProfileStep({
  data,
  onChange,
  onNext,
  onBack,
}: {
  data: { boxName: string; phone: string; bio: string };
  onChange: (d: typeof data) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#ff4d00]/10 text-[#ff4d00]">
          <UserCircle size={28} />
        </div>
        <h2 className="text-2xl font-bold">Contanos de vos</h2>
        <p className="text-text-secondary text-sm">
          Esto ayuda a que los atletas conozcan al organizador del evento.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">Nombre de tu Box / Afiliado</label>
          <input
            value={data.boxName}
            onChange={(e) => onChange({ ...data, boxName: e.target.value })}
            placeholder="Ej: CrossFit Buenos Aires"
            className="flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-[#ff4d00]/50 focus:ring-1 focus:ring-[#ff4d00]/20 transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">Teléfono de contacto</label>
          <input
            value={data.phone}
            onChange={(e) => onChange({ ...data, phone: e.target.value })}
            placeholder="Ej: +54 11 1234 5678"
            className="flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-[#ff4d00]/50 focus:ring-1 focus:ring-[#ff4d00]/20 transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">Bio breve (opcional)</label>
          <textarea
            value={data.bio}
            onChange={(e) => onChange({ ...data, bio: e.target.value })}
            placeholder="Coach certificado, 5 años organizando competencias..."
            rows={3}
            className="flex w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-[#ff4d00]/50 focus:ring-1 focus:ring-[#ff4d00]/20 transition-all resize-none"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-3 text-sm font-medium text-white transition-all hover:bg-white/[0.06]"
        >
          <ArrowLeft size={16} />
          Atrás
        </button>
        <button
          onClick={onNext}
          className="flex-1 group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff4d00] to-[#ff6b35] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#ff4d00]/20 transition-all hover:shadow-[#ff4d00]/30 hover:scale-[1.02] active:scale-[0.98]"
        >
          Continuar
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </motion.div>
  );
}

// ── Step 3: First Competition ──
function CompetitionStep({
  data,
  onChange,
  onNext,
  onBack,
}: {
  data: { name: string; location: string; startDate: string };
  onChange: (d: typeof data) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const canProceed = data.name.trim() && data.startDate;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#ff4d00]/10 text-[#ff4d00]">
          <Dumbbell size={28} />
        </div>
        <h2 className="text-2xl font-bold">Creá tu primera competencia</h2>
        <p className="text-text-secondary text-sm">
          Después podés agregar categorías, WODs y atletas desde el dashboard.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">Nombre de la competencia *</label>
          <input
            value={data.name}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            placeholder="Ej: Box Battle 2026"
            className="flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-[#ff4d00]/50 focus:ring-1 focus:ring-[#ff4d00]/20 transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">Ubicación</label>
          <div className="relative">
            <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={data.location}
              onChange={(e) => onChange({ ...data, location: e.target.value })}
              placeholder="Ej: Av. del Libertador 1000, CABA"
              className="flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] pl-10 pr-4 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-[#ff4d00]/50 focus:ring-1 focus:ring-[#ff4d00]/20 transition-all"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">Fecha de inicio *</label>
          <div className="relative">
            <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="date"
              value={data.startDate}
              onChange={(e) => onChange({ ...data, startDate: e.target.value })}
              className="flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#ff4d00]/50 focus:ring-1 focus:ring-[#ff4d00]/20 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-2">
        <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Lo que se incluye automáticamente</p>
        <div className="flex flex-wrap gap-2">
          {["Categoría RX", "Categoría Scaled", "WOD 1", "WOD 2", "WOD 3"].map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-lg bg-white/[0.04] px-2.5 py-1 text-xs text-text-secondary"
            >
              <Sparkles size={10} className="text-[#ff4d00]" />
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-3 text-sm font-medium text-white transition-all hover:bg-white/[0.06]"
        >
          <ArrowLeft size={16} />
          Atrás
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="flex-1 group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff4d00] to-[#ff6b35] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#ff4d00]/20 transition-all hover:shadow-[#ff4d00]/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          Crear competencia
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </motion.div>
  );
}

// ── Step 4: Done ──
function DoneStep({
  onFinish,
  loading,
  competitionName,
}: {
  onFinish: () => void;
  loading: boolean;
  competitionName: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="text-center space-y-8"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-400/10 text-emerald-400"
      >
        <CheckCircle2 size={48} />
      </motion.div>

      <div className="space-y-3">
        <h2 className="text-3xl font-bold">¡Estás listo!</h2>
        <p className="text-text-secondary max-w-sm mx-auto">
          {competitionName ? (
            <>
              Tu competencia <span className="text-white font-medium">"{competitionName}"</span> fue creada con éxito.
            </>
          ) : (
            "Tu perfil está configurado y listo para usar."
          )}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
          <Zap size={20} className="mx-auto mb-2 text-[#ff4d00]" />
          <div className="text-sm font-medium">Dashboard</div>
          <div className="text-xs text-text-muted">Gestioná todo</div>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
          <Trophy size={20} className="mx-auto mb-2 text-[#ff4d00]" />
          <div className="text-sm font-medium">Leaderboard</div>
          <div className="text-xs text-text-muted">En vivo</div>
        </div>
      </div>

      <button
        onClick={onFinish}
        disabled={loading}
        className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ff4d00] to-[#ff6b35] px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#ff4d00]/20 transition-all hover:shadow-[#ff4d00]/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Preparando todo...
          </>
        ) : (
          <>
            Ir al dashboard
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </button>
    </motion.div>
  );
}
