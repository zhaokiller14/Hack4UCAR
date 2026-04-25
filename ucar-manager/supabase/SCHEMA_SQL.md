-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.absences (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL,
  institution_id uuid NOT NULL,
  absence_date date NOT NULL,
  reason text,
  justified boolean NOT NULL DEFAULT false,
  recorded_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT absences_pkey PRIMARY KEY (id),
  CONSTRAINT absences_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(id),
  CONSTRAINT absences_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id)
);
CREATE TABLE public.alerts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  institution_id uuid,
  kpi_domain USER-DEFINED NOT NULL,
  kpi_key text NOT NULL,
  threshold_value numeric,
  actual_value numeric,
  severity USER-DEFINED NOT NULL DEFAULT 'medium'::alert_severity,
  message text NOT NULL,
  is_acknowledged boolean NOT NULL DEFAULT false,
  acknowledged_by uuid,
  triggered_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT alerts_pkey PRIMARY KEY (id),
  CONSTRAINT alerts_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organization(id),
  CONSTRAINT alerts_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id),
  CONSTRAINT alerts_acknowledged_by_fkey FOREIGN KEY (acknowledged_by) REFERENCES public.users(id)
);
CREATE TABLE public.announcements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  author_id uuid NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  audience text NOT NULL DEFAULT 'all'::text,
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT announcements_pkey PRIMARY KEY (id),
  CONSTRAINT announcements_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organization(id),
  CONSTRAINT announcements_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id)
);
CREATE TABLE public.attendance_records (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  course_id uuid NOT NULL,
  session_date date NOT NULL,
  present boolean NOT NULL DEFAULT false,
  note text,
  CONSTRAINT attendance_records_pkey PRIMARY KEY (id),
  CONSTRAINT attendance_records_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id),
  CONSTRAINT attendance_records_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.budget_lines (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL,
  fiscal_year text NOT NULL,
  department text NOT NULL,
  category text NOT NULL,
  allocated numeric NOT NULL DEFAULT 0,
  consumed numeric NOT NULL DEFAULT 0,
  description text,
  source_upload_id uuid,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT budget_lines_pkey PRIMARY KEY (id),
  CONSTRAINT budget_lines_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id),
  CONSTRAINT fk_budget_upload FOREIGN KEY (source_upload_id) REFERENCES public.raw_uploads(id)
);
CREATE TABLE public.courses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL,
  staff_id uuid,
  code text,
  title text NOT NULL,
  specialization text,
  year_level integer,
  credits numeric,
  semester text,
  academic_year text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT courses_pkey PRIMARY KEY (id),
  CONSTRAINT courses_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id),
  CONSTRAINT courses_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(id)
);
CREATE TABLE public.enrollments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  institution_id uuid NOT NULL,
  academic_year text NOT NULL,
  semester text,
  specialization text,
  status USER-DEFINED NOT NULL DEFAULT 'enrolled'::enrollment_status,
  repeated_year boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT enrollments_pkey PRIMARY KEY (id),
  CONSTRAINT enrollments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id),
  CONSTRAINT enrollments_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id)
);
CREATE TABLE public.esg_records (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL,
  period_type USER-DEFINED NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  energy_kwh numeric,
  water_liters numeric,
  carbon_kg numeric,
  waste_kg numeric,
  recycled_kg numeric,
  green_mobility_pct numeric,
  source_upload_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT esg_records_pkey PRIMARY KEY (id),
  CONSTRAINT esg_records_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id),
  CONSTRAINT fk_esg_upload FOREIGN KEY (source_upload_id) REFERENCES public.raw_uploads(id)
);
CREATE TABLE public.exam_results (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL,
  student_id uuid NOT NULL,
  score numeric,
  passed boolean,
  absent boolean NOT NULL DEFAULT false,
  note text,
  CONSTRAINT exam_results_pkey PRIMARY KEY (id),
  CONSTRAINT exam_results_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES public.exams(id),
  CONSTRAINT exam_results_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id)
);
CREATE TABLE public.exams (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL,
  institution_id uuid NOT NULL,
  type text NOT NULL,
  exam_date date,
  max_score numeric NOT NULL DEFAULT 20,
  academic_year text NOT NULL,
  semester text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT exams_pkey PRIMARY KEY (id),
  CONSTRAINT exams_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
  CONSTRAINT exams_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id)
);
CREATE TABLE public.extracted_records (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  upload_id uuid NOT NULL,
  institution_id uuid NOT NULL,
  source_table text NOT NULL,
  source_record_id uuid,
  raw_extracted jsonb NOT NULL,
  validation_status USER-DEFINED NOT NULL DEFAULT 'valid'::validation_status,
  validation_errors text,
  processed_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT extracted_records_pkey PRIMARY KEY (id),
  CONSTRAINT extracted_records_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES public.raw_uploads(id),
  CONSTRAINT extracted_records_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id)
);
CREATE TABLE public.infrastructure_assets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL,
  asset_type text NOT NULL,
  name text NOT NULL,
  location text,
  capacity integer,
  status USER-DEFINED NOT NULL DEFAULT 'operational'::asset_status,
  last_maintenance date,
  reported_occupancy_pct numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT infrastructure_assets_pkey PRIMARY KEY (id),
  CONSTRAINT infrastructure_assets_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id)
);
CREATE TABLE public.institutions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  city text NOT NULL,
  president_name text,
  contact_email text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT institutions_pkey PRIMARY KEY (id),
  CONSTRAINT institutions_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organization(id)
);
CREATE TABLE public.kpi_snapshots (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL,
  domain USER-DEFINED NOT NULL,
  period_type USER-DEFINED NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT kpi_snapshots_pkey PRIMARY KEY (id),
  CONSTRAINT kpi_snapshots_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id)
);
CREATE TABLE public.organization (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  short_name text NOT NULL,
  country text NOT NULL DEFAULT 'Tunisia'::text,
  city text NOT NULL,
  president_name text,
  contact_email text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT organization_pkey PRIMARY KEY (id)
);
CREATE TABLE public.partnerships (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL,
  partner_name text NOT NULL,
  partner_country text,
  type text NOT NULL,
  start_date date,
  end_date date,
  is_active boolean NOT NULL DEFAULT true,
  scope text,
  outgoing_students integer NOT NULL DEFAULT 0,
  incoming_students integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT partnerships_pkey PRIMARY KEY (id),
  CONSTRAINT partnerships_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id)
);
CREATE TABLE public.raw_uploads (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL,
  uploaded_by uuid NOT NULL,
  file_name text NOT NULL,
  file_type text NOT NULL,
  storage_path text NOT NULL,
  domain USER-DEFINED,
  status USER-DEFINED NOT NULL DEFAULT 'pending'::upload_status,
  extracted_data jsonb,
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT raw_uploads_pkey PRIMARY KEY (id),
  CONSTRAINT raw_uploads_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id),
  CONSTRAINT raw_uploads_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id)
);
CREATE TABLE public.reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid,
  institution_id uuid,
  generated_by uuid NOT NULL,
  title text NOT NULL,
  period_type USER-DEFINED NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  storage_path text,
  status USER-DEFINED NOT NULL DEFAULT 'pending'::report_status,
  generated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT reports_pkey PRIMARY KEY (id),
  CONSTRAINT reports_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organization(id),
  CONSTRAINT reports_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id),
  CONSTRAINT reports_generated_by_fkey FOREIGN KEY (generated_by) REFERENCES public.users(id)
);
CREATE TABLE public.research_projects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL,
  title text NOT NULL,
  lead_researcher text,
  funding_amount numeric,
  funding_source text,
  start_date date,
  end_date date,
  status text NOT NULL DEFAULT 'active'::text,
  publications_count integer NOT NULL DEFAULT 0,
  patents_filed integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT research_projects_pkey PRIMARY KEY (id),
  CONSTRAINT research_projects_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id)
);
CREATE TABLE public.staff (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL,
  employee_code text,
  full_name text NOT NULL,
  email text,
  phone text,
  role_type USER-DEFINED NOT NULL,
  department text,
  contract_type USER-DEFINED,
  teaching_hours_week numeric,
  hire_date date,
  is_active boolean NOT NULL DEFAULT true,
  source_upload_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT staff_pkey PRIMARY KEY (id),
  CONSTRAINT staff_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id),
  CONSTRAINT fk_staff_upload FOREIGN KEY (source_upload_id) REFERENCES public.raw_uploads(id)
);
CREATE TABLE public.staff_trainings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL,
  training_id uuid NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  completion_date date,
  CONSTRAINT staff_trainings_pkey PRIMARY KEY (id),
  CONSTRAINT staff_trainings_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(id),
  CONSTRAINT staff_trainings_training_id_fkey FOREIGN KEY (training_id) REFERENCES public.trainings(id)
);
CREATE TABLE public.strategic_goals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  institution_id uuid,
  domain USER-DEFINED NOT NULL,
  kpi_key text NOT NULL,
  target_value numeric NOT NULL,
  academic_year text NOT NULL,
  description text,
  scope USER-DEFINED NOT NULL DEFAULT 'institution'::goal_scope,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT strategic_goals_pkey PRIMARY KEY (id),
  CONSTRAINT strategic_goals_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organization(id),
  CONSTRAINT strategic_goals_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id)
);
CREATE TABLE public.students (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL,
  student_code text,
  full_name text NOT NULL,
  email text,
  phone text,
  birth_date date,
  gender text,
  specialization text,
  current_year integer,
  status USER-DEFINED NOT NULL DEFAULT 'active'::student_status,
  enrollment_date date,
  graduation_date date,
  source_upload_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT students_pkey PRIMARY KEY (id),
  CONSTRAINT students_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id),
  CONSTRAINT fk_students_upload FOREIGN KEY (source_upload_id) REFERENCES public.raw_uploads(id)
);
CREATE TABLE public.trainings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL,
  title text NOT NULL,
  provider text,
  start_date date,
  end_date date,
  duration_hours integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT trainings_pkey PRIMARY KEY (id),
  CONSTRAINT trainings_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id)
);
CREATE TABLE public.ucar_kpi_aggregates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  domain USER-DEFINED NOT NULL,
  period_type USER-DEFINED NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  institutions_count integer NOT NULL DEFAULT 0,
  aggregated_metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  computed_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT ucar_kpi_aggregates_pkey PRIMARY KEY (id),
  CONSTRAINT ucar_kpi_aggregates_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organization(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL,
  organization_id uuid NOT NULL,
  institution_id uuid,
  full_name text NOT NULL,
  role USER-DEFINED NOT NULL DEFAULT 'viewer'::user_role,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id),
  CONSTRAINT profiles_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organization(id),
  CONSTRAINT profiles_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id)
);