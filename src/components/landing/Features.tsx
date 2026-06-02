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

const features = [
  {
    icon: CreditCard,
    title: "Payments built-in",
    description:
      "Collect registration fees with MercadoPago. No more cash, no more spreadsheets.",
    size: "large",
  },
  {
    icon: Trophy,
    title: "Live Leaderboard",
    description: "Real-time rankings that update as scores come in. Project it on a TV.",
    size: "small",
  },
  {
    icon: BarChart3,
    title: "WOD Scoring",
    description: "AMRAP, For Time, EMOM, Max Weight. We handle the math.",
    size: "small",
  },
  {
    icon: Users,
    title: "Self-registration",
    description: "Athletes sign themselves up. You just share the link.",
    size: "small",
  },
  {
    icon: Zap,
    title: "Set up in minutes",
    description: "From zero to published competition in under 5 minutes.",
    size: "small",
  },
  {
    icon: Shield,
    title: "Secure & reliable",
    description: "SSL, backups, and 99.9% uptime. Your data is safe.",
    size: "large",
  },
];

export function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

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
            Everything you need to{" "}
            <span className="text-gradient-primary">run a comp</span>
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            No more duct-taping spreadsheets, WhatsApp groups, and cash payments.
            One platform. Zero headaches.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
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
                <feature.icon size={20} />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
