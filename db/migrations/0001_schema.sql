-- Soil Food Web Practitioner Directory v2
-- Migration 0001: core schema (PRD §4)
-- Target: Postgres 15 + PostGIS. Supabase-compatible.

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
CREATE TYPE role_enum AS ENUM ('consultant', 'lab_tech', 'grower');
CREATE TYPE practitioner_status AS ENUM ('active', 'inactive', 'pending');
CREATE TYPE vocabulary_enum AS ENUM ('crop', 'soil_type', 'climate', 'language', 'practice', 'land_use');
CREATE TYPE proficiency_enum AS ENUM ('native', 'fluent', 'working');

-- ---------------------------------------------------------------------------
-- Ecoregions (RESOLVE Ecoregions 2017, Dinerstein et al.)
-- Load geometry with: shp2pgsql / ogr2ogr into this table, then build the index.
-- 846 terrestrial ecoregions, 14 biomes, 8 realms.
-- ---------------------------------------------------------------------------
CREATE TABLE realm (
  id    int PRIMARY KEY,
  name  text NOT NULL
);

CREATE TABLE biome (
  id       int PRIMARY KEY,
  name     text NOT NULL,
  realm_id int  -- a biome spans realms in RESOLVE; kept nullable, informational
);

CREATE TABLE ecoregion (
  id        int PRIMARY KEY,          -- ECO_ID from the RESOLVE shapefile
  eco_name  text NOT NULL,
  biome_id  int NOT NULL REFERENCES biome(id),
  realm_id  int NOT NULL REFERENCES realm(id),
  geom      geography(MultiPolygon, 4326)
);

CREATE INDEX idx_ecoregion_geom ON ecoregion USING GIST (geom);

-- ---------------------------------------------------------------------------
-- Controlled vocabularies (PRD §4.2)
-- Free tags fragment across a multilingual network; every filterable attribute
-- is an FK into vocabulary_term. Labels and synonyms live per-locale in the
-- i18n table. Synonyms are search-time expansion only, never filter options.
-- ---------------------------------------------------------------------------
CREATE TABLE vocabulary_term (
  id          serial PRIMARY KEY,
  vocabulary  vocabulary_enum NOT NULL,
  slug        text UNIQUE NOT NULL,      -- 'vineyard', never translated
  parent_id   int REFERENCES vocabulary_term(id),  -- hierarchy: query expansion goes DOWN the tree only
  sort_order  int NOT NULL DEFAULT 0
);

CREATE INDEX idx_vocab_vocabulary ON vocabulary_term (vocabulary);
CREATE INDEX idx_vocab_parent ON vocabulary_term (parent_id);

CREATE TABLE vocabulary_term_i18n (
  term_id   int NOT NULL REFERENCES vocabulary_term(id) ON DELETE CASCADE,
  locale    char(5) NOT NULL,            -- 'en', 'es', 'pt-BR', 'tr', 'sv'
  label     text NOT NULL,
  synonyms  text[] NOT NULL DEFAULT '{}',
  PRIMARY KEY (term_id, locale)
);

-- ---------------------------------------------------------------------------
-- Practitioner (PRD §4.1)
-- ---------------------------------------------------------------------------
CREATE TABLE practitioner (
  id                 uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug               text UNIQUE NOT NULL,
  display_name       text NOT NULL,
  roles              role_enum[] NOT NULL DEFAULT '{}',
  certified_since    int,
  certifications     jsonb NOT NULL DEFAULT '[]',   -- [{"program": "CTP", "year": 2022}]
  status             practitioner_status NOT NULL DEFAULT 'pending',
  accepting_clients  bool NOT NULL DEFAULT false,
  services_remotely  bool NOT NULL DEFAULT false,
  travel_radius_km   int,
  contact_email      text NOT NULL,   -- NEVER exposed raw; contact runs through the relay (PRD §8.2)
  contact_phone      text,
  website_url        text,
  location           geography(Point, 4326),
  city               text,
  admin_area         text,
  country_code       char(2),
  ecoregion_id       int REFERENCES ecoregion(id),  -- derived, denormalised (PRD §4.3)
  biome_id           int REFERENCES biome(id),      -- derived
  realm_id           int REFERENCES realm(id),      -- derived
  ecoregion_review   bool NOT NULL DEFAULT false,   -- flagged when coastal fallback was used
  bio                jsonb NOT NULL DEFAULT '{}',   -- {"en": "...", "es": "..."} long-form bios, preserved unabridged
  -- Consent & lifecycle (PRD §8.1): listing is opt-in and separate from certification
  listed_publicly    bool NOT NULL DEFAULT false,
  consent_at         timestamptz,
  consent_terms_ver  text,
  last_confirmed_at  timestamptz,   -- quarterly "still accurate?" confirmations (PRD §7)
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_practitioner_location ON practitioner USING GIST (location);
CREATE INDEX idx_practitioner_roles ON practitioner USING GIN (roles);
CREATE INDEX idx_practitioner_eco ON practitioner (ecoregion_id);
CREATE INDEX idx_practitioner_biome ON practitioner (biome_id);
CREATE INDEX idx_practitioner_public ON practitioner (status, listed_publicly);

-- ---------------------------------------------------------------------------
-- Junction tables (PRD §4.4)
-- ---------------------------------------------------------------------------
CREATE TABLE practitioner_crop (
  practitioner_id  uuid NOT NULL REFERENCES practitioner(id) ON DELETE CASCADE,
  term_id          int NOT NULL REFERENCES vocabulary_term(id),
  years_experience int,
  PRIMARY KEY (practitioner_id, term_id)
);

CREATE TABLE practitioner_soil_type (
  practitioner_id  uuid NOT NULL REFERENCES practitioner(id) ON DELETE CASCADE,
  term_id          int NOT NULL REFERENCES vocabulary_term(id),
  PRIMARY KEY (practitioner_id, term_id)
);

CREATE TABLE practitioner_language (
  practitioner_id  uuid NOT NULL REFERENCES practitioner(id) ON DELETE CASCADE,
  term_id          int NOT NULL REFERENCES vocabulary_term(id),
  proficiency      proficiency_enum NOT NULL DEFAULT 'working',
  PRIMARY KEY (practitioner_id, term_id)
);

CREATE TABLE practitioner_practice (
  practitioner_id  uuid NOT NULL REFERENCES practitioner(id) ON DELETE CASCADE,
  term_id          int NOT NULL REFERENCES vocabulary_term(id),
  PRIMARY KEY (practitioner_id, term_id)
);

CREATE INDEX idx_pcrop_term ON practitioner_crop (term_id);
CREATE INDEX idx_psoil_term ON practitioner_soil_type (term_id);
CREATE INDEX idx_plang_term ON practitioner_language (term_id);
CREATE INDEX idx_ppractice_term ON practitioner_practice (term_id);

-- ---------------------------------------------------------------------------
-- Enquiry relay (PRD §8.2): contact runs server-side; raw emails never published.
-- Also the organisation's first enquiry-volume dataset.
-- ---------------------------------------------------------------------------
CREATE TABLE enquiry (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  practitioner_id  uuid NOT NULL REFERENCES practitioner(id),
  sender_name      text NOT NULL,
  sender_email     text NOT NULL,
  message          text NOT NULL,
  source           text NOT NULL DEFAULT 'directory',  -- directory | intake
  matched_ecoregion bool,   -- success measure: enquiry reached a practitioner in a matching ecoregion
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_enquiry_practitioner ON enquiry (practitioner_id, created_at);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_practitioner_updated
  BEFORE UPDATE ON practitioner
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
