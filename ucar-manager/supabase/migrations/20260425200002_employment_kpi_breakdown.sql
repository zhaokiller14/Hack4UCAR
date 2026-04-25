-- Replace v_employment_kpis to add national/international employment breakdown
-- CREATE OR REPLACE cannot add columns; must drop and recreate
DROP VIEW IF EXISTS v_employment_kpis;
CREATE VIEW v_employment_kpis AS
SELECT
  s.institution_id,
  COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'graduated')                        AS total_graduated,
  COUNT(DISTINCT j.student_id)                                                       AS employed_count,
  ROUND(
    COUNT(DISTINCT j.student_id)::numeric
    / NULLIF(COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'graduated'), 0)
    * 100, 1
  )                                                                                  AS employability_rate,
  COUNT(DISTINCT j.student_id) FILTER (WHERE j.job_country = 'TN')                  AS national_employed_count,
  ROUND(
    COUNT(DISTINCT j.student_id) FILTER (WHERE j.job_country = 'TN')::numeric
    / NULLIF(COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'graduated'), 0)
    * 100, 1
  )                                                                                  AS national_employment_rate,
  COUNT(DISTINCT j.student_id) FILTER (WHERE j.job_country <> 'TN')                 AS international_employed_count,
  ROUND(
    COUNT(DISTINCT j.student_id) FILTER (WHERE j.job_country <> 'TN')::numeric
    / NULLIF(COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'graduated'), 0)
    * 100, 1
  )                                                                                  AS international_employment_rate,
  ROUND(
    AVG(j.employment_date - s.graduation_date) FILTER (WHERE j.student_id IS NOT NULL)
  )                                                                                  AS avg_days_to_employ
FROM students s
LEFT JOIN student_jobs j ON j.student_id = s.id
GROUP BY s.institution_id;
