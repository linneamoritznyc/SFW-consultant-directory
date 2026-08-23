import type { Filters, Practitioner, RankedResult, Role } from "./types";
import { expandDown, label, synonymHits } from "./vocab";

// In-memory implementation of the search architecture (PRD §5). In production
// each layer maps onto Postgres: layer 1 = indexed filters, layer 2 =
// per-locale tsvector, layer 3 = pg_trgm, layer 4 = synonym expansion against
// vocabulary_term_i18n. The ranking weights in §5.3 are implemented in rank().

export const EMPTY_FILTERS: Filters = {
  crops: [],
  soilTypes: [],
  languages: [],
  biomes: [],
};

// --- Layer 3 helper: trigram similarity for fuzzy fallback -----------------
function trigrams(s: string): Set<string> {
  const norm = "  " + s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") + " ";
  const grams = new Set<string>();
  for (let i = 0; i < norm.length - 2; i++) grams.add(norm.slice(i, i + 3));
  return grams;
}

export function similarity(a: string, b: string): number {
  const ta = trigrams(a);
  const tb = trigrams(b);
  if (ta.size === 0 || tb.size === 0) return 0;
  let shared = 0;
  ta.forEach((g) => {
    if (tb.has(g)) shared++;
  });
  return shared / (ta.size + tb.size - shared);
}

// --- Free-text matching (layers 2–4) ---------------------------------------
function textMatches(p: Practitioner, q: string): boolean {
  const query = q.toLowerCase().trim();
  if (!query) return true;

  // Layer 2 equivalent: weighted fields, exact token containment.
  const haystacks = [
    p.displayName,
    `${p.city} ${p.adminArea} ${p.countryCode}`,
    p.crops.map(label).join(" "),
    p.ecoregion,
    p.biome,
    p.bio,
  ]
    .join(" ")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const normQuery = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (haystacks.includes(normQuery)) return true;

  // Layer 4: synonym expansion - "viñedo" resolves to the vineyard term (and
  // its descendants) regardless of profile language.
  for (const term of synonymHits(query)) {
    const slugs = expandDown(term.slug);
    if (
      slugs.some(
        (s) =>
          p.crops.includes(s) ||
          p.soilTypes.includes(s) ||
          p.practices.includes(s) ||
          p.languages.some((l) => l.slug === s)
      )
    )
      return true;
  }

  // Layer 3: fuzzy fallback on name and city for misspellings and
  // transliteration variance ("Turkiye", "Gothenburg").
  if (similarity(p.displayName, query) > 0.3) return true;
  if (similarity(p.city, query) > 0.35) return true;
  if (similarity(p.adminArea, query) > 0.35) return true;

  return false;
}

// --- Layer 1: structured filters -------------------------------------------
export function matchesFilters(p: Practitioner, f: Filters): boolean {
  if (f.role && !p.roles.includes(f.role)) return false;
  if (f.crops.length > 0) {
    // Hierarchy-aware: selecting a parent matches practitioners tagged with
    // any descendant. Expansion goes down only (PRD §4.2).
    const expanded = new Set(f.crops.flatMap(expandDown));
    if (!p.crops.some((c) => expanded.has(c))) return false;
  }
  if (f.soilTypes.length > 0 && !p.soilTypes.some((s) => f.soilTypes.includes(s)))
    return false;
  if (f.languages.length > 0 && !p.languages.some((l) => f.languages.includes(l.slug)))
    return false;
  if (f.biomes.length > 0 && !f.biomes.includes(p.biome)) return false;
  if (f.remote && !p.servicesRemotely) return false;
  if (f.accepting && !p.acceptingClients) return false;
  if (f.q && !textMatches(p, f.q)) return false;
  return true;
}

