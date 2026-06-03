"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useI18n } from "@/lib/i18n/provider";

const leaderboardData = [
  { rank: 1, name: "Martín García", box: "CrossFit Centro", wod1: "2:45", wod2: "18 rds", wod3: "115 kg", total: 3 },
  { rank: 2, name: "Lucas Pérez", box: "CrossFit Norte", wod1: "3:12", wod2: "16 rds", wod3: "102 kg", total: 6 },
  { rank: 3, name: "Carlos Ruiz", box: "CrossFit Este", wod1: "3:58", wod2: "14 rds", wod3: "95 kg", total: 9 },
];

export function LivePreview() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { t } = useI18n();

  return (
    <section className="py-24 sm:py-32 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            {t.livePreview.title.split("<gradient>")[0]}
            <span className="text-gradient-primary">
              {t.livePreview.title.split("<gradient>")[1].split("</gradient>")[0]}
            </span>
            {t.livePreview.title.split("</gradient>")[1]}
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            {t.livePreview.subtitle}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto max-w-4xl"
        >
          {/* Glow behind the card */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/20 via-accent-purple/10 to-primary/20 blur-xl opacity-50" />

          <div className="relative rounded-xl border border-border bg-surface-raised overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <div className="h-2 w-2 rounded-full bg-green-500" />
              </div>
              <div className="text-sm font-medium text-text-secondary">
                {t.livePreview.header}
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
                <span className="text-xs text-text-muted">{t.livePreview.live}</span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-text-muted">
                    <th className="px-6 py-3 font-medium">{t.livePreview.table.rank}</th>
                    <th className="px-6 py-3 font-medium">{t.livePreview.table.athlete}</th>
                    <th className="px-6 py-3 font-medium">{t.livePreview.table.box}</th>
                    <th className="px-6 py-3 font-medium text-center">{t.livePreview.table.wod1}</th>
                    <th className="px-6 py-3 font-medium text-center">{t.livePreview.table.wod2}</th>
                    <th className="px-6 py-3 font-medium text-center">{t.livePreview.table.wod3}</th>
                    <th className="px-6 py-3 font-medium text-center">{t.livePreview.table.total}</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData.map((row, i) => (
                    <motion.tr
                      key={row.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                      className="border-b border-border/50 hover:bg-surface-elevated/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                            row.rank === 1
                              ? "bg-yellow-500/20 text-yellow-500"
                              : row.rank === 2
                              ? "bg-gray-400/20 text-gray-400"
                              : "bg-orange-700/20 text-orange-400"
                          }`}
                        >
                          {row.rank}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">{row.name}</td>
                      <td className="px-6 py-4 text-text-secondary">{row.box}</td>
                      <td className="px-6 py-4 text-center">{row.wod1}</td>
                      <td className="px-6 py-4 text-center">{row.wod2}</td>
                      <td className="px-6 py-4 text-center">{row.wod3}</td>
                      <td className="px-6 py-4 text-center font-bold">{row.total}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
