"use client";

import Link from "next/link";
import type { RankedResult } from "@/lib/types";
import { label } from "@/lib/vocab";
import RoleBadge from "./RoleBadge";

interface Props {
  result: RankedResult;
  highlighted: boolean;
  onHover: (id: string | null) => void;
  cardRef?: (el: HTMLDivElement | null) => void;
}

export default function PractitionerCard({ result, highlighted, onHover, cardRef }: Props) {
  const p = result.practitioner;
  return (
    <div
      ref={cardRef}
      onMouseEnter={() => onHover(p.id)}
      onMouseLeave={() => onHover(null)}
      className={`rounded-xl border border-soil-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md ${
        highlighted ? "card-highlight" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <Link
            href={`/practitioners/${p.slug}`}
            className="font-semibold text-soil-900 hover:text-leaf-700 hover:underline"
          >
            {p.displayName}
          </Link>
          <p className="text-xs text-soil-500">
            {p.city}, {p.adminArea} · {p.countryCode}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {p.roles.map((r) => (
            <RoleBadge key={r} role={r} />
          ))}
        </div>
      </div>

      <p className="mt-2 text-xs text-soil-600">
        {p.crops.slice(0, 3).map(label).join(" · ")}
        {p.crops.length > 3 ? ` +${p.crops.length - 3}` : ""}
      </p>
      <p className="mt-1 text-xs text-soil-500 italic">{p.biome}</p>

      <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
        {p.acceptingClients ? (
          <span className="rounded-full bg-leaf-100 px-2 py-0.5 text-leaf-800">
            Accepting clients
          </span>
        ) : (
          <span className="rounded-full bg-soil-100 px-2 py-0.5 text-soil-500">
            Not taking clients
          </span>
        )}
        {p.servicesRemotely && (
          <span className="rounded-full bg-sky-100 px-2 py-0.5 text-sky-800">
            Remote
          </span>
        )}
        {p.acceptsSamples && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800">
            Samples by post
          </span>
        )}
        <span className="rounded-full bg-soil-100 px-2 py-0.5 text-soil-600">
          Fees: {p.feeBand}
        </span>
        {p.travelRadiusKm ? (
          <span className="rounded-full bg-soil-100 px-2 py-0.5 text-soil-600">
            Travels {p.travelRadiusKm} km
          </span>
        ) : null}
        {p.languages.map((l) => (
          <span key={l.slug} className="rounded-full bg-soil-100 px-2 py-0.5 text-soil-600">
            {label(l.slug)}
          </span>
        ))}
      </div>
    </div>
  );
}
