"use client";

import { useState } from "react";
import DataTable, { type Column } from "@/components/shared/DataTable";
import RecordFormModal, {
  type FieldDef,
} from "@/components/shared/RecordFormModal";
import type { StaffRow } from "@/lib/data/hr";
import type { StaffInput } from "@/lib/actions/hr";
import { FR } from "@/lib/i18n";

type Props = {
  rows: StaffRow[];
  total: number;
  page: number;
  pageSize: number;
  institutionId: string;
  canWrite: boolean;
  onCreate: (
    institutionId: string,
    input: StaffInput,
  ) => Promise<{ error?: string }>;
  onUpdate: (staffId: string, input: StaffInput) => Promise<{ error?: string }>;
  onDelete: (staffId: string) => Promise<{ error?: string }>;
};

type FormState = { mode: "create" } | { mode: "edit"; row: StaffRow } | null;

const ROLE_OPTIONS = Object.entries(FR.staffRole).map(([v, l]) => ({ value: v, label: l }));
const CONTRACT_OPTIONS = [{ value: "", label: "—" }, ...Object.entries(FR.contractType).map(([v, l]) => ({ value: v, label: l }))];
const ACTIVE_OPTIONS = Object.entries(FR.activeStatus).map(([v, l]) => ({ value: v, label: l }));

export default function HrStaffTable({
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

  const columns: Column<StaffRow>[] = [
    {
      header: "Code",
      render: (row) => row.employee_code ?? "—",
    },
    {
      header: "Nom",
      render: (row) => (
        <span className="font-medium text-[#1B1C1A]">{row.full_name}</span>
      ),
    },
    {
      header: "Rôle",
      render: (row) => FR.staffRole[row.role_type as keyof typeof FR.staffRole] ?? row.role_type,
    },
    {
      header: "Département",
      render: (row) => row.department ?? "—",
    },
    {
      header: "Contrat",
      render: (row) => row.contract_type ? (FR.contractType[row.contract_type as keyof typeof FR.contractType] ?? row.contract_type) : "—",
    },
    {
      header: "Statut",
      render: (row) =>
        row.is_active ? (
          <span className="inline-flex items-center rounded-sm border border-green-200 bg-green-100 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-green-700">
            Actif
          </span>
        ) : (
          <span className="inline-flex items-center rounded-sm border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-slate-600">
            Inactif
          </span>
        ),
    },
  ];

  const fields: FieldDef[] = [
    { key: "employee_code", label: "Code employe", type: "text" },
    { key: "full_name", label: "Nom complet", type: "text", required: true },
    { key: "email", label: "Email", type: "email" },
    { key: "phone", label: "Telephone", type: "text" },
    {
      key: "role_type",
      label: "Role",
      type: "select",
      required: true,
      options: ROLE_OPTIONS,
    },
    { key: "department", label: "Departement", type: "text" },
    {
      key: "contract_type",
      label: "Contrat",
      type: "select",
      options: CONTRACT_OPTIONS,
    },
    {
      key: "teaching_hours_week",
      label: "Heures/sem",
      type: "number",
      min: 0,
    },
    { key: "hire_date", label: "Date embauche", type: "date" },
    {
      key: "is_active",
      label: "Statut",
      type: "select",
      required: true,
      options: ACTIVE_OPTIONS,
    },
  ];

  function toInput(
    values: Record<string, string | number | undefined>,
  ): StaffInput {
    return {
      employee_code: String(values.employee_code ?? "").trim() || undefined,
      full_name: String(values.full_name ?? ""),
      email: String(values.email ?? "").trim() || undefined,
      phone: String(values.phone ?? "").trim() || undefined,
      role_type: String(values.role_type ?? "") as StaffInput["role_type"],
      department: String(values.department ?? "").trim() || undefined,
      contract_type: (String(values.contract_type ?? "").trim() ||
        undefined) as StaffInput["contract_type"],
      teaching_hours_week:
        values.teaching_hours_week !== undefined &&
        values.teaching_hours_week !== ""
          ? Number(values.teaching_hours_week)
          : undefined,
      hire_date: String(values.hire_date ?? "").trim() || undefined,
      is_active: String(values.is_active ?? "true") === "true",
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
          employee_code: form.row.employee_code ?? "",
          full_name: form.row.full_name,
          email: form.row.email ?? "",
          phone: form.row.phone ?? "",
          role_type: form.row.role_type,
          department: form.row.department ?? "",
          contract_type: form.row.contract_type ?? "",
          teaching_hours_week: form.row.teaching_hours_week ?? undefined,
          hire_date: form.row.hire_date ?? "",
          is_active: String(form.row.is_active),
        }
      : {
          employee_code: "",
          full_name: "",
          email: "",
          phone: "",
          role_type: "",
          department: "",
          contract_type: "",
          teaching_hours_week: undefined,
          hire_date: "",
          is_active: "true",
        };

  return (
    <>
      <DataTable
        rows={rows}
        total={total}
        page={page}
        pageSize={pageSize}
        pageParamKey="staffPage"
        columns={columns}
        canWrite={canWrite}
        addLabel="+ Ajouter staff"
        onAdd={() => setForm({ mode: "create" })}
        onEdit={(row) => setForm({ mode: "edit", row })}
        onDelete={onDelete}
        getDeleteLabel={(row) => row.full_name}
      />

      {form && (
        <RecordFormModal
          title={form.mode === "create" ? "Ajouter staff" : "Modifier staff"}
          fields={fields}
          initialValues={initialValues}
          onClose={() => setForm(null)}
          onSave={handleSave}
        />
      )}
    </>
  );
}
