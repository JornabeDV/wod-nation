"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AuthCardProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthCard({ children, title, subtitle }: AuthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative w-full max-w-md"
    >
      {/* Glow behind card */}
      <div className="absolute -inset-1 bg-gradient-to-br from-[#ff4d00]/20 via-transparent to-[#8b5cf6]/10 rounded-2xl blur-xl opacity-60" />

      <div className="relative rounded-2xl border border-white/[0.08] bg-[#0a0a0a]/80 backdrop-blur-xl p-8 sm:p-10 shadow-2xl">
        {/* Logo / brand */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 text-center"
        >
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-[#ff4d00] to-[#ff6b35] mb-5 shadow-lg shadow-[#ff4d00]/20">
            <span className="text-xl font-bold text-white">W</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-text-secondary">{subtitle}</p>
          )}
        </motion.div>

        {children}
      </div>
    </motion.div>
  );
}
