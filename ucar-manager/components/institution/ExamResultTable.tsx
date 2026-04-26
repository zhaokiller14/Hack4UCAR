"use client";

import { useMemo, useState } from "react";
import DataTable, { type Column } from "@/components/shared/DataTable";
import RecordFormModal, {
  type FieldDef,
} from "@/components/shared/RecordFormModal";
import type { SelectOption } from "@/lib/data/academic";
import type { ExamResultRow } from "@/lib/data/exams";
import type { ExamResultInput } from "@/lib/actions/exams";

type Props = {
  examResults: ExamResultRow[];
  total: number;
  page: number;
  pageSize: number;
  institutionId: string;
  canWrite: boolean;
  exams: SelectOption[];
  students: SelectOption[];
  onCreate: (
    institutionId: string,
    input: ExamResultInput,
  ) => Promise<{ error?: string }>;
  onUpdate: (examResultId: string, input: ExamResultInput) => Promise<{ error?: string }>;
  onDelete: (examResultId: string) => Promise<{ error?: string }>;
};

type FormState = { mode: "create" } | { mode: "edit"; examResult: ExamResultRow } | null;

export default function ExamResultTable({
  examResults,
  total,
  page,
  pageSize,
  institutionId,
  canWrite,
  exams,
  students,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const [form, setForm] = useState<FormState>(null);

  const examLabels = useMemo(
    () => new Map(exams.map((exam) => [exam.id, exam.label])),
    [exams],
  );

  const studentLabels = useMemo(
    () => new Map(students.map((student) => [student.id, student.label])),
    [students],
  );

  const columns: Column<ExamResultRow>[] = [
    {
      header: "Examen",
      render: (result) => examLabels.get(result.exam_id) ?? result.exam_id,
    },
    {
      header: "Étudiant",
      render: (result) => studentLabels.get(result.student_id) ?? result.student_id,
    },
    {
      header: "Absence",
      render: (result) => (result.absent ? "Oui" : "Non"),
    },
    {
      header: "Réussi",
      render: (result) => (result.passed !== null ? (result.passed ? "Oui" : "Non") : "—"),
    },
    {
      header: "Score",
      render: (result) => (result.score !== null ? String(result.score) : "—"),
    },
    {
      header: "Note",
      render: (result) => result.note ?? "—",
    },
  ];

  const fields: FieldDef[] = [
    {
      key: "exam_id",
      label: "Examen",
      type: "select",
      required: true,
      options: [
        { value: "", label: "—" },
        ...exams.map((exam) => ({ value: exam.id, label: exam.label })),
      ],
    },
    {
      key: "student_id",
      label: "Étudiant",
      type: "select",
      required: true,
      options: [
        { value: "", label: "—" },
        ...students.map((student) => ({ value: student.id, label: student.label })),
      ],
    },
    {
      key: "absent",
      label: "Absence",
      type: "select",
      options: [
        { value: "", label: "—" },
        { value: "false", label: "Non" },
        { value: "true", label: "Oui" },
      ],
    },
    {
      key: "passed",
      label: "Réussi",
      type: "select",
      options: [
        { value: "", label: "—" },
        { value: "false", label: "Non" },
        { value: "true", label: "Oui" },
      ],
    },
    {
      key: "score",
      label: "Score",
      type: "number",
      min: 0,
    },
    {
      key: "note",
      label: "Note",
      type: "text",
      placeholder: "A, B, C, ...",
    },
  ];

  function toInput(
    values: Record<string, string | number | undefined>,
  ): ExamResultInput {
    return {
      exam_id: String(values.exam_id ?? ""),
      student_id: String(values.student_id ?? ""),
      absent: values.absent === "true",
      passed: values.passed ? values.passed === "true" : undefined,
      score:
        values.score !== undefined && values.score !== ""
          ? Number(values.score)
          : undefined,
      note: String(values.note ?? "").trim() || undefined,
    };
  }

  async function handleSave(
    values: Record<string, string | number | undefined>,
  ) {
    const input = toInput(values);
    if (form?.mode === "edit") return onUpdate(form.examResult.id, input);
    return onCreate(institutionId, input);
  }

  const initialValues =
    form?.mode === "edit"
      ? {
          exam_id: form.examResult.exam_id,
          student_id: form.examResult.student_id,
          absent: form.examResult.absent ? "true" : "false",
          passed: form.examResult.passed !== null ? String(form.examResult.passed) : "",
          score: form.examResult.score ?? "",
          note: form.examResult.note ?? "",
        }
      : {
          exam_id: "",
          student_id: "",
          absent: "false",
          passed: "",
          score: "",
          note: "",
        };

  return (
    <>
      <DataTable
        rows={examResults}
        total={total}
        page={page}
        pageSize={pageSize}
        columns={columns}
        canWrite={canWrite}
        addLabel="+ Ajouter un résultat"
        onAdd={() => setForm({ mode: "create" })}
        onEdit={(result) => setForm({ mode: "edit", examResult: result })}
        onDelete={onDelete}
        getDeleteLabel={(result) => {
          const student = studentLabels.get(result.student_id) ?? result.student_id;
          const exam = examLabels.get(result.exam_id) ?? result.exam_id;
          return `${student} — ${exam}`;
        }}
      />

      {form && (
        <RecordFormModal
          title={
            form.mode === "create"
              ? "Ajouter un résultat"
              : "Modifier le résultat"
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