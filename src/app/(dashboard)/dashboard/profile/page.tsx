"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  UserCircle,
  Mail,
  Building2,
  Phone,
  FileText,
  Globe,
  Save,
  Loader2,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}
import { updateOrganizerProfile } from "@/lib/actions";
import { toast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    boxName: "",
    phone: "",
    bio: "",
    website: "",
    instagram: "",
  });

  // Load profile data on mount
  useEffect(() => {
    if (session?.user?.id) {
      fetch("/api/user/profile")
        .then((r) => r.json())
        .then((data) => {
          setProfile({
            name: data.name || "",
            boxName: data.boxName || "",
            phone: data.phone || "",
            bio: data.bio || "",
            website: data.website || "",
            instagram: data.instagram || "",
          });
        })
        .catch(() => {
          // Fallback to session data
          setProfile((prev) => ({ ...prev, name: session.user?.name || "" }));
        });
    }
  }, [session?.user?.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateOrganizerProfile(profile);
      await update({ name: profile.name });
      setSaved(true);
      toast({ title: "Perfil actualizado", variant: "success" });
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  }

  function restartTour() {
    localStorage.removeItem("wodnation-tour-completed");
    toast({
      title: "Tour reiniciado",
      description: "El tour se mostrará la próxima vez que entres al dashboard.",
      variant: "success",
    });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Perfil</h1>
        <p className="text-text-secondary mt-1">
          Administrá tus datos de organizador.
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
          <div className="text-lg font-semibold">{profile.name || "Organizador"}</div>
          <div className="text-sm text-text-secondary">{session?.user?.email}</div>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Account */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 space-y-4"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4">
            Información de cuenta
          </h2>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
              <UserCircle size={14} />
              Nombre
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
              value={session?.user?.email || ""}
              disabled
              className="flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 text-sm text-text-muted cursor-not-allowed"
            />
          </div>
        </motion.div>

        {/* Organizer Profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 space-y-4"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4">
            Datos del organizador
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                <Building2 size={14} />
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
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
              <FileText size={14} />
              Bio
            </label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Coach certificado, organizando competencias desde 2020..."
              rows={3}
              className="flex w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-[#ff4d00]/50 focus:ring-1 focus:ring-[#ff4d00]/20 transition-all resize-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                <Globe size={14} />
                Sitio web
              </label>
              <input
                value={profile.website}
                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                placeholder="https://tubox.com"
                className="flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-[#ff4d00]/50 focus:ring-1 focus:ring-[#ff4d00]/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                <InstagramIcon />
                Instagram
              </label>
              <input
                value={profile.instagram}
                onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                placeholder="@tubox"
                className="flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-[#ff4d00]/50 focus:ring-1 focus:ring-[#ff4d00]/20 transition-all"
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

          <button
            type="button"
            onClick={restartTour}
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-3 text-sm font-medium text-text-secondary hover:text-text transition-colors"
          >
            <Sparkles size={16} />
            Reiniciar tour
          </button>
        </motion.div>
      </form>
    </div>
  );
}
