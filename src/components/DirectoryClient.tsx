"use client";

import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";
import type { Filters, Practitioner } from "@/lib/types";
import { relaxations, search } from "@/lib/search";
import { directoryHref, filtersToParams, paramsToFilters } from "@/lib/url-state";
import FilterRail from "./FilterRail";
import PractitionerCard from "./PractitionerCard";

const DirectoryMap = dynamic(() => import("./DirectoryMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-soil-500">
      Loading map…
    </div>
  ),
});

export default function DirectoryClient({
  practitioners,
}: {
  practitioners: Practitioner[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL is the single source of truth for filter state (PRD §6.2).
  const filters = useMemo(
    () => paramsToFilters(new URLSearchParams(searchParams.toString())),
    [searchParams]
  );

  const setFilters = useCallback(
    (next: Filters) => {
      const qs = filtersToParams(next).toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname]
  );

  const results = useMemo(
    () => search(practitioners, filters),
    [practitioners, filters]
  );

  // One selection model across list and map (PRD §6.1).
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const handlePinSelect = useCallback((id: string) => {
    setHighlightedId(id);
    cardRefs.current.get(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const mapped = useMemo(
    () => results.map((r) => r.practitioner),
    [results]
  );

  const nearest = results.length === 0 ? relaxations(practitioners, filters) : [];

  return (
    <div className="flex flex-1 flex-col lg:h-[calc(100vh-49px)] lg:flex-row lg:overflow-hidden">
      {/* Filter rail - 280px on desktop (PRD §6.1) */}
      <aside className="order-2 shrink-0 overflow-y-auto border-r border-soil-200 bg-white px-4 pb-8 lg:order-1 lg:w-[280px]">
        <FilterRail all={practitioners} filters={filters} onChange={setFilters} />
      </aside>

      {/* Results list */}
      <section className="order-3 flex-1 overflow-y-auto px-4 py-4 lg:order-2">
        <div className="mb-3 flex items-center gap-3">
          <input
            type="search"
            defaultValue={filters.q ?? ""}
            key={filters.q ?? ""}
            placeholder="Search names, places, crops - any language"
            onKeyDown={(e) => {
              if (e.key === "Enter")
                setFilters({ ...filters, q: e.currentTarget.value || undefined });
            }}
            onBlur={(e) =>
              setFilters({ ...filters, q: e.currentTarget.value || undefined })
            }
            className="w-full rounded-lg border border-soil-300 bg-white px-3 py-2 text-sm focus:border-leaf-500 focus:outline-none"
          />
        </div>
        <p className="mb-3 text-sm text-soil-600">
          {results.length} practitioner{results.length === 1 ? "" : "s"}
          {filters.q ? ` matching “${filters.q}”` : ""}
        </p>

        {results.length === 0 ? (
          <EmptyState nearest={nearest} filters={filters} />
        ) : (
          <div className="space-y-3 pb-8">
            {results.map((r) => (
              <PractitionerCard
                key={r.practitioner.id}
                result={r}
                highlighted={highlightedId === r.practitioner.id}
                onHover={setHighlightedId}
                cardRef={(el) => {
                  if (el) cardRefs.current.set(r.practitioner.id, el);
                  else cardRefs.current.delete(r.practitioner.id);
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* Map */}
      <section className="order-1 h-[320px] shrink-0 lg:order-3 lg:h-auto lg:w-[38%]">
        <DirectoryMap
          practitioners={mapped}
          highlightedId={highlightedId}
          onHover={setHighlightedId}
          onSelect={handlePinSelect}
        />
      </section>
    </div>
  );
}

// Empty state (PRD §6.3): name the constraint that failed, offer the nearest
// relaxations with counts. Never a blank page.
function EmptyState({
  nearest,
  filters,
}: {
  nearest: ReturnType<typeof relaxations>;
  filters: Filters;
}) {
  const active = Object.entries({
    role: filters.role,
    crops: filters.crops.length || null,
    languages: filters.languages.length || null,
    q: filters.q,
  }).filter(([, v]) => v);

  return (
    <div className="rounded-xl border border-soil-200 bg-white p-6">
      <h3 className="font-semibold text-soil-900">
        No practitioners match all of your filters
        {active.length > 0 && nearest.length > 0
          ? ` - the “${nearest[0].droppedLabel}” constraint is the one that failed`
          : ""}
        .
      </h3>
      {nearest.length > 0 ? (
        <ul className="mt-3 space-y-2 text-sm">
          {nearest.map((r) => (
            <li key={r.droppedLabel}>
              <a
                href={directoryHref(r.filters)}
                className="text-leaf-700 hover:underline"
              >
                {r.count} practitioner{r.count === 1 ? "" : "s"} if you drop{" "}
                <strong>{r.droppedLabel}</strong>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-soil-600">
          Try clearing your filters, or{" "}
          <a href="/intake" className="text-leaf-700 hover:underline">
            describe your situation
          </a>{" "}
          and we&apos;ll suggest the closest matches.
        </p>
      )}
      <p className="mt-4 text-xs text-soil-500">
        Remote-capable practitioners serve growers anywhere - consider dropping
        location-based filters and keeping “works remotely”.
      </p>
    </div>
  );
}
