import Link from "next/link";
import { requireInstitutionRole } from "@/lib/auth/guards";
import { getCourseSelectOptions } from "@/lib/data/academic";
import { getExams } from "@/lib/data/exams";
import { createExam, deleteExam, updateExam } from "@/lib/actions/exams";
import type { ExamInput } from "@/lib/actions/exams";
import ExamTable from "@/components/institution/ExamTable";
import SectionCard from "@/components/shared/SectionCard";
import ExamsFilterBar from "../../_components/Examsfilterbar";

const PAGE_SIZE = 20;
const WRITE_ROLES = new Set([
  "super_admin",
  "institution_admin",
  "academic_manager",
]);

export default async function InstitutionExams({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    q?: string;
    type?: string;
    year?: string;
  }>;
}) {
  const ctx = await requireInstitutionRole();
  const { page: pageParam, q, type, year } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));

  if (!ctx.institutionId) {
    return (
      <div className="p-8 text-sm text-slate-500">Institution introuvable.</div>
    );
  }

  const [{ data: exams, total }, courses] = await Promise.all([
    getExams(ctx.institutionId, page, PAGE_SIZE, {
      search: q,
      type,
      academicYear: year,
    }),
    getCourseSelectOptions(ctx.institutionId),
  ]);

  const canWrite = WRITE_ROLES.has(ctx.role ?? "");

  async function handleCreate(_institutionId: string, input: ExamInput) {
    "use server";
    return createExam(ctx.institutionId!, input);
  }

  async function handleUpdate(examId: string, input: ExamInput) {
    "use server";
    return updateExam(examId, input);
  }

  async function handleDelete(examId: string) {
    "use server";
    return deleteExam(examId);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-8">
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
          <Link
            href="/institution/academic"
            className="hover:text-[#003850] transition-colors"
          >
            Académique
          </Link>
          <span>/</span>
          <span className="text-slate-600">Examens</span>
        </div>
        <h1 className="text-2xl font-semibold text-[#1B1C1A]">Examens</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          {total} examen{total !== 1 ? "s" : ""}
        </p>
      </div>

      <ExamsFilterBar
        currentQ={q ?? ""}
        currentType={type ?? ""}
        currentYear={year ?? ""}
      />

      <SectionCard
        title="Liste des examens"
        description="Triés par année académique et date d'examen"
      >
        <ExamTable
          exams={exams}
          total={total}
          page={page}
          pageSize={PAGE_SIZE}
          institutionId={ctx.institutionId}
          canWrite={canWrite}
          courses={courses}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      </SectionCard>
    </div>
  );
}
