-- Recreate all KPI views with security_invoker = true so they respect RLS
-- and cannot be used to bypass row-level data isolation via the REST API.

DROP VIEW IF EXISTS v_academic_kpis;
DROP VIEW IF EXISTS v_attendance_kpis;
DROP VIEW IF EXISTS v_finance_kpis;
DROP VIEW IF EXISTS v_finance_kpis_summary;
DROP VIEW IF EXISTS v_hr_kpis;
DROP VIEW IF EXISTS v_research_kpis;
DROP VIEW IF EXISTS v_esg_kpis;
DROP VIEW IF EXISTS v_employment_kpis;
DROP VIEW IF EXISTS v_infrastructure_kpis;
DROP VIEW IF EXISTS v_partnerships_kpis;


CREATE VIEW v_academic_kpis WITH (security_invoker = true) AS
SELECT
  s.institution_id,
  e.academic_year,
  COUNT(DISTINCT s.id)                                                   AS total_students,
  COUNT(DISTINCT e.id)                                                   AS total_enrollments,
  ROUND(
    COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'dropped')::numeric
    / NULLIF(COUNT(DISTINCT s.id), 0) * 100, 2
  )                                                                      AS dropout_rate,
  ROUND(
    COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'graduated')::numeric
    / NULLIF(COUNT(DISTINCT s.id), 0) * 100, 2
  )                                                                      AS success_rate,
  ROUND(
    COUNT(DISTINCT e.id) FILTER (WHERE e.repeated_year = true)::numeric
    / NULLIF(COUNT(DISTINCT e.id), 0) * 100, 2
  )                                                                      AS repetition_rate
FROM students s
JOIN enrollments e ON e.student_id = s.id AND e.institution_id = s.institution_id
GROUP BY s.institution_id, e.academic_year;


CREATE VIEW v_attendance_kpis WITH (security_invoker = true) AS
SELECT
  c.institution_id,
  c.academic_year,
  c.id AS course_id,
  c.title AS course_title,
  COUNT(*) FILTER (WHERE ar.present = true)  AS sessions_present,
  COUNT(*)                                   AS sessions_total,
  ROUND(
    COUNT(*) FILTER (WHERE ar.present = true)::numeric
    / NULLIF(COUNT(*), 0) * 100, 2
  )                                           AS attendance_rate
FROM courses c
JOIN attendance_records ar ON ar.course_id = c.id
GROUP BY c.institution_id, c.academic_year, c.id, c.title;


CREATE VIEW v_finance_kpis WITH (security_invoker = true) AS
SELECT
  institution_id,
  fiscal_year,
  SUM(allocated)                                                          AS total_allocated,
  SUM(consumed)                                                           AS total_consumed,
  ROUND(SUM(consumed) / NULLIF(SUM(allocated), 0) * 100, 2)              AS execution_rate,
  department,
  SUM(allocated) AS dept_allocated,
  SUM(consumed)  AS dept_consumed
FROM budget_lines
GROUP BY institution_id, fiscal_year, department;


CREATE VIEW v_finance_kpis_summary WITH (security_invoker = true) AS
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


CREATE VIEW v_hr_kpis WITH (security_invoker = true) AS
SELECT
  st.institution_id,
  COUNT(*) FILTER (WHERE st.role_type = 'teaching')       AS teaching_staff_count,
  COUNT(*) FILTER (WHERE st.role_type = 'administrative') AS admin_staff_count,
  COUNT(*) FILTER (WHERE st.role_type = 'research')       AS research_staff_count,
  ROUND(AVG(st.teaching_hours_week) FILTER (WHERE st.role_type = 'teaching'), 2) AS avg_teaching_load,
  ROUND(
    COUNT(DISTINCT ab.staff_id)::numeric / NULLIF(COUNT(DISTINCT st.id), 0) * 100, 2
  ) AS absenteeism_rate
FROM staff st
LEFT JOIN absences ab
  ON ab.staff_id = st.id
  AND ab.absence_date >= date_trunc('month', now())
WHERE st.is_active = true
GROUP BY st.institution_id;


CREATE VIEW v_research_kpis WITH (security_invoker = true) AS
SELECT
  institution_id,
  COUNT(*) FILTER (WHERE status = 'active')              AS active_projects,
  COUNT(*)                                               AS total_projects,
  SUM(publications_count)                                AS total_publications,
  SUM(patents_filed)                                     AS total_patents,
  ROUND(SUM(funding_amount) / 1000, 2)                  AS total_funding_k
