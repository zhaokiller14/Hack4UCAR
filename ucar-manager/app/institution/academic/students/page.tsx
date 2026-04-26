import Link from "next/link";
import { requireInstitutionRole } from "@/lib/auth/guards";
import { getStudents } from "@/lib/data/academic";
import {
  createStudent,
  updateStudent,
  deleteStudent,
} from "@/lib/actions/students";
import type { StudentInput } from "@/lib/actions/students";
import StudentTable from "@/components/institution/StudentTable";
import SectionCard from "@/components/shared/SectionCard";
import StudentsFilterBar from "../../_components/Studentsfilterbar";
import ExportButton from "@/components/shared/ExportButton";

const PAGE_SIZE = 20;
const WRITE_ROLES = new Set([
  "super_admin",
  "institution_admin",
  "academic_manager",
]);

const STATUS_OPTIONS = [
  { value: "active", label: "Actif" },
  { value: "graduated", label: "Diplômé" },
  { value: "dropped", label: "Abandonné" },
  { value: "suspended", label: "Suspendu" },
  { value: "transferred", label: "Transféré" },
];

export default async function InstitutionStudents({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    q?: string;
    status?: string;
    year?: string;
  }>;
}) {
  const ctx = await requireInstitutionRole();
  const { page: pageParam, q, status, year } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));

  if (!ctx.institutionId) {
    return (
      <div className="p-8 text-sm text-slate-500">Institution introuvable.</div>
    );
  }

  const { data: students, total } = await getStudents(
    ctx.institutionId,
    page,
    PAGE_SIZE,
    { search: q, status, year: year ? Number(year) : undefined },
  );
  const canWrite = WRITE_ROLES.has(ctx.role ?? "");

  async function handleCreate(_institutionId: string, input: StudentInput) {
    "use server";
    return createStudent(ctx.institutionId!, input);
  }

  async function handleUpdate(
    _institutionId: string,
    input: StudentInput,
    studentId?: string,
  ) {
    "use server";
    return updateStudent(studentId!, input);
  }

  async function handleDelete(studentId: string) {
    "use server";
    return deleteStudent(studentId);
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Link
              href="/institution/academic"
              className="hover:text-[#003850] transition-colors"
            >
              Académique
            </Link>
            <span>/</span>
            <span className="text-slate-600">Étudiants</span>
          </div>
          <h1 className="text-2xl font-semibold text-[#1B1C1A]">Étudiants</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {total} étudiant{total !== 1 ? "s" : ""} enregistré
            {total !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <StudentsFilterBar
        statusOptions={STATUS_OPTIONS}
        currentQ={q ?? ""}
        currentStatus={status ?? ""}
        currentYear={year ?? ""}
      />

      <SectionCard
        title="Liste des étudiants"
        description="Triés par nom alphabétique"
        action={<ExportButton filename="etudiants" headers={["Code","Nom complet","Email","Spécialisation","Année","Statut","Inscription","Diplôme"]} data={students.map((s) => [s.student_code ?? "",s.full_name,s.email ?? "",s.specialization ?? "",s.current_year ?? "",s.status,s.enrollment_date ?? "",s.graduation_date ?? ""])} />}
      >
        <StudentTable
          students={students}
          total={total}
          page={page}
          pageSize={PAGE_SIZE}
          institutionId={ctx.institutionId}
          canWrite={canWrite}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      </SectionCard>
    </div>
  );
}
