"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Check } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for small box competitions.",
    features: [
      "1 competition",
      "Up to 30 athletes",
      "Basic leaderboard",
      "Email support",
    ],
    cta: "Get started",
    href: "/register",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "per competition",
    description: "For serious organizers running multiple events.",
    features: [
      "Unlimited competitions",
      "Unlimited athletes",
      "Live leaderboard",
      "MercadoPago payments",
      "Priority support",
    ],
    cta: "Start free trial",
    href: "/register",
    highlighted: true,
  },
  {
    name: "Full",
    price: "$99",
    period: "per competition",
    description: "For large-scale events and franchises.",
    features: [
      "Everything in Pro",
      "Custom branding",
      "Advanced analytics",
      "API access",
      "Dedicated account manager",
    ],
    cta: "Contact us",
    href: "/register",
    highlighted: false,
  },
];

export function Pricing() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

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
            Simple, transparent{" "}
            <span className="text-gradient-primary">pricing</span>
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Pay per competition, not per month. No hidden fees. Cancel anytime.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
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
                    Most popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-text-muted text-sm">/{plan.period}</span>
                </div>
                <p className="text-sm text-text-secondary">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check size={16} className="mt-0.5 text-primary shrink-0" />
                    <span className="text-text-secondary">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`block text-center rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                  plan.highlighted
                    ? "bg-primary text-white hover:bg-primary-glow glow-primary"
                    : "border border-border text-text hover:border-border-hover hover:bg-surface-elevated"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
