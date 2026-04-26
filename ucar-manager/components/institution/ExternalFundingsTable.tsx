"use client";

import { useState } from "react";
import DataTable, { type Column } from "@/components/shared/DataTable";
import RecordFormModal, { type FieldDef } from "@/components/shared/RecordFormModal";
import type { ExternalFundingRow } from "@/lib/data/finance";
import type { ExternalFundingInput } from "@/lib/actions/finance";

const COLUMNS: Column<ExternalFundingRow>[] = [
  { header: "Nom",         render: (r) => <span className="font-medium text-[#1B1C1A]">{r.name}</span> },
  { header: "Type source", render: (r) => r.source_type },
  { header: "Montant",      render: (r) => `${r.amount.toLocaleString("fr-TN")} TND` },
  { header: "Année fiscale",render: (r) => r.fiscal_year },
  { header: "Description",  render: (r) => r.description ?? "—" },
];

const FIELDS: FieldDef[] = [
  { key: "name",        label: "Nom",          type: "text",   required: true },
  { key: "fiscal_year", label: "Année fiscale", type: "text",   required: true, placeholder: "2026" },
  { key: "amount",      label: "Montant (TND)", type: "number", required: true, min: 0 },
  { key: "source_type", label: "Type de source", type: "text", required: true, placeholder: "ex. Subvention, Contrat UE..." },
  { key: "description", label: "Description", type: "text" },
];

type Props = {
  rows: ExternalFundingRow[];
  total: number;
  page: number;
  pageSize: number;
  institutionId: string;
  canWrite: boolean;
  onCreate: (institutionId: string, input: ExternalFundingInput) => Promise<{ error?: string }>;
  onUpdate: (fundingId: string, input: ExternalFundingInput) => Promise<{ error?: string }>;
  onDelete: (fundingId: string) => Promise<{ error?: string }>;
};

type FormState = { mode: "create" } | { mode: "edit"; row: ExternalFundingRow } | null;

export default function ExternalFundingsTable({
  rows, total, page, pageSize, institutionId, canWrite, onCreate, onUpdate, onDelete,
}: Props) {
  const [form, setForm] = useState<FormState>(null);

  function toInput(values: Record<string, string | number | undefined>): ExternalFundingInput {
    return {
      name:        String(values.name        ?? ""),
      source_type: String(values.source_type ?? ""),
      fiscal_year: String(values.fiscal_year ?? ""),
      amount:      values.amount !== undefined && values.amount !== "" ? Number(values.amount) : 0,
      description: String(values.description ?? "").trim() || undefined,
    };
  }

  async function handleSave(values: Record<string, string | number | undefined>) {
    const input = toInput(values);
    if (form?.mode === "edit") return onUpdate(form.row.id, input);
    return onCreate(institutionId, input);
  }

  const initialValues = form?.mode === "edit"
    ? {
        name:        form.row.name,
        source_type: form.row.source_type,
        fiscal_year: form.row.fiscal_year,
        amount:      form.row.amount,
        description: form.row.description ?? "",
      }
    : { name: "", source_type: "", fiscal_year: "", amount: 0, description: "" };

  return (
    <>
      <DataTable
        rows={rows}
        total={total}
        page={page}
        pageSize={pageSize}
        pageParamKey="fundingPage"
        columns={COLUMNS}
        canWrite={canWrite}
        addLabel="+ Ajouter un financement"
        onAdd={() => setForm({ mode: "create" })}
        onEdit={(r) => setForm({ mode: "edit", row: r })}
        onDelete={onDelete}
        getDeleteLabel={(r) => r.name}
      />

      {form && (
        <RecordFormModal
          title={form.mode === "create" ? "Ajouter un financement externe" : "Modifier le financement"}
          fields={FIELDS}
          initialValues={initialValues}
          onClose={() => setForm(null)}
          onSave={handleSave}
        />
      )}
    </>
  );
}
