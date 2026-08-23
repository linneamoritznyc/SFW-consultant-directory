import type { Practitioner } from "./types";

// Demo dataset. All practitioners are FICTIONAL, generated to exercise the
// directory's filters, map, ranking, and empty states. In production this is
// replaced by the Postgres data layer (db/migrations/) populated by the
// Phase 1 migration of the existing prose directory content.
//
// Deliberate shape: lab-techs outnumber consultants roughly 2:1, mirroring
// the real network (~250 lab-techs vs ~100 consultants, PRD §1).

const MED = "Mediterranean Forests, Woodlands & Scrub";
const TBF = "Temperate Broadleaf & Mixed Forests";
const TGS = "Temperate Grasslands, Savannas & Shrublands";
const TMF = "Tropical & Subtropical Moist Broadleaf Forests";
const TGR = "Tropical & Subtropical Grasslands, Savannas & Shrublands";
const DXS = "Deserts & Xeric Shrublands";
const BOR = "Boreal Forests/Taiga";

type BaseRecord = Omit<
  Practitioner,
  | "acceptsSamples"
  | "scaleBands"
  | "feeBand"
  | "yearsExperience"
  | "approach"
  | "services"
  | "caseStudies"
>;

const BASE: BaseRecord[] = [
  {
    id: "p01", slug: "elena-vasquez", displayName: "Elena Vásquez",
    roles: ["consultant"], certifications: [{ program: "CC", year: 2019 }], certifiedSince: 2019,
    acceptingClients: true, servicesRemotely: true, travelRadiusKm: 300,
    city: "Sevilla", adminArea: "Andalucía", countryCode: "ES", lat: 37.389, lng: -5.984,
    ecoregion: "Southwest Iberian Mediterranean sclerophyllous and mixed forests", biome: MED, realm: "Palearctic",
    crops: ["olive", "vineyard", "citrus"], soilTypes: ["calcareous", "clay"],
    languages: [{ slug: "es", proficiency: "native" }, { slug: "en", proficiency: "fluent" }],
    practices: ["compost_production", "transition_organic"],
    bio: "Elena grew up between her family's olive groves outside Écija and has spent six years helping Andalusian growers rebuild fungal networks in soils compacted by decades of tillage. Her work centres on dehesa systems, dry-farmed olives, and old-vine garnacha, with a particular interest in water retention on calcareous slopes. She runs a small on-farm compost operation and teaches seasonal workshops in Spanish and English.",
  },
  {
    id: "p02", slug: "mehmet-aydin", displayName: "Mehmet Aydın",
    roles: ["consultant", "lab_tech"], certifications: [{ program: "CC", year: 2021 }, { program: "LT", year: 2020 }], certifiedSince: 2020,
    acceptingClients: true, servicesRemotely: true, travelRadiusKm: 250,
    city: "İzmir", adminArea: "Ege", countryCode: "TR", lat: 38.423, lng: 27.143,
    ecoregion: "Aegean and Western Turkey sclerophyllous and mixed forests", biome: MED, realm: "Palearctic",
    crops: ["vineyard", "olive", "vegetables"], soilTypes: ["calcareous", "sandy"],
    languages: [{ slug: "tr", proficiency: "native" }, { slug: "en", proficiency: "working" }],
    practices: ["microscopy", "compost_extracts"],
    bio: "Mehmet runs a microscopy lab in İzmir serving vineyards and olive growers across the Aegean coast. A former agronomist with the regional cooperative, he combines biological assessments with practical amendment plans that smallholders can execute without new machinery. He is one of the few practitioners offering full soil food web assessments in Turkish.",
  },
  {
    id: "p03", slug: "claire-dubois", displayName: "Claire Dubois",
    roles: ["consultant"], certifications: [{ program: "CC", year: 2018 }], certifiedSince: 2018,
    acceptingClients: false, servicesRemotely: false, travelRadiusKm: 150,
    city: "Avignon", adminArea: "Provence", countryCode: "FR", lat: 43.949, lng: 4.806,
    ecoregion: "Northeastern Spain and Southern France Mediterranean forests", biome: MED, realm: "Palearctic",
    crops: ["vineyard", "orchard_fruit"], soilTypes: ["calcareous", "loam"],
    languages: [{ slug: "fr", proficiency: "native" }, { slug: "en", proficiency: "fluent" }, { slug: "es", proficiency: "working" }],
    practices: ["compost_production", "compost_extracts", "transition_organic"],
    bio: "Claire has guided over forty Rhône valley estates through biological transition, from first microscope assessment to certified organic status. Her waiting list is currently closed. She co-authors a regional newsletter on vineyard soil biology and mentors newly certified consultants in southern France.",
  },
  {
    id: "p04", slug: "sofia-lindqvist", displayName: "Sofia Lindqvist",
    roles: ["lab_tech"], certifications: [{ program: "LT", year: 2022 }], certifiedSince: 2022,
    acceptingClients: true, servicesRemotely: true, travelRadiusKm: 100,
    city: "Göteborg", adminArea: "Västra Götaland", countryCode: "SE", lat: 57.709, lng: 11.975,
    ecoregion: "Sarmatic mixed forests", biome: TBF, realm: "Palearctic",
    crops: ["vegetables", "cereals"], soilTypes: ["clay", "peat"],
    languages: [{ slug: "sv", proficiency: "native" }, { slug: "en", proficiency: "fluent" }],
    practices: ["microscopy"],
    bio: "Sofia offers microscope-based soil assessments for market gardens and grain farms across western Sweden, with remote sample analysis for the rest of Scandinavia. She came to soil biology from marine microbiology and brings a methodical sampling protocol that growers appreciate.",
  },
  {
    id: "p05", slug: "james-okafor", displayName: "James Okafor",
    roles: ["consultant"], certifications: [{ program: "CC", year: 2020 }], certifiedSince: 2020,
    acceptingClients: true, servicesRemotely: true, travelRadiusKm: null,
    city: "Nairobi", adminArea: "Nairobi County", countryCode: "KE", lat: -1.286, lng: 36.817,
    ecoregion: "East African montane forests", biome: TMF, realm: "Afrotropic",
    crops: ["coffee", "tropical_smallholder", "vegetables"], soilTypes: ["volcanic", "clay"],
    languages: [{ slug: "en", proficiency: "native" }],
    practices: ["compost_production", "transition_organic"],
    bio: "James works with coffee cooperatives and smallholder vegetable growers across the Kenyan highlands, building compost programmes that use locally available feedstocks. He advises remotely across East Africa and has trained village-level compost teams serving over 800 farms.",
  },
  {
    id: "p06", slug: "ana-souza", displayName: "Ana Souza",
    roles: ["consultant", "lab_tech"], certifications: [{ program: "CC", year: 2022 }, { program: "LT", year: 2021 }], certifiedSince: 2021,
    acceptingClients: true, servicesRemotely: true, travelRadiusKm: 400,
    city: "Campinas", adminArea: "São Paulo", countryCode: "BR", lat: -22.906, lng: -47.062,
    ecoregion: "Alto Paraná Atlantic forests", biome: TMF, realm: "Neotropic",
    crops: ["coffee", "citrus", "cereals"], soilTypes: ["clay", "loam"],
    languages: [{ slug: "pt", proficiency: "native" }, { slug: "es", proficiency: "fluent" }, { slug: "en", proficiency: "working" }],
    practices: ["microscopy", "compost_extracts", "transition_organic"],
    bio: "Ana splits her time between a soil biology lab in Campinas and consulting for coffee and citrus operations transitioning away from fumigation-heavy programmes. She works throughout southeastern Brazil and remotely across Latin America in Portuguese and Spanish.",
  },
  {
    id: "p07", slug: "rachel-whitfield", displayName: "Rachel Whitfield",
    roles: ["consultant"], certifications: [{ program: "CC", year: 2017 }], certifiedSince: 2017,
    acceptingClients: true, servicesRemotely: false, travelRadiusKm: 500,
    city: "Paso Robles", adminArea: "California", countryCode: "US", lat: 35.627, lng: -120.691,
    ecoregion: "California montane chaparral and woodlands", biome: MED, realm: "Nearctic",
    crops: ["vineyard", "olive", "orchard_fruit"], soilTypes: ["calcareous", "sandy"],
    languages: [{ slug: "en", proficiency: "native" }, { slug: "es", proficiency: "working" }],
    practices: ["compost_production", "compost_extracts"],
    bio: "Rachel consults for Central Coast vineyards and olive ranches on biological soil management under drought. Her long-running trial blocks in Paso Robles comparing compost extract programmes against conventional fertigation are among the most cited practical datasets in the network.",
  },
  {
    id: "p08", slug: "priya-sharma", displayName: "Priya Sharma",
    roles: ["lab_tech"], certifications: [{ program: "LT", year: 2023 }], certifiedSince: 2023,
    acceptingClients: true, servicesRemotely: true, travelRadiusKm: 200,
    city: "Pune", adminArea: "Maharashtra", countryCode: "IN", lat: 18.52, lng: 73.856,
    ecoregion: "Deccan thorn scrub forests", biome: TGR, realm: "Indomalayan",
    crops: ["cereals", "vegetables", "tropical_smallholder"], soilTypes: ["clay", "saline"],
    languages: [{ slug: "hi", proficiency: "native" }, { slug: "en", proficiency: "fluent" }],
    practices: ["microscopy", "compost_production"],
    bio: "Priya runs biological assessments for farmer producer organisations across Maharashtra, focusing on sodic soil recovery in irrigated cereal systems. She accepts shipped samples from across India and reports in Hindi and English.",
  },
  {
    id: "p09", slug: "tom-bakker", displayName: "Tom Bakker",
    roles: ["lab_tech"], certifications: [{ program: "LT", year: 2021 }], certifiedSince: 2021,
    acceptingClients: true, servicesRemotely: true, travelRadiusKm: 150,
    city: "Wageningen", adminArea: "Gelderland", countryCode: "NL", lat: 51.969, lng: 5.665,
    ecoregion: "Atlantic mixed forests", biome: TBF, realm: "Palearctic",
    crops: ["vegetables", "turf"], soilTypes: ["sandy", "peat"],
    languages: [{ slug: "de", proficiency: "working" }, { slug: "en", proficiency: "fluent" }],
    practices: ["microscopy", "compost_extracts"],
    bio: "Tom assesses soils for Dutch glasshouse growers and sports turf managers, and analyses shipped samples from across northwestern Europe. His background is in plant pathology, which shapes his focus on disease-suppressive biology.",
  },
  {
    id: "p10", slug: "lucia-moreno", displayName: "Lucía Moreno",
    roles: ["lab_tech"], certifications: [{ program: "LT", year: 2022 }], certifiedSince: 2022,
    acceptingClients: true, servicesRemotely: false, travelRadiusKm: 120,
    city: "Mendoza", adminArea: "Mendoza", countryCode: "AR", lat: -32.889, lng: -68.845,
    ecoregion: "Low Monte", biome: DXS, realm: "Neotropic",
    crops: ["vineyard", "orchard_fruit"], soilTypes: ["sandy", "saline"],
    languages: [{ slug: "es", proficiency: "native" }],
    practices: ["microscopy"],
    bio: "Lucía provides microscope assessments for Mendoza's irrigated vineyards, with particular experience in salinity-stressed blocks under flood irrigation. She works in Spanish and visits sites within the province.",
  },
  {
    id: "p11", slug: "david-crane", displayName: "David Crane",
    roles: ["consultant"], certifications: [{ program: "CC", year: 2016 }], certifiedSince: 2016,
    acceptingClients: false, servicesRemotely: true, travelRadiusKm: 800,
    city: "Fargo", adminArea: "North Dakota", countryCode: "US", lat: 46.877, lng: -96.789,
    ecoregion: "Northern tall grasslands", biome: TGS, realm: "Nearctic",
    crops: ["cereals", "pasture"], soilTypes: ["clay", "loam"],
    languages: [{ slug: "en", proficiency: "native" }],
    practices: ["transition_organic", "compost_production"],
    bio: "David advises broadacre grain and grazing operations across the northern plains on reducing synthetic inputs through biological management. Currently at capacity; he maintains a waiting list and takes on new remote clients each spring.",
  },
  {
    id: "p12", slug: "hana-yilmaz", displayName: "Hana Yılmaz",
    roles: ["lab_tech"], certifications: [{ program: "LT", year: 2023 }], certifiedSince: 2023,
    acceptingClients: true, servicesRemotely: true, travelRadiusKm: 80,
    city: "Antalya", adminArea: "Akdeniz", countryCode: "TR", lat: 36.897, lng: 30.713,
    ecoregion: "Southern Anatolian montane conifer and deciduous forests", biome: MED, realm: "Palearctic",
    crops: ["citrus", "vegetables"], soilTypes: ["calcareous", "clay"],
    languages: [{ slug: "tr", proficiency: "native" }, { slug: "de", proficiency: "fluent" }],
    practices: ["microscopy", "compost_extracts"],
    bio: "Hana serves Antalya's protected-cropping vegetable sector and coastal citrus groves with biological assessments and brewing protocols. She grew up in Germany and works comfortably with the region's German-speaking export operations.",
  },
  {
    id: "p13", slug: "marcus-hale", displayName: "Marcus Hale",
    roles: ["lab_tech"], certifications: [{ program: "LT", year: 2020 }], certifiedSince: 2020,
    acceptingClients: true, servicesRemotely: true, travelRadiusKm: 300,
    city: "Perth", adminArea: "Western Australia", countryCode: "AU", lat: -31.95, lng: 115.86,
    ecoregion: "Southwest Australia woodlands", biome: MED, realm: "Australasia",
    crops: ["cereals", "vineyard", "pasture"], soilTypes: ["sandy", "saline"],
    languages: [{ slug: "en", proficiency: "native" }],
    practices: ["microscopy", "compost_production"],
    bio: "Marcus works the Western Australian wheatbelt and Margaret River vineyards, assessing biology in some of the world's oldest and most weathered soils. He accepts shipped samples nationally and runs field days on non-wetting sands.",
  },
  {
    id: "p14", slug: "ingrid-olsen", displayName: "Ingrid Olsen",
    roles: ["lab_tech"], certifications: [{ program: "LT", year: 2021 }], certifiedSince: 2021,
    acceptingClients: false, servicesRemotely: true, travelRadiusKm: 200,
    city: "Trondheim", adminArea: "Trøndelag", countryCode: "NO", lat: 63.43, lng: 10.395,
    ecoregion: "Scandinavian and Russian taiga", biome: BOR, realm: "Palearctic",
    crops: ["vegetables", "pasture"], soilTypes: ["peat", "loam"],
    languages: [{ slug: "sv", proficiency: "fluent" }, { slug: "en", proficiency: "fluent" }],
    practices: ["microscopy"],
    bio: "Ingrid analyses soils for short-season vegetable growers and dairy pasture in central Norway. Currently on parental leave and not accepting new samples until next season.",
  },
  {
    id: "p15", slug: "carlos-mendez", displayName: "Carlos Méndez",
    roles: ["consultant"], certifications: [{ program: "CC", year: 2021 }], certifiedSince: 2021,
    acceptingClients: true, servicesRemotely: true, travelRadiusKm: 350,
    city: "Talca", adminArea: "Maule", countryCode: "CL", lat: -35.426, lng: -71.655,
    ecoregion: "Chilean Matorral", biome: MED, realm: "Neotropic",
    crops: ["vineyard", "orchard_fruit", "cereals"], soilTypes: ["clay", "volcanic"],
    languages: [{ slug: "es", proficiency: "native" }, { slug: "en", proficiency: "working" }],
    practices: ["compost_production", "transition_organic", "compost_extracts"],
    bio: "Carlos consults for wine and cherry producers through Chile's central valley, designing compost and extract programmes matched to volcanic-influenced soils. He advises remotely across the Spanish-speaking Americas.",
  },
  {
    id: "p16", slug: "amara-diallo", displayName: "Amara Diallo",
    roles: ["lab_tech"], certifications: [{ program: "LT", year: 2022 }], certifiedSince: 2022,
    acceptingClients: true, servicesRemotely: true, travelRadiusKm: 150,
    city: "Thiès", adminArea: "Thiès", countryCode: "SN", lat: 14.79, lng: -16.926,
    ecoregion: "West Sudanian savanna", biome: TGR, realm: "Afrotropic",
    crops: ["vegetables", "cereals", "tropical_smallholder"], soilTypes: ["sandy"],
    languages: [{ slug: "fr", proficiency: "native" }, { slug: "en", proficiency: "working" }],
    practices: ["microscopy", "compost_production"],
    bio: "Amara supports market-garden cooperatives in Senegal's Niayes zone with biological assessment and compost quality control, and consults remotely for francophone West Africa.",
  },
  {
    id: "p17", slug: "beth-oconnell", displayName: "Beth O'Connell",
    roles: ["lab_tech"], certifications: [{ program: "LT", year: 2019 }], certifiedSince: 2019,
    acceptingClients: true, servicesRemotely: false, travelRadiusKm: 250,
    city: "Cork", adminArea: "Munster", countryCode: "IE", lat: 51.898, lng: -8.475,
    ecoregion: "Celtic broadleaf forests", biome: TBF, realm: "Palearctic",
    crops: ["pasture", "vegetables"], soilTypes: ["loam", "peat"],
    languages: [{ slug: "en", proficiency: "native" }],
    practices: ["microscopy", "compost_extracts"],
    bio: "Beth works with Irish dairy and drystock farms assessing pasture soil biology under high rainfall. She visits farms across Munster and runs microscopy evenings with local discussion groups.",
  },
  {
    id: "p18", slug: "kenji-watanabe", displayName: "Kenji Watanabe",
    roles: ["consultant"], certifications: [{ program: "CC", year: 2022 }], certifiedSince: 2022,
    acceptingClients: true, servicesRemotely: true, travelRadiusKm: 200,
    city: "Nagano", adminArea: "Chūbu", countryCode: "JP", lat: 36.649, lng: 138.181,
    ecoregion: "Nihonkai montane deciduous forests", biome: TBF, realm: "Palearctic",
    crops: ["orchard_fruit", "vegetables", "cereals"], soilTypes: ["volcanic", "loam"],
    languages: [{ slug: "en", proficiency: "fluent" }],
    practices: ["compost_production", "transition_organic"],
    bio: "Kenji advises apple and highland vegetable growers in Nagano prefecture on biological management adapted to volcanic ash soils and heavy snow-load rotations. He consults remotely in English and Japanese.",
  },
  {
    id: "p19", slug: "gabriela-ortiz", displayName: "Gabriela Ortiz",
    roles: ["lab_tech"], certifications: [{ program: "LT", year: 2023 }], certifiedSince: 2023,
    acceptingClients: true, servicesRemotely: true, travelRadiusKm: 100,
    city: "Oaxaca", adminArea: "Oaxaca", countryCode: "MX", lat: 17.073, lng: -96.727,
    ecoregion: "Sierra Madre de Oaxaca pine-oak forests", biome: TMF, realm: "Neotropic",
    crops: ["tropical_smallholder", "coffee", "cereals"], soilTypes: ["clay", "volcanic"],
    languages: [{ slug: "es", proficiency: "native" }, { slug: "en", proficiency: "working" }],
    practices: ["microscopy", "compost_production"],
    bio: "Gabriela works with milpa smallholders and shade-coffee cooperatives in the Oaxacan highlands, pairing microscope assessment with compost programmes built on coffee pulp and local feedstocks.",
  },
  {
    id: "p20", slug: "stefan-brandt", displayName: "Stefan Brandt",
    roles: ["lab_tech"], certifications: [{ program: "LT", year: 2020 }], certifiedSince: 2020,
    acceptingClients: true, servicesRemotely: true, travelRadiusKm: 200,
    city: "Freiburg", adminArea: "Baden-Württemberg", countryCode: "DE", lat: 47.999, lng: 7.842,
    ecoregion: "Western European broadleaf forests", biome: TBF, realm: "Palearctic",
    crops: ["vineyard", "orchard_fruit", "vegetables"], soilTypes: ["loam", "calcareous"],
    languages: [{ slug: "de", proficiency: "native" }, { slug: "en", proficiency: "fluent" }, { slug: "fr", proficiency: "working" }],
    practices: ["microscopy", "compost_extracts"],
    bio: "Stefan assesses soils for Baden's steep-slope vineyards and Lake Constance orchards, and takes shipped samples from across the German-speaking countries.",
  },
  {
    id: "p21", slug: "nadia-haddad", displayName: "Nadia Haddad",
    roles: ["consultant", "lab_tech"], certifications: [{ program: "CC", year: 2023 }, { program: "LT", year: 2021 }], certifiedSince: 2021,
    acceptingClients: true, servicesRemotely: true, travelRadiusKm: 300,
    city: "Sousse", adminArea: "Sousse", countryCode: "TN", lat: 35.826, lng: 10.637,
    ecoregion: "Mediterranean dry woodlands and steppe", biome: MED, realm: "Palearctic",
    crops: ["olive", "cereals", "vegetables"], soilTypes: ["calcareous", "saline", "sandy"],
    languages: [{ slug: "fr", proficiency: "native" }, { slug: "en", proficiency: "working" }],
    practices: ["microscopy", "compost_production", "transition_organic"],
    bio: "Nadia combines lab assessment with field consulting for Tunisian olive estates and irrigated vegetable operations, with deep experience in saline irrigation water and gypsum-amended soils. She works across the Maghreb in French and Arabic.",
  },
  {
    id: "p22", slug: "will-thompson", displayName: "Will Thompson",
    roles: ["lab_tech"], certifications: [{ program: "LT", year: 2022 }], certifiedSince: 2022,
    acceptingClients: true, servicesRemotely: false, travelRadiusKm: 400,
    city: "Christchurch", adminArea: "Canterbury", countryCode: "NZ", lat: -43.532, lng: 172.636,
    ecoregion: "Canterbury-Otago tussock grasslands", biome: TGS, realm: "Australasia",
    crops: ["pasture", "cereals", "vineyard"], soilTypes: ["loam", "sandy"],
    languages: [{ slug: "en", proficiency: "native" }],
    practices: ["microscopy", "compost_production"],
    bio: "Will services Canterbury's mixed arable and dairy operations plus Waipara vineyards, driving the length of the South Island for sampling rounds each season.",
  },
];

