-- Fix v_employment_kpis: each student counts at most once as employed.
-- National = latest job in TN; International = latest job outside TN.
DROP VIEW IF EXISTS v_employment_kpis;

CREATE VIEW v_employment_kpis AS
WITH latest_jobs AS (
  -- One row per employed student: their most recent job
  SELECT DISTINCT ON (student_id)
    student_id,
    job_country,
    employment_date
  FROM student_jobs
  ORDER BY student_id, employment_date DESC
)
SELECT
  s.institution_id,
  COUNT(DISTINCT s.id)  FILTER (WHERE s.status = 'graduated')          AS total_graduated,
  COUNT(DISTINCT lj.student_id)                                         AS employed_count,
  ROUND(
    COUNT(DISTINCT lj.student_id)::numeric
    / NULLIF(COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'graduated'), 0)
    * 100, 1
  )                                                                     AS employability_rate,
  COUNT(DISTINCT lj.student_id) FILTER (WHERE lj.job_country = 'TN')   AS national_employed_count,
  ROUND(
    COUNT(DISTINCT lj.student_id) FILTER (WHERE lj.job_country = 'TN')::numeric
    / NULLIF(COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'graduated'), 0)
    * 100, 1
  )                                                                     AS national_employment_rate,
  COUNT(DISTINCT lj.student_id) FILTER (WHERE lj.job_country <> 'TN')  AS international_employed_count,
  ROUND(
    COUNT(DISTINCT lj.student_id) FILTER (WHERE lj.job_country <> 'TN')::numeric
    / NULLIF(COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'graduated'), 0)
    * 100, 1
  )                                                                     AS international_employment_rate,
  ROUND(
    AVG(lj.employment_date - s.graduation_date)
    FILTER (WHERE lj.student_id IS NOT NULL)
  )                                                                     AS avg_days_to_employ
FROM students s
LEFT JOIN latest_jobs lj ON lj.student_id = s.id AND s.status = 'graduated'
GROUP BY s.institution_id;
