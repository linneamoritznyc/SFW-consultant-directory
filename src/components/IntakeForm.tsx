"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { matchPractitioners, type IntakeAnswers, type Match } from "@/lib/matching";
import { termsFor, synonymHits, BIOMES } from "@/lib/vocab";
import { useLocale } from "./LocaleProvider";
import RoleBadge from "./RoleBadge";

const EcoregionPicker = dynamic(() => import("./EcoregionPicker"), {
  ssr: false,
  loading: () => (
    <div className="mt-4 flex h-[340px] items-center justify-center rounded-xl border border-soil-200 bg-soil-100 text-sm text-soil-500">
      …
    </div>
  ),
});

// Guided intake (PRD §6.5): one question per screen, progress indicator,
// back navigation that never loses answers. Output: three ranked matches with
// plain-language explanations. UI strings localize via LocaleProvider;
// vocabulary slugs and biome values stay stable underneath.

// Sentinel option values that open an inline widget instead of advancing.
const PICK_ON_MAP = "__map__";
const OTHER_FREE_TEXT = "__other__";

interface Question {
  key: keyof IntakeAnswers;
  title: string;
  hint?: string;
  options: { value: string; label: string }[];
}

export default function IntakeForm() {
  const { t, termLabel, biomeLabel } = useLocale();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<IntakeAnswers>>({});
  const [matches, setMatches] = useState<Match[] | null>(null);
  // Which sentinel widget (map picker / free-text) is open, if any.
  const [widget, setWidget] = useState<string | null>(null);
  const [otherText, setOtherText] = useState("");

  const QUESTIONS: Question[] = [
    {
      key: "biome",
      title: t("q_biome"),
      hint: t("q_biome_hint"),
      options: [
        ...BIOMES.map((b) => ({ value: b, label: biomeLabel(b) })),
        { value: PICK_ON_MAP, label: t("q_biome_map") },
      ],
    },
    {
      key: "landSize",
      title: t("q_land"),
      options: [
        { value: "under_1", label: t("land_under_1") },
        { value: "1_10", label: t("land_1_10") },
        { value: "10_100", label: t("land_10_100") },
        { value: "over_100", label: t("land_over_100") },
      ],
    },
    {
      key: "crop",
      title: t("q_crop"),
      options: [
        ...termsFor("crop")
          .filter((tm) => !["perennial_fruit", "vine_fruit", "annual_row"].includes(tm.slug))
          .map((tm) => ({ value: tm.slug, label: termLabel(tm.slug) })),
        { value: OTHER_FREE_TEXT, label: t("crop_other") },
      ],
    },
    {
      key: "problem",
      title: t("q_problem"),
      options: [
        { value: "fertility", label: t("prob_fertility") },
        { value: "disease", label: t("prob_disease") },
        { value: "compaction", label: t("prob_compaction") },
        { value: "transition", label: t("prob_transition") },
        { value: "other", label: t("prob_other") },
      ],
    },
    {
      key: "mode",
      title: t("q_mode"),
      options: [
        { value: "onsite", label: t("mode_onsite") },
        { value: "remote", label: t("mode_remote") },
        { value: "either", label: t("mode_either") },
      ],
    },
    {
      key: "language",
      title: t("q_lang"),
      options: termsFor("language").map((tm) => ({
        value: tm.slug,
        label: termLabel(tm.slug),
      })),
    },
    {
      key: "timeline",
      title: t("q_timeline"),
      options: [
        { value: "now", label: t("time_now") },
        { value: "season", label: t("time_season") },
        { value: "exploring", label: t("time_exploring") },
      ],
    },
  ];

  if (matches) {
    return (
      <Results
        matches={matches}
        onRestart={() => {
          setMatches(null);
          setStep(0);
          setAnswers({});
          setWidget(null);
          setOtherText("");
        }}
      />
    );
  }

  const q = QUESTIONS[step];
  const selected = answers[q.key];

  const advance = (value: string) => {
    if (value === PICK_ON_MAP || value === OTHER_FREE_TEXT) {
      setWidget(widget === value ? null : value);
      return;
    }
    setWidget(null);
    setOtherText("");
    const next = { ...answers, [q.key]: value };
    setAnswers(next);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setMatches(matchPractitioners(next as IntakeAnswers));
    }
  };

  // Free-text crop: try to resolve against the controlled vocabulary via
  // synonym expansion ("viñedo" -> vineyard); otherwise carry the raw text
  // (it simply won't earn crop-match points in ranking).
  const submitOther = () => {
    const text = otherText.trim();
    if (!text) return;
    const hit = synonymHits(text).find((tm) => tm.vocabulary === "crop");
    advance(hit ? hit.slug : text.toLowerCase());
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-soil-900">{t("intake_h1")}</h1>
      <p className="mt-1 text-sm text-soil-600">{t("intake_sub")}</p>

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
                selected === opt.value || widget === opt.value
                  ? "border-leaf-600 bg-leaf-50 text-leaf-900"
                  : "border-soil-200 bg-white text-soil-800 hover:border-leaf-400 hover:bg-leaf-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {widget === PICK_ON_MAP && (
          <EcoregionPicker
            onConfirm={(biomeName) => {
              setWidget(null);
              advance(biomeName);
            }}
          />
        )}

        {widget === OTHER_FREE_TEXT && (
          <div className="mt-4 rounded-lg border border-soil-200 bg-white p-4">
            <label className="text-sm text-soil-700" htmlFor="other-crop">
              {t("other_label")}
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="other-crop"
                autoFocus
                value={otherText}
                onChange={(e) => setOtherText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitOther()}
                placeholder={t("other_placeholder")}
                className="flex-1 rounded-lg border border-soil-300 px-3 py-2 text-sm focus:border-leaf-500 focus:outline-none"
              />
              <button
                onClick={submitOther}
                disabled={!otherText.trim()}
                className="rounded-lg bg-leaf-600 px-4 py-2 text-sm font-medium text-white hover:bg-leaf-700 disabled:opacity-50"
              >
                {t("continue")}
              </button>
            </div>
            <p className="mt-2 text-xs text-soil-500">{t("other_hint")}</p>
          </div>
        )}

        {step > 0 && (
          <button
            onClick={() => {
              setWidget(null);
              setOtherText("");
              setStep(step - 1);
            }}
            className="mt-4 text-sm text-soil-600 hover:text-soil-900 hover:underline"
          >
            {t("back")}
          </button>
        )}
      </div>
    </div>
  );
}

function Results({ matches, onRestart }: { matches: Match[]; onRestart: () => void }) {
  const { t } = useLocale();
  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold text-soil-900">
        {matches.length > 0 ? t("results_some") : t("results_none")}
      </h2>
      {matches.length === 0 && (
        <p className="mt-2 text-sm text-soil-600">
          {t("results_none_body")}{" "}
          <Link href="/directory?remote=true" className="text-leaf-700 hover:underline">
            {t("results_browse_remote")}
          </Link>
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
              <strong className="text-soil-900">{t("matched_because")}</strong>{" "}
              {m.explanation.join("; ")}.
            </p>
            <Link
              href={`/practitioners/${m.practitioner.slug}`}
              className="mt-3 inline-block rounded-lg bg-leaf-600 px-4 py-2 text-sm font-medium text-white hover:bg-leaf-700"
            >
              {t("view_profile")}
            </Link>
          </div>
        ))}
      </div>
      <button
        onClick={onRestart}
        className="mt-6 text-sm text-soil-600 hover:text-soil-900 hover:underline"
      >
        {t("start_over")}
      </button>
    </div>
  );
}
