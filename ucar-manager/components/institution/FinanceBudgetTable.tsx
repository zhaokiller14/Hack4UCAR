"use client";

import { useState } from "react";
import DataTable, { type Column } from "@/components/shared/DataTable";
import RecordFormModal, {
  type FieldDef,
} from "@/components/shared/RecordFormModal";
import type { BudgetLineRow } from "@/lib/data/finance";
import type { BudgetLineInput } from "@/lib/actions/finance";

type Props = {
  rows: BudgetLineRow[];
  total: number;
  page: number;
  pageSize: number;
  institutionId: string;
  canWrite: boolean;
  onCreate: (
    institutionId: string,
    input: BudgetLineInput,
  ) => Promise<{ error?: string }>;
  onUpdate: (
    budgetLineId: string,
    input: BudgetLineInput,
  ) => Promise<{ error?: string }>;
  onDelete: (budgetLineId: string) => Promise<{ error?: string }>;
};

type FormState =
  | { mode: "create" }
  | { mode: "edit"; row: BudgetLineRow }
  | null;

const CATEGORY_OPTIONS = [
  { value: "maintenance", label: "Maintenance" },
  { value: "salaries", label: "Salaires" },
  { value: "equipment", label: "Equipements" },
  { value: "operations", label: "Operations" },
  { value: "other", label: "Autre" },
];

function formatCurrency(value: number) {
  return `${value.toLocaleString("fr-TN")} TND`;
}

function executionRate(allocated: number, consumed: number) {
  if (!allocated) return "—";
  return `${((consumed / allocated) * 100).toFixed(1)}%`;
}

export default function FinanceBudgetTable({
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

  const columns: Column<BudgetLineRow>[] = [
    {
      header: "Annee fiscale",
      render: (row) => row.fiscal_year,
    },
    {
      header: "Departement",
      render: (row) => (
        <span className="font-medium text-[#1B1C1A]">{row.department}</span>
      ),
    },
    {
      header: "Categorie",
      render: (row) => row.category,
    },
    {
      header: "Alloue",
      render: (row) => formatCurrency(row.allocated),
    },
    {
      header: "Consomme",
      render: (row) => formatCurrency(row.consumed),
    },
    {
      header: "Execution",
      render: (row) => executionRate(row.allocated, row.consumed),
    },
  ];

  const fields: FieldDef[] = [
    {
      key: "fiscal_year",
      label: "Annee fiscale",
      type: "text",
      required: true,
      placeholder: "2026",
    },
    {
      key: "department",
      label: "Departement",
      type: "text",
      required: true,
      placeholder: "Informatique",
    },
    {
      key: "category",
      label: "Categorie",
      type: "select",
      required: true,
      options: CATEGORY_OPTIONS,
    },
    {
      key: "allocated",
      label: "Montant alloue",
      type: "number",
      required: true,
      min: 0,
    },
    {
      key: "consumed",
      label: "Montant consomme",
      type: "number",
      required: true,
      min: 0,
    },
    {
      key: "description",
      label: "Description",
      type: "text",
      placeholder: "Detail budgetaire",
    },
  ];

  function toInput(
    values: Record<string, string | number | undefined>,
  ): BudgetLineInput {
    return {
      fiscal_year: String(values.fiscal_year ?? ""),
      department: String(values.department ?? ""),
      category: String(values.category ?? ""),
      allocated:
        values.allocated !== undefined && values.allocated !== ""
          ? Number(values.allocated)
          : undefined,
      consumed:
        values.consumed !== undefined && values.consumed !== ""
          ? Number(values.consumed)
          : undefined,
      description: String(values.description ?? "").trim() || undefined,
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
          fiscal_year: form.row.fiscal_year,
          department: form.row.department,
          category: form.row.category,
          allocated: form.row.allocated,
          consumed: form.row.consumed,
          description: form.row.description ?? "",
        }
      : {
          fiscal_year: "",
          department: "",
          category: "",
          allocated: 0,
          consumed: 0,
          description: "",
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
        addLabel="+ Ajouter une ligne budget"
        onAdd={() => setForm({ mode: "create" })}
        onEdit={(row) => setForm({ mode: "edit", row })}
        onDelete={onDelete}
        getDeleteLabel={(row) => `${row.department} (${row.fiscal_year})`}
      />

      {form && (
        <RecordFormModal
          title={
            form.mode === "create"
              ? "Ajouter une ligne budget"
              : "Modifier la ligne budget"
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
