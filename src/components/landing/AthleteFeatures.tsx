"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Trophy,
  BarChart3,
  Users,
  Zap,
  Shield,
  Calendar,
} from "lucide-react";

const icons = [Calendar, Trophy, BarChart3, Users, Zap, Shield];

const features = [
  {
    title: "Descubrí competencias",
    description:
      "Encontrá eventos de CrossFit y fitness funcional en tu región. Filtrá por fecha, ubicación o categoría.",
  },
  {
    title: "Inscripción online",
    description:
      "Inscribite en minutos desde cualquier dispositivo. Pagá con MercadoPago o inscribite gratis.",
  },
  {
    title: "Leaderboard en vivo",
    description:
      "Seguí tu posición en tiempo real mientras competís. Accesible desde tu celular.",
  },
  {
    title: "Tu perfil de atleta",
    description:
      "Mantené tus datos actualizados, revisá tu historial de competencias y resultados.",
  },
  {
    title: "Notificaciones instantáneas",
    description:
      "Recibí alertas cuando se publiquen nuevos scores o cuando cambie tu posición.",
  },
  {
    title: "Certificados digitales",
    description:
      "Descargá tu certificado de participación y compartilo en redes sociales.",
  },
];

export function AthleteFeatures() {
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
            Todo lo que necesitás para{" "}
            <span className="text-gradient-primary">competir al máximo</span>
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Desde encontrar tu competencia ideal hasta descargar tu certificado, te acompañamos en cada paso.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => {
            const Icon = icons[i];
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.5,
                  delay: 0.2 + i * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group relative rounded-2xl border border-border bg-surface-raised p-6 transition-all hover:border-border-hover hover:bg-surface-elevated"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon size={20} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
