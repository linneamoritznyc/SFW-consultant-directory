export type Role = "consultant" | "lab_tech";

export type Proficiency = "native" | "fluent" | "working";

export type Vocabulary =
  | "crop"
  | "soil_type"
  | "climate"
  | "language"
  | "practice";

export interface VocabTerm {
  id: number;
  vocabulary: Vocabulary;
  slug: string;
  parentSlug?: string;
  label: string; // en label; i18n table carries other locales in production
  synonyms: string[]; // search-time expansion only, never filter options
}

export interface Certification {
  program: string;
  year: number;
}

export interface Practitioner {
  id: string;
  slug: string;
  displayName: string;
  roles: Role[];
  certifications: Certification[];
  certifiedSince: number;
  acceptingClients: boolean;
  servicesRemotely: boolean;
  travelRadiusKm: number | null;
  city: string;
  adminArea: string;
  countryCode: string;
  lat: number;
  lng: number;
  // Derived ecoregion tags (PRD §4.3). In production these come from the
  // PostGIS point-in-polygon lookup; the demo dataset carries them inline.
  ecoregion: string;
  biome: string;
  realm: string;
  crops: string[]; // vocabulary slugs
  soilTypes: string[];
  languages: { slug: string; proficiency: Proficiency }[];
  practices: string[];
  bio: string;
  websiteUrl?: string;
}

export interface Filters {
  role?: Role;
  crops: string[];
  soilTypes: string[];
  languages: string[];
  biomes: string[];
  remote?: boolean;
  accepting?: boolean;
  q?: string;
}

export interface RankedResult {
  practitioner: Practitioner;
  score: number;
  remoteOnly: boolean; // surfaced despite being outside scope because remote-capable
  reasons: string[];
}
