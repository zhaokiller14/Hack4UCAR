-- ───────────────────────────────────────────────────────────────
-- 0. Extensions
-- ───────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for future full-text search on names


-- ───────────────────────────────────────────────────────────────
-- 1. ENUMS
-- ───────────────────────────────────────────────────────────────
CREATE TYPE user_role AS ENUM (
  'super_admin',       -- UCAR-level, sees everything
  'org_admin',         -- institution-level admin, all modules
  'finance_manager',
  'hr_manager',
  'academic_manager',
  'research_manager',
  'partnerships_manager',
  'esg_manager',
  'infrastructure_manager',
  'viewer'             -- read-only within institution
);


CREATE TYPE contract_type AS ENUM ('permanent', 'fixed_term', 'part_time', 'visiting');
CREATE TYPE staff_role_type AS ENUM ('teaching', 'administrative', 'technical', 'research');
CREATE TYPE student_status AS ENUM ('active', 'graduated', 'dropped', 'suspended', 'transferred');
CREATE TYPE enrollment_status AS ENUM ('enrolled', 'withdrawn', 'completed', 'failed');
CREATE TYPE asset_status AS ENUM ('operational', 'maintenance', 'out_of_service');
CREATE TYPE alert_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE report_status AS ENUM ('pending', 'generating', 'ready', 'failed');
CREATE TYPE upload_status AS ENUM ('pending', 'processing', 'done', 'failed');
CREATE TYPE validation_status AS ENUM ('valid', 'invalid', 'partial');
CREATE TYPE kpi_domain AS ENUM (
  'academic', 'finance', 'hr', 'research',
  'partnerships', 'infrastructure', 'esg', 'employment'
);
CREATE TYPE period_type AS ENUM ('monthly', 'semester', 'annual');
CREATE TYPE goal_scope AS ENUM ('ucar_wide', 'institution');


-- ───────────────────────────────────────────────────────────────
-- 2. ORGANIZATION (UCAR itself — single row in prod)
-- ───────────────────────────────────────────────────────────────
CREATE TABLE organization (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  short_name      text NOT NULL,
  country         text NOT NULL DEFAULT 'Tunisia',
  city            text NOT NULL,
  president_name  text,
  contact_email   text,
  created_at      timestamptz NOT NULL DEFAULT now()
);


-- ───────────────────────────────────────────────────────────────
-- 3. INSTITUTIONS (the 30+ affiliated entities)
-- ───────────────────────────────────────────────────────────────
CREATE TABLE institutions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
  name            text NOT NULL,
  code            text NOT NULL UNIQUE,        -- e.g. "ENSI", "ISET-SF"
  city            text NOT NULL,
  president_name  text,
  contact_email   text,
  is_active       bool NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_institutions_org ON institutions(organization_id);


-- ───────────────────────────────────────────────────────────────
-- 4. USERS / PROFILES
--    auth.users is managed by Supabase; profiles extends it
-- ───────────────────────────────────────────────────────────────
CREATE TABLE profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organization(id),
  institution_id  uuid REFERENCES institutions(id),  -- NULL for super_admin
  full_name       text NOT NULL,
  role            user_role NOT NULL DEFAULT 'viewer',
  is_active       bool NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_institution ON profiles(institution_id);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Automatically create profile on user signup (trigger set in auth hooks or edge function)