// Service-shape and scale fields (personas: due-diligence buyers need scale
// worked and fee transparency; smallholders need to know who takes shipped
// samples). In production these are practitioner-confirmed fields; here they
// are merged onto the base demo records.
const EXTRAS: Record<
  string,
  { acceptsSamples: boolean; scaleBands: string[]; feeBand: "low" | "mid" | "high" }
> = {
  p01: { acceptsSamples: false, scaleBands: ["1_10", "10_100"], feeBand: "mid" },
  p02: { acceptsSamples: true, scaleBands: ["1_10", "10_100"], feeBand: "low" },
  p03: { acceptsSamples: false, scaleBands: ["10_100", "over_100"], feeBand: "high" },
  p04: { acceptsSamples: true, scaleBands: ["under_1", "1_10"], feeBand: "low" },
  p05: { acceptsSamples: false, scaleBands: ["under_1", "1_10"], feeBand: "low" },
  p06: { acceptsSamples: true, scaleBands: ["10_100", "over_100"], feeBand: "mid" },
  p07: { acceptsSamples: false, scaleBands: ["10_100", "over_100"], feeBand: "high" },
  p08: { acceptsSamples: true, scaleBands: ["under_1", "1_10"], feeBand: "low" },
  p09: { acceptsSamples: true, scaleBands: ["1_10", "10_100"], feeBand: "low" },
  p10: { acceptsSamples: false, scaleBands: ["1_10", "10_100"], feeBand: "low" },
  p11: { acceptsSamples: false, scaleBands: ["10_100", "over_100"], feeBand: "mid" },
  p12: { acceptsSamples: true, scaleBands: ["under_1", "1_10"], feeBand: "low" },
  p13: { acceptsSamples: true, scaleBands: ["10_100", "over_100"], feeBand: "low" },
  p14: { acceptsSamples: true, scaleBands: ["1_10"], feeBand: "low" },
  p15: { acceptsSamples: false, scaleBands: ["10_100", "over_100"], feeBand: "mid" },
  p16: { acceptsSamples: true, scaleBands: ["under_1", "1_10"], feeBand: "low" },
  p17: { acceptsSamples: false, scaleBands: ["10_100"], feeBand: "low" },
  p18: { acceptsSamples: false, scaleBands: ["1_10", "10_100"], feeBand: "mid" },
  p19: { acceptsSamples: true, scaleBands: ["under_1", "1_10"], feeBand: "low" },
  p20: { acceptsSamples: true, scaleBands: ["1_10", "10_100"], feeBand: "low" },
  p21: { acceptsSamples: true, scaleBands: ["10_100", "over_100"], feeBand: "mid" },
  p22: { acceptsSamples: false, scaleBands: ["10_100", "over_100"], feeBand: "low" },
};

