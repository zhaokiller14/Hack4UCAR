"use client";

import { useState } from "react";
import DataTable, { type Column } from "@/components/shared/DataTable";
import RecordFormModal, {
  type FieldDef,
} from "@/components/shared/RecordFormModal";
import type { ResearchProjectRow } from "@/lib/data/research";
import type { ResearchProjectInput } from "@/lib/actions/research";
import { FR } from "@/lib/i18n";

type Props = {
  rows: ResearchProjectRow[];
  total: number;
  page: number;
  pageSize: number;
  institutionId: string;
  canWrite: boolean;
  onCreate: (
    institutionId: string,
    input: ResearchProjectInput,
  ) => Promise<{ error?: string }>;
  onUpdate: (
    projectId: string,
    input: ResearchProjectInput,
  ) => Promise<{ error?: string }>;
  onDelete: (projectId: string) => Promise<{ error?: string }>;
};

type FormState =
  | { mode: "create" }
  | { mode: "edit"; row: ResearchProjectRow }
  | null;

const STATUS_OPTIONS = Object.entries(FR.researchStatus).map(([v, l]) => ({ value: v, label: l }));

function formatFunding(value: number | null) {
  if (value === null) return "—";
  return `${value.toLocaleString("fr-TN")} TND`;
}

export default function ResearchProjectsTable({
  rows,
  total,
  page,
  pageSize,
  institutionId,
  canWrite,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const [form, setForm] = useState<FormState>(null);

  const columns: Column<ResearchProjectRow>[] = [
    {
      header: "Projet",
      render: (row) => (
        <span className="font-medium text-[#1B1C1A]">{row.title}</span>
      ),
    },
    {
      header: "Responsable",
      render: (row) => row.lead_researcher ?? "—",
    },
    {
      header: "Financement",
      render: (row) => formatFunding(row.funding_amount),
    },
    {
      header: "Statut",
      render: (row) => FR.researchStatus[row.status as keyof typeof FR.researchStatus] ?? row.status,
    },
    {
      header: "Publications",
      render: (row) => String(row.publications_count),
    },
    {
      header: "Brevets",
      render: (row) => String(row.patents_filed),
    },
  ];

  const fields: FieldDef[] = [
    {
      key: "title",
      label: "Titre",
      type: "text",
      required: true,
    },
    {
      key: "lead_researcher",
      label: "Responsable",
      type: "text",
    },
    {
      key: "funding_amount",
      label: "Financement (TND)",
      type: "number",
      min: 0,
    },
    {
      key: "funding_source",
      label: "Source financement",
      type: "text",
    },
    {
      key: "start_date",
      label: "Date debut",
      type: "date",
    },
    {
      key: "end_date",
      label: "Date fin",
      type: "date",
    },
    {
      key: "status",
      label: "Statut",
      type: "select",
      required: true,
      options: STATUS_OPTIONS,
    },
    {
      key: "publications_count",
      label: "Publications",
      type: "number",
      min: 0,
      required: true,
    },
    {
      key: "patents_filed",
      label: "Brevets",
      type: "number",
      min: 0,
      required: true,
    },
  ];

  function toInput(
    values: Record<string, string | number | undefined>,
  ): ResearchProjectInput {
    return {
      title: String(values.title ?? ""),
      lead_researcher: String(values.lead_researcher ?? "").trim() || undefined,
      funding_amount:
        values.funding_amount !== undefined && values.funding_amount !== ""
          ? Number(values.funding_amount)
          : undefined,
      funding_source: String(values.funding_source ?? "").trim() || undefined,
      start_date: String(values.start_date ?? "").trim() || undefined,
      end_date: String(values.end_date ?? "").trim() || undefined,
      status: String(values.status ?? "active"),
      publications_count:
        values.publications_count !== undefined &&
        values.publications_count !== ""
          ? Number(values.publications_count)
          : undefined,
      patents_filed:
        values.patents_filed !== undefined && values.patents_filed !== ""
          ? Number(values.patents_filed)
          : undefined,
    };
  }

  async function handleSave(
    values: Record<string, string | number | undefined>,
  ) {
    const input = toInput(values);
    if (form?.mode === "edit") return onUpdate(form.row.id, input);
    return onCreate(institutionId, input);
  }

  const initialValues =
    form?.mode === "edit"
      ? {
          title: form.row.title,
          lead_researcher: form.row.lead_researcher ?? "",
          funding_amount: form.row.funding_amount ?? undefined,
          funding_source: form.row.funding_source ?? "",
          start_date: form.row.start_date ?? "",
          end_date: form.row.end_date ?? "",
          status: form.row.status,
          publications_count: form.row.publications_count,
          patents_filed: form.row.patents_filed,
        }
      : {
          title: "",
          lead_researcher: "",
          funding_amount: undefined,
          funding_source: "",
          start_date: "",
          end_date: "",
          status: "active",
          publications_count: 0,
          patents_filed: 0,
        };

  return (
    <>
      <DataTable
        rows={rows}
        total={total}
        page={page}
        pageSize={pageSize}
        columns={columns}
        canWrite={canWrite}
        addLabel="+ Ajouter projet"
        onAdd={() => setForm({ mode: "create" })}
        onEdit={(row) => setForm({ mode: "edit", row })}
        onDelete={onDelete}
        getDeleteLabel={(row) => row.title}
      />

      {form && (
        <RecordFormModal
          title={form.mode === "create" ? "Ajouter projet" : "Modifier projet"}
          fields={fields}
          initialValues={initialValues}
          onClose={() => setForm(null)}
          onSave={handleSave}
        />
      )}
    </>
  );
}
