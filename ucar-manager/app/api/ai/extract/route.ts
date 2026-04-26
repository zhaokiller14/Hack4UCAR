import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { isInstitutionRole } from "@/lib/auth/roles";
import { CrudError, getAuthedSupabase, readRequestJson, unwrapData } from "@/lib/db/crud";

const MATCHED_TABLE_NAMES = [
  "organization",
  "institutions",
  "users",
  "students",
  "enrollments",
  "courses",
  "attendance_records",
  "exams",
  "exam_results",
  "staff",
  "absences",
  "trainings",
  "staff_trainings",
  "budget_lines",
  "external_fundings",
  "research_projects",
  "partnerships",
  "infrastructure_assets",
  "esg_records",
  "kpi_snapshots",
  "academic_kpis",
  "finance_kpis",
  "hr_kpis",
  "research_kpis",
  "esg_kpis",
  "ucar_kpi_aggregates",
  "strategic_goals",
  "alerts",
  "ucar_alerts",
  "reports",
  "ucar_reports",
  "raw_uploads",
  "extracted_records",
  "ai_conversations",
  "announcements",
] as const;

type MatchedTableName = (typeof MATCHED_TABLE_NAMES)[number] | null;

type UserRoleRow = {
  role: string | null;
  institution_id: string | null;
};

type RawUploadRow = {
  id: string;
  institution_id: string;
  storage_path: string;
  file_name: string;
  file_type: string;
  status?: string | null;
};

type ExtractSource = {
  table_name: string | null;
  row_index: number | null;
  text_span: string | null;
};

type ExtractEntity = {
  entity_id: string;
  entity_type: string;
  entity_name: string;
  matched_table_name: MatchedTableName;
  attributes: Record<string, unknown>;
  confidence: number | null;
  source: ExtractSource;
};

type ExtractRelation = {
  relation_id: string;
  relation_type: string;
  from_entity_id: string;
  to_entity_id: string;
  matched_table_name: MatchedTableName;
  confidence: number | null;
  source: ExtractSource;
};

type ExtractResponsePayload = {
  document_id: string | null;
  entities: ExtractEntity[];
  relations: ExtractRelation[];
};

type ExtractRequest = {
  raw_upload_id: string;
};

type VerifyRequest = {
  raw_upload_id: string;
  entities: ExtractEntity[];
  relations?: ExtractRelation[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toNullableString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function toNullableNumber(value: unknown): number | null {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }
  return value;
}

function toMatchedTableName(value: unknown): MatchedTableName {
  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    return null;
  }

  return (MATCHED_TABLE_NAMES as readonly string[]).includes(value)
    ? (value as MatchedTableName)
    : null;
}

function normalizeSource(value: unknown): ExtractSource {
  if (!isRecord(value)) {
    return { table_name: null, row_index: null, text_span: null };
  }

  return {
    table_name: toNullableString(value.table_name),
    row_index: toNullableNumber(value.row_index),
    text_span: toNullableString(value.text_span),
  };
}

function normalizeEntity(value: unknown): ExtractEntity | null {
  if (!isRecord(value)) {
    return null;
  }

  if (typeof value.entity_id !== "string" || typeof value.entity_type !== "string") {
    return null;
  }

  if (typeof value.entity_name !== "string") {
    return null;
  }

  return {
    entity_id: value.entity_id,
    entity_type: value.entity_type,
    entity_name: value.entity_name,
    matched_table_name: toMatchedTableName(value.matched_table_name),
    attributes: isRecord(value.attributes) ? value.attributes : {},
    confidence: toNullableNumber(value.confidence),
    source: normalizeSource(value.source),
  };
}

function normalizeRelation(value: unknown): ExtractRelation | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.relation_id !== "string" ||
    typeof value.relation_type !== "string" ||
    typeof value.from_entity_id !== "string" ||
    typeof value.to_entity_id !== "string"
  ) {
    return null;
  }

  return {
    relation_id: value.relation_id,
    relation_type: value.relation_type,
    from_entity_id: value.from_entity_id,
    to_entity_id: value.to_entity_id,
    matched_table_name: toMatchedTableName(value.matched_table_name),
    confidence: toNullableNumber(value.confidence),
    source: normalizeSource(value.source),
  };
}

