import Link from "next/link";
import { PRACTITIONERS } from "@/lib/data";

export default function HomePage() {
  const consultants = PRACTITIONERS.filter((p) => p.roles.includes("consultant")).length;
  const labTechs = PRACTITIONERS.filter((p) => p.roles.includes("lab_tech")).length;
  const biomes = new Set(PRACTITIONERS.map((p) => p.biome)).size;
  const ecoregions = new Set(PRACTITIONERS.map((p) => p.ecoregion)).size;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-4xl font-semibold tracking-tight text-soil-900">
        Find the right soil practitioner in under a minute
      </h1>
      <p className="mt-4 text-lg text-soil-600">
        Certified consultants and lab-techs, searchable by crop, soil type,
        language, and ecological region — not just by country.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Link
          href="/directory"
          className="rounded-lg bg-leaf-600 px-6 py-3 text-white font-medium hover:bg-leaf-700"
        >
          Browse the directory
        </Link>
        <Link
          href="/intake"
          className="rounded-lg border border-soil-300 bg-white px-6 py-3 font-medium text-soil-800 hover:bg-soil-100"
        >
          Answer 7 questions, get 3 matches
        </Link>
      </div>
      <dl className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
        {[
          [consultants, "Consultants"],
          [labTechs, "Lab-techs"],
          [ecoregions, "Ecoregions"],
          [biomes, "Biomes"],
        ].map(([n, l]) => (
          <div key={String(l)} className="rounded-xl bg-white p-5 shadow-sm">
            <dt className="text-3xl font-semibold text-leaf-700">{n}</dt>
            <dd className="mt-1 text-sm text-soil-500">{l}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-10 text-sm text-soil-500 max-w-xl mx-auto">
        Lab-techs are often the most accessible starting point: a biological
        soil assessment costs a fraction of a full advisory engagement. Both
        roles appear in the same directory, side by side.
      </p>
    </div>
  );
}
