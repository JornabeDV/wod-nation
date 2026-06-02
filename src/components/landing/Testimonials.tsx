"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "WODNation saved us 10 hours of manual work per competition. The live leaderboard alone is worth it.",
    author: "Sofia Martinez",
    role: "Organizer, CrossFit Mendoza",
  },
  {
    quote:
      "Our athletes love seeing the leaderboard update in real time. It adds so much excitement to the event.",
    author: "Juan Perez",
    role: "Box Owner, CrossFit Buenos Aires",
  },
  {
    quote:
      "We went from Excel chaos to a professional competition experience in one weekend. Incredible tool.",
    author: "Ana Lopez",
    role: "Coach, FitFest Chile",
  },
];

export function Testimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Loved by{" "}
            <span className="text-gradient-primary">organizers</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.author}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: 0.2 + i * 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="rounded-2xl border border-border bg-surface-raised p-6 relative"
            >
              <Quote
                size={24}
                className="text-primary/30 mb-4"
              />
              <p className="text-text-secondary leading-relaxed mb-6">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center text-sm font-bold">
                  {t.author.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-medium">{t.author}</div>
                  <div className="text-xs text-text-muted">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
