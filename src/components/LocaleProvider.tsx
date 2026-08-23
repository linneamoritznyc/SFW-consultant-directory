"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { STRINGS, TERM_I18N, BIOME_I18N, LOCALES, type Locale } from "@/lib/i18n";
import { label as enTermLabel } from "@/lib/vocab";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
  termLabel: (slug: string) => string;
  biomeLabel: (biome: string) => string;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: "en",
  setLocale: () => {},
  t: (k) => STRINGS.en[k] ?? k,
  termLabel: enTermLabel,
  biomeLabel: (b) => b,
});

const SUPPORTED = new Set(LOCALES.map((l) => l.code));

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  // First visit: default to the browser's language when supported; a saved
  // choice always wins. Runs after mount to keep SSR markup stable.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("sfw-locale");
      if (stored && SUPPORTED.has(stored as Locale)) {
        setLocaleState(stored as Locale);
        return;
      }
      const browser = (navigator.language || "en").slice(0, 2) as Locale;
      if (SUPPORTED.has(browser)) setLocaleState(browser);
    } catch {}
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    try {
      window.localStorage.setItem("sfw-locale", l);
    } catch {}
  };

  const t = (key: string) => STRINGS[locale]?.[key] ?? STRINGS.en[key] ?? key;
  const termLabel = (slug: string) =>
    TERM_I18N[locale]?.[slug] ?? enTermLabel(slug);
  const biomeLabel = (biome: string) => BIOME_I18N[locale]?.[biome] ?? biome;

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, termLabel, biomeLabel }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
