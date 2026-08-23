"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import type { Practitioner } from "@/lib/types";
import { lookupEcoregion, osmBasemap } from "@/lib/ecoregion";
import { ROLE_COLORS } from "./RoleBadge";

// Profile map: the practitioner's location, their travel radius, and - pulled
// live from the public RESOLVE 2017 dataset - the ecoregion polygon their
// point falls in. Degrades gracefully: if the service is unreachable the map
// still shows the pin and radius.

/** Geodesic-ish circle polygon around a point, radius in km. */
function circlePolygon(lng: number, lat: number, radiusKm: number): GeoJSON.Feature {
  const points = 64;
  const coords: [number, number][] = [];
  const degLat = radiusKm / 110.574;
  const degLng = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180));
  for (let i = 0; i <= points; i++) {
    const theta = (i / points) * 2 * Math.PI;
    coords.push([lng + degLng * Math.cos(theta), lat + degLat * Math.sin(theta)]);
  }
  return {
    type: "Feature",
    properties: {},
    geometry: { type: "Polygon", coordinates: [coords] },
  };
}

export default function ProfileMap({ practitioner: p }: { practitioner: Practitioner }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ecoLoaded, setEcoLoaded] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: osmBasemap(),
      center: [p.lng, p.lat],
      zoom: p.travelRadiusKm ? Math.max(4, 8 - Math.log2(p.travelRadiusKm / 40)) : 5,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }));
    map.scrollZoom.disable(); // page scroll shouldn't hijack into zoom
    map.on("dblclick", () => map.scrollZoom.enable());

    const color = p.roles.includes("consultant")
      ? ROLE_COLORS.consultant
      : ROLE_COLORS.lab_tech;

    map.on("load", async () => {
      if (p.travelRadiusKm) {
        map.addSource("radius", {
          type: "geojson",
          data: circlePolygon(p.lng, p.lat, p.travelRadiusKm),
        });
        map.addLayer({
          id: "radius-fill",
          type: "fill",
          source: "radius",
          paint: { "fill-color": color, "fill-opacity": 0.08 },
        });
        map.addLayer({
          id: "radius-line",
          type: "line",
          source: "radius",
          paint: { "line-color": color, "line-opacity": 0.5, "line-width": 1.5, "line-dasharray": [2, 2] },
        });
      }

      new maplibregl.Marker({ color })
        .setLngLat([p.lng, p.lat])
        .setPopup(new maplibregl.Popup({ offset: 24 }).setText(`${p.displayName} · ${p.city}`))
        .addTo(map);

      const eco = await lookupEcoregion(p.lng, p.lat);
      if (eco && map.getStyle()) {
        map.addSource("ecoregion", { type: "geojson", data: eco.geojson });
        map.addLayer(
          {
            id: "ecoregion-fill",
            type: "fill",
            source: "ecoregion",
            paint: { "fill-color": "#548947", "fill-opacity": 0.12 },
          },
          p.travelRadiusKm ? "radius-fill" : undefined // under the radius ring
        );
        map.addLayer({
          id: "ecoregion-line",
          type: "line",
          source: "ecoregion",
          paint: { "line-color": "#33552d", "line-opacity": 0.6, "line-width": 1 },
        });
        setEcoLoaded(eco.ecoName);
      }
    });

    return () => map.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.id]);

  return (
    <div className="relative overflow-hidden rounded-xl border border-soil-200">
      <div ref={containerRef} className="h-[300px] w-full" />
      {ecoLoaded && (
        <div className="pointer-events-none absolute left-3 top-3 rounded-lg bg-white/90 px-3 py-1.5 text-xs text-soil-700 shadow-sm">
          <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-sm bg-leaf-500/40 align-middle ring-1 ring-leaf-700" />
          Ecoregion: <strong>{ecoLoaded}</strong>
        </div>
      )}
      {p.travelRadiusKm ? (
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-white/90 px-3 py-1.5 text-xs text-soil-700 shadow-sm">
          Dashed ring: {p.travelRadiusKm} km travel radius
        </div>
      ) : null}
    </div>
  );
}
