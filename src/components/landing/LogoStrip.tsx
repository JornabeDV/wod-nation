"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useI18n } from "@/lib/i18n/provider";

const logos = [
  "CrossFit Mendoza",
  "Box Battle",
  "FitFest",
  "WODwin",
  "Strongest",
  "Circle21",
];

export function LogoStrip() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const { t } = useI18n();

  return (
    <section className="py-16 border-y border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.p
          ref={ref}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center text-sm text-text-muted mb-10 uppercase tracking-wider"
        >
          {t.logoStrip.title}
        </motion.p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {logos.map((name, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="text-lg font-semibold text-text-muted/40 hover:text-text-muted/60 transition-colors cursor-default"
            >
              {name}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
