"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type UploadIngestCardProps = {
  institutionId: string;
};

type MatchedTableName =
  | "organization"
  | "institutions"
  | "users"
  | "students"
  | "enrollments"
  | "courses"
  | "attendance_records"
  | "exams"
  | "exam_results"
  | "staff"
  | "absences"
  | "trainings"
  | "staff_trainings"
  | "budget_lines"
  | "external_fundings"
  | "research_projects"
  | "partnerships"
  | "infrastructure_assets"
  | "esg_records"
  | "kpi_snapshots"
  | "academic_kpis"
  | "finance_kpis"
  | "hr_kpis"
  | "research_kpis"
  | "esg_kpis"
  | "ucar_kpi_aggregates"
  | "strategic_goals"
  | "alerts"
  | "ucar_alerts"
  | "reports"
  | "ucar_reports"
  | "raw_uploads"
  | "extracted_records"
  | "ai_conversations"
  | "announcements"
  | null;

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

type ExtractionPayload = {
  document_id: string | null;
  entities: ExtractEntity[];
  relations: ExtractRelation[];
};

type UploadApiResponse = {
  data?: {
    raw_upload?: {
      id?: string;
    };
  };
  error?: string;
};

type ExtractApiResponse = {
  data?: {
    extraction?: ExtractionPayload;
    message?: string;
  };
  error?: string;
};

type VerifyApiResponse = {
  data?: {
    verification?: {
      inserted_count: number;
      skipped_count: number;
      failed_count: number;
    };
  };
  error?: string;
};

type EditableEntity = {
  entity_id: string;
  entity_type: string;
  entity_name: string;
  matched_table_name: MatchedTableName;
  confidence: number | null;
  source: ExtractSource;
  attributesText: string;
};

const TABLE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "No target table" },
  { value: "organization", label: "organization" },
  { value: "institutions", label: "institutions" },
  { value: "users", label: "users" },
  { value: "students", label: "students" },
  { value: "enrollments", label: "enrollments" },
  { value: "courses", label: "courses" },
  { value: "attendance_records", label: "attendance_records" },
  { value: "exams", label: "exams" },
  { value: "exam_results", label: "exam_results" },
  { value: "staff", label: "staff" },
  { value: "absences", label: "absences" },
  { value: "trainings", label: "trainings" },
  { value: "staff_trainings", label: "staff_trainings" },
  { value: "budget_lines", label: "budget_lines" },
  { value: "external_fundings", label: "external_fundings" },
  { value: "research_projects", label: "research_projects" },
  { value: "partnerships", label: "partnerships" },
  { value: "infrastructure_assets", label: "infrastructure_assets" },
  { value: "esg_records", label: "esg_records" },
  { value: "kpi_snapshots", label: "kpi_snapshots" },
  { value: "academic_kpis", label: "academic_kpis" },
  { value: "finance_kpis", label: "finance_kpis" },
  { value: "hr_kpis", label: "hr_kpis" },
  { value: "research_kpis", label: "research_kpis" },
  { value: "esg_kpis", label: "esg_kpis" },
  { value: "ucar_kpi_aggregates", label: "ucar_kpi_aggregates" },
  { value: "strategic_goals", label: "strategic_goals" },
  { value: "alerts", label: "alerts" },
  { value: "ucar_alerts", label: "ucar_alerts" },
  { value: "reports", label: "reports" },
  { value: "ucar_reports", label: "ucar_reports" },
  { value: "raw_uploads", label: "raw_uploads" },
  { value: "extracted_records", label: "extracted_records" },
  { value: "ai_conversations", label: "ai_conversations" },
  { value: "announcements", label: "announcements" },
];

function mapExtractionToEditable(extraction: ExtractionPayload): EditableEntity[] {
  return extraction.entities.map((entity) => ({
    entity_id: entity.entity_id,
    entity_type: entity.entity_type,
    entity_name: entity.entity_name,
    matched_table_name: entity.matched_table_name,
    confidence: entity.confidence,
    source: entity.source,
    attributesText: JSON.stringify(entity.attributes, null, 2),
  }));
}

async function uploadRawFile(params: {
  file: File;
  institutionId: string;
}): Promise<string> {
  const formData = new FormData();
  formData.append("file", params.file);
  formData.append("institution_id", params.institutionId);

  const response = await fetch("/api/uploads/raw", {
    method: "POST",
    body: formData,
  });

  const json = (await response.json()) as UploadApiResponse;

  if (!response.ok) {
    throw new Error(json.error ?? "Upload failed.");
  }

  const rawUploadId = json.data?.raw_upload?.id;

  if (!rawUploadId) {
    throw new Error("Upload succeeded but raw_upload id is missing.");
  }

  return rawUploadId;
}

async function runExtraction(rawUploadId: string): Promise<ExtractionPayload> {
  const response = await fetch("/api/ai/extract", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw_upload_id: rawUploadId }),
  });

  const json = (await response.json()) as ExtractApiResponse;

  if (!response.ok) {
    throw new Error(json.error ?? "Extraction failed.");
  }

  const extraction = json.data?.extraction;

  if (!extraction) {
    throw new Error("Extraction response is missing extraction payload.");
  }

  return extraction;
}

async function verifyEntities(params: {
  rawUploadId: string;
  entities: ExtractEntity[];
  relations: ExtractRelation[];
}) {
  const response = await fetch("/api/ai/extract", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      raw_upload_id: params.rawUploadId,
      entities: params.entities,
      relations: params.relations,
    }),
  });

  const json = (await response.json()) as VerifyApiResponse;

  if (!response.ok) {
    throw new Error(json.error ?? "Verification failed.");
  }

  return json.data?.verification;
}

