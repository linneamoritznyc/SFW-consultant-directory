import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import { LocaleProvider } from "@/components/LocaleProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Soil Food Web Practitioner Directory",
  description:
    "Find certified Soil Food Web consultants and lab-techs by crop, soil, language, and ecoregion.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <LocaleProvider>
          <Header />
          <main className="flex-1 flex flex-col">{children}</main>
          <footer className="bg-soil-100 text-soil-600 text-xs px-4 py-3">
            <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-between gap-2">
              <span>
                Demo build - all practitioner profiles are fictional sample data.
                Ecoregion labels follow RESOLVE Ecoregions 2017 (Dinerstein et al.).
              </span>
              <span className="flex gap-4">
                <a
                  href="https://soilfoodweb.com/"
                  target="_blank"
                  rel="noopener"
                  className="font-medium hover:text-soil-900 hover:underline"
                >
                  soilfoodweb.com ↗
                </a>
                <Link href="/coverage" className="hover:text-soil-900 hover:underline">
                  Network coverage
                </Link>
                <Link href="/for-practitioners" className="hover:text-soil-900 hover:underline">
                  For practitioners
                </Link>
              </span>
            </div>
          </footer>
        </LocaleProvider>
      </body>
    </html>
  );
}