// --- Ranking (PRD §5.3) ----------------------------------------------------
// Certification recency and seniority are deliberately excluded: ranking by
// seniority entrenches early cohorts and starves new graduates of work.
export function rank(p: Practitioner, f: Filters, userBiome?: string): RankedResult {
  let score = 0;
  const reasons: string[] = [];

  if (userBiome && p.biome === userBiome) {
    score += 0.3;
    reasons.push(`Works in your biome (${p.biome})`);
  }
  if (f.crops.length > 0) {
    const expanded = new Set(f.crops.flatMap(expandDown));
    const overlap = p.crops.filter((c) => expanded.has(c));
    if (overlap.length > 0) {
      score += 0.25 * Math.min(1, overlap.length / f.crops.length);
      reasons.push(`Experience with ${overlap.map(label).join(", ").toLowerCase()}`);
    }
  }
  if (f.languages.length > 0) {
    const match = p.languages.find((l) => f.languages.includes(l.slug));
    if (match) {
      const profWeight = match.proficiency === "native" ? 1 : match.proficiency === "fluent" ? 0.85 : 0.6;
      score += 0.2 * profWeight;
      reasons.push(`${label(match.slug)} (${match.proficiency})`);
    }
  }
  if (p.acceptingClients) {
    score += 0.15;
    reasons.push("Currently accepting clients");
  }
  if (p.servicesRemotely) {
    score += 0.1;
    reasons.push("Works remotely");
  } else if (p.travelRadiusKm) {
    score += 0.05;
  }

  return { practitioner: p, score, remoteOnly: false, reasons };
}

export function search(
  all: Practitioner[],
  f: Filters,
  userBiome?: string
): RankedResult[] {
  return all
    .filter((p) => matchesFilters(p, f))
    .map((p) => rank(p, f, userBiome))
    .sort((a, b) => b.score - a.score || a.practitioner.displayName.localeCompare(b.practitioner.displayName));
}

// --- Facet counts (PRD §5.4) -----------------------------------------------
// Each option's count is computed against the currently applied filters with
// that option's own group removed - the standard faceted pattern that shows
// "Turkish (3)" before clicking, preventing dead ends.
export function facetCount(
  all: Practitioner[],
  f: Filters,
  group: keyof Filters,
  optionTest: (p: Practitioner) => boolean
): number {
  const without: Filters = { ...f };
  if (group === "crops") without.crops = [];
  else if (group === "soilTypes") without.soilTypes = [];
  else if (group === "languages") without.languages = [];
  else if (group === "biomes") without.biomes = [];
  else if (group === "role") without.role = undefined;
  else if (group === "remote") without.remote = undefined;
  else if (group === "accepting") without.accepting = undefined;
  return all.filter((p) => matchesFilters(p, without) && optionTest(p)).length;
}

// --- Empty states (PRD §6.3) -----------------------------------------------
// Name the constraint that failed and offer the nearest relaxations, never a
// blank page. Strategy: drop each active constraint singly and report which
// single relaxations bring results back, with counts.
export interface Relaxation {
  droppedLabel: string;
  count: number;
  filters: Filters;
}

const GROUP_LABELS: Record<string, (f: Filters) => string | null> = {
  role: (f) => (f.role ? `role: ${f.role === "lab_tech" ? "lab-tech" : "consultant"}` : null),
  crops: (f) => (f.crops.length ? `crops: ${f.crops.map(label).join(", ").toLowerCase()}` : null),
  soilTypes: (f) => (f.soilTypes.length ? `soil: ${f.soilTypes.map(label).join(", ").toLowerCase()}` : null),
  languages: (f) => (f.languages.length ? `language: ${f.languages.map(label).join(", ")}` : null),
  biomes: (f) => (f.biomes.length ? `biome: ${f.biomes.join(", ")}` : null),
  remote: (f) => (f.remote ? "remote only" : null),
  accepting: (f) => (f.accepting ? "accepting clients" : null),
  q: (f) => (f.q ? `search: “${f.q}”` : null),
};

export function relaxations(all: Practitioner[], f: Filters): Relaxation[] {
  const out: Relaxation[] = [];
  for (const group of Object.keys(GROUP_LABELS)) {
    const groupLabel = GROUP_LABELS[group](f);
    if (!groupLabel) continue;
    const relaxed: Filters = { ...f };
    if (group === "crops") relaxed.crops = [];
    else if (group === "soilTypes") relaxed.soilTypes = [];
    else if (group === "languages") relaxed.languages = [];
    else if (group === "biomes") relaxed.biomes = [];
    else if (group === "role") relaxed.role = undefined;
    else if (group === "remote") relaxed.remote = undefined;
    else if (group === "accepting") relaxed.accepting = undefined;
    else if (group === "q") relaxed.q = undefined;
    const count = all.filter((p) => matchesFilters(p, relaxed)).length;
    if (count > 0) out.push({ droppedLabel: groupLabel, count, filters: relaxed });
  }
  return out.sort((a, b) => b.count - a.count);
}

/** The constraint most likely responsible for an empty set: the one whose
 * removal restores the most results. */
export function failingConstraint(all: Practitioner[], f: Filters): string | null {
  const r = relaxations(all, f);
  return r.length > 0 ? r[0].droppedLabel : null;
}
