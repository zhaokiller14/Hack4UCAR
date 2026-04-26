import Link from "next/link";
import { requireInstitutionRole } from "@/lib/auth/guards";
import { getCourses } from "@/lib/data/academic";
import {
  createCourse,
  updateCourse,
  deleteCourse,
} from "@/lib/actions/courses";
import type { CourseInput } from "@/lib/actions/courses";
import CourseTable from "@/components/institution/CourseTable";
import SectionCard from "@/components/shared/SectionCard";
import CoursesFilterBar from "../../_components/Coursesfilterbar";

const PAGE_SIZE = 20;
const WRITE_ROLES = new Set([
  "super_admin",
  "institution_admin",
  "academic_manager",
]);

export default async function InstitutionCourses({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    q?: string;
    semester?: string;
    year?: string;
  }>;
}) {
  const ctx = await requireInstitutionRole();
  const { page: pageParam, q, semester, year } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));

  if (!ctx.institutionId) {
    return (
      <div className="p-8 text-sm text-slate-500">Institution introuvable.</div>
    );
  }

  const { data: courses, total } = await getCourses(
    ctx.institutionId,
    page,
    PAGE_SIZE,
    { search: q, semester, academicYear: year },
  );
  const canWrite = WRITE_ROLES.has(ctx.role ?? "");

  async function handleCreate(_institutionId: string, input: CourseInput) {
    "use server";
    return createCourse(ctx.institutionId!, input);
  }

  async function handleUpdate(courseId: string, input: CourseInput) {
    "use server";
    return updateCourse(courseId, input);
  }

  async function handleDelete(courseId: string) {
    "use server";
    return deleteCourse(courseId);
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
          <span className="text-slate-600">Cours</span>
        </div>
        <h1 className="text-2xl font-semibold text-[#1B1C1A]">Cours</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          {total} cours enregistré{total !== 1 ? "s" : ""}
        </p>
      </div>

      <CoursesFilterBar
        currentQ={q ?? ""}
        currentSemester={semester ?? ""}
        currentYear={year ?? ""}
      />

      <SectionCard
        title="Liste des cours"
        description="Triés par année académique et intitulé"
      >
        <CourseTable
          courses={courses}
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
