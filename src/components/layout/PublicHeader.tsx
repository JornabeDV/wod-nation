"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { UserNav } from "./UserNav";

interface PublicHeaderProps {
  session?: boolean;
  userName?: string | null;
}

export function PublicHeader({ session, userName }: PublicHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/competitions", label: "Competencias" },
  ];

  if (session) {
    navLinks.push({ href: "/dashboard", label: "Dashboard" });
  }

  return (
    <header className="relative z-10 border-b border-white/[0.06]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-lg font-bold tracking-tight"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#ff4d00] to-[#ff6b35]">
              <span className="text-sm font-bold text-white">W</span>
            </div>
            <span className="text-gradient-primary">WODNation</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden sm:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-text-secondary hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden sm:flex items-center gap-4">
            {session ? (
              <UserNav userName={userName} />
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-text-secondary hover:text-white transition-colors"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-gradient-to-r from-[#ff4d00] to-[#ff6b35] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-[#ff4d00]/20 hover:shadow-[#ff4d00]/30 transition-all"
                >
                  Crear cuenta
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="sm:hidden p-2 text-text-secondary hover:text-white transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="sm:hidden border-b border-border bg-[#050505]/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-lg px-3 py-2.5 text-sm text-text-secondary hover:text-white hover:bg-white/[0.04] transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              <div className="pt-3 mt-2 border-t border-white/[0.08] space-y-2">
                {session ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="block rounded-lg px-3 py-2.5 text-sm text-text-secondary hover:text-white hover:bg-white/[0.04] transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        // signOut is handled in UserNav, but we need it here too
                        // Since we can't import next-auth/react in a shared layout easily,
                        // we'll do a full page redirect to signout
                        window.location.href = "/api/auth/signout";
                      }}
                      className="block w-full text-left rounded-lg px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      Cerrar sesión
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block rounded-lg px-3 py-2.5 text-sm text-text-secondary hover:text-white hover:bg-white/[0.04] transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      Iniciar sesión
                    </Link>
                    <Link
                      href="/register"
                      className="block rounded-lg bg-gradient-to-r from-[#ff4d00] to-[#ff6b35] px-3 py-2.5 text-sm font-medium text-white text-center shadow-lg shadow-[#ff4d00]/20"
                      onClick={() => setMobileOpen(false)}
                    >
                      Crear cuenta
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