function normalizeExtractionPayload(input: unknown): ExtractResponsePayload | null {
  const candidates: unknown[] = [input];

  if (Array.isArray(input)) {
    candidates.push(...input);
  }

  if (isRecord(input)) {
    candidates.push(input.data, input.result, input.output, input.body);
  }

  for (const candidate of candidates) {
    if (!isRecord(candidate)) {
      continue;
    }

    const rawEntities = Array.isArray(candidate.entities) ? candidate.entities : [];
    const rawRelations = Array.isArray(candidate.relations) ? candidate.relations : [];

    if (!Array.isArray(candidate.entities) || !Array.isArray(candidate.relations)) {
      continue;
    }

    const entities = rawEntities
      .map(normalizeEntity)
      .filter((entity): entity is ExtractEntity => Boolean(entity));

    const relations = rawRelations
      .map(normalizeRelation)
      .filter((relation): relation is ExtractRelation => Boolean(relation));

    return {
      document_id: toNullableString(candidate.document_id),
      entities,
      relations,
    };
  }

  return null;
}

function getWebhookUrl(): string {
  return process.env.N8N_DATA_INGEST_WEBHOOK_URL || "https://raghboun.app.n8n.cloud/webhook-test/data-ingest";
}

function getSignedUrlTtlSeconds(): number {
  const raw = process.env.N8N_SIGNED_URL_TTL_SECONDS;
  const parsed = raw ? Number.parseInt(raw, 10) : 3600;

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 3600;
  }

  return Math.min(parsed, 60 * 60 * 24 * 7);
}

