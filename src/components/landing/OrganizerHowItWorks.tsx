"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const steps = [
  {
    number: "01",
    title: "Creá tu competencia",
    description:
      "Configurá tu evento en minutos. Definí categorías, WODs, reglas de scoring y precios de inscripción.",
  },
  {
    number: "02",
    title: "Los atletas se inscriben y pagan",
    description:
      "Compartí un link. Los atletas se registran y pagan online. Sin perseguir pagos ni administrar hojas de cálculo.",
  },
  {
    number: "03",
    title: "Puntaje y transmisión en vivo",
    description:
      "Los jueces cargan scores desde cualquier dispositivo. El leaderboard se actualiza instantáneamente.",
  },
];

export function OrganizerHowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="how-it-works" className="py-24 sm:py-32 bg-surface">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            De la idea a la competencia en{" "}
            <span className="text-gradient-primary">3 pasos</span>
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Eliminamos la complejidad para que te enfoques en lo importante: organizar un evento épico.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: 0.3 + i * 0.2,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative"
            >
              <div className="text-6xl font-bold text-text-muted/10 mb-4">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-text-secondary leading-relaxed">
                {step.description}
              </p>

              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-full w-full h-px">
                  <div className="w-full h-full bg-gradient-to-r from-border via-border to-transparent" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
