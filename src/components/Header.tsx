"use client";

import Link from "next/link";
import { LOCALES } from "@/lib/i18n";
import { useLocale } from "./LocaleProvider";

export default function Header() {
  const { locale, setLocale, t } = useLocale();
  return (
    <header className="bg-soil-800 text-soil-50 sticky top-0 z-40">
      <div className="mx-auto max-w-screen-2xl px-4 py-3 flex items-center gap-6">
        <Link href="/" className="font-semibold tracking-tight text-lg">
          <span className="text-leaf-300">Soil Food Web</span> Directory
        </Link>
        <nav className="flex flex-1 gap-4 text-sm text-soil-200">
          <Link href="/directory" className="hover:text-white">
            {t("nav_browse")}
          </Link>
          <Link href="/intake" className="hover:text-white">
            {t("nav_match")}
          </Link>
          <Link href="/about" className="hover:text-white">
            {t("nav_info")}
          </Link>
        </nav>
        <label className="flex items-center gap-1.5 text-xs text-soil-200">
          <span aria-hidden>🌐</span>
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as typeof locale)}
            aria-label="Language"
            className="rounded-md border border-soil-600 bg-soil-800 px-2 py-1 text-xs text-soil-100 hover:bg-soil-700 focus:outline-none"
          >
            {LOCALES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.native}
              </option>
            ))}
          </select>
        </label>
      </div>
    </header>
  );
}