function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new CrudError(
      "Missing server storage config. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
      500,
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function createSignedStorageUrl(storagePath: string, bucket: string): Promise<string> {
  const serviceRoleClient = createServiceRoleClient();
  const expiresIn = getSignedUrlTtlSeconds();

  const { data, error } = await serviceRoleClient.storage
    .from(bucket)
    .createSignedUrl(storagePath, expiresIn);

  if (error || !data?.signedUrl) {
    throw new CrudError(error?.message || "Failed to generate signed storage URL.", 500);
  }

  return data.signedUrl;
}

async function getAuthorizedContext(rawUploadId: string) {
  const { supabase, user } = await getAuthedSupabase();

  const { data: userRow, error: userError } = await supabase
    .from("users")
    .select("role, institution_id")
    .eq("id", user.id)
    .maybeSingle<UserRoleRow>();

  if (userError) {
    throw new CrudError(userError.message, 400);
  }

  const role = userRow?.role;
  const isUcarAdmin = role === "ucar_admin" || role === "super_admin";
  const isInstitutionScopedRole = isInstitutionRole(role) || role === "admin";

  if (!isInstitutionScopedRole && !isUcarAdmin) {
    throw new CrudError("Forbidden: role is not allowed for this action.", 403);
  }

  const { data: rawUpload, error: rawUploadError } = await supabase
    .from("raw_uploads")
    .select("id, institution_id, storage_path, file_name, file_type, status")
    .eq("id", rawUploadId)
    .maybeSingle<RawUploadRow>();

  if (rawUploadError) {
    throw new CrudError(rawUploadError.message, 400);
  }

  if (!rawUpload) {
    throw new CrudError("raw_upload not found.", 404);
  }

  if (isInstitutionScopedRole && userRow?.institution_id !== rawUpload.institution_id) {
    throw new CrudError("Forbidden: institution scope mismatch.", 403);
  }

  return { supabase, user, userRow, rawUpload };
}

export async function POST(request: Request) {
  try {
    const payload = unwrapData<unknown>(await readRequestJson(request));

    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return NextResponse.json(
        { error: "Request body must be an object." },
        { status: 400 },
      );
    }

    const { raw_upload_id } = payload as ExtractRequest;

    if (!raw_upload_id) {
      return NextResponse.json(
        { error: "raw_upload_id is required." },
        { status: 400 },
      );
    }

    const { supabase, rawUpload } = await getAuthorizedContext(raw_upload_id);

    await supabase
      .from("raw_uploads")
      .update({ status: "processing", error_message: null })
      .eq("id", raw_upload_id);

    const bucket = process.env.S3_BUCKET || "documents";
    const signed_file_url = await createSignedStorageUrl(rawUpload.storage_path, bucket);

    const webhookResponse = await fetch(getWebhookUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ s3Url: signed_file_url }),
      signal: AbortSignal.timeout(60000),
    });

    const responseText = await webhookResponse.text();
    let responseBody: unknown = null;

    if (responseText) {
      try {
        responseBody = JSON.parse(responseText);
      } catch {
        responseBody = responseText;
      }
    }

    if (!webhookResponse.ok) {
      await supabase
        .from("raw_uploads")
        .update({
          status: "failed",
          error_message: `n8n webhook failed with status ${webhookResponse.status}`,
        })
        .eq("id", raw_upload_id);

      return NextResponse.json(
        {
          error: "Extraction service returned an error.",
          details: responseBody,
        },
        { status: 502 },
      );
    }

    const normalized = normalizeExtractionPayload(responseBody);

    if (!normalized) {
      await supabase
        .from("raw_uploads")
        .update({
          status: "failed",
          error_message: "Invalid extraction response format from n8n.",
        })
        .eq("id", raw_upload_id);

      return NextResponse.json(
        { error: "Invalid extraction response format from n8n." },
        { status: 502 },
      );
    }

    const { error: rawUploadUpdateError } = await supabase
      .from("raw_uploads")
      .update({
        status: "done",
        extracted_data: normalized,
        error_message: null,
      })
      .eq("id", raw_upload_id);

    if (rawUploadUpdateError) {
      return NextResponse.json({ error: rawUploadUpdateError.message }, { status: 400 });
    }

    return NextResponse.json(
      {
        data: {
          raw_upload: rawUpload,
          extraction: normalized,
          status: "review_required",
          message: "Extraction complete. Review entities before verification.",
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return handleCrudError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const payload = unwrapData<unknown>(await readRequestJson(request));

    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return NextResponse.json(
        { error: "Request body must be an object." },
        { status: 400 },
      );
    }

    const { raw_upload_id, entities, relations } = payload as VerifyRequest;

    if (!raw_upload_id) {
      return NextResponse.json(
        { error: "raw_upload_id is required." },
        { status: 400 },
      );
    }

    if (!Array.isArray(entities)) {
      return NextResponse.json(
        { error: "entities must be an array." },
        { status: 400 },
      );
    }

    const { supabase } = await getAuthorizedContext(raw_upload_id);

    const normalizedEntities = entities
      .map(normalizeEntity)
      .filter((entity): entity is ExtractEntity => Boolean(entity));

    const normalizedRelations = Array.isArray(relations)
      ? relations
          .map(normalizeRelation)
          .filter((relation): relation is ExtractRelation => Boolean(relation))
      : [];

    const inserted: Array<{ entity_id: string; table: string }> = [];
    const skipped: Array<{ entity_id: string; reason: string }> = [];
    const failed: Array<{ entity_id: string; table: string; error: string }> = [];

    for (const entity of normalizedEntities) {
      const table = entity.matched_table_name;

      if (!table) {
        skipped.push({ entity_id: entity.entity_id, reason: "No matched_table_name." });
        continue;
      }

      if (!MATCHED_TABLE_NAMES.includes(table)) {
        skipped.push({ entity_id: entity.entity_id, reason: "Invalid matched_table_name." });
        continue;
      }

      if (!isRecord(entity.attributes)) {
        skipped.push({ entity_id: entity.entity_id, reason: "attributes must be an object." });
        continue;
      }

      const insertPayload = {
        ...entity.attributes,
      } as Record<string, unknown>;

      const { error } = await supabase.from(table).insert(insertPayload);

      if (error) {
        failed.push({ entity_id: entity.entity_id, table, error: error.message });
        continue;
      }

      inserted.push({ entity_id: entity.entity_id, table });
    }

    const reviewedData = {
      document_id: null,
      entities: normalizedEntities,
      relations: normalizedRelations,
      verification: {
        inserted_count: inserted.length,
        skipped_count: skipped.length,
        failed_count: failed.length,
        inserted,
        skipped,
        failed,
      },
    };

    await supabase
      .from("raw_uploads")
      .update({
        extracted_data: reviewedData,
        status: failed.length === 0 ? "done" : "failed",
        error_message: failed.length === 0 ? null : "Some entities failed to verify.",
      })
      .eq("id", raw_upload_id);

    return NextResponse.json(
      {
        data: {
          raw_upload_id,
          verification: {
            inserted_count: inserted.length,
            skipped_count: skipped.length,
            failed_count: failed.length,
            inserted,
            skipped,
            failed,
          },
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return handleCrudError(error);
  }
}

function handleCrudError(error: unknown) {
  if (error instanceof CrudError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
}