-- ───────────────────────────────────────────────────────────────
-- 5. HR — STAFF
-- ───────────────────────────────────────────────────────────────
CREATE TABLE staff (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id       uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  employee_code        text,
  full_name            text NOT NULL,
  email                text,
  phone                text,
  role_type            staff_role_type NOT NULL,
  department           text,
  contract_type        contract_type,
  teaching_hours_week  numeric(5,2),           -- only relevant for teaching staff
  hire_date            date,
  is_active            bool NOT NULL DEFAULT true,
  source_upload_id     uuid,                   -- FK added after raw_uploads table
  created_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_staff_institution ON staff(institution_id);
CREATE INDEX idx_staff_role_type ON staff(institution_id, role_type);

CREATE TABLE absences (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id       uuid NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  institution_id uuid NOT NULL REFERENCES institutions(id),
  absence_date   date NOT NULL,
  reason         text,
  justified      bool NOT NULL DEFAULT false,
  recorded_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_absences_staff ON absences(staff_id);
CREATE INDEX idx_absences_institution_date ON absences(institution_id, absence_date);

CREATE TABLE trainings (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  title          text NOT NULL,
  provider       text,
  start_date     date,
  end_date       date,
  duration_hours int,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE staff_trainings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id        uuid NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  training_id     uuid NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  completed       bool NOT NULL DEFAULT false,
  completion_date date,
  UNIQUE (staff_id, training_id)
);


-- ───────────────────────────────────────────────────────────────
-- 6. ACADEMIC — STUDENTS, COURSES, EXAMS
-- ───────────────────────────────────────────────────────────────
CREATE TABLE students (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id   uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  student_code     text,
  full_name        text NOT NULL,
  email            text,
  phone            text,
  birth_date       date,
  gender           text,
  specialization   text,
  current_year     int,
  status           student_status NOT NULL DEFAULT 'active',
  enrollment_date  date,
  graduation_date  date,
  source_upload_id uuid,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_students_institution ON students(institution_id);
CREATE INDEX idx_students_status ON students(institution_id, status);
CREATE INDEX idx_students_specialization ON students(institution_id, specialization);

CREATE TABLE enrollments (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id     uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  institution_id uuid NOT NULL REFERENCES institutions(id),
  academic_year  text NOT NULL,               -- e.g. "2024-2025"
  semester       text,                         -- "S1", "S2"
  specialization text,
  status         enrollment_status NOT NULL DEFAULT 'enrolled',
  repeated_year  bool NOT NULL DEFAULT false,
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, academic_year, semester)
);

CREATE INDEX idx_enrollments_institution_year ON enrollments(institution_id, academic_year);

CREATE TABLE courses (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  staff_id       uuid REFERENCES staff(id) ON DELETE SET NULL,
  code           text,
  title          text NOT NULL,
  specialization text,
  year_level     int,
  credits        numeric(4,2),
  semester       text,
  academic_year  text NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_courses_institution ON courses(institution_id, academic_year);

CREATE TABLE attendance_records (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id    uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  session_date date NOT NULL,
  present      bool NOT NULL DEFAULT false,
  note         text,
  UNIQUE (student_id, course_id, session_date)
);

CREATE INDEX idx_attendance_course ON attendance_records(course_id, session_date);
CREATE INDEX idx_attendance_student ON attendance_records(student_id);

CREATE TABLE exams (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id      uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  institution_id uuid NOT NULL REFERENCES institutions(id),
  type           text NOT NULL,               -- 'midterm', 'final', 'makeup'
  exam_date      date,
  max_score      numeric(6,2) NOT NULL DEFAULT 20,
  academic_year  text NOT NULL,
  semester       text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE exam_results (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id    uuid NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  score      numeric(6,2),
  passed     bool,
  absent     bool NOT NULL DEFAULT false,
  note       text,
  UNIQUE (exam_id, student_id)
);

CREATE INDEX idx_exam_results_exam ON exam_results(exam_id);
CREATE INDEX idx_exam_results_student ON exam_results(student_id);


-- ───────────────────────────────────────────────────────────────
-- 7. FINANCE
-- ───────────────────────────────────────────────────────────────
CREATE TABLE budget_lines (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  fiscal_year    text NOT NULL,               -- "2024"
  department     text NOT NULL,
  category       text NOT NULL,               -- "maintenance", "salaries", "equipment"
  allocated      numeric(14,3) NOT NULL DEFAULT 0,
  consumed       numeric(14,3) NOT NULL DEFAULT 0,
  description    text,
  source_upload_id uuid,
  updated_at     timestamptz NOT NULL DEFAULT now(),
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_budget_institution_year ON budget_lines(institution_id, fiscal_year);
CREATE INDEX idx_budget_dept ON budget_lines(institution_id, department);


-- ───────────────────────────────────────────────────────────────
-- 8. RESEARCH
-- ───────────────────────────────────────────────────────────────
CREATE TABLE research_projects (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id     uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  title              text NOT NULL,
  lead_researcher    text,
  funding_amount     numeric(14,3),
  funding_source     text,
  start_date         date,
  end_date           date,
  status             text NOT NULL DEFAULT 'active', -- 'active','completed','cancelled'
  publications_count int NOT NULL DEFAULT 0,
  patents_filed      int NOT NULL DEFAULT 0,
  created_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_research_institution ON research_projects(institution_id, status);


-- ───────────────────────────────────────────────────────────────
-- 9. PARTNERSHIPS
-- ───────────────────────────────────────────────────────────────
CREATE TABLE partnerships (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id     uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  partner_name       text NOT NULL,
  partner_country    text,
  type               text NOT NULL,           -- 'academic','industry','government','ngo'
  start_date         date,
  end_date           date,
  is_active          bool NOT NULL DEFAULT true,
  scope              text,
  outgoing_students  int NOT NULL DEFAULT 0,
  incoming_students  int NOT NULL DEFAULT 0,
  created_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_partnerships_institution ON partnerships(institution_id, is_active);


-- ───────────────────────────────────────────────────────────────
-- 10. INFRASTRUCTURE
-- ───────────────────────────────────────────────────────────────
CREATE TABLE infrastructure_assets (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id        uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  asset_type            text NOT NULL,        -- 'classroom','lab','office','server'
  name                  text NOT NULL,
  location              text,
  capacity              int,
  status                asset_status NOT NULL DEFAULT 'operational',
  last_maintenance      date,
  reported_occupancy_pct numeric(5,2),        -- manual input, not computed
  created_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_assets_institution ON infrastructure_assets(institution_id, asset_type);


-- ───────────────────────────────────────────────────────────────
-- 11. ESG
-- ───────────────────────────────────────────────────────────────
CREATE TABLE esg_records (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id      uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  period_type         period_type NOT NULL,
  period_start        date NOT NULL,
  period_end          date NOT NULL,
  energy_kwh          numeric(14,3),
  water_liters        numeric(14,3),
  carbon_kg           numeric(14,3),
  waste_kg            numeric(14,3),
  recycled_kg         numeric(14,3),
  green_mobility_pct  numeric(5,2),
  source_upload_id    uuid,
  created_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (institution_id, period_type, period_start)
);

CREATE INDEX idx_esg_institution_period ON esg_records(institution_id, period_start);


-- ───────────────────────────────────────────────────────────────
-- 12. KPI SNAPSHOTS (materialized cache — computed by Edge Function)
--     One row per institution per domain per period.
--     metrics jsonb shape defined per domain in application code.
-- ───────────────────────────────────────────────────────────────
CREATE TABLE kpi_snapshots (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  domain         kpi_domain NOT NULL,
  period_type    period_type NOT NULL,
  period_start   date NOT NULL,
  period_end     date NOT NULL,
  metrics        jsonb NOT NULL DEFAULT '{}',
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (institution_id, domain, period_type, period_start)
);

CREATE INDEX idx_snapshots_institution_domain ON kpi_snapshots(institution_id, domain);
CREATE INDEX idx_snapshots_period ON kpi_snapshots(period_start, domain);


-- ───────────────────────────────────────────────────────────────
-- 13. UCAR-LEVEL AGGREGATES
--     Cross-institution rollup. per_institution_breakdown removed —
--     derive it by joining kpi_snapshots.
-- ───────────────────────────────────────────────────────────────
CREATE TABLE ucar_kpi_aggregates (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id      uuid NOT NULL REFERENCES organization(id),
  domain               kpi_domain NOT NULL,
  period_type          period_type NOT NULL,
  period_start         date NOT NULL,
  period_end           date NOT NULL,
  institutions_count   int NOT NULL DEFAULT 0,
  aggregated_metrics   jsonb NOT NULL DEFAULT '{}',
  computed_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, domain, period_type, period_start)
);


-- ───────────────────────────────────────────────────────────────
-- 14. ALERTS (unified — institution_id NULL = UCAR-wide)
-- ───────────────────────────────────────────────────────────────
CREATE TABLE alerts (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid NOT NULL REFERENCES organization(id),
  institution_id   uuid REFERENCES institutions(id) ON DELETE CASCADE,
  kpi_domain       kpi_domain NOT NULL,
  kpi_key          text NOT NULL,
  threshold_value  numeric(14,4),
  actual_value     numeric(14,4),
  severity         alert_severity NOT NULL DEFAULT 'medium',
  message          text NOT NULL,
  is_acknowledged  bool NOT NULL DEFAULT false,
  acknowledged_by  uuid REFERENCES profiles(id) ON DELETE SET NULL,
  triggered_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_alerts_institution ON alerts(institution_id, is_acknowledged);
CREATE INDEX idx_alerts_org ON alerts(organization_id, is_acknowledged);
CREATE INDEX idx_alerts_severity ON alerts(severity, triggered_at DESC);


-- ───────────────────────────────────────────────────────────────
-- 15. STRATEGIC GOALS
-- ───────────────────────────────────────────────────────────────
CREATE TABLE strategic_goals (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organization(id),
  institution_id  uuid REFERENCES institutions(id) ON DELETE CASCADE,
  domain          kpi_domain NOT NULL,
  kpi_key         text NOT NULL,
  target_value    numeric(14,4) NOT NULL,
  academic_year   text NOT NULL,
  description     text,
  scope           goal_scope NOT NULL DEFAULT 'institution',
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_goals_institution ON strategic_goals(institution_id, academic_year);


-- ───────────────────────────────────────────────────────────────
-- 16. ANNOUNCEMENTS
-- ───────────────────────────────────────────────────────────────
CREATE TABLE announcements (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organization(id),
  author_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title           text NOT NULL,
  body            text NOT NULL,
  audience        text NOT NULL DEFAULT 'all',  -- 'all','finance','hr', etc.
  is_published    bool NOT NULL DEFAULT false,
  published_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);


-- ───────────────────────────────────────────────────────────────
-- 17. REPORTS
-- ───────────────────────────────────────────────────────────────
CREATE TABLE reports (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organization(id),
  institution_id uuid REFERENCES institutions(id) ON DELETE CASCADE,
  generated_by   uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title          text NOT NULL,
  period_type    period_type NOT NULL,
  period_start   date NOT NULL,
  period_end     date NOT NULL,
  storage_path   text,                         -- Supabase Storage path
  status         report_status NOT NULL DEFAULT 'pending',
  generated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_reports_institution ON reports(institution_id, generated_at DESC);
CREATE INDEX idx_reports_org ON reports(organization_id, generated_at DESC);


-- ───────────────────────────────────────────────────────────────
-- 18. AI DOCUMENT INGESTION
-- ───────────────────────────────────────────────────────────────
CREATE TABLE raw_uploads (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id   uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  uploaded_by      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_name        text NOT NULL,
  file_type        text NOT NULL,              -- 'pdf','xlsx','csv','image'
  storage_path     text NOT NULL,              -- Supabase Storage path
  domain           kpi_domain,                -- which module this doc belongs to
  status           upload_status NOT NULL DEFAULT 'pending',
  extracted_data   jsonb,                      -- raw Claude output before validation
  error_message    text,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_uploads_institution ON raw_uploads(institution_id, status);
CREATE INDEX idx_uploads_status ON raw_uploads(status, created_at);

CREATE TABLE extracted_records (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id         uuid NOT NULL REFERENCES raw_uploads(id) ON DELETE CASCADE,
  institution_id    uuid NOT NULL REFERENCES institutions(id),
  source_table      text NOT NULL,             -- e.g. 'students', 'budget_lines'
  source_record_id  uuid,                      -- FK to the actual inserted row
  raw_extracted     jsonb NOT NULL,            -- what Claude returned for this record
  validation_status validation_status NOT NULL DEFAULT 'valid',
  validation_errors text,
  processed_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_extracted_upload ON extracted_records(upload_id);
CREATE INDEX idx_extracted_institution ON extracted_records(institution_id, source_table);

-- Now add the deferred FK on source tables back to raw_uploads
ALTER TABLE staff    ADD CONSTRAINT fk_staff_upload    FOREIGN KEY (source_upload_id) REFERENCES raw_uploads(id) ON DELETE SET NULL;
ALTER TABLE students ADD CONSTRAINT fk_students_upload FOREIGN KEY (source_upload_id) REFERENCES raw_uploads(id) ON DELETE SET NULL;
ALTER TABLE budget_lines ADD CONSTRAINT fk_budget_upload FOREIGN KEY (source_upload_id) REFERENCES raw_uploads(id) ON DELETE SET NULL;
ALTER TABLE esg_records  ADD CONSTRAINT fk_esg_upload    FOREIGN KEY (source_upload_id) REFERENCES raw_uploads(id) ON DELETE SET NULL;


-- ───────────────────────────────────────────────────────────────
-- 19. KPI VIEWS (computed on demand — never stored)
-- ───────────────────────────────────────────────────────────────

-- Academic KPIs per institution per academic year
CREATE OR REPLACE VIEW v_academic_kpis AS
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

-- Attendance rate per course
CREATE OR REPLACE VIEW v_attendance_kpis AS
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

-- Finance KPIs per institution per fiscal year
CREATE OR REPLACE VIEW v_finance_kpis AS
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

-- Finance KPI with cost_per_student (requires join)
CREATE OR REPLACE VIEW v_finance_kpis_summary AS
SELECT
  bl.institution_id,
  bl.fiscal_year,
  SUM(bl.allocated)                                                        AS total_allocated,
  SUM(bl.consumed)                                                         AS total_consumed,
  ROUND(SUM(bl.consumed) / NULLIF(SUM(bl.allocated), 0) * 100, 2)         AS execution_rate,
  ROUND(SUM(bl.consumed) / NULLIF(COUNT(DISTINCT s.id), 0), 2)            AS cost_per_student
FROM budget_lines bl
LEFT JOIN students s
  ON s.institution_id = bl.institution_id
  AND s.status = 'active'
GROUP BY bl.institution_id, bl.fiscal_year;

-- HR KPIs per institution
CREATE OR REPLACE VIEW v_hr_kpis AS
SELECT
  st.institution_id,
  COUNT(*) FILTER (WHERE st.role_type = 'teaching')      AS teaching_staff_count,
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

-- Research KPIs per institution
CREATE OR REPLACE VIEW v_research_kpis AS
SELECT
  institution_id,
  COUNT(*) FILTER (WHERE status = 'active')              AS active_projects,
  COUNT(*)                                               AS total_projects,
  SUM(publications_count)                                AS total_publications,
  SUM(patents_filed)                                     AS total_patents,
  ROUND(SUM(funding_amount) / 1000, 2)                  AS total_funding_k
FROM research_projects
GROUP BY institution_id;

-- ESG KPIs per institution (latest period)
CREATE OR REPLACE VIEW v_esg_kpis AS
SELECT
  institution_id,
  period_start,
  period_end,
  energy_kwh,
  carbon_kg,
  water_liters,
  waste_kg,
  recycled_kg,
  ROUND(recycled_kg / NULLIF(waste_kg, 0) * 100, 2) AS recycling_rate,
  green_mobility_pct
FROM esg_records
WHERE period_type = 'monthly';


-- ───────────────────────────────────────────────────────────────
-- 20. ROW LEVEL SECURITY
-- ───────────────────────────────────────────────────────────────
ALTER TABLE institutions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff                ENABLE ROW LEVEL SECURITY;
ALTER TABLE absences             ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainings            ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_trainings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE students             ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses              ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records   ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams                ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results         ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_lines         ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_projects    ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnerships         ENABLE ROW LEVEL SECURITY;
ALTER TABLE infrastructure_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE esg_records          ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_snapshots        ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts               ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategic_goals      ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements        ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports              ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_uploads          ENABLE ROW LEVEL SECURITY;
ALTER TABLE extracted_records    ENABLE ROW LEVEL SECURITY;

-- Helper: get current user's role
CREATE OR REPLACE FUNCTION auth_role()
RETURNS user_role LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$;

-- Helper: get current user's institution_id
CREATE OR REPLACE FUNCTION auth_institution_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT institution_id FROM profiles WHERE id = auth.uid()
$$;

-- Helper: is current user super_admin?
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS bool LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'
  )
$$;

-- Generic institution-scoped policy macro (applied per table below)
-- super_admin sees all; others see only their institution

CREATE POLICY "institution_isolation" ON institutions
  FOR ALL USING (
    is_super_admin()
    OR id = auth_institution_id()
  );

CREATE POLICY "profiles_isolation" ON profiles
  FOR ALL USING (
    is_super_admin()
    OR institution_id = auth_institution_id()
    OR id = auth.uid()
  );

-- Macro for all institution-scoped tables
CREATE POLICY "staff_isolation"              ON staff                 FOR ALL USING (is_super_admin() OR institution_id = auth_institution_id());
CREATE POLICY "absences_isolation"           ON absences              FOR ALL USING (is_super_admin() OR institution_id = auth_institution_id());
CREATE POLICY "trainings_isolation"          ON trainings             FOR ALL USING (is_super_admin() OR institution_id = auth_institution_id());
CREATE POLICY "staff_trainings_isolation"    ON staff_trainings       FOR ALL USING (is_super_admin() OR EXISTS (SELECT 1 FROM staff s WHERE s.id = staff_id AND s.institution_id = auth_institution_id()));
CREATE POLICY "students_isolation"           ON students              FOR ALL USING (is_super_admin() OR institution_id = auth_institution_id());
CREATE POLICY "enrollments_isolation"        ON enrollments           FOR ALL USING (is_super_admin() OR institution_id = auth_institution_id());
CREATE POLICY "courses_isolation"            ON courses               FOR ALL USING (is_super_admin() OR institution_id = auth_institution_id());
CREATE POLICY "attendance_isolation"         ON attendance_records    FOR ALL USING (is_super_admin() OR EXISTS (SELECT 1 FROM courses c WHERE c.id = course_id AND c.institution_id = auth_institution_id()));
CREATE POLICY "exams_isolation"              ON exams                 FOR ALL USING (is_super_admin() OR institution_id = auth_institution_id());
CREATE POLICY "exam_results_isolation"       ON exam_results          FOR ALL USING (is_super_admin() OR EXISTS (SELECT 1 FROM exams e WHERE e.id = exam_id AND e.institution_id = auth_institution_id()));
CREATE POLICY "budget_isolation"             ON budget_lines          FOR ALL USING (is_super_admin() OR institution_id = auth_institution_id());
CREATE POLICY "research_isolation"           ON research_projects     FOR ALL USING (is_super_admin() OR institution_id = auth_institution_id());
CREATE POLICY "partnerships_isolation"       ON partnerships          FOR ALL USING (is_super_admin() OR institution_id = auth_institution_id());
CREATE POLICY "assets_isolation"             ON infrastructure_assets FOR ALL USING (is_super_admin() OR institution_id = auth_institution_id());
CREATE POLICY "esg_isolation"                ON esg_records           FOR ALL USING (is_super_admin() OR institution_id = auth_institution_id());
CREATE POLICY "snapshots_isolation"          ON kpi_snapshots         FOR ALL USING (is_super_admin() OR institution_id = auth_institution_id());
CREATE POLICY "alerts_isolation"             ON alerts                FOR ALL USING (is_super_admin() OR institution_id = auth_institution_id());
CREATE POLICY "goals_isolation"              ON strategic_goals       FOR ALL USING (is_super_admin() OR institution_id = auth_institution_id());
CREATE POLICY "announcements_read"           ON announcements         FOR SELECT USING (is_published = true OR is_super_admin());
CREATE POLICY "announcements_write"          ON announcements         FOR ALL USING (is_super_admin() OR author_id = auth.uid());
CREATE POLICY "reports_isolation"            ON reports               FOR ALL USING (is_super_admin() OR institution_id = auth_institution_id());
CREATE POLICY "uploads_isolation"            ON raw_uploads           FOR ALL USING (is_super_admin() OR institution_id = auth_institution_id());
CREATE POLICY "extracted_isolation"          ON extracted_records     FOR ALL USING (is_super_admin() OR institution_id = auth_institution_id());


-- ───────────────────────────────────────────────────────────────
-- 21. SEED: UCAR organization (run once)
-- ───────────────────────────────────────────────────────────────
INSERT INTO organization (name, short_name, city, president_name, contact_email)
VALUES ('Université de Carthage', 'UCAR', 'Tunis', 'Président UCAR', 'admin@ucar.tn')
ON CONFLICT DO NOTHING;