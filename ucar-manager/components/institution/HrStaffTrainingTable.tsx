"use client";

import { useMemo, useState } from "react";
import { FR } from "@/lib/i18n";
import DataTable, { type Column } from "@/components/shared/DataTable";
import RecordFormModal, {
  type FieldDef,
} from "@/components/shared/RecordFormModal";
import type { SelectOption } from "@/lib/data/academic";
import type { StaffTrainingInput } from "@/lib/actions/hr";
import type { StaffTrainingRow } from "@/lib/data/hr";

type Props = {
  rows: StaffTrainingRow[];
  total: number;
  page: number;
  pageSize: number;
  institutionId: string;
  canWrite: boolean;
  staffOptions: SelectOption[];
  trainingOptions: SelectOption[];
  onCreate: (
    institutionId: string,
    input: StaffTrainingInput,
  ) => Promise<{ error?: string }>;
  onUpdate: (
    staffTrainingId: string,
    input: StaffTrainingInput,
  ) => Promise<{ error?: string }>;
  onDelete: (staffTrainingId: string) => Promise<{ error?: string }>;
};

type FormState =
  | { mode: "create" }
  | { mode: "edit"; row: StaffTrainingRow }
  | null;

const COMPLETED_OPTIONS = Object.entries(FR.trainingStatus).map(([v, l]) => ({ value: v, label: l }));

export default function HrStaffTrainingTable({
  rows,
  total,
  page,
  pageSize,
  institutionId,
  canWrite,
  staffOptions,
  trainingOptions,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const [form, setForm] = useState<FormState>(null);

  const staffLabels = useMemo(
    () => new Map(staffOptions.map((option) => [option.id, option.label])),
    [staffOptions],
  );
  const trainingLabels = useMemo(
    () => new Map(trainingOptions.map((option) => [option.id, option.label])),
    [trainingOptions],
  );

  const columns: Column<StaffTrainingRow>[] = [
    {
      header: "Staff",
      render: (row) => (
        <span className="font-medium text-[#1B1C1A]">
          {staffLabels.get(row.staff_id) ?? row.staff_id}
        </span>
      ),
    },
    {
      header: "Training",
      render: (row) => trainingLabels.get(row.training_id) ?? row.training_id,
    },
    {
      header: "Statut",
      render: (row) =>
        row.completed ? (
          <span className="inline-flex items-center rounded-sm border border-green-200 bg-green-100 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-green-700">
            Complété
          </span>
        ) : (
          <span className="inline-flex items-center rounded-sm border border-yellow-200 bg-yellow-100 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-yellow-700">
            En cours
          </span>
        ),
    },
    {
      header: "Date completion",
      render: (row) => row.completion_date ?? "—",
    },
  ];

  const fields: FieldDef[] = [
    {
      key: "staff_id",
      label: "Staff",
      type: "select",
      required: true,
      options: [
        { value: "", label: "—" },
        ...staffOptions.map((option) => ({
          value: option.id,
          label: option.label,
        })),
      ],
    },
    {
      key: "training_id",
      label: "Training",
      type: "select",
      required: true,
      options: [
        { value: "", label: "—" },
        ...trainingOptions.map((option) => ({
          value: option.id,
          label: option.label,
        })),
      ],
    },
    {
      key: "completed",
      label: "Statut",
      type: "select",
      required: true,
      options: COMPLETED_OPTIONS,
    },
    {
      key: "completion_date",
      label: "Date completion",
      type: "date",
    },
  ];

  function toInput(
    values: Record<string, string | number | undefined>,
  ): StaffTrainingInput {
    return {
      staff_id: String(values.staff_id ?? ""),
      training_id: String(values.training_id ?? ""),
      completed: String(values.completed ?? "false") === "true",
      completion_date: String(values.completion_date ?? "").trim() || undefined,
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
          staff_id: form.row.staff_id,
          training_id: form.row.training_id,
          completed: String(form.row.completed),
          completion_date: form.row.completion_date ?? "",
        }
      : {
          staff_id: "",
          training_id: "",
          completed: "false",
          completion_date: "",
        };

  return (
    <>
      <DataTable
        rows={rows}
        total={total}
        page={page}
        pageSize={pageSize}
        pageParamKey="trainingPage"
        columns={columns}
        canWrite={canWrite}
        addLabel="+ Ajouter staff training"
        onAdd={() => setForm({ mode: "create" })}
        onEdit={(row) => setForm({ mode: "edit", row })}
        onDelete={onDelete}
        getDeleteLabel={(row) => {
          const staff = staffLabels.get(row.staff_id) ?? row.staff_id;
          const training =
            trainingLabels.get(row.training_id) ?? row.training_id;
          return `${staff} / ${training}`;
        }}
      />

      {form && (
        <RecordFormModal
          title={
            form.mode === "create"
              ? "Ajouter staff training"
              : "Modifier staff training"
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
