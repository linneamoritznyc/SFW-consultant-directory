"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { STRINGS, TERM_ES, BIOME_ES, type Locale } from "@/lib/i18n";
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

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("sfw-locale");
      if (stored === "es" || stored === "en") setLocaleState(stored);
    } catch {}
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    try {
      window.localStorage.setItem("sfw-locale", l);
    } catch {}
  };

  const t = (key: string) => STRINGS[locale][key] ?? STRINGS.en[key] ?? key;
  const termLabel = (slug: string) =>
    locale === "es" ? TERM_ES[slug] ?? enTermLabel(slug) : enTermLabel(slug);
  const biomeLabel = (biome: string) =>
    locale === "es" ? BIOME_ES[biome] ?? biome : biome;

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, termLabel, biomeLabel }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
