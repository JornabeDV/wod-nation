"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { Locale, Dictionary } from "./types";
import { LOCALES, DEFAULT_LOCALE } from "./types";
import { dictionary as enDictionary } from "./dictionaries/en";

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
}

const I18nContext = createContext<I18nContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: enDictionary,
});

const dictionaries: Record<Locale, () => Promise<{ dictionary: Dictionary }>> =
  {
    en: () => import("./dictionaries/en") as Promise<{ dictionary: Dictionary }>,
    es: () => import("./dictionaries/es") as Promise<{ dictionary: Dictionary }>,
  };

function getStoredLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const stored = localStorage.getItem("locale") as Locale | null;
    if (stored && LOCALES.includes(stored)) return stored;
  } catch {
    // ignore
  }
  const browserLang = navigator.language.slice(0, 2);
  if (browserLang === "es") return "es";
  return DEFAULT_LOCALE;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [dict, setDict] = useState<Dictionary>(enDictionary);

  const loadDictionary = useCallback(async (l: Locale) => {
    const mod = await dictionaries[l]();
    setDict(mod.dictionary);
  }, []);

  useEffect(() => {
    const stored = getStoredLocale();
    setLocaleState(stored);
    loadDictionary(stored);
  }, [loadDictionary]);

  const setLocale = useCallback(
    (l: Locale) => {
      setLocaleState(l);
      loadDictionary(l);
      try {
        localStorage.setItem("locale", l);
      } catch {
        // ignore
      }
      document.cookie = `locale=${l};path=/;max-age=${60 * 60 * 24 * 365}`;
      document.documentElement.lang = l;
    },
    [loadDictionary]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t: dict }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}
