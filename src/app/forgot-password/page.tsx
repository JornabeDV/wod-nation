"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, ArrowRight, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { requestPasswordReset } from "@/lib/actions";
import { AuthBackground } from "@/components/auth/AuthBackground";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [emailConfigured, setEmailConfigured] = useState(true);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await requestPasswordReset(email);
      setSent(true);
      setEmailConfigured(result.emailConfigured ?? true);
    } catch (err: any) {
      setError(err.message || "Error al enviar el email");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
      <AuthBackground />

      <AuthCard
        title="¿Olvidaste tu contraseña?"
        subtitle="Te enviaremos un link para restablecerla"
      >
        {sent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-5"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Email enviado</h3>
              <p className="text-sm text-text-secondary">
                Si existe una cuenta con <span className="text-white font-medium">{email}</span>,
                recibirás un link para restablecer tu contraseña.
              </p>
            </div>

            {!emailConfigured && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-950/30 px-4 py-3 text-left">
                <p className="text-xs text-amber-400 font-medium mb-1">Email no configurado</p>
                <p className="text-xs text-amber-200/80">
                  Resend no está configurado. Revisá la consola del servidor para ver el link de reset.
                </p>
              </div>
            )}

            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/[0.06]"
            >
              <ArrowLeft size={16} />
              Volver al login
            </Link>
          </motion.div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <AuthInput
                id="email"
                name="email"
                type="email"
                label="Email"
                placeholder="demo@wodnation.com"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-400"
                >
                  {error}
                </motion.p>
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
                    Enviar link de recuperación
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-text-secondary">
              ¿Recordaste tu contraseña?{" "}
              <Link
                href="/login"
                className="font-medium text-white hover:text-[#ff4d00] transition-colors"
              >
                Iniciar sesión
              </Link>
            </p>
          </>
        )}
      </AuthCard>
    </div>
  );
}
