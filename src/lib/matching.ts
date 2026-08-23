import type { Practitioner } from "./types";
import { PRACTITIONERS } from "./data";
import { expandDown, label } from "./vocab";

// Guided intake matching (PRD §6.5): score practitioners against the grower's
// answers and return three, each with a plain-language explanation. The
// explanation matters more than the ranking. Weights follow §5.3.

export interface IntakeAnswers {
  biome: string; // proxy for location in the demo; production geocodes + resolves ecoregion
  landSize: string;
  crop: string;
  problem: string;
  mode: "onsite" | "remote" | "either";
  language: string;
  timeline: string;
}

export interface Match {
  practitioner: Practitioner;
  score: number;
  explanation: string[];
  viaRemote: boolean;
}

const PROBLEM_PRACTICES: Record<string, string[]> = {
  fertility: ["compost_production", "compost_extracts"],
  disease: ["microscopy", "compost_extracts"],
  compaction: ["compost_production", "transition_organic"],
  transition: ["transition_organic"],
  other: [],
};

export function matchPractitioners(a: IntakeAnswers): Match[] {
  const cropSet = new Set(expandDown(a.crop));

  const scored = PRACTITIONERS.map((p) => {
    let score = 0;
    const explanation: string[] = [];
    let viaRemote = false;

    const sameBiome = p.biome === a.biome;
    if (sameBiome) {
      score += 0.3;
      explanation.push(
        `works in your biome (${p.biome}), so the soil biology challenges will be familiar`
      );
    } else if (p.servicesRemotely) {
      viaRemote = true;
    }

    const cropOverlap = p.crops.filter((c) => cropSet.has(c));
    if (cropOverlap.length > 0) {
      score += 0.25;
      explanation.push(
        `has direct experience with ${cropOverlap.map(label).join(", ").toLowerCase()}`
      );
    }

    const lang = p.languages.find((l) => l.slug === a.language);
    if (lang) {
      const w = lang.proficiency === "native" ? 1 : lang.proficiency === "fluent" ? 0.85 : 0.6;
      score += 0.2 * w;
      explanation.push(
        `speaks ${label(lang.slug)} (${lang.proficiency}) - a technical soil conversation needs more than small talk`
      );
    }

    if (p.acceptingClients) {
      score += 0.15;
      explanation.push("is currently accepting new clients");
    }

    if (a.mode === "remote" && p.servicesRemotely) {
      score += 0.1;
      explanation.push(
        p.acceptsSamples
          ? "offers fully remote consultations and accepts shipped soil samples"
          : "offers fully remote consultations"
      );
    } else if (a.mode === "onsite" && !p.servicesRemotely && !sameBiome) {
      score -= 0.2; // wants on-site, practitioner neither nearby-ish nor remote
    } else if (p.servicesRemotely) {
      score += 0.1;
    }

    const wanted = PROBLEM_PRACTICES[a.problem] ?? [];
    const practiceHit = p.practices.filter((pr) => wanted.includes(pr));
    if (practiceHit.length > 0) {
      score += 0.1;
      explanation.push(
        `their practice focus (${practiceHit.map(label).join(", ").toLowerCase()}) fits your stated problem`
      );
    }

    // Scale familiarity: a 900 ha citrus operation and a 1 ha market garden
    // are different jobs even on the same crop.
    if (p.scaleBands.includes(a.landSize)) {
      score += 0.05;
      explanation.push("has worked operations at your scale");
    }

    // Lab-techs are the cheaper entry point; nudge them up for assessment-type
    // problems so growers see the accessible option first.
    if (a.problem === "disease" && p.roles.includes("lab_tech")) {
      score += 0.05;
      explanation.push(
        "as a lab-tech, offers a soil assessment at lower cost than a full advisory engagement"
      );
    }

    if (viaRemote && explanation.length > 0) {
      explanation.push("outside your region, but available remotely");
    }

    return { practitioner: p, score, explanation, viaRemote };
  });

  return scored
    .filter((m) => m.score > 0.15 && m.explanation.length > 0)
    .sort((x, y) => y.score - x.score)
    .slice(0, 3);
}
