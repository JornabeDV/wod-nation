"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

export function CTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { t } = useI18n();

  return (
    <section className="py-24 sm:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-6">
            {t.cta.title.split("<gradient>")[0]}
            <span className="text-gradient-primary">
              {t.cta.title.split("<gradient>")[1].split("</gradient>")[0]}
            </span>
            {t.cta.title.split("</gradient>")[1]}
          </h2>
          <p className="text-text-secondary text-lg mb-10 max-w-2xl mx-auto">
            {t.cta.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/competitions"
              className="group inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-white transition-all hover:bg-primary-glow glow-primary"
            >
              Quiero competir
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-raised px-8 py-4 text-base font-medium text-text-secondary transition-all hover:border-border-hover hover:text-text"
            >
              Quiero organizar un evento
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
