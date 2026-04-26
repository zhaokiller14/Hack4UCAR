"use client";

import { useMemo, useState } from "react";
import { FR } from "@/lib/i18n";
import DataTable, { type Column } from "@/components/shared/DataTable";
import RecordFormModal, {
  type FieldDef,
} from "@/components/shared/RecordFormModal";
import type { SelectOption } from "@/lib/data/academic";
import type { ExamRow } from "@/lib/data/exams";
import type { ExamInput } from "@/lib/actions/exams";

type Props = {
  exams: ExamRow[];
  total: number;
  page: number;
  pageSize: number;
  institutionId: string;
  canWrite: boolean;
  courses: SelectOption[];
  onCreate: (
    institutionId: string,
    input: ExamInput,
  ) => Promise<{ error?: string }>;
  onUpdate: (examId: string, input: ExamInput) => Promise<{ error?: string }>;
  onDelete: (examId: string) => Promise<{ error?: string }>;
};

type FormState = { mode: "create" } | { mode: "edit"; exam: ExamRow } | null;

const TYPE_OPTIONS = [{ value: "", label: "—" }, ...Object.entries(FR.examType).map(([v, l]) => ({ value: v, label: l }))];

const SEMESTER_OPTIONS = [
  { value: "", label: "—" },
  { value: "S1", label: "S1" },
  { value: "S2", label: "S2" },
];

export default function ExamTable({
  exams,
  total,
  page,
  pageSize,
  institutionId,
  canWrite,
  courses,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const [form, setForm] = useState<FormState>(null);

  const courseLabels = useMemo(
    () => new Map(courses.map((course) => [course.id, course.label])),
    [courses],
  );

  const columns: Column<ExamRow>[] = [
    {
      header: "Cours",
      render: (exam) => courseLabels.get(exam.course_id) ?? exam.course_id,
    },
    {
      header: "Type",
      render: (exam) =>
        TYPE_OPTIONS.find((option) => option.value === exam.type)?.label ??
        exam.type,
    },
    {
      header: "Date",
      render: (exam) => exam.exam_date ?? "—",
    },
    {
      header: "Score max",
      render: (exam) => String(exam.max_score),
    },
    {
      header: "Année acad.",
      render: (exam) => exam.academic_year,
    },
    {
      header: "Semestre",
      render: (exam) => exam.semester ?? "—",
    },
  ];

  const fields: FieldDef[] = [
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
      key: "type",
      label: "Type d'examen",
      type: "select",
      required: true,
      options: TYPE_OPTIONS,
    },
    {
      key: "exam_date",
      label: "Date d'examen",
      type: "date",
    },
    {
      key: "max_score",
      label: "Score maximal",
      type: "number",
      min: 0,
      max: 100,
      required: true,
    },
    {
      key: "academic_year",
      label: "Année académique",
      type: "text",
      required: true,
      placeholder: "2024-2025",
    },
    {
      key: "semester",
      label: "Semestre",
      type: "select",
      options: SEMESTER_OPTIONS,
    },
  ];

  function toInput(
    values: Record<string, string | number | undefined>,
  ): ExamInput {
    return {
      course_id: String(values.course_id ?? ""),
      type: String(values.type ?? ""),
      exam_date: String(values.exam_date ?? "").trim() || undefined,
      max_score:
        values.max_score !== undefined && values.max_score !== ""
          ? Number(values.max_score)
          : undefined,
      academic_year: String(values.academic_year ?? ""),
      semester: String(values.semester ?? "").trim() || undefined,
    };
  }

  async function handleSave(
    values: Record<string, string | number | undefined>,
  ) {
    const input = toInput(values);
    if (form?.mode === "edit") return onUpdate(form.exam.id, input);
    return onCreate(institutionId, input);
  }

  const initialValues =
    form?.mode === "edit"
      ? {
          course_id: form.exam.course_id,
          type: form.exam.type,
          exam_date: form.exam.exam_date ?? "",
          max_score: form.exam.max_score,
          academic_year: form.exam.academic_year,
          semester: form.exam.semester ?? "",
        }
      : {
          course_id: "",
          type: "",
          exam_date: "",
          max_score: 20,
          academic_year: "",
          semester: "",
        };

  return (
    <>
      <DataTable
        rows={exams}
        total={total}
        page={page}
        pageSize={pageSize}
        columns={columns}
        canWrite={canWrite}
        addLabel="+ Ajouter un examen"
        onAdd={() => setForm({ mode: "create" })}
        onEdit={(exam) => setForm({ mode: "edit", exam })}
        onDelete={onDelete}
        getDeleteLabel={(exam) => {
          const course = courseLabels.get(exam.course_id) ?? exam.course_id;
          const examType =
            TYPE_OPTIONS.find((option) => option.value === exam.type)?.label ??
            exam.type;
          return `${course} — ${examType}`;
        }}
      />

      {form && (
        <RecordFormModal
          title={
            form.mode === "create" ? "Ajouter un examen" : "Modifier l'examen"
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
