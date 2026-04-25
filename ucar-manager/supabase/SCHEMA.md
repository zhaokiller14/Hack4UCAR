# UCAR Manager Database Schema

This directory contains Supabase migrations and database configuration for the UCAR Manager platform.

---

## Schema Overview

The UCAR Manager database is organized into logical domains to support multi-tenant university management across 30+ affiliated institutions.

### Core Principles

- **Multi-Tenancy**: Institutions are the primary tenant boundary, enforced via `institution_id` and PostgreSQL Row-Level Security (RLS).
- **RBAC**: User roles (`super_admin`, `institution_admin`, `hr_manager`, etc.) determine data visibility and portal access.
- **Immutability**: KPI snapshots are persisted snapshots; they are never recomputed on the fly.
- **Security**: All queries use server-side Supabase clients; RLS policies enforce tenant isolation at the DB layer.

---

## Table Structure

### 1. Top-Level / Governance

#### `organization`
- **Purpose**: Single UCAR organization record (parent of all institutions).
- **Key Fields**: `id`, `name`, `created_at`, `updated_at`
- **Scope**: Organization-wide; not tenant-scoped.

#### `institutions`
- **Purpose**: List of 30+ affiliated universities/schools under UCAR.
- **Key Fields**: `id`, `organization_id` (FK), `name`, `country`, `region`, `created_at`, `updated_at`
- **Scope**: Institution-scoped (tenant boundary).
- **RLS**: Users can only see their own institution.

#### `users`
- **Purpose**: All platform users (authentication + profile + role assignment).
- **Key Fields**: `id` (FK to Supabase Auth), `email`, `role`, `organization_id`, `institution_id`, `created_at`, `updated_at`
- **Roles**: `super_admin`, `institution_admin`, `hr_manager`, `finance_manager`, `academic_manager`, `research_manager`, `partnerships_manager`, `esg_manager`, `infrastructure_manager`, `viewer`
- **RLS**: Users can only see their own profile; institution roles scoped to their institution.

---

### 2. Academic Domain

#### `students`
- **Purpose**: Student records per institution.
- **Key Fields**: `id`, `institution_id` (FK), `first_name`, `last_name`, `email`, `enrollment_status`, `date_of_birth`, `created_at`, `updated_at`
- **Scope**: Institution-scoped.
- **RLS**: Visible to academic managers and admins of the same institution.

#### `enrollments`
- **Purpose**: Per-semester/academic-year enrollment status.
- **Key Fields**: `id`, `student_id` (FK), `institution_id` (FK), `academic_year`, `semester`, `status` (enrolled, graduated, dropped), `created_at`, `updated_at`
- **Scope**: Institution-scoped.

#### `courses`
- **Purpose**: Courses offered at an institution.
- **Key Fields**: `id`, `institution_id` (FK), `code`, `title`, `credits`, `teacher_id` (FK to `staff`), `created_at`, `updated_at`
- **Scope**: Institution-scoped.

#### `attendance_records`
- **Purpose**: Per-student per-course session attendance tracking.
- **Key Fields**: `id`, `student_id` (FK), `course_id` (FK), `session_date`, `status` (present, absent, late), `created_at`, `updated_at`
- **Scope**: Institution-scoped (via course + student).

#### `exams`
- **Purpose**: Exam definitions per course.
- **Key Fields**: `id`, `course_id` (FK), `title`, `exam_date`, `duration_minutes`, `created_at`, `updated_at`
- **Scope**: Institution-scoped.

#### `exam_results`
- **Purpose**: Per-student exam scores and grades.
- **Key Fields**: `id`, `exam_id` (FK), `student_id` (FK), `score`, `grade`, `created_at`, `updated_at`
- **Scope**: Institution-scoped.

---

### 3. HR Domain

#### `staff`
- **Purpose**: All staff (teaching + administrative) per institution.
- **Key Fields**: `id`, `institution_id` (FK), `first_name`, `last_name`, `email`, `position`, `department`, `hire_date`, `created_at`, `updated_at`
- **Scope**: Institution-scoped.
- **RLS**: Visible to HR managers and admins of the same institution.

