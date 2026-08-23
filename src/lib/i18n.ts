// Scoped UI localization for the grower-facing flow (intake + contact + nav).
// Vocabulary slugs and biome values never change; only labels translate -
// the same interlingua principle as the data model. Production extends this
// to every locale in vocabulary_term_i18n; the demo ships en + es.

export type Locale = "en" | "es";

type Dict = Record<string, string>;

export const STRINGS: Record<Locale, Dict> = {
  en: {
    nav_browse: "Browse practitioners",
    nav_match: "Get matched",
    nav_info: "More information",
    intake_h1: "Describe your situation",
    intake_sub:
      "Seven quick questions. We'll suggest three practitioners and explain why each one fits.",
    q_biome: "Which best describes your region?",
    q_biome_hint:
      "We match on ecological similarity, not distance - a grower in Andalusia and one in coastal California share more than either shares with a neighbour two climate zones away.",
    q_biome_map: "Don't know? Find your ecoregion on a map",
    q_land: "How much land are you working?",
    land_under_1: "Under 1 hectare",
    land_1_10: "1-10 hectares",
    land_10_100: "10-100 hectares",
    land_over_100: "Over 100 hectares",
    q_crop: "What's your primary crop or system?",
    crop_other: "Other - type your own",
    other_label: "Describe your crop or system",
    other_placeholder: "e.g. hazelnuts, hops, viñedo…",
    other_hint: "Any language works - we match it against our crop vocabulary where we can.",
    continue: "Continue",
    q_problem: "What's the main problem you're trying to solve?",
    prob_fertility: "Fertility / declining yields",
    prob_disease: "Disease or pest pressure",
    prob_compaction: "Compaction / poor water infiltration",
    prob_transition: "Transitioning to organic / regenerative",
    prob_other: "Something else",
    q_mode: "On-site visits, or remote?",
    mode_onsite: "I want someone who can visit",
    mode_remote: "Remote is fine",
    mode_either: "Either works",
    q_lang: "Which language do you prefer to work in?",
    q_timeline: "When do you want to start?",
    time_now: "As soon as possible",
    time_season: "Before next season",
    time_exploring: "Just exploring for now",
    back: "← Back",
    results_some: "Your closest matches",
    results_none: "No close matches",
    results_none_body:
      "Nobody in the network fits those answers closely. Try browsing remote-capable practitioners - many advise growers far outside their own region.",
    results_browse_remote: "browsing remote-capable practitioners",
    matched_because: "Matched because they",
    view_profile: "View profile & contact",
    start_over: "Start over",
    picker_hint:
      "Click your location on the map - we'll look up your ecoregion in the RESOLVE 2017 dataset (846 ecoregions worldwide).",
    picker_loading: "Looking up your ecoregion…",
    picker_failed:
      "Couldn't resolve an ecoregion there (open water, or the service is unreachable). Try clicking on land, or pick a region from the list above.",
    picker_use: "Use this region",
    contact_note:
      "Messages are relayed directly to the practitioner. Their contact details are never published.",
    contact_lang_note: "Write in any language you share with the practitioner - they reply to your email address directly.",
    contact_name: "Your name",
    contact_email: "Your email",
    contact_msg: "Describe your land, your crop, and what you're seeing…",
    contact_send: "Send enquiry",
    contact_sending: "Sending…",
    contact_sent:
      "Your message has been relayed. The practitioner will reply to the email address you provided.",
    contact_error: "Something went wrong - please try again.",
  },
  es: {
    nav_browse: "Ver profesionales",
    nav_match: "Buscar mi match",
    nav_info: "Más información",
    intake_h1: "Describe tu situación",
    intake_sub:
      "Siete preguntas rápidas. Te sugerimos tres profesionales y explicamos por qué encaja cada uno.",
    q_biome: "¿Qué describe mejor tu región?",
    q_biome_hint:
      "Emparejamos por similitud ecológica, no por distancia: un agricultor de Andalucía y uno de la costa de California comparten más que cualquiera de ellos con un vecino a dos zonas climáticas.",
    q_biome_map: "¿No lo sabes? Encuentra tu ecorregión en un mapa",
    q_land: "¿Cuánta tierra trabajas?",
    land_under_1: "Menos de 1 hectárea",
    land_1_10: "1-10 hectáreas",
    land_10_100: "10-100 hectáreas",
    land_over_100: "Más de 100 hectáreas",
    q_crop: "¿Cuál es tu cultivo o sistema principal?",
    crop_other: "Otro - escríbelo tú",
    other_label: "Describe tu cultivo o sistema",
    other_placeholder: "p. ej. avellanas, lúpulo, vineyard…",
    other_hint: "Vale cualquier idioma: lo comparamos con nuestro vocabulario de cultivos.",
    continue: "Continuar",
    q_problem: "¿Cuál es el problema principal que quieres resolver?",
    prob_fertility: "Fertilidad / rendimientos en descenso",
    prob_disease: "Presión de enfermedades o plagas",
    prob_compaction: "Compactación / mala infiltración de agua",
    prob_transition: "Transición a ecológico / regenerativo",
    prob_other: "Otra cosa",
    q_mode: "¿Visitas en finca o a distancia?",
    mode_onsite: "Quiero alguien que pueda visitarme",
    mode_remote: "A distancia está bien",
    mode_either: "Cualquiera de las dos",
    q_lang: "¿En qué idioma prefieres trabajar?",
    q_timeline: "¿Cuándo quieres empezar?",
    time_now: "Lo antes posible",
    time_season: "Antes de la próxima temporada",
    time_exploring: "Solo estoy explorando",
    back: "← Atrás",
    results_some: "Tus mejores coincidencias",
    results_none: "Sin coincidencias cercanas",
    results_none_body:
      "Nadie en la red encaja bien con esas respuestas. Prueba a ver profesionales que trabajan a distancia: muchos asesoran a agricultores lejos de su propia región.",
    results_browse_remote: "ver profesionales que trabajan a distancia",
    matched_because: "Seleccionado porque",
    view_profile: "Ver perfil y contactar",
    start_over: "Empezar de nuevo",
    picker_hint:
      "Haz clic en tu ubicación en el mapa: buscamos tu ecorregión en el conjunto de datos RESOLVE 2017 (846 ecorregiones en el mundo).",
    picker_loading: "Buscando tu ecorregión…",
    picker_failed:
      "No se pudo resolver una ecorregión ahí (mar abierto, o el servicio no responde). Prueba a hacer clic en tierra, o elige una región de la lista.",
    picker_use: "Usar esta región",
    contact_note:
      "Los mensajes se envían directamente al profesional. Sus datos de contacto nunca se publican.",
    contact_lang_note:
      "Escribe en cualquier idioma que compartas con el profesional: responderá directamente a tu correo.",
    contact_name: "Tu nombre",
    contact_email: "Tu correo electrónico",
    contact_msg: "Describe tu tierra, tu cultivo y lo que estás viendo…",
    contact_send: "Enviar consulta",
    contact_sending: "Enviando…",
    contact_sent:
      "Tu mensaje ha sido enviado. El profesional responderá al correo que has indicado.",
    contact_error: "Algo ha fallado - inténtalo de nuevo.",
  },
};

