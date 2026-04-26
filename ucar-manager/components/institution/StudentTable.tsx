"use client";

import { useState } from "react";
import DataTable, { type Column } from "@/components/shared/DataTable";
import RecordFormModal, { type FieldDef } from "@/components/shared/RecordFormModal";
import type { StudentRow } from "@/lib/data/academic";
import type { StudentInput } from "@/lib/actions/students";

const STATUS_STYLES: Record<string, string> = {
  active:      "bg-green-100 text-green-700 border-green-200",
  graduated:   "bg-blue-100 text-blue-700 border-blue-200",
  dropped:     "bg-red-100 text-red-700 border-red-200",
  suspended:   "bg-yellow-100 text-yellow-700 border-yellow-200",
  transferred: "bg-slate-100 text-slate-600 border-slate-200",
};

const STATUS_FR: Record<string, string> = {
  active:      "Actif",
  graduated:   "Diplômé",
  dropped:     "Abandonné",
  suspended:   "Suspendu",
  transferred: "Transféré",
};

const COLUMNS: Column<StudentRow>[] = [
  { header: "Code",          render: (s) => <span className="font-mono text-xs text-slate-500">{s.student_code ?? "—"}</span> },
  { header: "Nom complet",   render: (s) => <span className="font-medium text-[#1B1C1A]">{s.full_name}</span> },
  { header: "Spécialisation",render: (s) => s.specialization ?? "—" },
  { header: "Année",         render: (s) => s.current_year !== null ? `L${s.current_year}` : "—" },
  {
    header: "Statut",
    render: (s) => (
      <span className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-[11px] font-semibold tracking-wide ${STATUS_STYLES[s.status] ?? STATUS_STYLES.active}`}>
        {STATUS_FR[s.status] ?? s.status}
      </span>
    ),
  },
  { header: "Inscription",   render: (s) => <span className="text-slate-500">{s.enrollment_date ?? "—"}</span> },
  { header: "Diplôme",       render: (s) => <span className="text-slate-500">{s.graduation_date ?? "—"}</span> },
];

const FIELDS: FieldDef[] = [
  { key: "full_name",       label: "Nom complet",     type: "text",   required: true, placeholder: "Prénom Nom" },
  { key: "student_code",    label: "Code étudiant",   type: "text",   placeholder: "ETU-001" },
  { key: "email",           label: "Email",           type: "email" },
  { key: "phone",           label: "Téléphone",       type: "text" },
  { key: "specialization",  label: "Spécialisation",  type: "text" },
  { key: "current_year",    label: "Année en cours",  type: "number", min: 1, max: 8, placeholder: "1–8" },
  {
    key: "status", label: "Statut", type: "select",
    options: [
      { value: "active",      label: "Actif" },
      { value: "graduated",   label: "Diplômé" },
      { value: "dropped",     label: "Abandonné" },
      { value: "suspended",   label: "Suspendu" },
      { value: "transferred", label: "Transféré" },
    ],
  },
  {
    key: "gender", label: "Genre", type: "select",
    options: [
      { value: "",  label: "—" },
      { value: "M", label: "Masculin" },
      { value: "F", label: "Féminin" },
    ],
  },
  { key: "enrollment_date",  label: "Date d'inscription", type: "date" },
  { key: "graduation_date",  label: "Date de diplôme",    type: "date" },
];

type Props = {
  students: StudentRow[];
  total: number;
  page: number;
  pageSize: number;
  institutionId: string;
  canWrite: boolean;
  onCreate: (institutionId: string, input: StudentInput) => Promise<{ error?: string }>;
  onUpdate: (institutionId: string, input: StudentInput, studentId?: string) => Promise<{ error?: string }>;
  onDelete: (studentId: string) => Promise<{ error?: string }>;
};

type FormState = { mode: "create" } | { mode: "edit"; student: StudentRow } | null;

export default function StudentTable({
  students, total, page, pageSize, institutionId, canWrite, onCreate, onUpdate, onDelete,
}: Props) {
  const [form, setForm] = useState<FormState>(null);

  function toInput(values: Record<string, string | number | undefined>): StudentInput {
    return {
      student_code:    String(values.student_code   ?? ""),
      full_name:       String(values.full_name      ?? ""),
      email:           String(values.email          ?? ""),
      phone:           String(values.phone          ?? ""),
      birth_date:      String(values.birth_date     ?? ""),
      gender:          String(values.gender         ?? ""),
      specialization:  String(values.specialization ?? ""),
      current_year:    values.current_year != null && values.current_year !== "" ? Number(values.current_year) : undefined,
      status:          String(values.status         ?? "active"),
      enrollment_date: String(values.enrollment_date ?? ""),
      graduation_date: String(values.graduation_date ?? ""),
    };
  }

  async function handleSave(values: Record<string, string | number | undefined>) {
    const input = toInput(values);
    if (form?.mode === "edit") return onUpdate(institutionId, input, form.student.id);
    return onCreate(institutionId, input);
  }

  const initialValues = form?.mode === "edit"
    ? {
        full_name:       form.student.full_name,
        student_code:    form.student.student_code   ?? "",
        email:           form.student.email          ?? "",
        specialization:  form.student.specialization ?? "",
        current_year:    form.student.current_year   ?? undefined,
        status:          form.student.status,
        enrollment_date: form.student.enrollment_date ?? "",
        graduation_date: form.student.graduation_date ?? "",
      }
    : undefined;

  return (
    <>
      <DataTable
        rows={students}
        total={total}
        page={page}
        pageSize={pageSize}
        columns={COLUMNS}
        canWrite={canWrite}
        addLabel="+ Ajouter un étudiant"
        onAdd={() => setForm({ mode: "create" })}
        onEdit={(s) => setForm({ mode: "edit", student: s })}
        onDelete={onDelete}
        getDeleteLabel={(s) => s.full_name}
      />

      {form && (
        <RecordFormModal
          title={form.mode === "create" ? "Ajouter un étudiant" : "Modifier l'étudiant"}
          fields={FIELDS}
          initialValues={initialValues}
          onClose={() => setForm(null)}
          onSave={handleSave}
        />
      )}
    </>
  );
}
