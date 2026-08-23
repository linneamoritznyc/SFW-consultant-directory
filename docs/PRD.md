# Soil Food Web Practitioner Directory v2 - PRD

Status: Draft for discussion · Owner: TBD

> **Addendum, 2026-08-23 - findings from the live site.** Open question #1 is
> answered: the live "Directory (NEW)" already implements a clustered
> Leaflet/OSM map, role and country filters, free-text search over bios, and
> profile cards - 178 records, with consultants and lab-techs in one
> interface. This changes the framing from *rebuild* to **enrichment**:
>
> - **§1 is partly stale.** "Lab-techs are invisible on a separate page" is
>   no longer true. The unsolved problem is *fit*: every existing filter is
>   an attribute of the practitioner (role, country), none is an attribute
>   of the grower's problem (crop, soil, language, availability, remote).
> - **§11 Phase 2 mostly exists** and should not be rebuilt. Phases 1
>   (schema, vocabularies, ecoregion tagging), 3 (self-service, contact
>   relay - raw emails and phones are currently exposed on profile cards),
>   4 (guided intake), and 5 (coverage analysis) all survive; none is
>   possible with country-and-role data alone.
> - **The data is unstructured, not missing.** Live bios are
>   information-dense prose (crop, scale, practices, problem type,
>   certification context all present but unqueryable; free-text "compost"
>   matches 39% of the network with no indication of why). Phase 1 is
>   therefore primarily *extraction*: run the 178 bios through a model to
>   propose structured tags against the controlled vocabularies, then have
>   each practitioner confirm their own during a profile-review prompt.
> - **Count discrepancy to ask about:** 178 live records vs ~350 certified
>   practitioners claimed in §1 - incomplete migration, or a wrong figure?
> - **Live roles are Lab-Tech / Consultant / Farmer** (at
>   `/certified-listing-directory/`, Leaflet + OSM). The schema's
>   `role_enum` already covers the third as `grower`. Profile modals expose
>   raw email and phone (§8.2 applies verbatim), and search results give no
>   indication of *why* a record matched - e.g. "compost" returns 70 of
>   178 with no match explanation.
>
> One-line framing: the interface is done; the data underneath it isn't.
> Adding structured fields to what exists turns location search into fit
> matching, and this repo's demo prototypes exactly that layer.

## Concept

The Soil Food Web consultant directory is currently a set of pages you
scroll through, with long-form bios for consultants and a flat contact list
for lab-techs, which means finding the right person depends on reading
everything and guessing. This rebuild restructures the same information into
filterable fields covering role (consultant, lab-tech, or both), crops
worked, soil and climate types, languages spoken, certification year, travel
radius, remote availability, and whether they are currently taking clients -
with multi-select filters that combine across categories, free-text search
across names, locations and bios, and shareable URLs. Results sit alongside
a clustered map with markers colour-coded by role, linked so that hovering a
listing highlights its pin and clicking a pin opens the profile.
Remote-capable practitioners still surface in searches outside their travel
radius, flagged as remote. When a search returns nothing, the interface
names the filter that failed and shows the nearest alternatives. A short
intake form lets a grower describe their situation and receive a shortlist
of three suitable practitioners. Lab-techs are surfaced in the same
interface rather than on a separate page. Nothing is removed. The same
practitioners, made findable.

## 1. Problem

- Growers self-select badly: no way to know who has worked their soils,
  speaks their language, or is taking clients.
- Lab-techs are invisible: ~250 certified lab-techs vs ~100 consultants, yet
  the cheaper entry point sits on a separate flat contact list.
- The network's shape is unknown internally: the data is prose, not fields.

## 2. Goals / non-goals

Goals: find a suitable practitioner in under 60 seconds without reading
bios; lab-techs and consultants in one interface; structural queryability;
self-maintained profiles; works on a phone, outdoors, on a slow connection.

