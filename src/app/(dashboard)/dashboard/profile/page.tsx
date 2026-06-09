"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  UserCircle,
  Mail,
  Phone,
  Dumbbell,
  Users,
  Calendar,
  Save,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    boxName: "",
    gender: "",
    birthDate: "",
  });

  // Load athlete profile data
  useEffect(() => {
    if (session?.user?.id) {
      fetch("/api/user/athlete-profile")
        .then((r) => r.json())
        .then((data) => {
          const athlete = data.athlete || {};
          setProfile({
            name: athlete.name || session.user?.name || "",
            email: athlete.email || session.user?.email || "",
            phone: athlete.phone || "",
            boxName: athlete.boxName || "",
            gender: athlete.gender || "",
            birthDate: athlete.birthDate
              ? new Date(athlete.birthDate).toISOString().split("T")[0]
              : "",
          });
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [session?.user?.id, session?.user?.name, session?.user?.email]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch("/api/user/athlete-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          boxName: profile.boxName,
          gender: profile.gender || undefined,
          birthDate: profile.birthDate || undefined,
        }),
      });

      if (res.ok) {
        await update({ name: profile.name });
        setSaved(true);
        toast({ title: "Perfil actualizado", variant: "success" });
        setTimeout(() => setSaved(false), 2000);
      } else {
        throw new Error("Error al guardar");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "No se pudieron guardar los cambios.",
        variant: "destructive",
      });
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#ff4d00]" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mi perfil</h1>
        <p className="text-text-secondary mt-1">
          Administrá tus datos personales. Se usan para pre-completar tus inscripciones a competencias.
        </p>
      </div>

      {/* Avatar + Name */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-5"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff4d00] to-[#ff6b35] text-3xl font-bold shadow-lg shadow-[#ff4d00]/20">
          {profile.name?.charAt(0).toUpperCase() || "W"}
        </div>
        <div>
          <div className="text-lg font-semibold">{profile.name || "Atleta"}</div>
          <div className="text-sm text-text-secondary">{session?.user?.email}</div>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 space-y-4"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4">
            Información personal
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                <UserCircle size={14} />
                Nombre completo
              </label>
              <input
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-[#ff4d00]/50 focus:ring-1 focus:ring-[#ff4d00]/20 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                <Mail size={14} />
                Email
              </label>
              <input
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-[#ff4d00]/50 focus:ring-1 focus:ring-[#ff4d00]/20 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                <Phone size={14} />
                Teléfono
              </label>
              <input
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+54 11 1234 5678"
                className="flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-[#ff4d00]/50 focus:ring-1 focus:ring-[#ff4d00]/20 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                <Dumbbell size={14} />
                Box / Afiliado
              </label>
              <input
                value={profile.boxName}
                onChange={(e) => setProfile({ ...profile, boxName: e.target.value })}
                placeholder="CrossFit Buenos Aires"
                className="flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-[#ff4d00]/50 focus:ring-1 focus:ring-[#ff4d00]/20 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                <Users size={14} />
                Género
              </label>
              <select
                value={profile.gender}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                className="flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white focus:outline-none focus:border-[#ff4d00]/50 focus:ring-1 focus:ring-[#ff4d00]/20 transition-all appearance-none"
              >
                <option value="" className="bg-[#0a0a0a]">No especificado</option>
                <option value="MALE" className="bg-[#0a0a0a]">Masculino</option>
                <option value="FEMALE" className="bg-[#0a0a0a]">Femenino</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                <Calendar size={14} />
                Fecha de nacimiento
              </label>
              <DatePicker
                value={profile.birthDate}
                onChange={(val) => setProfile({ ...profile, birthDate: val })}
                placeholder="Seleccionar fecha"
              />
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap items-center gap-3"
        >
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ff4d00] to-[#ff6b35] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#ff4d00]/20 transition-all hover:shadow-[#ff4d00]/30 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : saved ? (
              <CheckCircle2 size={16} />
            ) : (
              <Save size={16} />
            )}
            {saving ? "Guardando..." : saved ? "Guardado" : "Guardar cambios"}
          </button>
        </motion.div>
      </form>
    </div>
  );
}
