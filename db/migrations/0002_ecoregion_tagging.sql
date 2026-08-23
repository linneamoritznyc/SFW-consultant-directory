-- Migration 0002: ecoregion point-in-polygon tagging (PRD §4.3)
--
-- Prerequisite: the RESOLVE Ecoregions 2017 shapefile loaded into ecoregion.geom, e.g.:
--   ogr2ogr -f PostgreSQL PG:"$DATABASE_URL" Ecoregions2017.shp \
--     -nln ecoregion_raw -nlt PROMOTE_TO_MULTI -t_srs EPSG:4326
-- then mapped into ecoregion / biome / realm via db/scripts/ingest_ecoregions.sql.

-- Tag a single practitioner. Called from the app on create or location update.
CREATE OR REPLACE FUNCTION tag_practitioner_ecoregion(p_id uuid) RETURNS void AS $$
DECLARE
  hit record;
BEGIN
  -- Primary: exact point-in-polygon.
  SELECT e.id, e.biome_id, e.realm_id INTO hit
  FROM ecoregion e, practitioner p
  WHERE p.id = p_id
    AND ST_Contains(e.geom::geometry, p.location::geometry)
  LIMIT 1;

  IF FOUND THEN
    UPDATE practitioner
    SET ecoregion_id = hit.id, biome_id = hit.biome_id, realm_id = hit.realm_id,
        ecoregion_review = false
    WHERE id = p_id;
    RETURN;
  END IF;

  -- Coastal edge case: point in water or boundary gap. Nearest polygon within
  -- 25 km, ordered by distance, and flag the record for review.
  SELECT e.id, e.biome_id, e.realm_id INTO hit
  FROM ecoregion e, practitioner p
  WHERE p.id = p_id
    AND ST_DWithin(e.geom, p.location, 25000)
  ORDER BY ST_Distance(e.geom, p.location)
  LIMIT 1;

  IF FOUND THEN
    UPDATE practitioner
    SET ecoregion_id = hit.id, biome_id = hit.biome_id, realm_id = hit.realm_id,
        ecoregion_review = true
    WHERE id = p_id;
  ELSE
    UPDATE practitioner
    SET ecoregion_id = NULL, biome_id = NULL, realm_id = NULL,
        ecoregion_review = true
    WHERE id = p_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Keep tags fresh automatically when a location changes.
CREATE OR REPLACE FUNCTION trg_tag_ecoregion() RETURNS trigger AS $$
BEGIN
  IF NEW.location IS NOT NULL AND
     (TG_OP = 'INSERT' OR OLD.location IS DISTINCT FROM NEW.location) THEN
    PERFORM tag_practitioner_ecoregion(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_practitioner_ecoregion
  AFTER INSERT OR UPDATE OF location ON practitioner
  FOR EACH ROW EXECUTE FUNCTION trg_tag_ecoregion();

-- Foundation coverage analysis (PRD §4.3, §11 phase 5):
-- biomes with zero certified practitioners = recruitment roadmap.
CREATE OR REPLACE VIEW coverage_by_biome AS
SELECT b.id, b.name,
       count(p.id) FILTER (WHERE p.status = 'active') AS active_practitioners
FROM biome b
LEFT JOIN practitioner p ON p.biome_id = b.id
GROUP BY b.id, b.name
ORDER BY active_practitioners ASC, b.name;
