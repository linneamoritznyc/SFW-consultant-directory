import type { Metadata } from "next";
import Link from "next/link";
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
        <header className="bg-soil-800 text-soil-50 sticky top-0 z-40">
          <div className="mx-auto max-w-screen-2xl px-4 py-3 flex items-center gap-6">
            <Link href="/" className="font-semibold tracking-tight text-lg">
              <span className="text-leaf-300">Soil Food Web</span> Directory
            </Link>
            <nav className="flex gap-4 text-sm text-soil-200">
              <Link href="/directory" className="hover:text-white">
                Browse practitioners
              </Link>
              <Link href="/intake" className="hover:text-white">
                Get matched
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 flex flex-col">{children}</main>
        <footer className="bg-soil-100 text-soil-600 text-xs px-4 py-3 text-center">
          Demo build — all practitioner profiles are fictional sample data.
          Ecoregion labels follow RESOLVE Ecoregions 2017 (Dinerstein et al.).
        </footer>
      </body>
    </html>
  );
}