export default function UploadIngestCard({
  institutionId,
}: UploadIngestCardProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [rawUploadId, setRawUploadId] = useState<string | null>(null);
  const [relations, setRelations] = useState<ExtractRelation[]>([]);
  const [editableEntities, setEditableEntities] = useState<EditableEntity[]>([]);

  const hasInstitutionId = institutionId.trim().length > 0;

  const groupedCounts = useMemo(() => {
    const counts = new Map<string, number>();

    for (const entity of editableEntities) {
      const key = entity.matched_table_name ?? "unmatched";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return Array.from(counts.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [editableEntities]);

  const handleUploadAndExtract = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) {
      setError("Please choose a file to upload.");
      return;
    }

    if (!hasInstitutionId) {
      setError("Missing institution context for this user.");
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const nextRawUploadId = await uploadRawFile({
        file,
        institutionId,
      });

      const extraction = await runExtraction(nextRawUploadId);

      setRawUploadId(nextRawUploadId);
      setEditableEntities(mapExtractionToEditable(extraction));
      setRelations(extraction.relations);
      setSuccess(
        `Upload complete (${nextRawUploadId}). ${extraction.entities.length} entities extracted and ready for review.`,
      );
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unexpected upload error.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEntityChange = (index: number, patch: Partial<EditableEntity>) => {
    setEditableEntities((current) =>
      current.map((entity, currentIndex) =>
        currentIndex === index
          ? {
              ...entity,
              ...patch,
            }
          : entity,
      ),
    );
  };

  const handleVerify = async () => {
    if (!rawUploadId) {
      setError("No extraction to verify. Upload and extract first.");
      return;
    }

    setIsVerifying(true);
    setError(null);
    setSuccess(null);

    try {
      const entities: ExtractEntity[] = editableEntities.map((entity) => {
        let parsedAttributes: unknown;

        try {
          parsedAttributes = JSON.parse(entity.attributesText);
        } catch {
          throw new Error(`Invalid JSON in attributes for entity ${entity.entity_id}.`);
        }

        if (!parsedAttributes || typeof parsedAttributes !== "object" || Array.isArray(parsedAttributes)) {
          throw new Error(`attributes must be a JSON object for entity ${entity.entity_id}.`);
        }

        return {
          entity_id: entity.entity_id,
          entity_type: entity.entity_type,
          entity_name: entity.entity_name,
          matched_table_name: entity.matched_table_name,
          attributes: parsedAttributes as Record<string, unknown>,
          confidence: entity.confidence,
          source: entity.source,
        };
      });

      const verification = await verifyEntities({
        rawUploadId,
        entities,
        relations,
      });

      setSuccess(
        `Verification done. Inserted: ${verification?.inserted_count ?? 0}, skipped: ${verification?.skipped_count ?? 0}, failed: ${verification?.failed_count ?? 0}.`,
      );
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : "Verification failed.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload, Extract, Review, Verify</CardTitle>
        <CardDescription>
          Upload a source file, run n8n extraction, review generated entities, then verify to insert rows into matched tables.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form className="space-y-4" onSubmit={handleUploadAndExtract}>
          <div className="space-y-2">
            <Label htmlFor="source-file">File</Label>
            <Input
              id="source-file"
              type="file"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              required
            />
          </div>

          {!hasInstitutionId ? (
            <p className="text-sm text-red-600">
              Upload is disabled: no institution_id is associated with your account.
            </p>
          ) : null}

          <Button disabled={isUploading || !hasInstitutionId} type="submit">
            {isUploading ? "Uploading and extracting..." : "Upload and Extract"}
          </Button>
        </form>

        {groupedCounts.length > 0 ? (
          <div className="space-y-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            <p className="font-semibold">Detected entities by target table</p>
            {groupedCounts.map(([table, count]) => (
              <p key={table}>
                {table}: {count}
              </p>
            ))}
          </div>
        ) : null}

        {editableEntities.length > 0 ? (
          <div className="space-y-4">
            {editableEntities.map((entity, index) => (
              <div key={entity.entity_id} className="space-y-3 rounded-md border border-slate-200 p-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label>Entity Name</Label>
                    <Input
                      value={entity.entity_name}
                      onChange={(event) =>
                        handleEntityChange(index, { entity_name: event.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Entity Type</Label>
                    <Input
                      value={entity.entity_type}
                      onChange={(event) =>
                        handleEntityChange(index, { entity_type: event.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label>Matched Table</Label>
                    <select
                      className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                      value={entity.matched_table_name ?? ""}
                      onChange={(event) =>
                        handleEntityChange(index, {
                          matched_table_name: event.target.value
                            ? (event.target.value as MatchedTableName)
                            : null,
                        })
                      }
                    >
                      {TABLE_OPTIONS.map((option) => (
                        <option key={option.value || "null"} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label>Confidence (0-1)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      max={1}
                      value={entity.confidence ?? ""}
                      onChange={(event) => {
                        const nextValue = event.target.value;
                        handleEntityChange(index, {
                          confidence: nextValue === "" ? null : Number(nextValue),
                        });
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>Attributes (JSON object)</Label>
                  <textarea
                    className="min-h-40 w-full rounded-md border border-slate-300 p-3 font-mono text-xs"
                    value={entity.attributesText}
                    onChange={(event) =>
                      handleEntityChange(index, { attributesText: event.target.value })
                    }
                  />
                </div>

                <p className="text-xs text-slate-500">
                  Source: {entity.source.table_name ?? "unknown"} | row {entity.source.row_index ?? "-"}
                </p>
              </div>
            ))}

            <Button disabled={isVerifying} onClick={handleVerify} type="button">
              {isVerifying ? "Verifying..." : "Verify and Insert"}
            </Button>
          </div>
        ) : null}

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {success ? <p className="text-sm text-green-700">{success}</p> : null}
      </CardContent>
    </Card>
  );
}
