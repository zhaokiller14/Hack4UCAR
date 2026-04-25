# UCAR Intelligence Platform — CLAUDE.md

## What this project is
AI-powered university management platform for the University of Carthage (UCAR).
UCAR governs 30+ affiliated institutions. This platform centralizes their operational,
academic, financial, and ESG data — and surfaces KPIs, anomalies, and reports to
decision-makers at both the institution and UCAR levels.

Built for HACK4UCAR 2025. 24-hour hackathon. Ship what works, skip what doesn't.

---

## Coding behavior guidelines

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

## Stack
- **Framework**: Next.js 15 App Router (TypeScript, strict mode)
- **Database**: Supabase (Postgres + Auth + Storage + Edge Functions)
- **Styling**: Tailwind CSS + shadcn/ui (Radix UI primitives)
- **Icons**: lucide-react
- **Charts**: Recharts — not installed yet, add when building dashboards
- **PDF export**: jsPDF + jspdf-autotable — not installed yet
- **Excel parsing**: xlsx (SheetJS) — not installed yet
- **AI extraction**: TBD
- **Deployment**: Vercel (free tier)

---

## Project structure

Current state: auth scaffolding + DB schema. Domain pages not yet created.

```
/app
  /auth              → login, sign-up, confirm, forgot-password, update-password (all exist)
  /protected         → placeholder post-auth page (will become role-based redirect target)
  /ucar              → NOT YET CREATED (super_admin portal)
  /org               → NOT YET CREATED (institution portal)
  /api               → NOT YET CREATED (API routes)
/components
  /ui                → shadcn/ui primitives
  auth-button.tsx, login-form.tsx, sign-up-form.tsx, etc. (auth forms)
/lib
  /supabase          → client.ts, server.ts, middleware.ts
  utils.ts
/supabase
  /migrations        → 20260425135401_initial-schema.sql (full schema + RLS + views)
/types
  database.ts        → generated Supabase types (npx supabase gen types typescript --local)
```

Planned structure (to be built):
```
/app
  /ucar
    /dashboard       → cross-institution KPI overview
    /institutions    → list + comparison
    /alerts          → unified alert feed
    /reports         → report generation + export
  /org/[institution]
    /dashboard, /academic, /finance, /hr, /research, /partnerships, /esg, /infrastructure, /uploads
  /api
    /kpi, /alerts, /extract, /reports
/components
  /charts, /kpi, /upload, /alerts, /reports
/lib
  /kpi               → KPI formula functions
  /extraction        → Claude prompt builders per domain (TBD)
  /anomaly           → z-score detection logic
  /pdf               → jsPDF report builders
/supabase/functions
  /extract-document, /compute-snapshots, /detect-anomalies
```

---

## Auth and routing rules

After login, check `profiles.role`:
- `super_admin` → redirect to `/ucar/dashboard`
- any other role → redirect to `/org/[institution_id]/dashboard`

Middleware at `middleware.ts` enforces this on every request.
Never trust role from client — always read from Supabase session server-side.

### Role → module access map
| Role | Accessible modules |
|---|---|
| `super_admin` | Everything, all institutions |
| `org_admin` | All modules within own institution |
| `finance_manager` | finance only |
| `hr_manager` | hr only |
| `academic_manager` | academic only |
| `research_manager` | research only |
| `partnerships_manager` | partnerships only |
| `esg_manager` | esg only |
| `infrastructure_manager` | infrastructure only |
| `viewer` | all modules, read-only |

---

## Database rules — READ THIS BEFORE TOUCHING THE DB

### Never do this
```sql
-- WRONG: storing a computed KPI as a column
UPDATE students SET dropout_rate = 11.4 WHERE institution_id = '...';

-- WRONG: querying kpi_ prefixed tables that don't exist
SELECT * FROM kpi_students;
```

### Always do this
```sql
-- RIGHT: compute from source tables via views
SELECT * FROM v_academic_kpis WHERE institution_id = '...' AND academic_year = '2024-2025';

-- RIGHT: use snapshots only for historical trend/anomaly data
SELECT metrics FROM kpi_snapshots
WHERE institution_id = '...' AND domain = 'academic' AND period_start = '2024-10-01';
```

