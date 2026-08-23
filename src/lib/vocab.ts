import type { VocabTerm, Vocabulary } from "./types";

// Controlled vocabularies (PRD §4.2). Slugs are stable and never translated;
// labels here are the 'en' locale. Synonyms are search-time expansion only —
// they include cross-locale variants so "viñedo" resolves to `vineyard`.
// Hierarchy: parentSlug builds the tree; query expansion goes DOWN only.

let nextId = 1;
function t(
  vocabulary: Vocabulary,
  slug: string,
  label: string,
  synonyms: string[] = [],
  parentSlug?: string
): VocabTerm {
  return { id: nextId++, vocabulary, slug, label, synonyms, parentSlug };
}

export const TERMS: VocabTerm[] = [
  // Crops — hierarchical
  t("crop", "perennial_fruit", "Perennial fruit"),
  t("crop", "vine_fruit", "Vine fruit", [], "perennial_fruit"),
  t("crop", "vineyard", "Vineyard / wine grapes", ["wine grapes", "viticulture", "viticultura", "viñedo", "vinha", "bağ", "vingård", "grapes"], "vine_fruit"),
  t("crop", "olive", "Olives", ["olivar", "aceituna", "oliveira", "zeytin", "olive grove"], "perennial_fruit"),
  t("crop", "orchard_fruit", "Orchard fruit", ["apples", "stone fruit", "manzana", "frutales", "pomar"], "perennial_fruit"),
  t("crop", "citrus", "Citrus", ["orange", "lemon", "naranja", "limón"], "perennial_fruit"),
  t("crop", "coffee", "Coffee", ["café", "kahve"], "perennial_fruit"),
  t("crop", "annual_row", "Annual row crops"),
  t("crop", "vegetables", "Vegetables / market garden", ["market garden", "hortalizas", "huerta", "grönsaker", "sebze"], "annual_row"),
  t("crop", "cereals", "Cereals / grains", ["wheat", "maize", "corn", "trigo", "maíz", "buğday"], "annual_row"),
  t("crop", "pasture", "Pasture / rangeland", ["grazing", "livestock", "pastizal", "pradera", "mera"]),
  t("crop", "turf", "Turf / landscaping", ["lawns", "golf", "césped"]),
  t("crop", "forestry", "Forestry / agroforestry", ["agroforestería", "skog", "orman"]),
  t("crop", "tropical_smallholder", "Tropical smallholder systems", ["banana", "cacao", "plátano"]),

  // Soil types
  t("soil_type", "calcareous", "Calcareous", ["limestone", "calcáreo", "kireçli", "chalky"]),
  t("soil_type", "clay", "Clay-heavy", ["arcilloso", "lera", "killi"]),
  t("soil_type", "sandy", "Sandy", ["arenoso", "sandig", "kumlu"]),
  t("soil_type", "loam", "Loam", ["franco"]),
  t("soil_type", "volcanic", "Volcanic / andisol", ["volcánico"]),
  t("soil_type", "peat", "Peat / organic", ["turba", "torv"]),
  t("soil_type", "saline", "Saline / sodic", ["salino", "tuzlu"]),

  // Languages (ISO-ish slugs)
  t("language", "en", "English", ["inglés", "ingilizce"]),
  t("language", "es", "Spanish", ["español", "castellano"]),
  t("language", "pt", "Portuguese", ["português"]),
  t("language", "tr", "Turkish", ["türkçe", "turkce"]),
  t("language", "sv", "Swedish", ["svenska"]),
  t("language", "fr", "French", ["français"]),
  t("language", "de", "German", ["deutsch"]),
  t("language", "hi", "Hindi", []),

  // Practices
  t("practice", "compost_production", "Thermal compost production", ["compost", "composta"]),
  t("practice", "compost_extracts", "Extracts & teas", ["compost tea", "té de composta"]),
  t("practice", "microscopy", "Soil microscopy & assessment", ["microscope", "biological assay"]),
  t("practice", "transition_organic", "Transition to organic / regenerative", ["conversion", "transición"]),
];

export const TERMS_BY_SLUG: Map<string, VocabTerm> = new Map(
  TERMS.map((term) => [term.slug, term])
);

export function termsFor(vocabulary: Vocabulary): VocabTerm[] {
  return TERMS.filter((term) => term.vocabulary === vocabulary);
}

export function label(slug: string): string {
  return TERMS_BY_SLUG.get(slug)?.label ?? slug;
}

/** All descendant slugs of a term, inclusive. Expansion goes down the tree,
 * never up: "perennial_fruit" matches vineyard practitioners, but "vineyard"
 * does not match everyone who has touched a fruit tree. */
export function expandDown(slug: string): string[] {
  const out = [slug];
  for (const term of TERMS) {
    if (term.parentSlug && out.includes(term.parentSlug)) out.push(term.slug);
  }
  // Repeat until fixed point for depth > 2 trees
  let grew = true;
  while (grew) {
    grew = false;
    for (const term of TERMS) {
      if (term.parentSlug && out.includes(term.parentSlug) && !out.includes(term.slug)) {
        out.push(term.slug);
        grew = true;
      }
    }
  }
  return out;
}

/** Layer 4: query-time synonym expansion. Maps a free-text token to matching
 * term slugs across all locales' synonyms. */
export function synonymHits(token: string): VocabTerm[] {
  const needle = token.toLowerCase().trim();
  if (needle.length < 3) return [];
  return TERMS.filter(
    (term) =>
      term.slug.replace(/_/g, " ").includes(needle) ||
      term.label.toLowerCase().includes(needle) ||
      term.synonyms.some((syn) => syn.toLowerCase().includes(needle) || needle.includes(syn.toLowerCase()))
  );
}

export const BIOMES = [
  "Mediterranean Forests, Woodlands & Scrub",
  "Temperate Broadleaf & Mixed Forests",
  "Temperate Grasslands, Savannas & Shrublands",
  "Tropical & Subtropical Moist Broadleaf Forests",
  "Tropical & Subtropical Grasslands, Savannas & Shrublands",
  "Deserts & Xeric Shrublands",
  "Boreal Forests/Taiga",
  "Montane Grasslands & Shrublands",
] as const;
