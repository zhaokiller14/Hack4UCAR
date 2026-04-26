import Link from "next/link";
import { requireInstitutionRole } from "@/lib/auth/guards";
import { getAttendanceRecords } from "@/lib/data/attendance";
import {
  getStudentSelectOptions,
  getCourseSelectOptions,
} from "@/lib/data/academic";
import {
  createAttendanceRecord,
  deleteAttendanceRecord,
  updateAttendanceRecord,
} from "@/lib/actions/attendance";
import type { AttendanceInput } from "@/lib/actions/attendance";
import AttendanceTable from "@/components/institution/AttendanceTable";
import SectionCard from "@/components/shared/SectionCard";
import AttendanceFilterBar from "../../_components/Attendancefilterbar";

const PAGE_SIZE = 20;
const WRITE_ROLES = new Set([
  "super_admin",
  "institution_admin",
  "academic_manager",
]);

export default async function InstitutionAttendance({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    q?: string;
    present?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}) {
  const ctx = await requireInstitutionRole();
  const { page: pageParam, q, present, dateFrom, dateTo } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));

  if (!ctx.institutionId) {
    return (
      <div className="p-8 text-sm text-slate-500">Institution introuvable.</div>
    );
  }

  const presentFilter =
    present === "true" ? true : present === "false" ? false : undefined;

  const [{ data: attendance, total }, students, courses] = await Promise.all([
    getAttendanceRecords(ctx.institutionId, page, PAGE_SIZE, {
      search: q,
      present: presentFilter,
      dateFrom,
      dateTo,
    }),
    getStudentSelectOptions(ctx.institutionId),
    getCourseSelectOptions(ctx.institutionId),
  ]);

  const canWrite = WRITE_ROLES.has(ctx.role ?? "");

  async function handleCreate(_institutionId: string, input: AttendanceInput) {
    "use server";
    return createAttendanceRecord(ctx.institutionId!, input);
  }

  async function handleUpdate(recordId: string, input: AttendanceInput) {
    "use server";
    return updateAttendanceRecord(recordId, input);
  }

  async function handleDelete(recordId: string) {
    "use server";
    return deleteAttendanceRecord(recordId);
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
          <span className="text-slate-600">Assiduité</span>
        </div>
        <h1 className="text-2xl font-semibold text-[#1B1C1A]">Assiduité</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          {total} enregistrement{total !== 1 ? "s" : ""}
        </p>
      </div>

      <AttendanceFilterBar
        currentQ={q ?? ""}
        currentPresent={present ?? ""}
        currentDateFrom={dateFrom ?? ""}
        currentDateTo={dateTo ?? ""}
      />

      <SectionCard
        title="Présences"
        description="Triées par date de séance décroissante"
      >
        <AttendanceTable
          attendance={attendance}
          total={total}
          page={page}
          pageSize={PAGE_SIZE}
          institutionId={ctx.institutionId}
          canWrite={canWrite}
          students={students}
          courses={courses}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      </SectionCard>
    </div>
  );
}
