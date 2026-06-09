"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Check } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/provider";

export function Pricing() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { t } = useI18n();

  const plans = [
    { key: "free", highlighted: false },
    { key: "pro", highlighted: true },
    { key: "full", highlighted: false },
  ] as const;

  return (
    <section id="pricing" className="py-24 sm:py-32 bg-surface">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            {t.pricing.title.split("<gradient>")[0]}
            <span className="text-gradient-primary">
              {t.pricing.title.split("<gradient>")[1].split("</gradient>")[0]}
            </span>
            {t.pricing.title.split("</gradient>")[1]}
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            {t.pricing.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, i) => {
            const data = t.pricing.plans[plan.key];
            return (
              <motion.div
                key={plan.key}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.5,
                  delay: 0.2 + i * 0.15,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`relative rounded-2xl p-6 lg:p-8 ${
                  plan.highlighted
                    ? "border-2 border-primary bg-surface-raised"
                    : "border border-border bg-surface-raised"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
                      {t.pricing.mostPopular}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">{data.name}</h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-bold">{data.price}</span>
                    <span className="text-text-muted text-sm">/{data.period}</span>
                  </div>
                  <p className="text-sm text-text-secondary">{data.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {data.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check size={16} className="mt-0.5 text-primary shrink-0" />
                      <span className="text-text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register?role=organizer"
                  className={`block text-center rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                    plan.highlighted
                      ? "bg-primary text-white hover:bg-primary-glow glow-primary"
                      : "border border-border text-text hover:border-border-hover hover:bg-surface-elevated"
                  }`}
                >
                  {data.cta}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
