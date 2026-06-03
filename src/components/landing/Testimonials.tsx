"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Quote } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

export function Testimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { t } = useI18n();

  const testimonials = [
    t.testimonials.items.sofia,
    t.testimonials.items.juan,
    t.testimonials.items.ana,
  ];

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
            {t.testimonials.title.split("<gradient>")[0]}
            <span className="text-gradient-primary">
              {t.testimonials.title.split("<gradient>")[1].split("</gradient>")[0]}
            </span>
            {t.testimonials.title.split("</gradient>")[1]}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item, i) => (
            <motion.div
              key={item.author}
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
                &ldquo;{item.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center text-sm font-bold">
                  {item.author.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-medium">{item.author}</div>
                  <div className="text-xs text-text-muted">{item.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
