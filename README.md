# Soil Food Web Practitioner Directory v2

A working prototype of the **enrichment layer** for the Soil Food Web
directory: the same practitioners, made findable by *fit*, not just
location. The live site already has a clustered map, role/country filters,
and free-text search over bios — what it cannot do is answer "who has worked
calcareous Mediterranean soils, speaks Spanish, and is taking clients?"
This prototype demonstrates that layer end to end: structured vocabularies,
ecoregion-based matching, facet counts, guided intake with match
explanations, and a contact relay replacing exposed raw emails. Built to the
accompanying PRD and its live-site addendum (see `docs/PRD.md`).

## What's implemented

**Public directory** (`/directory`)
- Structured multi-select filters: role, crops (hierarchical — selecting
  "Perennial fruit" matches vineyard practitioners; the reverse never
  happens), soil types, languages, biome, remote, accepting-clients
- Facet counts on every option, computed against the applied filters, so
  users see "Turkish (3)" *before* clicking — no dead ends
- Free-text search with synonym expansion across locales ("viñedo" finds
  vineyard practitioners), accent-folding, and trigram fuzzy fallback for
  misspellings ("Turkiye", "Gothenburg")
- URL as state: every filter combination serialises to query params —
  shareable, bookmarkable, back-button correct
  (`/directory?role=consultant&crop=vineyard,olive&lang=es&remote=true`)
- Clustered map (MapLibre GL) with markers colour-coded by role, sharing one
  selection model with the list: hover a card and its pin lifts; click a pin
  and its card scrolls into view
- Empty states that name the failing constraint and link the nearest
  relaxations with counts — never a blank page

**Profile pages** (`/practitioners/[slug]`)
- Header (roles, certifications, availability), structured summary, the
  long-form bio unabridged, and a contact relay form — raw emails are never
  shipped to the client (`/api/contact`)

**Guided intake** (`/intake`)
- Seven questions, one per screen, progress bar, lossless back navigation
- Returns three ranked practitioners each with a plain-language explanation
  of *why* they matched (§5.3 weights: ecoregion 0.30, crop 0.25, language
  0.20 scaled by proficiency, availability 0.15, logistics 0.10; seniority
  deliberately excluded)

**Data layer** (`db/migrations/`)
- `0001_schema.sql` — full production schema: practitioner, controlled
  vocabularies + per-locale i18n with synonyms, junction tables, ecoregion /
  biome / realm, enquiry log, consent fields (GDPR §8.1)
- `0002_ecoregion_tagging.sql` — RESOLVE Ecoregions 2017 point-in-polygon
  tagging with the 25 km coastal fallback, trigger-maintained, plus the
  `coverage_by_biome` view for gap analysis
- `0003_search.sql` — per-locale weighted tsvectors + pg_trgm indexes

## Demo status — read this first

There is no database attached to this build. The app runs on a **fictional
in-memory dataset** (`src/lib/data.ts`, 22 sample practitioners shaped like
the real network: lab-techs ≈ 2× consultants) with the search layers
implemented in TypeScript (`src/lib/search.ts`) mirroring the SQL
architecture one-to-one. This makes every interaction in the PRD demoable
today; Phase 1 swaps `src/lib/data.ts` for the Postgres layer with no UI
changes.

Two deliberate substitutions, each a one-line swap later:
- **MapLibre GL** instead of Mapbox GL (API-compatible; no token needed for
  the demo). Point `DirectoryMap.tsx` at a Mapbox style + token to switch.
- **OSM raster tiles**, desaturated, as the muted basemap.

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run typecheck
```

## Path to production (per PRD §11)

1. **Phase 1** — stand up Supabase (Postgres 15 + PostGIS), run
   `db/migrations/` in order, load the RESOLVE 2017 shapefile
   (`ogr2ogr` → `ecoregion`), seed vocabularies from `src/lib/vocab.ts`,
   then **extract** structured tags from the 178 existing live bios
   (model-proposed against the controlled vocabularies, practitioner-
   confirmed) rather than collecting new data from scratch
2. **Phase 2** — replace `src/lib/data.ts` reads with server-side queries;
   the filter/ranking semantics are already mirrored in SQL
3. **Phase 3** — magic-link auth (Supabase Auth), practitioner self-service
   editing, wire `/api/contact` to a transactional email provider and the
   `enquiry` table
4. **Phase 4–5** — intake persistence, internal coverage dashboard
   (`coverage_by_biome` view is already in place)

## Open questions carried from the PRD

Unresolved and blocking pieces of production rollout — decisions, not code:
who is the data controller (School LLC vs Foundation); whether listing
consent exists and is recorded; delisting policy for lapsed practitioners.
The schema reserves fields for all three (`listed_publicly`, `consent_at`,
`consent_terms_ver`, `last_confirmed_at`).
