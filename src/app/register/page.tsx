"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { registerUser } from "@/lib/actions";
import { toast } from "@/hooks/use-toast";
import { AuthBackground } from "@/components/auth/AuthBackground";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";
import { PasswordInput } from "@/components/auth/PasswordInput";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [role, setRole] = useState<"ORGANIZER" | "ATHLETE">("ATHLETE");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("role") === "organizer") {
      setRole("ORGANIZER");
    }
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!acceptedTerms) {
      setError("Debés aceptar los términos y condiciones");
      return;
    }

    setLoading(true);

    const form = new FormData(e.currentTarget);
    const name = form.get("name") as string;
    const email = form.get("email") as string;
    const password = form.get("password") as string;
    const confirmPassword = form.get("confirmPassword") as string;
    const selectedRole = form.get("role") as "ORGANIZER" | "ATHLETE";

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }

    try {
      await registerUser({ name, email, password, role: selectedRole });
      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message || "Error al registrar");
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
      <AuthBackground />

      <AuthCard
        title="Crear cuenta"
        subtitle="Unite a WODNation como organizador o atleta"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            id="name"
            name="name"
            type="text"
            label="Nombre completo"
            placeholder="Juan Pérez"
            required
            autoComplete="name"
          />
          <AuthInput
            id="email"
            name="email"
            type="email"
            label="Email"
            placeholder="juan@tubox.com"
            required
            autoComplete="email"
          />
          <PasswordInput
            id="password"
            name="password"
            label="Contraseña"
            placeholder="Mínimo 6 caracteres"
            required
            minLength={6}
            autoComplete="new-password"
          />
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            label="Confirmar contraseña"
            placeholder="Repetí tu contraseña"
            required
            autoComplete="new-password"
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Tipo de cuenta</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("ORGANIZER")}
                className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                  role === "ORGANIZER"
                    ? "border-[#ff4d00]/50 bg-[#ff4d00]/10 text-white"
                    : "border-white/[0.08] bg-white/[0.03] text-text-secondary hover:text-white"
                }`}
              >
                Organizador
              </button>
              <button
                type="button"
                onClick={() => setRole("ATHLETE")}
                className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                  role === "ATHLETE"
                    ? "border-[#ff4d00]/50 bg-[#ff4d00]/10 text-white"
                    : "border-white/[0.08] bg-white/[0.03] text-text-secondary hover:text-white"
                }`}
              >
                Atleta
              </button>
            </div>
            <input type="hidden" name="role" value={role} />
          </div>

          <label className="flex items-start gap-3 text-sm text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-white/[0.08] bg-white/[0.03] text-[#ff4d00] focus:ring-[#ff4d00]/20"
            />
            <span>
              Acepto los{" "}
              <Link href="#" className="text-white hover:text-[#ff4d00] transition-colors">
                Términos de servicio
              </Link>{" "}
              y la{" "}
              <Link href="#" className="text-white hover:text-[#ff4d00] transition-colors">
                Política de privacidad
              </Link>
            </span>
          </label>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-950/30 px-4 py-3 text-sm text-red-400"
            >
              <span className="text-lg">•</span>
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff4d00] to-[#ff6b35] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#ff4d00]/20 transition-all hover:shadow-[#ff4d00]/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                Crear cuenta gratis
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          ¿Ya tenés cuenta?{" "}
          <Link
            href="/login"
            className="font-medium text-white hover:text-[#ff4d00] transition-colors"
          >
            Iniciar sesión
          </Link>
        </p>
      </AuthCard>
    </div>
  );
}
