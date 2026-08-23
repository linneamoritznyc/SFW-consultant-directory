import type { Filters, Role } from "./types";
import { EMPTY_FILTERS } from "./search";

// URL as state (PRD §6.2). Every filter combination serialises to query
// parameters — shareable, bookmarkable, back-button correct.
// e.g. /directory?role=consultant&crop=vineyard,olive&lang=es&remote=true

export function filtersToParams(f: Filters): URLSearchParams {
  const params = new URLSearchParams();
  if (f.role) params.set("role", f.role);
  if (f.crops.length) params.set("crop", f.crops.join(","));
  if (f.soilTypes.length) params.set("soil", f.soilTypes.join(","));
  if (f.languages.length) params.set("lang", f.languages.join(","));
  if (f.biomes.length) params.set("biome", f.biomes.join(","));
  if (f.remote) params.set("remote", "true");
  if (f.accepting) params.set("accepting", "true");
  if (f.q) params.set("q", f.q);
  return params;
}

export function paramsToFilters(params: URLSearchParams): Filters {
  const role = params.get("role");
  const list = (key: string) =>
    (params.get(key) ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return {
    ...EMPTY_FILTERS,
    role: role === "consultant" || role === "lab_tech" ? (role as Role) : undefined,
    crops: list("crop"),
    soilTypes: list("soil"),
    languages: list("lang"),
    biomes: list("biome"),
    remote: params.get("remote") === "true" || undefined,
    accepting: params.get("accepting") === "true" || undefined,
    q: params.get("q") || undefined,
  };
}

export function directoryHref(f: Filters): string {
  const qs = filtersToParams(f).toString();
  return qs ? `/directory?${qs}` : "/directory";
}
