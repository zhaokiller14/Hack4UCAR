"use client";

import { useMemo, useState } from "react";
import DataTable, { type Column } from "@/components/shared/DataTable";
import RecordFormModal, {
  type FieldDef,
} from "@/components/shared/RecordFormModal";
import type { AttendanceRow } from "@/lib/data/attendance";
import type { AttendanceInput } from "@/lib/actions/attendance";
import type { SelectOption } from "@/lib/data/academic";

type Props = {
  attendance: AttendanceRow[];
  total: number;
  page: number;
  pageSize: number;
  institutionId: string;
  canWrite: boolean;
  students: SelectOption[];
  courses: SelectOption[];
  onCreate: (
    institutionId: string,
    input: AttendanceInput,
  ) => Promise<{ error?: string }>;
  onUpdate: (
    recordId: string,
    input: AttendanceInput,
  ) => Promise<{ error?: string }>;
  onDelete: (recordId: string) => Promise<{ error?: string }>;
};

type FormState =
  | { mode: "create" }
  | { mode: "edit"; record: AttendanceRow }
  | null;

const PRESENT_OPTIONS = [
  { value: "", label: "—" },
  { value: "true", label: "Présent" },
  { value: "false", label: "Absent" },
];

function formatDate(date: string) {
  return date || "—";
}

export default function AttendanceTable({
  attendance,
  total,
  page,
  pageSize,
  institutionId,
  canWrite,
  students,
  courses,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const [form, setForm] = useState<FormState>(null);

  const studentLabels = useMemo(
    () => new Map(students.map((student) => [student.id, student.label])),
    [students],
  );
  const courseLabels = useMemo(
    () => new Map(courses.map((course) => [course.id, course.label])),
    [courses],
  );

  const columns: Column<AttendanceRow>[] = [
    {
      header: "Date",
      render: (r) => (
        <span className="font-mono text-xs text-slate-500">
          {formatDate(r.session_date)}
        </span>
      ),
    },
    {
      header: "Étudiant",
      render: (r) => (
        <span className="font-medium text-[#1B1C1A]">
          {studentLabels.get(r.student_id) ?? r.student_id}
        </span>
      ),
    },
    {
      header: "Cours",
      render: (r) => courseLabels.get(r.course_id) ?? r.course_id,
    },
    {
      header: "Présence",
      render: (r) => (
        <span
          className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-[11px] font-semibold tracking-wide ${
            r.present
              ? "border-green-200 bg-green-100 text-green-700"
              : "border-red-200 bg-red-100 text-red-700"
          }`}
        >
          {r.present ? "Présent" : "Absent"}
        </span>
      ),
    },
    { header: "Note", render: (r) => r.note ?? "—" },
  ];

  function toInput(
    values: Record<string, string | number | undefined>,
  ): AttendanceInput {
    return {
      student_id: String(values.student_id ?? ""),
      course_id: String(values.course_id ?? ""),
      session_date: String(values.session_date ?? ""),
      present: String(values.present ?? "true") === "true",
      note: String(values.note ?? "").trim() || undefined,
    };
  }

  async function handleSave(
    values: Record<string, string | number | undefined>,
  ) {
    const input = toInput(values);
    if (form?.mode === "edit") return onUpdate(form.record.id, input);
    return onCreate(institutionId, input);
  }

  const fields: FieldDef[] = [
    {
      key: "student_id",
      label: "Étudiant",
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
      key: "course_id",
      label: "Cours",
      type: "select",
      required: true,
      options: [
        { value: "", label: "—" },
        ...courses.map((course) => ({ value: course.id, label: course.label })),
      ],
    },
    {
      key: "session_date",
      label: "Date de séance",
      type: "date",
      required: true,
    },
    {
      key: "present",
      label: "Présence",
      type: "select",
      required: true,
      options: PRESENT_OPTIONS,
    },
    {
      key: "note",
      label: "Note",
      type: "text",
      placeholder: "Observation facultative",
    },
  ];

  const initialValues =
    form?.mode === "edit"
      ? {
          student_id: form.record.student_id,
          course_id: form.record.course_id,
          session_date: form.record.session_date,
          present: String(form.record.present),
          note: form.record.note ?? "",
        }
      : {
          student_id: "",
          course_id: "",
          session_date: "",
          present: "true",
          note: "",
        };

  return (
    <>
      <DataTable
        rows={attendance}
        total={total}
        page={page}
        pageSize={pageSize}
        columns={columns}
        canWrite={canWrite}
        addLabel="+ Ajouter une présence"
        onAdd={() => setForm({ mode: "create" })}
        onEdit={(record) => setForm({ mode: "edit", record })}
        onDelete={onDelete}
        getDeleteLabel={(record) => {
          const student =
            studentLabels.get(record.student_id) ?? record.student_id;
          const course = courseLabels.get(record.course_id) ?? record.course_id;
          return `${record.session_date} — ${student} / ${course}`;
        }}
      />

      {form && (
        <RecordFormModal
          title={
            form.mode === "create"
              ? "Ajouter une présence"
              : "Modifier la présence"
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
