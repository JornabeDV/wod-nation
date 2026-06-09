"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Save, CheckCircle2, User, Phone, Mail, Dumbbell, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function AthleteProfileForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [athlete, setAthlete] = useState<any>(null);

  useEffect(() => {
    fetch("/api/user/athlete-profile")
      .then((r) => r.json())
      .then((data) => {
        setAthlete(data.athlete || null);
        setLoading(false);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const form = new FormData(e.currentTarget);
    const body = {
      name: form.get("name") as string,
      email: form.get("email") as string,
      phone: form.get("phone") as string,
      boxName: form.get("boxName") as string,
      gender: form.get("gender") as string,
      birthDate: form.get("birthDate") as string,
    };

    try {
      const res = await fetch("/api/user/athlete-profile", {
        method: "PATCH",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        toast({
          title: "Perfil actualizado",
          description: "Tus datos fueron guardados correctamente.",
          variant: "success",
        });
      } else {
        throw new Error("Error al guardar");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#ff4d00]" />
      </div>
    );
  }

  if (!athlete) {
    return (
      <div className="text-center py-16 text-text-muted">
        <p>No se encontró tu perfil de atleta.</p>
      </div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8 space-y-5"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
            <User size={14} className="text-[#ff4d00]" />
            Nombre completo
          </label>
          <input
            name="name"
            defaultValue={athlete.name || ""}
            className="flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-[#ff4d00]/50 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
            <Mail size={14} className="text-[#ff4d00]" />
            Email
          </label>
          <input
            name="email"
            type="email"
            defaultValue={athlete.email || ""}
            className="flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-[#ff4d00]/50 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
            <Phone size={14} className="text-[#ff4d00]" />
            Teléfono
          </label>
          <input
            name="phone"
            defaultValue={athlete.phone || ""}
            className="flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-[#ff4d00]/50 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
            <Dumbbell size={14} className="text-[#ff4d00]" />
            Box / Affiliate
          </label>
          <input
            name="boxName"
            defaultValue={athlete.boxName || ""}
            className="flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-[#ff4d00]/50 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
            <Users size={14} className="text-[#ff4d00]" />
            Género
          </label>
          <select
            name="gender"
            defaultValue={athlete.gender || ""}
            className="flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white focus:outline-none focus:border-[#ff4d00]/50 transition-all appearance-none"
          >
            <option value="" className="bg-[#0a0a0a]">No especificado</option>
            <option value="MALE" className="bg-[#0a0a0a]">Masculino</option>
            <option value="FEMALE" className="bg-[#0a0a0a]">Femenino</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
            <CalendarIcon />
            Fecha de nacimiento
          </label>
          <input
            name="birthDate"
            type="date"
            defaultValue={
              athlete.birthDate
                ? new Date(athlete.birthDate).toISOString().split("T")[0]
                : ""
            }
            className="flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-[#ff4d00]/50 transition-all"
          />
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ff4d00] to-[#ff6b35] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#ff4d00]/20 transition-all hover:shadow-[#ff4d00]/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          Guardar cambios
        </button>
      </div>
    </motion.form>
  );
}

function CalendarIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-[#ff4d00]"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
