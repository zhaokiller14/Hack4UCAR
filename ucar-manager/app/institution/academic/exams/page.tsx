import Link from "next/link";
import { requireInstitutionRole } from "@/lib/auth/guards";
import { getCourseSelectOptions, getStudentSelectOptions } from "@/lib/data/academic";
import { getExams, getExamResults, getExamSelectOptions } from "@/lib/data/exams";
import { createExam, deleteExam, updateExam, createExamResult, deleteExamResult, updateExamResult } from "@/lib/actions/exams";
import type { ExamInput, ExamResultInput } from "@/lib/actions/exams";
import ExamTable from "@/components/institution/ExamTable";
import ExamResultTable from "@/components/institution/ExamResultTable";
import SectionCard from "@/components/shared/SectionCard";
import ExamsFilterBar from "../../_components/Examsfilterbar";
import ExportButton from "@/components/shared/ExportButton";

const EXAM_TYPE_FR: Record<string, string> = { midterm: "Partiel", final: "Final", makeup: "Rattrapage" };

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
    results_page?: string;
  }>;
}) {
  const ctx = await requireInstitutionRole();
  const { page: pageParam, q, type, year, results_page: resultsPageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));
  const resultsPage = Math.max(1, parseInt(resultsPageParam ?? "1", 10));

  if (!ctx.institutionId) {
    return (
      <div className="p-8 text-sm text-slate-500">Institution introuvable.</div>
    );
  }

  const examsData = await getExams(ctx.institutionId, page, PAGE_SIZE, {
      search: q,
      type,
      academicYear: year,
    });
    const courses = await getCourseSelectOptions(ctx.institutionId);
    const examResultsData = await getExamResults(ctx.institutionId, resultsPage, PAGE_SIZE);
    const students = await getStudentSelectOptions(ctx.institutionId);
    const examsSelect = await getExamSelectOptions(ctx.institutionId);

    const { data: exams, total } = examsData;
    const { data: examResults, total: resultsTotal } = examResultsData;

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

  async function handleCreateResult(_institutionId: string, input: ExamResultInput) {
    "use server";
    return createExamResult(ctx.institutionId!, input);
  }

  async function handleUpdateResult(examResultId: string, input: ExamResultInput) {
    "use server";
    return updateExamResult(examResultId, input);
  }

  async function handleDeleteResult(examResultId: string) {
    "use server";
    return deleteExamResult(examResultId);
  }

  return (
    <div className="space-y-6 p-8">
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
        action={<ExportButton filename="examens" headers={["Type","Date","Score max","Année acad.","Semestre"]} data={exams.map((e) => [EXAM_TYPE_FR[e.type] ?? e.type, e.exam_date ?? "", e.max_score, e.academic_year, e.semester ?? ""])} />}
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

      <SectionCard
        title="Résultats d'examens"
        description="Notes et scores des étudiants"
      >
        <ExamResultTable
          examResults={examResults}
          total={resultsTotal}
          page={resultsPage}
          pageSize={PAGE_SIZE}
          institutionId={ctx.institutionId}
          canWrite={canWrite}
          exams={examsSelect}
          students={students}
          onCreate={handleCreateResult}
          onUpdate={handleUpdateResult}
          onDelete={handleDeleteResult}
        />
      </SectionCard>
    </div>
  );
}
