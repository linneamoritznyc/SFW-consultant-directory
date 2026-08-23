"use client";

import Link from "next/link";
import { useState } from "react";
import { matchPractitioners, type IntakeAnswers, type Match } from "@/lib/matching";
import { termsFor, BIOMES } from "@/lib/vocab";
import RoleBadge from "./RoleBadge";

// Guided intake (PRD §6.5): one question per screen, progress indicator,
// back navigation that never loses answers. Output: three ranked matches with
// plain-language explanations.

interface Question {
  key: keyof IntakeAnswers;
  title: string;
  hint?: string;
  options: { value: string; label: string }[];
}

const QUESTIONS: Question[] = [
  {
    key: "biome",
    title: "Which best describes your region?",
    hint: "We match on ecological similarity, not distance - a grower in Andalusia and one in coastal California share more than either shares with a neighbour two climate zones away.",
    options: BIOMES.map((b) => ({ value: b, label: b })),
  },
  {
    key: "landSize",
    title: "How much land are you working?",
    options: [
      { value: "under_1", label: "Under 1 hectare" },
      { value: "1_10", label: "1–10 hectares" },
      { value: "10_100", label: "10–100 hectares" },
      { value: "over_100", label: "Over 100 hectares" },
    ],
  },
  {
    key: "crop",
    title: "What's your primary crop or system?",
    options: termsFor("crop")
      .filter((t) => !["perennial_fruit", "vine_fruit", "annual_row"].includes(t.slug))
      .map((t) => ({ value: t.slug, label: t.label })),
  },
  {
    key: "problem",
    title: "What's the main problem you're trying to solve?",
    options: [
      { value: "fertility", label: "Fertility / declining yields" },
      { value: "disease", label: "Disease or pest pressure" },
      { value: "compaction", label: "Compaction / poor water infiltration" },
      { value: "transition", label: "Transitioning to organic / regenerative" },
      { value: "other", label: "Something else" },
    ],
  },
  {
    key: "mode",
    title: "On-site visits, or remote?",
    options: [
      { value: "onsite", label: "I want someone who can visit" },
      { value: "remote", label: "Remote is fine" },
      { value: "either", label: "Either works" },
    ],
  },
  {
    key: "language",
    title: "Which language do you prefer to work in?",
    options: termsFor("language").map((t) => ({ value: t.slug, label: t.label })),
  },
  {
    key: "timeline",
    title: "When do you want to start?",
    options: [
      { value: "now", label: "As soon as possible" },
      { value: "season", label: "Before next season" },
      { value: "exploring", label: "Just exploring for now" },
    ],
  },
];

export default function IntakeForm() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<IntakeAnswers>>({});
  const [matches, setMatches] = useState<Match[] | null>(null);

  if (matches) {
    return <Results matches={matches} onRestart={() => { setMatches(null); setStep(0); setAnswers({}); }} />;
  }

  const q = QUESTIONS[step];
  const selected = answers[q.key];

  const advance = (value: string) => {
    const next = { ...answers, [q.key]: value };
    setAnswers(next);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setMatches(matchPractitioners(next as IntakeAnswers));
    }
  };

  return (
    <div className="mt-6">
      {/* Progress */}
      <div className="mb-6 flex items-center gap-1">
        {QUESTIONS.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${
              i < step ? "bg-leaf-600" : i === step ? "bg-leaf-300" : "bg-soil-200"
            }`}
          />
        ))}
        <span className="ml-2 text-xs tabular-nums text-soil-500">
          {step + 1}/{QUESTIONS.length}
        </span>
      </div>

      <h2 className="text-lg font-semibold text-soil-900">{q.title}</h2>
      {q.hint && <p className="mt-1 text-xs text-soil-500">{q.hint}</p>}

      <div className="mt-4 space-y-2">
        {q.options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => advance(opt.value)}
            className={`block w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
              selected === opt.value
                ? "border-leaf-600 bg-leaf-50 text-leaf-900"
                : "border-soil-200 bg-white text-soil-800 hover:border-leaf-400 hover:bg-leaf-50"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {step > 0 && (
        <button
          onClick={() => setStep(step - 1)}
          className="mt-4 text-sm text-soil-600 hover:text-soil-900 hover:underline"
        >
          ← Back
        </button>
      )}
    </div>
  );
}

function Results({ matches, onRestart }: { matches: Match[]; onRestart: () => void }) {
  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold text-soil-900">
        {matches.length > 0
          ? `Your ${matches.length} closest match${matches.length === 1 ? "" : "es"}`
          : "No close matches"}
      </h2>
      {matches.length === 0 && (
        <p className="mt-2 text-sm text-soil-600">
          Nobody in the network fits those answers closely. Try{" "}
          <Link href="/directory?remote=true" className="text-leaf-700 hover:underline">
            browsing remote-capable practitioners
          </Link>{" "}
          - many advise growers far outside their own region.
        </p>
      )}
      <div className="mt-4 space-y-4">
        {matches.map((m, i) => (
          <div key={m.practitioner.id} className="rounded-xl border border-soil-200 bg-white p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-xs font-semibold text-soil-400">#{i + 1}</span>
                <Link
                  href={`/practitioners/${m.practitioner.slug}`}
                  className="block font-semibold text-soil-900 hover:text-leaf-700 hover:underline"
                >
                  {m.practitioner.displayName}
                </Link>
                <p className="text-xs text-soil-500">
                  {m.practitioner.city}, {m.practitioner.countryCode}
                </p>
              </div>
              <div className="flex gap-1">
                {m.practitioner.roles.map((r) => (
                  <RoleBadge key={r} role={r} />
                ))}
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-soil-700">
              <strong className="text-soil-900">Matched because they</strong>{" "}
              {m.explanation.join("; ")}.
            </p>
            <Link
              href={`/practitioners/${m.practitioner.slug}`}
              className="mt-3 inline-block rounded-lg bg-leaf-600 px-4 py-2 text-sm font-medium text-white hover:bg-leaf-700"
            >
              View profile & contact
            </Link>
          </div>
        ))}
      </div>
      <button
        onClick={onRestart}
        className="mt-6 text-sm text-soil-600 hover:text-soil-900 hover:underline"
      >
        Start over
      </button>
    </div>
  );
}
