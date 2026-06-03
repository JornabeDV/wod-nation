"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/provider";
import type { Locale } from "@/lib/i18n/types";
import { LOCALES } from "@/lib/i18n/types";
import { Globe, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const localeLabels: Record<Locale, string> = {
  en: "English",
  es: "Español",
};

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);

  const handleSelect = (l: Locale) => {
    setLocale(l);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-text-secondary hover:text-text hover:bg-surface-elevated transition-colors"
        aria-label="Change language"
      >
        <Globe size={16} />
        <span className="uppercase text-xs font-medium">{locale}</span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 z-50 w-40 rounded-xl border border-border bg-surface-raised shadow-lg overflow-hidden"
            >
              {LOCALES.map((l) => (
                <button
                  key={l}
                  onClick={() => handleSelect(l)}
                  className={`flex w-full items-center justify-between px-3 py-2.5 text-sm transition-colors ${
                    locale === l
                      ? "text-text bg-surface-elevated"
                      : "text-text-secondary hover:text-text hover:bg-surface-elevated"
                  }`}
                >
                  <span>{localeLabels[l]}</span>
                  {locale === l && <Check size={14} className="text-primary" />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
