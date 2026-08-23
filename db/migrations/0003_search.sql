-- Migration 0003: search architecture (PRD §5)
-- Layer 2: per-locale full-text vectors. Layer 3: trigram fuzzy fallback.
-- Layer 1 (structured filters) and layer 4 (synonym expansion) need no schema
-- beyond vocabulary_term_i18n; expansion happens at query time in the app.

-- Per-locale tsvector columns. One per supported locale; extend as locales are added.
ALTER TABLE practitioner ADD COLUMN search_vector_en tsvector;
ALTER TABLE practitioner ADD COLUMN search_vector_es tsvector;

CREATE INDEX idx_search_en ON practitioner USING GIN (search_vector_en);
CREATE INDEX idx_search_es ON practitioner USING GIN (search_vector_es);

-- Weighted build: name (A) > city/region & crop labels (B) > bio (C),
-- so a name match outranks a bio mention.
CREATE OR REPLACE FUNCTION rebuild_search_vectors(p_id uuid) RETURNS void AS $$
DECLARE
  crops_en text;
  crops_es text;
BEGIN
  SELECT string_agg(i.label, ' ') INTO crops_en
  FROM practitioner_crop pc
  JOIN vocabulary_term_i18n i ON i.term_id = pc.term_id AND i.locale = 'en'
  WHERE pc.practitioner_id = p_id;

  SELECT string_agg(i.label, ' ') INTO crops_es
  FROM practitioner_crop pc
  JOIN vocabulary_term_i18n i ON i.term_id = pc.term_id AND i.locale = 'es'
  WHERE pc.practitioner_id = p_id;

  UPDATE practitioner p SET
    search_vector_en =
      setweight(to_tsvector('english', unaccent(coalesce(p.display_name, ''))), 'A') ||
      setweight(to_tsvector('english', unaccent(coalesce(p.city, '') || ' ' || coalesce(p.admin_area, ''))), 'B') ||
      setweight(to_tsvector('english', unaccent(coalesce(crops_en, ''))), 'B') ||
      setweight(to_tsvector('english', unaccent(coalesce(p.bio->>'en', ''))), 'C'),
    search_vector_es =
      setweight(to_tsvector('spanish', unaccent(coalesce(p.display_name, ''))), 'A') ||
      setweight(to_tsvector('spanish', unaccent(coalesce(p.city, '') || ' ' || coalesce(p.admin_area, ''))), 'B') ||
      setweight(to_tsvector('spanish', unaccent(coalesce(crops_es, ''))), 'B') ||
      setweight(to_tsvector('spanish', unaccent(coalesce(p.bio->>'es', ''))), 'C')
  WHERE p.id = p_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trg_rebuild_search() RETURNS trigger AS $$
BEGIN
  PERFORM rebuild_search_vectors(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_practitioner_search
  AFTER INSERT OR UPDATE OF display_name, city, admin_area, bio ON practitioner
  FOR EACH ROW EXECUTE FUNCTION trg_rebuild_search();

-- Layer 3: trigram indexes for the fuzzy fallback when full-text returns < 3
-- results ("Türkiye" / "Turkiye", "Göteborg" / "Gothenburg", misspellings).
CREATE INDEX idx_trgm_name ON practitioner USING GIN (display_name gin_trgm_ops);
CREATE INDEX idx_trgm_city ON practitioner USING GIN (city gin_trgm_ops);
