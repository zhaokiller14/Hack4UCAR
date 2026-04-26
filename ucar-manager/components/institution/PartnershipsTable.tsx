"use client";

import { useState } from "react";
import DataTable, { type Column } from "@/components/shared/DataTable";
import RecordFormModal, {
  type FieldDef,
} from "@/components/shared/RecordFormModal";
import type { PartnershipRow } from "@/lib/data/partnerships";
import type { PartnershipInput } from "@/lib/actions/partnerships";

type Props = {
  rows: PartnershipRow[];
  total: number;
  page: number;
  pageSize: number;
  institutionId: string;
  canWrite: boolean;
  onCreate: (
    institutionId: string,
    input: PartnershipInput,
  ) => Promise<{ error?: string }>;
  onUpdate: (
    partnershipId: string,
    input: PartnershipInput,
  ) => Promise<{ error?: string }>;
  onDelete: (partnershipId: string) => Promise<{ error?: string }>;
};

type FormState =
  | { mode: "create" }
  | { mode: "edit"; row: PartnershipRow }
  | null;

const TYPE_OPTIONS = [
  { value: "academic", label: "Academique" },
  { value: "industry", label: "Industrie" },
  { value: "government", label: "Gouvernement" },
  { value: "ngo", label: "ONG" },
];

const ACTIVE_OPTIONS = [
  { value: "true", label: "Actif" },
  { value: "false", label: "Inactif" },
];

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  const date = new Date(dateStr + "T00:00:00Z");
  return date.toLocaleDateString("fr-TN");
}

function getTypeLabel(type: string): string {
  return TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-700 border-green-200",
  inactive: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function PartnershipsTable({
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

  const columns: Column<PartnershipRow>[] = [
    {
      header: "Partenaire",
      render: (row) => (
        <span className="font-medium text-[#1B1C1A]">{row.partner_name}</span>
      ),
    },
    {
      header: "Pays",
      render: (row) => row.partner_country ?? "—",
    },
    {
      header: "Type",
      render: (row) => getTypeLabel(row.type),
    },
    {
      header: "Periode",
      render: (row) =>
        `${formatDate(row.start_date)} - ${formatDate(row.end_date)}`,
    },
    {
      header: "Mobilite",
      render: (row) =>
        `${row.outgoing_students} sortants / ${row.incoming_students} entrants`,
    },
    {
      header: "Statut",
      render: (row) => (
        <span
          className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-[11px] font-semibold tracking-wide ${row.is_active ? STATUS_STYLES.active : STATUS_STYLES.inactive}`}
        >
          {row.is_active ? "Actif" : "Inactif"}
        </span>
      ),
    },
  ];

  const fields: FieldDef[] = [
    {
      key: "partner_name",
      label: "Nom du partenaire",
      type: "text",
      required: true,
      placeholder: "ex. Universite de Bordeaux",
    },
    {
      key: "partner_country",
      label: "Pays",
      type: "text",
      placeholder: "ex. FR",
    },
    {
      key: "type",
      label: "Type",
      type: "select",
      required: true,
      options: TYPE_OPTIONS,
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
      key: "is_active",
      label: "Statut",
      type: "select",
      required: true,
      options: ACTIVE_OPTIONS,
    },
    {
      key: "scope",
      label: "Scope",
      type: "text",
      placeholder: "Double diplome, stage, recherche...",
    },
    {
      key: "outgoing_students",
      label: "Etudiants sortants",
      type: "number",
      min: 0,
    },
    {
      key: "incoming_students",
      label: "Etudiants entrants",
      type: "number",
      min: 0,
    },
  ];

  function toInput(
    values: Record<string, string | number | undefined>,
  ): PartnershipInput {
    return {
      partner_name: String(values.partner_name ?? ""),
      partner_country: String(values.partner_country ?? "").trim() || undefined,
      type: String(values.type ?? ""),
      start_date: String(values.start_date ?? "").trim() || undefined,
      end_date: String(values.end_date ?? "").trim() || undefined,
      is_active: String(values.is_active ?? "true") === "true",
      scope: String(values.scope ?? "").trim() || undefined,
      outgoing_students:
        values.outgoing_students !== undefined &&
        values.outgoing_students !== ""
          ? Number(values.outgoing_students)
          : undefined,
      incoming_students:
        values.incoming_students !== undefined &&
        values.incoming_students !== ""
          ? Number(values.incoming_students)
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
          partner_name: form.row.partner_name,
          partner_country: form.row.partner_country ?? "",
          type: form.row.type,
          start_date: form.row.start_date ?? "",
          end_date: form.row.end_date ?? "",
          is_active: String(form.row.is_active),
          scope: form.row.scope ?? "",
          outgoing_students: form.row.outgoing_students,
          incoming_students: form.row.incoming_students,
        }
      : {
          partner_name: "",
          partner_country: "",
          type: "academic",
          start_date: "",
          end_date: "",
          is_active: "true",
          scope: "",
          outgoing_students: 0,
          incoming_students: 0,
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
        addLabel="+ Ajouter un partenariat"
        onAdd={() => setForm({ mode: "create" })}
        onEdit={(row) => setForm({ mode: "edit", row })}
        onDelete={onDelete}
        getDeleteLabel={(row) => row.partner_name}
      />

      {form && (
        <RecordFormModal
          title={
            form.mode === "create"
              ? "Ajouter un partenariat"
              : "Modifier partenariat"
          }
          fields={fields}
          initialValues={initialValues}
          onClose={() => setForm(null)}
          onSave={handleSave}
        />
      )}
    </>
  );
}
