-- =============================================================
-- Migration: External Funding
-- =============================================================

CREATE TABLE external_fundings (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id   uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  name             text NOT NULL,
  source_type      text NOT NULL,
  description      text,
  amount           numeric(14,3) NOT NULL CHECK (amount >= 0),
  fiscal_year      text NOT NULL,
  source_upload_id uuid REFERENCES raw_uploads(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ext_fundings_institution ON external_fundings(institution_id);

ALTER TABLE external_fundings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ext_fundings_isolation"
  ON external_fundings FOR ALL
  USING (is_super_admin() OR institution_id = auth_institution_id());


-- ───────────────────────────────────────────────────────────────
-- Update v_finance_kpis_summary to include external funding
-- ───────────────────────────────────────────────────────────────
DROP VIEW IF EXISTS v_finance_kpis_summary;

CREATE OR REPLACE VIEW v_finance_kpis_summary AS
WITH budget AS (
  SELECT
    institution_id,
    fiscal_year,
    SUM(allocated)                                             AS total_allocated,
    SUM(consumed)                                              AS total_consumed,
    ROUND(SUM(consumed) / NULLIF(SUM(allocated), 0) * 100, 2) AS execution_rate
  FROM budget_lines
  GROUP BY institution_id, fiscal_year
),
students_count AS (
  SELECT institution_id, COUNT(*) AS active_students
  FROM students WHERE status = 'active'
  GROUP BY institution_id
),
ext AS (
  SELECT
    institution_id,
    fiscal_year,
    SUM(amount)   AS total_external,
    COUNT(*)      AS funding_sources_count
  FROM external_fundings
  GROUP BY institution_id, fiscal_year
)
SELECT
  b.institution_id,
  b.fiscal_year,
  b.total_allocated,
  b.total_consumed,
  b.execution_rate,
  ROUND(b.total_consumed / NULLIF(sc.active_students, 0), 2)  AS cost_per_student,
  COALESCE(e.total_external, 0)                               AS total_external_income,
  COALESCE(e.funding_sources_count, 0)                        AS funding_sources_count,
  ROUND(COALESCE(e.total_external, 0) / NULLIF(b.total_consumed, 0) * 100, 2) AS self_financing_rate,
  b.total_allocated + COALESCE(e.total_external, 0)           AS total_income
FROM budget b
LEFT JOIN students_count sc ON sc.institution_id = b.institution_id
LEFT JOIN ext e
  ON e.institution_id = b.institution_id
  AND e.fiscal_year = b.fiscal_year;