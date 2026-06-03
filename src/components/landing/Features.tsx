"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  CreditCard,
  Trophy,
  BarChart3,
  Users,
  Zap,
  Shield,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

const icons = [CreditCard, Trophy, BarChart3, Users, Zap, Shield];

export function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { t } = useI18n();

  const features = [
    { key: "payments", size: "large" },
    { key: "leaderboard", size: "small" },
    { key: "scoring", size: "small" },
    { key: "registration", size: "small" },
    { key: "setup", size: "small" },
    { key: "secure", size: "large" },
  ] as const;

  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            {t.features.title.split("<gradient>")[0]}
            <span className="text-gradient-primary">
              {t.features.title.split("<gradient>")[1].split("</gradient>")[0]}
            </span>
            {t.features.title.split("</gradient>")[1]}
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            {t.features.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => {
            const item = t.features.items[feature.key];
            const Icon = icons[i];
            return (
              <motion.div
                key={feature.key}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.5,
                  delay: 0.2 + i * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`group relative rounded-2xl border border-border bg-surface-raised p-6 transition-all hover:border-border-hover hover:bg-surface-elevated ${
                  feature.size === "large" ? "md:col-span-2 lg:col-span-1" : ""
                }`}
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon size={20} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