FROM research_projects
GROUP BY institution_id;


CREATE VIEW v_esg_kpis WITH (security_invoker = true) AS
SELECT
  institution_id,
  period_type,
  period_start,
  period_end,
  SUM(energy_kwh)         AS energy_kwh,
  SUM(carbon_kg)          AS carbon_kg,
  SUM(water_liters)       AS water_liters,
  SUM(waste_kg)           AS waste_kg,
  SUM(recycled_kg)        AS recycled_kg,
  ROUND(SUM(recycled_kg) / NULLIF(SUM(waste_kg), 0) * 100, 2) AS recycling_rate,
  ROUND(AVG(green_mobility_pct), 2)                            AS green_mobility_pct
FROM esg_records
GROUP BY institution_id, period_type, period_start, period_end;


CREATE VIEW v_employment_kpis WITH (security_invoker = true) AS
WITH latest_jobs AS (
  SELECT DISTINCT ON (student_id)
    student_id,
    job_country,
    employment_date
  FROM student_jobs
  ORDER BY student_id, employment_date DESC
)
SELECT
  s.institution_id,
  COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'graduated')              AS total_graduated,
  COUNT(DISTINCT lj.student_id)                                            AS employed_count,
  ROUND(
    COUNT(DISTINCT lj.student_id)::numeric
    / NULLIF(COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'graduated'), 0)
    * 100, 1
  )                                                                        AS employability_rate,
  COUNT(DISTINCT lj.student_id) FILTER (WHERE lj.job_country = 'TN')      AS national_employed_count,
  ROUND(
    COUNT(DISTINCT lj.student_id) FILTER (WHERE lj.job_country = 'TN')::numeric
    / NULLIF(COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'graduated'), 0)
    * 100, 1
  )                                                                        AS national_employment_rate,
  COUNT(DISTINCT lj.student_id) FILTER (WHERE lj.job_country <> 'TN')     AS international_employed_count,
  ROUND(
    COUNT(DISTINCT lj.student_id) FILTER (WHERE lj.job_country <> 'TN')::numeric
    / NULLIF(COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'graduated'), 0)
    * 100, 1
  )                                                                        AS international_employment_rate,
  ROUND(
    AVG(lj.employment_date - s.graduation_date)
    FILTER (WHERE lj.student_id IS NOT NULL)
  )                                                                        AS avg_days_to_employ
FROM students s
LEFT JOIN latest_jobs lj ON lj.student_id = s.id AND s.status = 'graduated'
GROUP BY s.institution_id;


CREATE VIEW v_infrastructure_kpis WITH (security_invoker = true) AS
SELECT
  institution_id,
  COUNT(*)                                                                 AS total_assets,
  COUNT(*) FILTER (WHERE status = 'operational')                           AS operational_count,
  COUNT(*) FILTER (WHERE status = 'maintenance')                           AS maintenance_count,
  COUNT(*) FILTER (WHERE status = 'out_of_service')                        AS out_of_service_count,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'operational')::numeric
    / NULLIF(COUNT(*), 0) * 100, 2
  )                                                                        AS operational_rate,
  ROUND(AVG(reported_occupancy_pct) FILTER (WHERE reported_occupancy_pct IS NOT NULL), 2) AS avg_occupancy_pct,
  COUNT(*) FILTER (WHERE asset_type = 'classroom')                         AS classroom_count,
  COUNT(*) FILTER (WHERE asset_type = 'lab')                               AS lab_count
FROM infrastructure_assets
GROUP BY institution_id;


CREATE VIEW v_partnerships_kpis WITH (security_invoker = true) AS
SELECT
  institution_id,
  COUNT(*) FILTER (WHERE is_active = true)                                                        AS active_partnerships,
  COUNT(*)                                                                                        AS total_partnerships,
  SUM(outgoing_students) FILTER (WHERE is_active = true)                                          AS total_outgoing_students,
  SUM(incoming_students) FILTER (WHERE is_active = true)                                          AS total_incoming_students,
  COUNT(*) FILTER (WHERE is_active = true AND (partner_country IS NULL OR partner_country <> 'TN')) AS international_partnerships,
  COUNT(*) FILTER (WHERE is_active = true AND type = 'academic')                                  AS academic_partnerships,
  COUNT(*) FILTER (WHERE is_active = true AND type = 'industry')                                  AS industry_partnerships
FROM partnerships
GROUP BY institution_id;
