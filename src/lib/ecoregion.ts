import type maplibregl from "maplibre-gl";

// RESOLVE Ecoregions 2017 (Dinerstein et al.), public FeatureServer on ArcGIS
// Online - the same dataset the production PostGIS layer ingests. Queries run
// in the visitor's browser and every caller degrades gracefully when the
// service is unreachable.
const RESOLVE_FEATURESERVER =
  "https://services5.arcgis.com/0AFshTTr9KmZgSsz/arcgis/rest/services/RESOLVE_Ecoregions_and_Biomes/FeatureServer/0/query";

export interface EcoregionHit {
  ecoName: string;
  biomeName: string;
  realm: string;
  geojson: GeoJSON.FeatureCollection;
}

export async function lookupEcoregion(
  lng: number,
  lat: number
): Promise<EcoregionHit | null> {
  const params = new URLSearchParams({
    f: "geojson",
    geometry: `${lng},${lat}`,
    geometryType: "esriGeometryPoint",
    inSR: "4326",
    outSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    returnGeometry: "true",
    outFields: "ECO_NAME,BIOME_NAME,REALM",
    // Simplify server-side: full-resolution ecoregion polygons run to megabytes.
    maxAllowableOffset: "0.02",
    geometryPrecision: "3",
  });
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`${RESOLVE_FEATURESERVER}?${params}`, {
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = (await res.json()) as GeoJSON.FeatureCollection;
    const props = data.features?.[0]?.properties as
      | { ECO_NAME?: string; BIOME_NAME?: string; REALM?: string }
      | undefined;
    if (!props?.ECO_NAME) return null;
    return {
      ecoName: props.ECO_NAME,
      biomeName: props.BIOME_NAME ?? "",
      realm: props.REALM ?? "",
      geojson: data,
    };
  } catch {
    return null;
  }
}

// Muted OSM raster basemap shared by the profile map and the ecoregion picker.
export function osmBasemap(): maplibregl.StyleSpecification {
  return {
    version: 8,
    sources: {
      osm: {
        type: "raster",
        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
        tileSize: 256,
        attribution: "© OpenStreetMap contributors · Ecoregions: RESOLVE 2017",
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
}