// Self-maintained profile depth: how they work, what they offer, and selected
// past work. In production practitioners write and update these themselves
// through the magic-link dashboard; the completeness meter tracks them.
type Detail = {
  yearsExperience: number;
  approach: string;
  services: { name: string; description: string }[];
  caseStudies?: { title: string; summary: string }[];
};

const DETAILS: Record<string, Detail> = {
  p01: {
    yearsExperience: 9,
    approach:
      "I start every engagement in the field, not the lab: a walk of the worst and best blocks together, then a biological assessment to confirm what we saw. Plans are built around what your farm can produce on-site - compost feedstocks you already have, water you already store. I visit quarterly in season and stay reachable by phone between visits.",
    services: [
      { name: "Initial farm assessment", description: "Field walk, sampling, microscope assessment, and a written baseline report with priorities." },
      { name: "Biological management programme", description: "A season-long plan: compost production, extract applications, and grazing or cover decisions, with quarterly reviews." },
      { name: "On-farm compost setup", description: "Design and staff training for a thermal compost operation using your own feedstocks." },
    ],
    caseStudies: [
      { title: "Dry-farmed olive recovery, Écija (120 ha)", summary: "Three seasons from compacted, bare inter-rows to living cover and measurable fungal recovery; irrigation demand down by roughly a fifth." },
      { title: "Old-vine garnacha transition, Sierra Norte", summary: "Fungicide passes halved over two seasons following extract programme; certified organic in year three." },
    ],
  },
  p02: {
    yearsExperience: 12,
    approach:
      "Most of my clients are smallholders, so everything I recommend has to work without new machinery. I assess first, explain what the microscope shows in plain Turkish, and then we agree one or two changes per season - never a full-farm overhaul at once.",
    services: [
      { name: "Soil biology assessment", description: "Shipped or dropped-off samples, full soil food web count, plain-language report in Turkish or English." },
      { name: "Vineyard & olive advisory", description: "Season plans for Aegean vineyards and olive groves, on-site within 250 km." },
      { name: "Compost tea & extract coaching", description: "Brewing setup, recipe, and application timing for your specific crop and equipment." },
    ],
    caseStudies: [
      { title: "Cooperative vineyard programme, Manisa", summary: "Fourteen member vineyards on a shared assessment and extract calendar; input costs down for eleven of fourteen in year one." },
    ],
  },
  p03: {
    yearsExperience: 15,
    approach:
      "I take on a small number of estates and stay with them for years. My work is programme-level: assessment, compost, extracts, and the vineyard team trained to run all of it without me. I do not do one-off visits.",
    services: [
      { name: "Estate transition programme", description: "Multi-year biological transition for wine estates, from baseline to certified organic." },
      { name: "Team training", description: "Your vineyard crew learns sampling, brewing, and application until the programme is self-sufficient." },
    ],
  },
  p04: {
    yearsExperience: 4,
    approach:
      "I keep it simple: you ship me a sample following my protocol, and within two weeks you get a report you can actually read - what is alive in your soil, what is missing for your crop, and the three most useful things to change. Video call included with every report.",
    services: [
      { name: "Full soil food web assessment", description: "Bacteria, fungi, protozoa, and nematodes counted and interpreted for your crop; written report plus a call." },
      { name: "Compost & extract quality check", description: "Is your compost biologically alive before you spread it? Sample it and find out." },
      { name: "Seasonal monitoring", description: "Three assessments across a season to see whether your management is moving the biology." },
    ],
    caseStudies: [
      { title: "Market garden re-assessment series, Bohuslän", summary: "Six gardens sampled spring and autumn for two years; the dataset now guides the region's growers' association compost buying." },
    ],
  },
  p05: {
    yearsExperience: 11,
    approach:
      "I train teams, not just farmers - village compost groups, cooperative staff, extension workers. The goal is always that the knowledge stays when I leave. Remote advisory works well here: photos, WhatsApp, and a disciplined sampling calendar.",
    services: [
      { name: "Cooperative compost programmes", description: "Design, training, and quality control for group-scale thermal compost using local feedstocks." },
      { name: "Remote smallholder advisory", description: "Structured remote support for farms and co-ops across East Africa." },
      { name: "Trainer training", description: "Multi-week curriculum for extension staff and lead farmers." },
    ],
    caseStudies: [
      { title: "Coffee cooperative network, Kirinyaga", summary: "Village compost teams now serve over 800 member farms; cherry rejection rates fell two seasons running." },
    ],
  },
  p06: {
    yearsExperience: 8,
    approach:
      "Half my week is microscope work, half is field consulting, and each half makes the other sharper. For transitions away from fumigation I insist on a baseline assessment first - you cannot manage what you have not measured.",
    services: [
      { name: "Lab assessment (shipped samples)", description: "Full biological workup with Portuguese or Spanish reporting, two-week turnaround." },
      { name: "Transition consulting", description: "Fumigation-to-biology programmes for coffee and citrus operations." },
      { name: "Extract programme design", description: "Brewing infrastructure, recipes, and application calendars sized to your operation." },
    ],
    caseStudies: [
      { title: "Citrus replant without fumigation, São Paulo state", summary: "A 300 ha replant established on compost and extracts instead of pre-plant fumigation; tree establishment matched the fumigated control block." },
    ],
  },
  p07: {
    yearsExperience: 14,
    approach:
      "Everything I recommend has been through my own trial blocks first. Central Coast growers get enough sales pitches; what I offer is data from soils like theirs, and a programme I have already watched work under drought.",
    services: [
      { name: "Vineyard & orchard consulting", description: "Biological programmes for wine grapes, olives, and stone fruit under water constraint." },
      { name: "Trial block design", description: "Set up a properly controlled comparison on your own ranch before committing acreage." },
    ],
    caseStudies: [
      { title: "Compost extract vs fertigation trial, Paso Robles", summary: "Five-season side-by-side on cabernet blocks: comparable yield, better infiltration, and lower input spend on the biological block." },
    ],
  },
  p08: {
    yearsExperience: 5,
    approach:
      "I work through farmer producer organisations because that is how change scales here. Reports go out in Hindi and English, and I run a monthly call with each FPO's lead growers to walk through what the numbers mean.",
    services: [
      { name: "FPO assessment programmes", description: "Batched sample analysis for producer organisations, with group reporting." },
      { name: "Sodic soil recovery plans", description: "Biology-led remediation calendars for salt-affected irrigated land." },
    ],
  },
  p09: {
    yearsExperience: 7,
    approach:
      "My plant-pathology background means I read your soil with disease in mind: which suppressive organisms are present, which are missing, and how to shift the balance before the next outbreak rather than after it.",
    services: [
      { name: "Disease-focused soil assessment", description: "Biological workup with specific attention to suppressive capacity for your pathogen pressure." },
      { name: "Glasshouse substrate analysis", description: "Assessment for protected cropping media and recirculating systems." },
      { name: "Turf biology programmes", description: "Assessment and amendment plans for sports surfaces." },
    ],
    caseStudies: [
      { title: "Pythium suppression in glasshouse lettuce", summary: "Substrate biology rebuilt over four cycles; grower discontinued two of three routine drenches." },
    ],
  },
  p10: {
    yearsExperience: 6,
    approach:
      "I visit every site I report on - salinity problems in Mendoza are as much about water handling as biology, and you only see that standing in the row. Reports are in Spanish, and I stay available for questions after delivery.",
    services: [
      { name: "On-site assessment", description: "Sampling visit plus microscope workup for irrigated vineyards and orchards." },
      { name: "Salinity-stress monitoring", description: "Season-series assessments for blocks under saline irrigation." },
    ],
  },
  p11: {
    yearsExperience: 16,
    approach:
      "Broadacre transition is a multi-year project and I plan it that way: reduce synthetic nitrogen stepwise, build biology ahead of each reduction, and keep yield risk explicitly managed. Spring intake only; waiting list otherwise.",
    services: [
      { name: "Broadacre transition programmes", description: "Multi-year input-reduction plans for grain and grazing operations." },
      { name: "Remote agronomy support", description: "Scheduled calls and imagery review through the season." },
    ],
  },
  p12: {
    yearsExperience: 4,
    approach:
      "Protected cropping moves fast, so I do too: courier your sample and you have results inside a week. I report in Turkish or German and always include the one change I would make first.",
    services: [
      { name: "Fast-turnaround assessment", description: "One-week reporting for greenhouse vegetable and citrus samples." },
      { name: "Brewing setup for glasshouses", description: "Compact extract systems sized for protected-cropping blocks." },
    ],
  },
  p13: {
    yearsExperience: 10,
    approach:
      "Wheatbelt soils are old, weathered, and unforgiving, and most advice written for other continents fails here. Everything I recommend is adapted to non-wetting sands and low organic matter starting points - and I say plainly when biology alone will not fix something.",
    services: [
      { name: "Broadacre soil assessment", description: "Shipped samples from anywhere in Australia, with regionally calibrated interpretation." },
      { name: "Field day programmes", description: "On-farm demonstration days for grower groups across the wheatbelt." },
    ],
  },
  p14: {
    yearsExperience: 6,
    approach:
      "Short-season growing leaves no room for slow feedback, so my clients sample on a fixed calendar and get results before each decision window. Currently on leave; back next season.",
    services: [
      { name: "Season-calendar assessment", description: "Fixed sampling dates matched to your planting and harvest windows." },
    ],
  },
  p15: {
    yearsExperience: 9,
    approach:
      "I design programmes the farm team can run without me by year two - compost, extracts, monitoring, all documented in Spanish. My remote clients across Latin America get the same structure with local execution.",
    services: [
      { name: "Fruit & vine programmes", description: "Full biological programmes for cherries, wine grapes, and rotations in the central valley." },
      { name: "Remote programme direction", description: "Structured remote advisory with your local agronomist executing." },
      { name: "Compost operation design", description: "Site layout, feedstock sourcing, and staff training." },
    ],
    caseStudies: [
      { title: "Cherry orchard establishment, Maule (85 ha)", summary: "New planting established on biological programme from day one; no soil fumigation used and first-harvest quality met export grade." },
    ],
  },
  p16: {
    yearsExperience: 5,
    approach:
      "I work alongside the cooperative's own agents so that assessment and compost quality control become their capacity, not my service. Reporting in French, training materials in French and Wolof.",
    services: [
      { name: "Cooperative assessment service", description: "Batched analysis for market-garden cooperatives in the Niayes." },
      { name: "Compost quality control", description: "Standing QC on cooperative compost production, with corrective guidance." },
    ],
  },
  p17: {
    yearsExperience: 8,
    approach:
      "High-rainfall pasture biology is its own discipline: drainage, treading damage, and biology interact, and I assess all three together on every farm visit. I run evening microscope sessions so farmers can see their own soil life.",
    services: [
      { name: "Pasture soil assessment", description: "On-farm sampling and assessment for dairy and drystock across Munster." },
      { name: "Discussion-group sessions", description: "Microscope evenings and results walkthroughs for farmer groups." },
    ],
  },
  p18: {
    yearsExperience: 7,
    approach:
      "Volcanic ash soils and heavy snow shape everything here. I plan around the short season: biology built in autumn, protected over winter, working by bud-break. I consult remotely in English and Japanese.",
    services: [
      { name: "Orchard biological programmes", description: "Season plans for apples and highland vegetables on andisols." },
      { name: "Remote advisory", description: "Video consulting with structured photo and sample protocols." },
    ],
  },
  p19: {
    yearsExperience: 4,
    approach:
      "Coffee pulp is the most under-used resource in these mountains, and most of my work starts there: turning a waste problem into the compost that rebuilds the parcela. I report in Spanish and travel by arrangement within the region.",
    services: [
      { name: "Smallholder assessment", description: "Shipped or collected samples for milpa and coffee parcels, reported in Spanish." },
      { name: "Pulp compost programmes", description: "Cooperative-scale composting built on coffee processing residues." },
    ],
  },
  p20: {
    yearsExperience: 9,
    approach:
      "Steep-slope viticulture punishes soil mistakes, so I sample by block position - top, mid, base - not by field average. German-speaking clients across DACH ship samples; Baden clients get site visits.",
    services: [
      { name: "Block-resolved vineyard assessment", description: "Position-stratified sampling that shows where erosion is eating your biology." },
      { name: "Orchard & vegetable assessment", description: "Shipped-sample analysis with German or English reporting." },
    ],
  },
  p21: {
    yearsExperience: 10,
    approach:
      "Saline water and calcareous soils define the Maghreb's constraints, and my programmes accept them rather than fight them: salt-tolerant biology first, gypsum where it earns its cost, and honest numbers about what irrigation water quality makes possible.",
    services: [
      { name: "Assessment with salinity workup", description: "Biological assessment paired with irrigation-water context, reported in French or Arabic." },
      { name: "Olive estate programmes", description: "Multi-year biological management for olive operations." },
      { name: "Remote Maghreb advisory", description: "Structured remote consulting across Tunisia, Algeria, and Morocco." },
    ],
  },
  p22: {
    yearsExperience: 6,
    approach:
      "I drive the island every season, so my clients get their sampling done on a schedule rather than when someone remembers. Mixed arable, dairy, and vineyard clients each get interpretation against their own system, not a generic template.",
    services: [
      { name: "Seasonal sampling rounds", description: "Scheduled on-farm sampling and assessment across Canterbury and North Otago." },
      { name: "System-specific reporting", description: "Interpretation calibrated to arable, dairy pasture, or vineyard management." },
    ],
  },
};

const DEFAULT_DETAIL: Detail = {
  yearsExperience: 5,
  approach: "",
  services: [],
};

export const PRACTITIONERS: Practitioner[] = BASE.map((p) => ({
  ...p,
  ...(EXTRAS[p.id] ?? { acceptsSamples: false, scaleBands: [], feeBand: "mid" as const }),
  ...(DETAILS[p.id] ?? DEFAULT_DETAIL),
}));

// Certification verification target. The demo links to the certifying body's
// public listing; production would link a per-certificate verification page.
export const VERIFY_URL = "https://soilfoodweb.com/certified-listing-directory/";

export function bySlug(slug: string): Practitioner | undefined {
  return PRACTITIONERS.find((p) => p.slug === slug);
}
