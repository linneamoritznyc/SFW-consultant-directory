"use client";

import { useEffect, useRef } from "react";
import maplibregl, { Map as MLMap, GeoJSONSource } from "maplibre-gl";
import type { Practitioner } from "@/lib/types";
import { ROLE_COLORS } from "./RoleBadge";

interface Props {
  practitioners: Practitioner[];
  highlightedId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}

// Muted raster basemap with no API key required. The PRD specifies Mapbox GL;
// MapLibre GL is API-compatible, so swapping in a Mapbox style + token later
// is a one-line change here.
const BASEMAP: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [
    { id: "bg", type: "background", paint: { "background-color": "#e8e4da" } },
    {
      id: "osm",
      type: "raster",
      source: "osm",
      paint: { "raster-saturation": -0.7, "raster-opacity": 0.85 },
    },
  ],
};

function toGeoJSON(practitioners: Practitioner[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: practitioners.map((p) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [p.lng, p.lat] },
      properties: {
        id: p.id,
        name: p.displayName,
        // Colour-code by role; dual-role practitioners get the consultant colour.
        color: p.roles.includes("consultant")
          ? ROLE_COLORS.consultant
          : ROLE_COLORS.lab_tech,
      },
    })),
  };
}

export default function DirectoryMap({
  practitioners,
  highlightedId,
  onHover,
  onSelect,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const readyRef = useRef(false);
  // Keep latest callbacks without re-binding map listeners.
  const onHoverRef = useRef(onHover);
  const onSelectRef = useRef(onSelect);
  onHoverRef.current = onHover;
  onSelectRef.current = onSelect;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: BASEMAP,
      center: [10, 25],
      zoom: 1.4,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }));
    mapRef.current = map;

    map.on("load", () => {
      map.addSource("practitioners", {
        type: "geojson",
        data: toGeoJSON([]),
        cluster: true,
        clusterMaxZoom: 8,
        clusterRadius: 45,
      });

      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "practitioners",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#5c4a35",
          "circle-opacity": 0.85,
          "circle-radius": ["step", ["get", "point_count"], 16, 5, 22, 10, 28],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#fff",
        },
      });
      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "practitioners",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-size": 12,
        },
        paint: { "text-color": "#ffffff" },
      });
      map.addLayer({
        id: "points",
        type: "circle",
        source: "practitioners",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": ["get", "color"],
          "circle-radius": [
            "case",
            ["boolean", ["feature-state", "highlight"], false],
            11,
            7,
          ],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#fff",
        },
      });

      map.on("click", "clusters", async (e) => {
        const feature = map.queryRenderedFeatures(e.point, { layers: ["clusters"] })[0];
        const source = map.getSource("practitioners") as GeoJSONSource;
        const zoom = await source.getClusterExpansionZoom(
          feature.properties.cluster_id
        );
        map.easeTo({
          center: (feature.geometry as GeoJSON.Point).coordinates as [number, number],
          zoom,
        });
      });

      map.on("click", "points", (e) => {
        const id = e.features?.[0]?.properties?.id;
        if (id) onSelectRef.current(id);
      });
      map.on("mouseenter", "points", (e) => {
        map.getCanvas().style.cursor = "pointer";
        const id = e.features?.[0]?.properties?.id;
        if (id) onHoverRef.current(id);
      });
      map.on("mouseleave", "points", () => {
        map.getCanvas().style.cursor = "";
        onHoverRef.current(null);
      });
      map.on("mouseenter", "clusters", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "clusters", () => {
        map.getCanvas().style.cursor = "";
      });

      readyRef.current = true;
      (map.getSource("practitioners") as GeoJSONSource).setData(
        toGeoJSON(practitioners)
      );
    });

    return () => {
      map.remove();
      mapRef.current = null;
      readyRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update data when the filtered set changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    (map.getSource("practitioners") as GeoJSONSource).setData(
      toGeoJSON(practitioners)
    );
  }, [practitioners]);

  // Hover a card → its pin lifts. Feature-state keyed by promoted id is
  // unavailable on clustered sources, so re-style via a match expression.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current || !map.getLayer("points")) return;
    map.setPaintProperty("points", "circle-radius", [
      "case",
      ["==", ["get", "id"], highlightedId ?? "__none__"],
      11,
      7,
    ]);
    map.setPaintProperty("points", "circle-stroke-color", [
      "case",
      ["==", ["get", "id"], highlightedId ?? "__none__"],
      "#233820",
      "#fff",
    ]);
  }, [highlightedId]);

  return <div ref={containerRef} className="h-full w-full" />;
}
