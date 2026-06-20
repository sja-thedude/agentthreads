"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  dictionaries,
  LOCALES,
  type Locale,
  type TranslationKey,
} from "./dictionaries";

type I18nContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = "agentthreads-locale";

function detectInitial(): Locale {
  if (typeof window === "undefined") return "en";
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved && LOCALES.includes(saved)) return saved;
  } catch {}
  const nav = navigator.language.slice(0, 2).toLowerCase();
  return (LOCALES as readonly string[]).includes(nav) ? (nav as Locale) : "en";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    setLocaleState(detectInitial());
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {}
  }, []);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => {
      let str = dictionaries[locale][key] ?? dictionaries.en[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replace(new RegExp(`{${k}}`, "g"), String(v));
        }
      }
      return str;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

/** Shorthand hook returning just the translate function. */
export function useT() {
  return useI18n().t;
}
