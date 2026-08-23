"use client";

import type { Filters, Practitioner, Role } from "@/lib/types";
import { facetCount } from "@/lib/search";
import { expandDown, termsFor, BIOMES } from "@/lib/vocab";

interface Props {
  all: Practitioner[];
  filters: Filters;
  onChange: (f: Filters) => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-soil-200 py-3">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-soil-500">
        {title}
      </h3>
      <div className="space-y-1">{children}</div>
    </section>
  );
}

function Option({
  label,
  count,
  checked,
  onToggle,
  indent = false,
}: {
  label: string;
  count: number;
  checked: boolean;
  onToggle: () => void;
  indent?: boolean;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center justify-between gap-2 rounded px-1 py-0.5 text-sm hover:bg-soil-100 ${
        count === 0 && !checked ? "text-soil-400" : "text-soil-800"
      } ${indent ? "ml-4" : ""}`}
    >
      <span className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="accent-leaf-600"
        />
        {label}
      </span>
      <span className="text-xs tabular-nums text-soil-500">{count}</span>
    </label>
  );
}

export default function FilterRail({ all, filters, onChange }: Props) {
  const toggleList = (key: "crops" | "soilTypes" | "languages" | "biomes", slug: string) => {
    const current = filters[key];
    const next = current.includes(slug)
      ? current.filter((s) => s !== slug)
      : [...current, slug];
    onChange({ ...filters, [key]: next });
  };

  const setRole = (role?: Role) => onChange({ ...filters, role });

  const cropTerms = termsFor("crop");
  const topCrops = cropTerms.filter((t) => !t.parentSlug);

  const hasActive =
    filters.role ||
    filters.crops.length ||
    filters.soilTypes.length ||
    filters.languages.length ||
    filters.biomes.length ||
    filters.remote ||
    filters.accepting ||
    filters.q;

  return (
    <div className="text-sm">
      <div className="flex items-center justify-between py-2">
        <h2 className="font-semibold text-soil-800">Filters</h2>
        {hasActive ? (
          <button
            onClick={() =>
              onChange({ crops: [], soilTypes: [], languages: [], biomes: [] })
            }
            className="text-xs text-leaf-700 hover:underline"
          >
            Clear all
          </button>
        ) : null}
      </div>

      <Section title="Role">
        {(
          [
            [undefined, "All roles"],
            ["consultant", "Consultants"],
            ["lab_tech", "Lab-techs"],
          ] as [Role | undefined, string][]
        ).map(([role, roleLabel]) => (
          <label
            key={roleLabel}
            className="flex cursor-pointer items-center justify-between gap-2 rounded px-1 py-0.5 hover:bg-soil-100"
          >
            <span className="flex items-center gap-2">
              <input
                type="radio"
                name="role"
                checked={filters.role === role}
                onChange={() => setRole(role)}
                className="accent-leaf-600"
              />
              {roleLabel}
            </span>
            <span className="text-xs tabular-nums text-soil-500">
              {facetCount(all, filters, "role", (p) =>
                role ? p.roles.includes(role) : true
              )}
            </span>
          </label>
        ))}
      </Section>

      <Section title="Availability">
        <Option
          label="Accepting clients"
          count={facetCount(all, filters, "accepting", (p) => p.acceptingClients)}
          checked={!!filters.accepting}
          onToggle={() => onChange({ ...filters, accepting: !filters.accepting || undefined })}
        />
        <Option
          label="Works remotely"
          count={facetCount(all, filters, "remote", (p) => p.servicesRemotely)}
          checked={!!filters.remote}
          onToggle={() => onChange({ ...filters, remote: !filters.remote || undefined })}
        />
      </Section>

      <Section title="Crops & systems">
        {topCrops.map((parent) => {
          const children = cropTerms.filter((t) => t.parentSlug === parent.slug);
          const descendants = expandDown(parent.slug);
          return (
            <div key={parent.slug}>
              <Option
                label={parent.label}
                count={facetCount(all, filters, "crops", (p) =>
                  p.crops.some((c) => descendants.includes(c))
                )}
                checked={filters.crops.includes(parent.slug)}
                onToggle={() => toggleList("crops", parent.slug)}
              />
              {children.map((child) => {
                const childDesc = expandDown(child.slug);
                return (
                  <Option
                    key={child.slug}
                    indent
                    label={child.label}
                    count={facetCount(all, filters, "crops", (p) =>
                      p.crops.some((c) => childDesc.includes(c))
                    )}
                    checked={filters.crops.includes(child.slug)}
                    onToggle={() => toggleList("crops", child.slug)}
                  />
                );
              })}
            </div>
          );
        })}
      </Section>

      <Section title="Soil types">
        {termsFor("soil_type").map((term) => (
          <Option
            key={term.slug}
            label={term.label}
            count={facetCount(all, filters, "soilTypes", (p) =>
              p.soilTypes.includes(term.slug)
            )}
            checked={filters.soilTypes.includes(term.slug)}
            onToggle={() => toggleList("soilTypes", term.slug)}
          />
        ))}
      </Section>

      <Section title="Languages">
        {termsFor("language").map((term) => (
          <Option
            key={term.slug}
            label={term.label}
            count={facetCount(all, filters, "languages", (p) =>
              p.languages.some((l) => l.slug === term.slug)
            )}
            checked={filters.languages.includes(term.slug)}
            onToggle={() => toggleList("languages", term.slug)}
          />
        ))}
      </Section>

      <Section title="Biome (RESOLVE 2017)">
        <p className="mb-1 text-[11px] leading-snug text-soil-500">
          A coarse ecological-similarity signal — not a claim of soil
          equivalence.
        </p>
        {BIOMES.map((biome) => (
          <Option
            key={biome}
            label={biome}
            count={facetCount(all, filters, "biomes", (p) => p.biome === biome)}
            checked={filters.biomes.includes(biome)}
            onToggle={() => toggleList("biomes", biome)}
          />
        ))}
      </Section>
    </div>
  );
}
