import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

const CRUD_TABLES = {
  organization: { superAdminOnly: true },
  ucar_kpi_aggregates: { superAdminOnly: true },
  institutions: {},
  profiles: {},
  staff: {},
  absences: {},
  trainings: {},
  staff_trainings: {},
  students: {},
  enrollments: {},
  courses: {},
  attendance_records: {},
  exams: {},
  exam_results: {},
  budget_lines: {},
  research_projects: {},
  partnerships: {},
  infrastructure_assets: {},
  esg_records: {},
  kpi_snapshots: {},
  alerts: {},
  strategic_goals: {},
  announcements: {},
  reports: {},
  raw_uploads: {},
  extracted_records: {},
} as const;

export type CrudTable = keyof typeof CRUD_TABLES;

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 500;

// TODO: Add per-table RBAC and field-level validation once endpoints stabilize.

export class CrudError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function getCrudTable(table: string): CrudTable | null {
  if (table in CRUD_TABLES) {
    return table as CrudTable;
  }

  return null;
}

export function isSuperAdminOnly(table: CrudTable): boolean {
  return Boolean(CRUD_TABLES[table].superAdminOnly);
}

export async function getAuthedSupabase() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    throw new CrudError("Unauthorized.", 401);
  }

  return { supabase, user: data.user };
}

export async function requireSuperAdmin(supabase: SupabaseClient) {
  const { data, error } = await supabase.rpc("is_super_admin");

  if (error) {
    throw new CrudError(error.message, 403);
  }

  if (!data) {
    throw new CrudError("Forbidden.", 403);
  }
}

export function parseListParams(url: URL) {
  const select = url.searchParams.get("select") ?? "*";
  const limit = clampInt(url.searchParams.get("limit"), DEFAULT_LIMIT, 1, MAX_LIMIT);
  const offset = clampInt(url.searchParams.get("offset"), 0, 0, Number.MAX_SAFE_INTEGER);
  const order = url.searchParams.get("order");
  const ascending = url.searchParams.get("ascending") !== "false";

  return { select, limit, offset, order, ascending };
}

export function parseIdParam(url: URL) {
  const id = url.searchParams.get("id");

  if (!id) {
    return null;
  }

  const trimmed = id.trim();

  return trimmed.length > 0 ? trimmed : null;
}

export async function readRequestJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new CrudError("Invalid JSON body.", 400);
  }
}

export function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }

  return payload as T;
}

function clampInt(value: string | null, fallback: number, min: number, max: number) {
  const parsed = Number.parseInt(value ?? "", 10);

  if (Number.isNaN(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(parsed, min), max);
}