Non-goals v1: payments/contracts/escrow; reviews or ratings (see §9);
bidding (erodes the credential's premium positioning); replacing the
existing bio content, which is preserved inside the richer profile.

## 3. Users

| User | Comes with | Needs |
|---|---|---|
| Grower / farmer | A problem, a location, a budget range | A shortlist of 3 people who can help |
| Certified practitioner | A profile to be found through | Control over their listing, qualified enquiries |
| Foundation staff | Questions about network coverage | Structural view, gap analysis, export |

## 4. Data architecture

Core `practitioner` entity with stable slug, roles array, certifications
jsonb, status, availability flags, travel radius, contact fields (never
exposed raw - §8.2), PostGIS point location, and denormalised
ecoregion/biome/realm IDs. See `db/migrations/0001_schema.sql` for the
authoritative DDL.

**Controlled vocabularies, not free tags** (§4.2): free text fragments
immediately across a multilingual network ("vineyard" / "wine grapes" /
"viticultura"). Every filterable attribute is an FK into `vocabulary_term`,
with per-locale labels and synonyms in `vocabulary_term_i18n`. Hierarchy
enables recall: query expansion goes down the tree, never up. Synonyms are
search-time only, never selectable filter options.

**Ecoregion tagging** (§4.3): RESOLVE Ecoregions 2017 (Dinerstein et al.) -
846 terrestrial ecoregions, 14 biomes, 8 realms. Political geography is a
poor proxy for ecological similarity: southern Spain and coastal California
share a Mediterranean biome across 9,000 km; two Chilean practitioners
300 km apart may share nothing. Implementation: PostGIS point-in-polygon on
create/update, denormalised onto the practitioner row, 25 km
nearest-polygon fallback for coastal points (flagged for review). Unlocks
"find practitioners in an ecologically similar place", automatic coverage
analysis by biome, and a verifiable reach claim. Caveat stated plainly in
the UI: ecoregion is a biodiversity classification, not a soil
classification - a coarse similarity signal, never a claim of soil
equivalence. Soil-level matching later = FAO/HWSD as a separate field.

**Junction tables** (§4.4): crop (with optional years experience), soil
type, language (with `native | fluent | working` proficiency - a technical
soil conversation is not small talk), practice.

## 5. Search architecture

1. **Structured filters** - language-independent by construction; the
   primary interaction.
2. **Per-locale full-text** - one weighted tsvector per supported locale
   (name A, city/crops B, bio C); language-specific stemmers, because the
   English stemmer mangles Turkish.
3. **Fuzzy fallback** - pg_trgm on name/city when full-text returns < 3
   results ("Türkiye"/"Turkiye", "Göteborg"/"Gothenburg").
4. **Query-time synonym expansion** - "viñedo" → term 47 → practitioners
   tagged `vineyard` regardless of profile language.

**Ranking** (§5.3): ecoregion match 0.30 · crop overlap 0.25 · language
0.20 · accepting clients 0.15 · radius/remote 0.10. Certification recency
and seniority deliberately excluded - ranking by seniority entrenches early
cohorts and starves new graduates.

**Facet counts** (§5.4): every option shows its count against currently
applied filters - "Turkish (3)" before clicking, one GROUP BY, not N
queries.

## 6. Interface

- Desktop: filter rail (280px) / list / map ≈ 3:4:5. Map and list are one
  selection model. Mobile: full-bleed map with three-detent bottom sheet;
  assume a mid-range Android in sunlight.
- **URL as state** (§6.2): every filter combination serialises to query
  params. Shareable, bookmarkable, back-button correct. Non-negotiable.
- **Empty states** (§6.3): name the failed constraint, offer nearest
  relaxations with counts. Never a blank page.
- **Profile** (§6.4): header, structured summary, the existing bio
  unabridged, case study links, contact via form.
- **Guided intake** (§6.5): 6-8 questions, one per screen, back without
  losing answers → three ranked practitioners with plain-language
  explanations. The explanation matters more than the ranking.

## 7. Practitioner-facing

Magic-link login; edit everything; one-tap accepting-clients toggle from
mobile; quarterly "still accurate?" prompt; 18-month-stale records flagged
internally, not hidden publicly.

## 8. Compliance & privacy

- GDPR applies (EU/UK practitioners). Explicit opt-in consent for public
  listing recorded with timestamp + terms version; self-service removal;
  documented retention policy. Certification and public listing are
  separate decisions, separately recorded.
- No raw emails/phones published - server-side relay form, which also
  yields the first enquiry-volume data the organisation has had.
- Migration note: the site currently mixes two legal entities (Foundation
  501(c)(3) in the footer, School LLC on the privacy policy). The data
  controller must be named explicitly before launch.

## 9. Deliberate omissions

No ratings/reviews at ~350 practitioners (statistically meaningless volume;
one unfair one-star review damages a livelihood - revisit above 1,000 or
replace with structured outcome data). No bidding (devalues the
credential).

## 10. Stack

Next.js 14 App Router + TypeScript · Tailwind · Mapbox GL (Supercluster) ·
Postgres 15 + PostGIS + pg_trgm + unaccent (Supabase) · native Postgres
full-text (no Elasticsearch at a few hundred records) · magic-link auth ·
Vercel.

## 11. Phasing

1. Schema, vocabularies, ecoregion ingest, data migration - 2 wk
2. Public directory: filters, list, map, profiles, URL state - 3 wk
3. Self-service editing, magic-link auth, contact relay - 2 wk
4. Guided intake + matching explanations - 2 wk
5. Internal coverage dashboard - 1 wk

Phase 1 determines whether everything after it works. Resist starting with
the map.

## 12. Success measures

Time to enquiry · enquiry rate vs bounce · share of enquiries reaching a
matching-ecoregion practitioner · structured-profile completeness · lab-tech
share of enquiries · biomes with zero coverage over time.

## 13. Open questions

Existing "Directory (NEW)" data model? · Data controller: School LLC or
Foundation? · Is listing consent recorded today? · Auto-delisting policy for
lapsed practitioners? · Is enquiry volume measured at all?

## Sources

RESOLVE Ecoregions 2017: Dinerstein et al., *An Ecoregion-Based Approach to
Protecting Half the Terrestrial Realm*, BioScience 2017. Available via
UNEP-WCMC, ArcGIS Hub, Google Earth Engine.