#### `absences`
- **Purpose**: Absence records per staff member.
- **Key Fields**: `id`, `staff_id` (FK), `absence_date`, `type` (sick, vacation, unpaid), `reason`, `created_at`, `updated_at`
- **Scope**: Institution-scoped.

#### `trainings`
- **Purpose**: Training programs offered at an institution.
- **Key Fields**: `id`, `institution_id` (FK), `title`, `description`, `start_date`, `end_date`, `created_at`, `updated_at`
- **Scope**: Institution-scoped.

#### `staff_trainings`
- **Purpose**: Many-to-many: which staff completed which training.
- **Key Fields**: `id`, `staff_id` (FK), `training_id` (FK), `completion_date`, `certification_status`, `created_at`, `updated_at`
- **Scope**: Institution-scoped (via staff + training).

---

### 4. Finance Domain

#### `budget_lines`
- **Purpose**: Budget allocation and consumption per department/category/fiscal year.
- **Key Fields**: `id`, `institution_id` (FK), `fiscal_year`, `category`, `department`, `allocated_amount`, `spent_amount`, `created_at`, `updated_at`
- **Scope**: Institution-scoped.
- **RLS**: Visible to finance managers and admins of the same institution.

---

---

### 5. Finance Domain (extended)

#### `external_fundings`
- **Purpose**: External funding sources per institution and fiscal year (grants, partnerships, public subsidies, etc.).
- **Key Fields**: `id`, `institution_id` (FK), `name`, `source_type`, `description`, `amount` (TND, numeric 14,3), `fiscal_year`, `source_upload_id` (FK to `raw_uploads`), `created_at`
- **Scope**: Institution-scoped.
- **RLS**: `ext_fundings_isolation` — visible to super admins or users of the same institution.
- **View impact**: `v_finance_kpis_summary` is updated to include `total_external_income`, `funding_sources_count`, `self_financing_rate` (external / consumed × 100), and `total_income` (allocated + external).

---

### 5b. Employment Domain

#### `student_jobs`
- **Purpose**: Post-graduation employment records for employability KPI tracking.
- **Key Fields**: `id`, `student_id` (FK to `students`), `institution_id` (FK), `employment_date`, `job_country` (default `'TN'`), `created_at`
- **Scope**: Institution-scoped.
- **RLS**: `student_jobs_isolation` — visible to super admins or users of the same institution.
- **Constraint**: `employment_date` must be ≥ `graduation_date` (enforced via trigger `trg_employment_after_graduation`).

#### `v_employment_kpis` (view)
- **Purpose**: Computes employment KPIs per institution from `students` and `student_jobs`.
- **Columns**: `institution_id`, `total_graduated`, `employed_count`, `employability_rate`, `national_employed_count`, `national_employment_rate`, `international_employed_count`, `international_employment_rate`, `avg_days_to_employ`
- **National**: `job_country = 'TN'` — **International**: `job_country <> 'TN'`

---

### 6. Research Domain

#### `research_projects`
- **Purpose**: Research projects with funding, publications, and patent tracking.
- **Key Fields**: `id`, `institution_id` (FK), `title`, `pi_name`, `funding_amount`, `start_date`, `end_date`, `publication_count`, `patent_count`, `created_at`, `updated_at`
- **Scope**: Institution-scoped.
- **RLS**: Visible to research managers and admins of the same institution.

---

### 7. Partnerships Domain

#### `partnerships`
- **Purpose**: Partner agreements and student mobility numbers.
- **Key Fields**: `id`, `institution_id` (FK), `partner_name`, `country`, `agreement_type`, `student_mobility_in`, `student_mobility_out`, `start_date`, `end_date`, `created_at`, `updated_at`
- **Scope**: Institution-scoped.
- **RLS**: Visible to partnerships managers and admins of the same institution.

---

### 8. Infrastructure Domain

