"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AuthBackground } from "@/components/auth/AuthBackground";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { GoogleIcon } from "@/components/auth/GoogleIcon";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "true";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (justRegistered) {
      toast({
        title: "¡Cuenta creada!",
        description: "Ahora podés iniciar sesión.",
        variant: "success",
      });
    }
  }, [justRegistered]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email o contraseña incorrectos");
    } else {
      toast({
        title: "Bienvenido de vuelta",
        description: "Redirigiendo al dashboard...",
        variant: "success",
      });
      router.push("/dashboard");
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
      <AuthBackground />

      <AuthCard
        title="Bienvenido de vuelta"
        subtitle="Ingresá a tu cuenta para gestionar tus competencias"
      >
        {justRegistered && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-400"
          >
            <CheckCircle2 size={16} />
            <span>Tu cuenta fue creada exitosamente</span>
          </motion.div>
        )}

        <button
          type="button"
          onClick={() => {
            setGoogleLoading(true);
            signIn("google", { callbackUrl: "/dashboard" });
          }}
          disabled={googleLoading}
          className="relative flex w-full items-center justify-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/[0.06] hover:border-white/[0.12] focus:outline-none focus:ring-2 focus:ring-[#ff4d00]/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {googleLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <GoogleIcon className="h-5 w-5" />
          )}
          Continuar con Google
        </button>

        <div className="my-6">
          <AuthDivider text="O con email" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            id="email"
            name="email"
            type="email"
            label="Email"
            placeholder="demo@wodnation.com"
            required
            autoComplete="email"
          />
          <PasswordInput
            id="password"
            name="password"
            label="Contraseña"
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-text-secondary hover:text-text transition-colors cursor-pointer">
              <input
                type="checkbox"
                name="remember"
                className="h-4 w-4 rounded border-white/[0.08] bg-white/[0.03] text-[#ff4d00] focus:ring-[#ff4d00]/20"
              />
              <span>Recordarme</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-text-secondary hover:text-[#ff4d00] transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

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
                Entrar
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          ¿No tenés cuenta?{" "}
          <Link
            href="/register"
            className="font-medium text-white hover:text-[#ff4d00] transition-colors"
          >
            Crear cuenta gratis
          </Link>
        </p>
      </AuthCard>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#ff4d00]" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