// Spanish labels for vocabulary terms surfaced in the intake. Slugs are the
// stable interlingua; these are display labels only.
export const TERM_ES: Record<string, string> = {
  vineyard: "Viñedo / uva de vino",
  olive: "Olivar",
  orchard_fruit: "Frutales",
  citrus: "Cítricos",
  coffee: "Café",
  vegetables: "Hortalizas / huerta",
  cereals: "Cereales / granos",
  pasture: "Pastizal / pradera",
  turf: "Césped / paisajismo",
  forestry: "Silvicultura / agroforestería",
  tropical_smallholder: "Sistemas tropicales de pequeña escala",
  en: "Inglés",
  es: "Español",
  pt: "Portugués",
  tr: "Turco",
  sv: "Sueco",
  fr: "Francés",
  de: "Alemán",
  hi: "Hindi",
};

export const BIOME_ES: Record<string, string> = {
  "Mediterranean Forests, Woodlands & Scrub": "Bosques y matorrales mediterráneos",
  "Temperate Broadleaf & Mixed Forests": "Bosques templados caducifolios y mixtos",
  "Temperate Grasslands, Savannas & Shrublands": "Praderas y sabanas templadas",
  "Tropical & Subtropical Moist Broadleaf Forests":
    "Bosques húmedos tropicales y subtropicales",
  "Tropical & Subtropical Grasslands, Savannas & Shrublands":
    "Praderas y sabanas tropicales y subtropicales",
  "Deserts & Xeric Shrublands": "Desiertos y matorrales xéricos",
  "Boreal Forests/Taiga": "Bosques boreales / taiga",
  "Montane Grasslands & Shrublands": "Praderas y matorrales de montaña",
};
