-- Run this once against your Vercel Postgres database before first use.
-- Vercel dashboard: Storage tab -> your Postgres database -> Query tab -> paste and run.

CREATE TABLE IF NOT EXISTS learners (
  id SERIAL PRIMARY KEY,
  hub_slug TEXT NOT NULL,
  sn INTEGER,                          -- original serial number from the uploaded sheet (nullable for added learners)
  source TEXT NOT NULL DEFAULT 'imported',  -- 'imported' or 'added'

  -- original (as uploaded / first entered) values
  name TEXT NOT NULL,
  gender TEXT NOT NULL DEFAULT '',
  population_segment TEXT NOT NULL DEFAULT 'N/A',
  type_of_disability TEXT NOT NULL DEFAULT 'N/A',
  dob TEXT NOT NULL DEFAULT '',
  type_of_id TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  guardian_contact TEXT NOT NULL DEFAULT '',
  employment_status TEXT NOT NULL DEFAULT 'Not employed',

  -- validated (field worker confirmed/edited) values -- null until validated
  v_name TEXT,
  v_gender TEXT,
  v_population_segment TEXT,
  v_type_of_disability TEXT,
  v_dob TEXT,
  v_type_of_id TEXT,
  v_phone TEXT,
  v_guardian_contact TEXT,
  v_employment_status TEXT,

  validated BOOLEAN NOT NULL DEFAULT FALSE,
  validated_by TEXT,
  validated_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_learners_hub ON learners (hub_slug);
