# AGENTS.md

Behavioral guidelines for coding agents working on UCAR Manager.

These rules bias toward correctness and tenant safety over speed. For trivial tasks, use judgment.

## Project Context

UCAR Manager is a multi-tenant, AI-powered university management platform for the University of Carthage (UCAR), covering 30+ affiliated institutions.

### Product Scope

- Two portals:
  - UCAR Admin Portal (`/ucar/*`) for cross-institution governance and aggregates.
  - Institution Portal (`/institution/*`) for institution-scoped operations.
- Core domains: academic, HR, finance, research, partnerships, infrastructure, ESG.
- KPI stack: institution snapshots plus UCAR-level aggregates, goals, alerts, and reports.

### Technical Stack

- Frontend: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui.
- Backend platform: Supabase (PostgreSQL, Auth, RLS, Storage).
- AI services: Python + FastAPI (called from Next.js server routes/actions).

### Role Model

- `ucar_admin`: UCAR-wide role with organization-level visibility.
- Institution roles: `admin`, `hr_manager`, `finance_manager`, `academic_manager`, `research_manager`, `partnerships_manager`, `esg_manager`.
- Users are scoped by `organization_id` and/or `institution_id` via platform data model and DB policies.

### Core Data Model (High-Level)

- Governance: `organization`, `institutions`, `users`, `strategic_goals`, `announcements`.
- Institutional operations: `students`, `enrollments`, `courses`, `attendance_records`, `exams`, `exam_results`, `staff`, `absences`, `trainings`, `staff_trainings`, `budget_lines`, `research_projects`, `partnerships`, `infrastructure_assets`, `esg_records`.
- KPI and reporting: `kpi_snapshots`, domain KPI tables, `alerts`, `reports`, `ucar_kpi_aggregates`, `ucar_alerts`, `ucar_reports`.
- AI pipeline: `raw_uploads`, `extracted_records`, `ai_conversations`.

### Mandatory Architectural Conventions

- Use Supabase server client in server contexts; browser client only in client components.
- Enforce tenant isolation with PostgreSQL RLS, not frontend filtering.
- Keep auth/session refresh and redirect checks in middleware/proxy path.
- Call FastAPI only from server-side Next.js endpoints.
- Compute KPI snapshots server-side and persist them.
- Regenerate `types/database.ts` after schema changes.

## 1. Think Before Coding

Do not assume. Surface uncertainty and tradeoffs before implementation.

Before changing code:
- State assumptions explicitly.
- If multiple valid interpretations exist, present them instead of choosing silently.
- Prefer the simplest working approach and say when a simpler path exists.
- If requirements are ambiguous, stop and ask.

## 2. Simplicity First

Implement the minimum needed to satisfy the request.

- Do not add features that were not requested.
- Do not introduce abstractions for one-time usage.
- Do not add configurability unless required.
- Keep code small and direct.
- If a solution feels overengineered, simplify it.

## 3. Surgical Changes

Touch only what is required by the task.

When editing existing code:
- Do not refactor unrelated areas.
- Do not reformat unrelated files.
- Match existing style and conventions.
- If you notice unrelated issues, mention them but do not fix without request.

When your changes create unused code:
- Remove only unused imports/variables/functions caused by your own edits.
- Leave pre-existing dead code unchanged unless asked.

## 4. Goal-Driven Execution

Define verifiable success criteria and iterate until they pass.

For non-trivial tasks, use a short plan:

1. Implement the smallest change.
2. Verify with focused checks (typecheck/tests/lint as relevant).
3. Confirm behavior and stop when done.

Translate vague requests into checks:
- "Fix bug" -> add or run a reproduction check, then validate fix.
- "Add validation" -> cover invalid paths and verify expected errors.
- "Refactor" -> preserve behavior and prove via existing tests/checks.

## 5. UCAR Architecture Guardrails (Required)

These are project-specific constraints and must be enforced.

### 5.1 RBAC and Routing

- Authenticate with Supabase Auth session first.
- Resolve role from platform data model (`users` table semantics).
- Redirect by role:
  - `ucar_admin` -> `/ucar/dashboard`
  - Institution roles -> `/institution/dashboard`
  - Unauthenticated -> `/auth/login`
- Never expose UCAR-wide data to institution-scoped users.

### 5.2 Multi-Tenancy and Data Isolation

- Treat `institution_id` as a hard tenant boundary.
- Rely on PostgreSQL RLS as the source of truth for isolation.
- Never rely on frontend-only filtering for tenant safety.
- Avoid service-role usage in user-path requests unless explicitly required and justified.

### 5.3 Supabase Client Usage

- Use server Supabase client in Server Components, Route Handlers, and Server Actions.
- Use browser Supabase client only in Client Components (for UI and realtime needs).
- Keep auth/session refresh flow in proxy/middleware path intact.

### 5.4 AI Service Integration

- FastAPI must be called from Next.js server-side endpoints only.
- Do not call AI microservice directly from the browser for privileged operations.
- Keep API keys and sensitive credentials server-side.
- Enforce institution scoping in text-to-SQL and extraction workflows.

### 5.5 KPI and Reporting

- Compute KPI snapshots server-side and persist them.
- Do not compute authoritative KPIs on the fly in frontend pages.
- Use snapshot and aggregate tables for dashboards and reports.

### 5.6 Schema and Types Hygiene

- After schema changes, regenerate Supabase TypeScript types.
- Keep query code aligned with generated types to avoid drift.

## 6. Verification Checklist Before Finishing

Before marking a task complete:
- Confirm tenant boundaries are preserved.
- Confirm role-based redirects and authorization logic still hold.
- Run relevant validation (tests, lint, typecheck, or targeted checks).
- Confirm no unrelated files were modified.
- Summarize what changed and why.

---

These guidelines are working when diffs are small, behavior is clearly verified, and no tenant-safety or RBAC regressions are introduced.