#### `infrastructure_assets`
- **Purpose**: Classrooms, labs, equipment with occupancy and status.
- **Key Fields**: `id`, `institution_id` (FK), `asset_type` (classroom, lab, equipment), `location`, `capacity`, `current_occupancy`, `status` (available, maintenance, retired), `created_at`, `updated_at`
- **Scope**: Institution-scoped.

---

### 9. ESG Domain

#### `esg_records`
- **Purpose**: Energy, water, carbon, waste, recycling per reporting period.
- **Key Fields**: `id`, `institution_id` (FK), `reporting_period`, `energy_kwh`, `water_liters`, `carbon_tons`, `waste_kg`, `recycled_kg`, `created_at`, `updated_at`
- **Scope**: Institution-scoped.
- **RLS**: Visible to ESG managers and admins of the same institution.

---

### 10. KPI & Reporting Layer

#### `kpi_snapshots`
- **Purpose**: Container for a KPI snapshot (domain + period + institution).
- **Key Fields**: `id`, `institution_id` (FK), `domain` (academic, finance, hr, research, esg), `reporting_period`, `snapshot_date`, `created_at`
- **Scope**: Institution-scoped.
- **Notes**: Immutable; KPIs are never recomputed on the fly from source data.

#### `academic_kpis`
- **Purpose**: Typed KPI values for academic domain (one-to-one with `kpi_snapshots`).
- **Key Fields**: `id`, `kpi_snapshot_id` (FK), `student_count`, `enrollment_rate`, `graduation_rate`, `attendance_average`, `exam_pass_rate`, `created_at`
- **Scope**: Institution-scoped.

#### `finance_kpis`
- **Purpose**: Typed KPI values for finance domain.
- **Key Fields**: `id`, `kpi_snapshot_id` (FK), `total_budget`, `spent_budget`, `budget_utilization_percent`, `cost_per_student`, `created_at`
- **Scope**: Institution-scoped.

#### `hr_kpis`
- **Purpose**: Typed KPI values for HR domain.
- **Key Fields**: `id`, `kpi_snapshot_id` (FK), `total_staff`, `average_salary`, `staff_retention_rate`, `absence_rate`, `training_hours_per_staff`, `created_at`
- **Scope**: Institution-scoped.

#### `research_kpis`
- **Purpose**: Typed KPI values for research domain.
- **Key Fields**: `id`, `kpi_snapshot_id` (FK), `active_projects`, `total_funding`, `publications_count`, `patent_count`, `created_at`
- **Scope**: Institution-scoped.

#### `esg_kpis`
- **Purpose**: Typed KPI values for ESG domain.
- **Key Fields**: `id`, `kpi_snapshot_id` (FK), `energy_per_capita`, `water_per_capita`, `carbon_per_capita`, `recycling_rate`, `created_at`
- **Scope**: Institution-scoped.

#### `ucar_kpi_aggregates`
- **Purpose**: Cross-institution aggregated KPIs for UCAR admin view.
- **Key Fields**: `id`, `organization_id` (FK), `reporting_period`, `metric_name`, `metric_value`, `institution_count`, `created_at`
- **Scope**: Organization-scoped (not tenant-scoped); visible only to UCAR admins.
- **Notes**: Aggregated from institution-level KPI snapshots.

#### `strategic_goals`
- **Purpose**: Target KPI values set by UCAR or institution admins.
- **Key Fields**: `id`, `organization_id` or `institution_id` (FK), `domain`, `metric_name`, `target_value`, `fiscal_year`, `owner`, `created_at`, `updated_at`
- **Scope**: Organization or institution-scoped depending on owner.
- **RLS**: Visible to admins at the same level.

---

### 11. Alerts & Reports

#### `alerts`
- **Purpose**: Institution-level KPI threshold alerts (triggered when KPI deviates from strategic goal).
- **Key Fields**: `id`, `institution_id` (FK), `metric_name`, `current_value`, `threshold_value`, `severity` (low, medium, high), `resolved`, `created_at`, `resolved_at`
- **Scope**: Institution-scoped.
- **RLS**: Visible to admins and relevant domain managers of the same institution.

