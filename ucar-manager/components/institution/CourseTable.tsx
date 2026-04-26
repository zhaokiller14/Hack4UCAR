"use client";

import { useState } from "react";
import DataTable, { type Column } from "@/components/shared/DataTable";
import RecordFormModal, { type FieldDef } from "@/components/shared/RecordFormModal";
import type { CourseRow } from "@/lib/data/academic";
import type { CourseInput } from "@/lib/actions/courses";

const COLUMNS: Column<CourseRow>[] = [
  { header: "Code",          render: (c) => <span className="font-mono text-xs text-slate-500">{c.code ?? "—"}</span> },
  { header: "Intitulé",      render: (c) => <span className="font-medium text-[#1B1C1A]">{c.title}</span> },
  { header: "Spécialisation",render: (c) => c.specialization ?? "—" },
  { header: "Année",         render: (c) => c.year_level !== null ? `L${c.year_level}` : "—" },
  { header: "Semestre",      render: (c) => c.semester ?? "—" },
  { header: "Crédits",       render: (c) => c.credits !== null ? String(c.credits) : "—" },
  { header: "Année acad.",   render: (c) => c.academic_year },
];

const FIELDS: FieldDef[] = [
  { key: "title",          label: "Intitulé",        type: "text",   required: true },
  { key: "code",           label: "Code",            type: "text",   placeholder: "INF-101" },
  { key: "specialization", label: "Spécialisation",  type: "text" },
  { key: "academic_year",  label: "Année académique",type: "text",   required: true, placeholder: "2024-2025" },
  { key: "year_level",     label: "Niveau",          type: "number", min: 1, max: 8, placeholder: "1–8" },
  { key: "credits",        label: "Crédits",         type: "number", min: 0, max: 30 },
  {
    key: "semester", label: "Semestre", type: "select",
    options: [
      { value: "",   label: "—" },
      { value: "S1", label: "S1" },
      { value: "S2", label: "S2" },
    ],
  },
];

type Props = {
  courses: CourseRow[];
  total: number;
  page: number;
  pageSize: number;
  institutionId: string;
  canWrite: boolean;
  onCreate: (institutionId: string, input: CourseInput) => Promise<{ error?: string }>;
  onUpdate: (courseId: string, input: CourseInput) => Promise<{ error?: string }>;
  onDelete: (courseId: string) => Promise<{ error?: string }>;
};

type FormState = { mode: "create" } | { mode: "edit"; course: CourseRow } | null;

export default function CourseTable({
  courses, total, page, pageSize, institutionId, canWrite, onCreate, onUpdate, onDelete,
}: Props) {
  const [form, setForm] = useState<FormState>(null);

  function toInput(values: Record<string, string | number | undefined>): CourseInput {
    return {
      code:           String(values.code          ?? ""),
      title:          String(values.title         ?? ""),
      specialization: String(values.specialization ?? ""),
      academic_year:  String(values.academic_year ?? ""),
      year_level:     values.year_level != null && values.year_level !== "" ? Number(values.year_level) : undefined,
      credits:        values.credits    != null && values.credits    !== "" ? Number(values.credits)    : undefined,
      semester:       String(values.semester      ?? ""),
    };
  }

  async function handleSave(values: Record<string, string | number | undefined>) {
    const input = toInput(values);
    if (form?.mode === "edit") return onUpdate(form.course.id, input);
    return onCreate(institutionId, input);
  }

  const initialValues = form?.mode === "edit"
    ? {
        title:          form.course.title,
        code:           form.course.code           ?? "",
        specialization: form.course.specialization ?? "",
        academic_year:  form.course.academic_year,
        year_level:     form.course.year_level     ?? undefined,
        credits:        form.course.credits        ?? undefined,
        semester:       form.course.semester       ?? "",
      }
    : undefined;

  return (
    <>
      <DataTable
        rows={courses}
        total={total}
        page={page}
        pageSize={pageSize}
        columns={COLUMNS}
        canWrite={canWrite}
        addLabel="+ Ajouter un cours"
        onAdd={() => setForm({ mode: "create" })}
        onEdit={(c) => setForm({ mode: "edit", course: c })}
        onDelete={onDelete}
        getDeleteLabel={(c) => c.title}
      />

      {form && (
        <RecordFormModal
          title={form.mode === "create" ? "Ajouter un cours" : "Modifier le cours"}
          fields={FIELDS}
          initialValues={initialValues}
          onClose={() => setForm(null)}
          onSave={handleSave}
        />
      )}
    </>
  );
}
