"use client";

import { useState } from "react";
import Link from "next/link";
import { PRACTITIONERS } from "@/lib/data";
import type { Practitioner } from "@/lib/types";

// Profile-completeness meter (practitioner persona): shows which fields are
// filled, which are missing, and - crucially - what each missing field costs
// in findability. Transparency here is the incentive that keeps profiles
// fresh, which is the whole self-maintenance problem.

interface Check {
  label: string;
  done: boolean;
  hint: string; // what being empty costs, in grower terms
}

function checksFor(p: Practitioner): Check[] {
  return [
    {
      label: "Crops & systems tagged",
      done: p.crops.length > 0,
      hint: "Growers filtering by crop can never find you.",
    },
    {
      label: "Soil types tagged",
      done: p.soilTypes.length > 0,
      hint: "You are invisible to every soil-type filter.",
    },
    {
      label: "Languages with proficiency",
      done: p.languages.length > 0,
      hint: "Language match is 20% of the match score.",
    },
    {
      label: "Practices listed",
      done: p.practices.length > 0,
      hint: "Problem-based matching (compaction, disease…) keys off practices.",
    },
    {
      label: "Service area set (radius or remote)",
      done: p.travelRadiusKm !== null || p.servicesRemotely,
      hint: "Without it, we cannot tell growers whether you can reach them.",
    },
    {
      label: "Scale of operations",
      done: p.scaleBands.length > 0,
      hint: "Large operations filter for practitioners who have worked at scale.",
    },
    {
      label: "Fee band chosen",
      done: !!p.feeBand,
      hint: "Cost opacity is the top silent reason growers bounce.",
    },
    {
      label: "Bio written (200+ characters)",
      done: p.bio.length >= 200,
      hint: "The bio is what convinces a grower after the match finds you.",
    },
    {
      label: "“How I work” written",
      done: p.approach.length > 0,
      hint: "Growers choose between similar matches on working style.",
    },
    {
      label: "Services listed with descriptions",
      done: p.services.length > 0,
      hint: "Without concrete services, growers cannot tell what an engagement looks like.",
    },
    {
      label: "At least one case study",
      done: (p.caseStudies?.length ?? 0) > 0,
      hint: "Past work with real outcomes is the strongest trust signal a profile can carry.",
    },
  ];
}

export default function CompletenessDemo() {
  const [slug, setSlug] = useState(PRACTITIONERS[0].slug);
  const p = PRACTITIONERS.find((x) => x.slug === slug) ?? PRACTITIONERS[0];
  const checks = checksFor(p);
  const done = checks.filter((c) => c.done).length;
  const pct = Math.round((done / checks.length) * 100);

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-soil-900">
        Preview a profile&apos;s completeness
      </h2>
      <select
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        className="mt-3 w-full rounded-lg border border-soil-300 bg-white px-3 py-2 text-sm focus:border-leaf-500 focus:outline-none"
      >
        {PRACTITIONERS.map((x) => (
          <option key={x.slug} value={x.slug}>
            {x.displayName} - {x.city}
          </option>
        ))}
      </select>

      <div className="mt-4 rounded-xl border border-soil-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-soil-900">{p.displayName}</p>
          <p className="text-sm tabular-nums text-soil-600">{pct}% complete</p>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-soil-100">
          <div
            className={`h-full rounded-full ${pct === 100 ? "bg-leaf-600" : "bg-leaf-400"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <ul className="mt-4 space-y-2 text-sm">
          {checks.map((c) => (
            <li key={c.label} className="flex items-start gap-2">
              <span
                className={`mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                  c.done ? "bg-leaf-100 text-leaf-700" : "bg-orange-100 text-clay-600"
                }`}
              >
                {c.done ? "✓" : "!"}
              </span>
              <span className={c.done ? "text-soil-700" : "text-soil-900"}>
                {c.label}
                {!c.done && (
                  <span className="block text-xs text-clay-600">{c.hint}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
        <Link
          href={`/practitioners/${p.slug}`}
          className="mt-4 inline-block text-sm text-leaf-700 hover:underline"
        >
          View public profile →
        </Link>
      </div>
    </section>
  );
}