#### `ucar_alerts`
- **Purpose**: Organization-level alerts (cross-institution anomalies).
- **Key Fields**: `id`, `organization_id` (FK), `metric_name`, `anomaly_type`, `affected_institutions`, `severity`, `resolved`, `created_at`, `resolved_at`
- **Scope**: Organization-scoped; visible only to UCAR admins.

#### `reports`
- **Purpose**: Generated reports per institution.
- **Key Fields**: `id`, `institution_id` (FK), `report_type` (academic, finance, hr, research, esg), `generated_by`, `content_url` (S3/Storage), `generated_at`, `created_at`
- **Scope**: Institution-scoped.
- **RLS**: Visible to relevant domain managers and admins of the same institution.

#### `ucar_reports`
- **Purpose**: Generated reports at UCAR level (cross-institution).
- **Key Fields**: `id`, `organization_id` (FK), `report_type`, `generated_by`, `content_url`, `generated_at`, `created_at`
- **Scope**: Organization-scoped; visible only to UCAR admins.

---

### 12. AI & Data Ingestion

#### `raw_uploads`
- **Purpose**: Files uploaded for AI extraction (PDFs, Excel, images).
- **Key Fields**: `id`, `institution_id` (FK), `file_name`, `file_type`, `file_url` (Supabase Storage), `upload_date`, `status` (pending, processing, completed, failed), `created_at`
- **Scope**: Institution-scoped.
- **RLS**: Visible to admins of the same institution.

#### `extracted_records`
- **Purpose**: Structured records extracted from raw uploads via AI OCR/extraction.
- **Key Fields**: `id`, `raw_upload_id` (FK), `institution_id` (FK), `record_type` (student, staff, exam, etc.), `data_json`, `validated`, `created_at`
- **Scope**: Institution-scoped.
- **RLS**: Visible to admins of the same institution; validated records may be visible to domain managers.

#### `ai_conversations`
- **Purpose**: Chat history for the NL query interface (text-to-SQL).
- **Key Fields**: `id`, `user_id` (FK to `users`), `institution_id` (FK), `query_text`, `generated_sql`, `result_json`, `conversation_turn`, `created_at`
- **Scope**: Institution-scoped.
- **RLS**: Visible only to the user who made the query.

---

### 13. Communication

#### `announcements`
- **Purpose**: UCAR-level announcements broadcast to all institutions.
- **Key Fields**: `id`, `organization_id` (FK), `title`, `content`, `author_id` (FK to `users`), `published_date`, `created_at`, `updated_at`
- **Scope**: Organization-scoped; visible to all authenticated users.

---

## Row-Level Security (RLS) Policies

All tables scoped to `institution_id` have RLS policies that:
1. Check that the current authenticated user's `institution_id` matches the record's `institution_id`.
2. Enforce role-based read/write access (e.g., only `finance_manager` can edit `budget_lines`).

Organization-scoped tables have policies that:
1. Check that the current authenticated user has `role = 'ucar_admin'`.

**Important**: RLS is the source of truth for data isolation. Frontend filtering alone is not sufficient.

---

## Migrations

All schema changes are tracked in the `migrations/` directory and applied via Supabase CLI:

```bash
supabase migration list
supabase migration pull
supabase migration push
```

After adding a new migration, regenerate TypeScript types:

```bash
supabase gen types typescript --project-id <YOUR_PROJECT_ID> > ../types/database.ts
```

---

## Key Conventions

- **Immutability of KPI Snapshots**: KPI values are never recomputed on the fly; they are always fetched from snapshot tables.
- **Server-Side Queries**: All Supabase queries use the server client from `lib/supabase/server.ts`.
- **Tenant-First Design**: Every query filters by the current user's `institution_id` or validates role.
- **No Pre-Existing Data Bypass**: No service-role keys in user-facing API routes; all queries respect RLS.

---

## Future Extensions

- **Audit Logging**: Add audit tables to track data changes for compliance.
- **Time-Series Analytics**: Consider partitioning large tables (e.g., `attendance_records`, `esg_records`) by time.
- **Data Retention**: Define retention policies for transient tables (e.g., raw uploads, AI conversations).