### KPI views available
| View | Computes |
|---|---|
| `v_academic_kpis` | dropout_rate, success_rate, repetition_rate per year |
| `v_attendance_kpis` | attendance_rate per course |
| `v_finance_kpis` | execution_rate, dept breakdown |
| `v_finance_kpis_summary` | execution_rate + cost_per_student |
| `v_hr_kpis` | staff counts, absenteeism_rate, avg teaching load |
| `v_research_kpis` | active projects, publications, patents, funding |
| `v_esg_kpis` | energy, carbon, recycling_rate, green_mobility |

### Source of truth hierarchy
```
raw document (Supabase Storage)
  → extracted_records
    → source tables (students, staff, budget_lines, …)
      → KPI views (computed on demand)
        → kpi_snapshots (monthly cache for trending)
          → ucar_kpi_aggregates (cross-institution rollup)
```

Every source table row has `source_upload_id` FK back to `raw_uploads`.
If an extraction was wrong: delete the upload, re-run. All derived data cascades.

---

## AI extraction pipeline — DESIGN IN PROGRESS

**Do not implement extraction code until the approach is confirmed.**

The DB schema is ready: `raw_uploads` → `extracted_records` → source tables (all with `source_upload_id` FK).
The pipeline mechanism (Edge Functions vs API routes, OCR approach, prompt design) is TBD.

### Domain → target table mapping (valid, matches schema)
| Domain tag on upload | Source table populated |
|---|---|
| `academic` | `students`, `enrollments`, `attendance_records`, `exam_results` |
| `finance` | `budget_lines` |
| `hr` | `staff`, `absences` |
| `research` | `research_projects` |
| `partnerships` | `partnerships` |
| `esg` | `esg_records` |
| `infrastructure` | `infrastructure_assets` |

---

## Anomaly detection

Runs as a scheduled Edge Function (`detect-anomalies`), or triggered after each
`kpi_snapshots` insert.

Algorithm:
1. Load last 12 months of `kpi_snapshots` for a given institution + domain + metric
2. Compute mean and standard deviation across all institutions for that metric + period
3. If `|value - mean| / stddev > 2.0` → create alert with severity:
   - `> 2.0σ` → medium
   - `> 2.5σ` → high
   - `> 3.0σ` → critical
4. Insert into `alerts` table

The threshold and z-score are stored on the alert row so it's fully auditable.

---

## Seeding (no real data — use Faker)

Seed script not yet created. Planned: `npm run seed` via `/scripts/seed.ts`.

Planned anomalies to inject for demo:
- ISSAT Sousse: dropout_rate = 31.4% (network avg ~11%)
- ISET Nabeul: budget execution = 142% (overspend)
- FST Tunis: absenteeism = 19.2% (network avg ~9%)

---

## Commands

```bash
# Dev
npm run dev

# Supabase local
npx supabase start
npx supabase db reset          # re-run all migrations
npx supabase gen types typescript --local > types/database.ts

# Deploy
git push origin main           # Vercel auto-deploys
npx supabase db push           # push migrations to remote
```

---

## Environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=     # server-only, never expose to client
```

---

## What NOT to build (scope cuts for 24h)

- No text-to-SQL / natural language query interface
- No mobile app
- No real-time collaborative editing
- No OAuth / SSO (email+password only)
- No email notification system (alerts are in-app only)
- No Employment module UI (KPIs exist in DB, no frontend page)
- Infrastructure and Partnerships modules: data entry forms only, no complex analytics

---

## Code style

- TypeScript strict — no `any`, no `as unknown`
- Server Components by default; add `'use client'` only when needed
- All DB queries go through `/lib/supabase/server.ts` in Server Components
- Never use `supabase.from()` directly in a page — use a typed query function in `/lib/`
- All currency: Tunisian Dinar (TND), stored as `numeric(14,3)`
- All dates: ISO 8601, stored as `date` or `timestamptz`
- Academic year format: `"2024-2025"` (string, not two columns)
- KPI percentages: stored as 0–100 (not 0–1)