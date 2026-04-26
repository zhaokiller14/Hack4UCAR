"use client";

import { useMemo, useState } from "react";
import DataTable, { type Column } from "@/components/shared/DataTable";
import RecordFormModal, {
  type FieldDef,
} from "@/components/shared/RecordFormModal";
import type { SelectOption } from "@/lib/data/academic";
import type { StudentJobInput } from "@/lib/actions/employment";
import type { StudentJobRow } from "@/lib/data/employment";

type Props = {
  rows: StudentJobRow[];
  total: number;
  page: number;
  pageSize: number;
  institutionId: string;
  canWrite: boolean;
  students: SelectOption[];
  onCreate: (
    institutionId: string,
    input: StudentJobInput,
  ) => Promise<{ error?: string }>;
  onUpdate: (
    studentJobId: string,
    input: StudentJobInput,
  ) => Promise<{ error?: string }>;
  onDelete: (studentJobId: string) => Promise<{ error?: string }>;
};

type FormState =
  | { mode: "create" }
  | { mode: "edit"; row: StudentJobRow }
  | null;

const COUNTRY_OPTIONS = [
  { value: "TN", label: "Tunisie (TN)" },
  { value: "FR", label: "France (FR)" },
  { value: "DE", label: "Allemagne (DE)" },
  { value: "CA", label: "Canada (CA)" },
  { value: "US", label: "Etats-Unis (US)" },
  { value: "GB", label: "Royaume-Uni (GB)" },
  { value: "AE", label: "Emirats Arabes Unis (AE)" },
  { value: "SA", label: "Arabie Saoudite (SA)" },
  { value: "QA", label: "Qatar (QA)" },
  { value: "MA", label: "Maroc (MA)" },
  { value: "DZ", label: "Algerie (DZ)" },
  { value: "OTHER", label: "Autre" },
];

function countryLabel(code: string) {
  return COUNTRY_OPTIONS.find((option) => option.value === code)?.label ?? code;
}

export default function EmploymentTable({
  rows,
  total,
  page,
  pageSize,
  institutionId,
  canWrite,
  students,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const [form, setForm] = useState<FormState>(null);

  const studentLabels = useMemo(
    () => new Map(students.map((student) => [student.id, student.label])),
    [students],
  );

  const columns: Column<StudentJobRow>[] = [
    {
      header: "Etudiant",
      render: (row) => (
        <span className="font-medium text-[#1B1C1A]">
          {studentLabels.get(row.student_id) ?? row.student_id}
        </span>
      ),
    },
    {
      header: "Date d'emploi",
      render: (row) => row.employment_date,
    },
    {
      header: "Pays",
      render: (row) => countryLabel(row.job_country),
    },
  ];

  const fields: FieldDef[] = [
    {
      key: "student_id",
      label: "Etudiant",
      type: "select",
      required: true,
      options: [
        { value: "", label: "—" },
        ...students.map((student) => ({
          value: student.id,
          label: student.label,
        })),
      ],
    },
    {
      key: "employment_date",
      label: "Date d'emploi",
      type: "date",
      required: true,
    },
    {
      key: "job_country",
      label: "Pays d'emploi",
      type: "select",
      required: true,
      options: COUNTRY_OPTIONS,
    },
  ];

  function toInput(
    values: Record<string, string | number | undefined>,
  ): StudentJobInput {
    return {
      student_id: String(values.student_id ?? ""),
      employment_date: String(values.employment_date ?? ""),
      job_country: String(values.job_country ?? "TN"),
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
          student_id: form.row.student_id,
          employment_date: form.row.employment_date,
          job_country: form.row.job_country,
        }
      : {
          student_id: "",
          employment_date: "",
          job_country: "TN",
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
        addLabel="+ Ajouter un emploi"
        onAdd={() => setForm({ mode: "create" })}
        onEdit={(row) => setForm({ mode: "edit", row })}
        onDelete={onDelete}
        getDeleteLabel={(row) =>
          studentLabels.get(row.student_id) ?? row.student_id
        }
      />

      {form && (
        <RecordFormModal
          title={
            form.mode === "create" ? "Ajouter un emploi" : "Modifier l'emploi"
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
