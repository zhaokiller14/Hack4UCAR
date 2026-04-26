# UCAR Manager

AI-powered university management platform for the University of Carthage (UCAR).

Built for **HACK4UCAR 2025**.

---

## Overview

The University of Carthage governs 30+ affiliated institutions (ISET, ISSAT, FST, …) spread across Tunisia. Each institution manages its own academic, financial, HR, research, ESG, and infrastructure data — but until now there was no unified view of the network.

**UCAR Manager** solves this in two layers:

**Institution portal** — each institution's staff uploads source documents (Excel, PDF). An AI pipeline (n8n + LLM) extracts structured entities, which an admin reviews and commits to the database. Domain dashboards then surface live KPIs: dropout rates, budget execution, absenteeism, research output, ESG metrics, and more.

**UCAR portal** — the central administration gets a cross-institution view: aggregated KPIs, anomaly alerts (z-score based), strategic goals, announcements, and the ability to compare institutions side by side.

Key capabilities:
- Document ingestion with human-in-the-loop review before any data is committed
- Automatic anomaly detection flagging institutions that deviate significantly from the network average
- Role-based access control — each staff member sees only what their role permits, enforced at the database level via RLS
- All KPIs computed on demand from source tables — no stale cached columns

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 App Router (TypeScript strict) |
| Database | Supabase (Postgres + Auth + Storage) |
| Styling | Tailwind CSS + shadcn/ui |
| Charts | Recharts |

---

## Getting Started

**Prerequisites:** Node.js 18+, Supabase CLI

```bash
cd ucar-manager

# Install dependencies
npm install

# Copy and fill environment variables
cp .env.example .env.local

# Run dev server
npm run dev
```

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
N8N_DATA_INGEST_WEBHOOK_URL=
```

---

## Project Structure

```
ucar-manager/
  app/
    auth/           → login, sign-up, password flows
    ucar/           → super_admin portal (dashboard, institutions, alerts, reports, goals, announcements)
    institution/    → institution portal (academic, finance, hr, research, esg, infrastructure, partnerships, reports, uploads)
    api/            → API routes (uploads, AI extraction, CRUD)
  components/
    ui/             → shadcn/ui primitives
    institution/    → institution-specific components
    shared/         → reusable components (DataTable, SectionCard, etc.)
  lib/
    data/           → typed Supabase query functions (server-side)
    actions/        → Next.js Server Actions
    auth/           → guards and role helpers
    alerts/         → anomaly detection (z-score)
  supabase/
    migrations/     → full schema, RLS policies, KPI views
    SCHEMA.md       → database schema reference
```

---

## Auth & Roles

After login, users are redirected based on role:

| Role | Redirect |
|---|---|
| `super_admin` | `/ucar/dashboard` |
| all others | `/institution/dashboard` |

Institution-scoped roles (`institution_admin`, `finance_manager`, `hr_manager`, etc.) can only access their own institution's data — enforced server-side via RLS.

---

## AI Extraction Pipeline

1. File uploaded to Supabase Storage → `raw_uploads` row created
2. Signed URL sent to n8n webhook → LLM extracts entities and relations
3. Normalized payload stored in `raw_uploads.extracted_data`
4. User reviews extracted entities in the UI
5. Confirmed entities inserted into target source tables via `PUT /api/ai/extract`

---

## KPI Views

KPIs are computed on demand from source tables — never stored as columns.

| View | Domain |
|---|---|
| `v_academic_kpis` | dropout, success, repetition rates |
| `v_finance_kpis` | budget execution rate |
| `v_hr_kpis` | staff counts, absenteeism, teaching load |
| `v_research_kpis` | projects, publications, patents, funding |
| `v_esg_kpis` | energy, carbon, recycling, green mobility |

Historical snapshots are cached in `kpi_snapshots` for trend and anomaly detection.
