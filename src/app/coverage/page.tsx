import Link from "next/link";
import { PRACTITIONERS } from "@/lib/data";
import { BIOMES, label, termsFor } from "@/lib/vocab";
import CsvButton from "@/components/CsvButton";

export const metadata = { title: "Network coverage - Soil Food Web Directory" };

// Internal coverage view (PRD phase 5): where does the network have nobody?
// Zero-coverage rows are the recruitment and course-marketing roadmap. In
// production this reads the coverage_by_biome view; here it computes over the
// demo dataset.

export default function CoveragePage() {
  const active = PRACTITIONERS.filter((p) => p.acceptingClients);

  const biomeRows = BIOMES.map((b) => {
    const inBiome = PRACTITIONERS.filter((p) => p.biome === b);
    return {
      name: b,
      consultants: inBiome.filter((p) => p.roles.includes("consultant")).length,
      labTechs: inBiome.filter((p) => p.roles.includes("lab_tech")).length,
      accepting: inBiome.filter((p) => p.acceptingClients).length,
    };
  }).sort((a, b) => a.consultants + a.labTechs - (b.consultants + b.labTechs));

  const langRows = termsFor("language")
    .map((t) => {
      const speakers = PRACTITIONERS.filter((p) =>
        p.languages.some((l) => l.slug === t.slug)
      );
      return {
        name: t.label,
        total: speakers.length,
        native: speakers.filter((p) =>
          p.languages.some((l) => l.slug === t.slug && l.proficiency === "native")
        ).length,
      };
    })
    .sort((a, b) => a.total - b.total);

  const cropRows = termsFor("crop")
    .filter((t) => !["perennial_fruit", "vine_fruit", "annual_row"].includes(t.slug))
    .map((t) => ({
      name: label(t.slug),
      total: PRACTITIONERS.filter((p) => p.crops.includes(t.slug)).length,
    }))
    .sort((a, b) => a.total - b.total);

  const gaps = biomeRows.filter((r) => r.consultants + r.labTechs === 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold text-soil-900">Network coverage</h1>
      <p className="mt-2 text-soil-600">
        Where the network is strong, and where it has nobody. Zero-coverage
        rows are a recruitment roadmap, generated automatically from the same
        data that powers matching.
      </p>
      <p className="mt-2 text-xs text-soil-500">
        Tip for staff: any filtered directory view can be sent to a grower -
        use the &quot;Copy link&quot; button on the{" "}
        <Link href="/directory" className="text-leaf-700 hover:underline">
          directory
        </Link>
        , or build one from URL parameters directly.
      </p>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-soil-900">By biome</h2>
        <CsvButton
          filename="coverage_by_biome.csv"
          header={["biome", "consultants", "lab_techs", "accepting_clients"]}
          rows={biomeRows.map((r) => [r.name, r.consultants, r.labTechs, r.accepting])}
        />
      </div>
      {gaps.length > 0 && (
        <p className="mt-2 rounded-lg bg-orange-50 p-3 text-sm text-clay-600">
          {gaps.length} biome{gaps.length === 1 ? " has" : "s have"} zero
          practitioners: {gaps.map((g) => g.name).join("; ")}.
        </p>
      )}
      <Table
        head={["Biome", "Consultants", "Lab-techs", "Accepting"]}
        rows={biomeRows.map((r) => [
          r.name,
          String(r.consultants),
          String(r.labTechs),
          String(r.accepting),
        ])}
        highlightZero
      />

      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-soil-900">By language</h2>
        <CsvButton
          filename="coverage_by_language.csv"
          header={["language", "speakers", "native"]}
          rows={langRows.map((r) => [r.name, r.total, r.native])}
        />
      </div>
      <Table
        head={["Language", "Speakers", "Native"]}
        rows={langRows.map((r) => [r.name, String(r.total), String(r.native)])}
        highlightZero
      />

      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-soil-900">By crop / system</h2>
        <CsvButton
          filename="coverage_by_crop.csv"
          header={["crop", "practitioners"]}
          rows={cropRows.map((r) => [r.name, r.total])}
        />
      </div>
      <Table
        head={["Crop / system", "Practitioners"]}
        rows={cropRows.map((r) => [r.name, String(r.total)])}
        highlightZero
      />

      <p className="mt-10 text-sm text-soil-500">
        {PRACTITIONERS.length} practitioners in the demo dataset,{" "}
        {active.length} currently accepting clients. Production adds enquiry
        funnel metrics (sent → replied → engaged) from the contact relay.
      </p>
    </div>
  );
}

function Table({
  head,
  rows,
  highlightZero,
}: {
  head: string[];
  rows: string[][];
  highlightZero?: boolean;
}) {
  return (
    <div className="mt-3 overflow-x-auto rounded-xl border border-soil-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-soil-200 text-left text-xs uppercase tracking-wide text-soil-500">
            {head.map((h) => (
              <th key={h} className="px-4 py-2 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const isZero =
              highlightZero && r.slice(1).every((c) => c === "0");
            return (
              <tr
                key={i}
                className={`border-b border-soil-100 last:border-0 ${
                  isZero ? "bg-orange-50/60" : ""
                }`}
              >
                {r.map((c, j) => (
                  <td
                    key={j}
                    className={`px-4 py-2 ${j > 0 ? "tabular-nums" : "text-soil-800"}`}
                  >
                    {c}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
