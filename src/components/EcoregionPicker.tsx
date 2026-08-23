"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { lookupEcoregion, osmBasemap, type EcoregionHit } from "@/lib/ecoregion";

// "Don't know your ecoregion?" - click anywhere on the map and the RESOLVE
// 2017 dataset (846 ecoregions) resolves the ecoregion and biome for that
// point. Far kinder than scrolling a list of 846 names.

interface Props {
  onConfirm: (biomeName: string, ecoName: string) => void;
}

export default function EcoregionPicker({ onConfirm }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const [state, setState] = useState<
    | { phase: "idle" }
    | { phase: "loading" }
    | { phase: "resolved"; hit: EcoregionHit }
    | { phase: "failed" }
  >({ phase: "idle" });

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: osmBasemap(),
      center: [10, 25],
      zoom: 1.2,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }));
    map.getCanvas().style.cursor = "crosshair";
    mapRef.current = map;

    map.on("click", async (e) => {
      const { lng, lat } = e.lngLat;
      markerRef.current?.remove();
      markerRef.current = new maplibregl.Marker({ color: "#406d37" })
        .setLngLat([lng, lat])
        .addTo(map);
      setState({ phase: "loading" });

      const hit = await lookupEcoregion(lng, lat);
      if (!map.getStyle()) return; // unmounted mid-fetch
      if (!hit) {
        setState({ phase: "failed" });
        return;
      }
      if (map.getSource("picked-eco")) {
        (map.getSource("picked-eco") as maplibregl.GeoJSONSource).setData(hit.geojson);
      } else {
        map.addSource("picked-eco", { type: "geojson", data: hit.geojson });
        map.addLayer({
          id: "picked-eco-fill",
          type: "fill",
          source: "picked-eco",
          paint: { "fill-color": "#548947", "fill-opacity": 0.15 },
        });
        map.addLayer({
          id: "picked-eco-line",
          type: "line",
          source: "picked-eco",
          paint: { "line-color": "#33552d", "line-opacity": 0.7, "line-width": 1.5 },
        });
      }
      setState({ phase: "resolved", hit });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="mt-4">
      <p className="mb-2 text-sm text-soil-600">
        Click your location on the map - we&apos;ll look up your ecoregion in
        the RESOLVE 2017 dataset (846 ecoregions worldwide).
      </p>
      <div className="overflow-hidden rounded-xl border border-soil-200">
        <div ref={containerRef} className="h-[340px] w-full" />
      </div>

      {state.phase === "loading" && (
        <p className="mt-3 text-sm text-soil-500">Looking up your ecoregion…</p>
      )}
      {state.phase === "failed" && (
        <p className="mt-3 text-sm text-clay-600">
          Couldn&apos;t resolve an ecoregion there (open water, or the service
          is unreachable). Try clicking on land, or pick a region from the
          list above.
        </p>
      )}
      {state.phase === "resolved" && (
        <div className="mt-3 rounded-lg border border-leaf-200 bg-leaf-50 p-4">
          <p className="text-sm text-soil-800">
            <strong>{state.hit.ecoName}</strong>
          </p>
          <p className="mt-0.5 text-xs text-soil-600">
            Biome: {state.hit.biomeName} · Realm: {state.hit.realm}
          </p>
          <button
            onClick={() => onConfirm(state.hit.biomeName, state.hit.ecoName)}
            className="mt-3 rounded-lg bg-leaf-600 px-4 py-2 text-sm font-medium text-white hover:bg-leaf-700"
          >
            Use this region
          </button>
        </div>
      )}
    </div>
  );
}
