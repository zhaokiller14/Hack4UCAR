import { requireInstitutionRole } from "@/lib/auth/guards";
import { getStudentSelectOptions } from "@/lib/data/academic";
import { getEmploymentKpis } from "@/lib/data/employment";
import { getStudentJobs } from "@/lib/data/employment";
import {
  createStudentJob,
  deleteStudentJob,
  updateStudentJob,
} from "@/lib/actions/employment";
import type { StudentJobInput } from "@/lib/actions/employment";
import EmploymentTable from "@/components/institution/EmploymentTable";
import SectionCard from "@/components/shared/SectionCard";
import DomainDashboardPage from "../_components/DomainDashboardPage";
import { getInstitutionDomainDashboard } from "../_components/domainData";

const PAGE_SIZE = 20;
const WRITE_ROLES = new Set([
  "super_admin",
  "institution_admin",
  "academic_manager",
]);

export default async function InstitutionEmploymentDashboard({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const ctx = await requireInstitutionRole();
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));
  const { institutionId } = ctx;

  const base = getInstitutionDomainDashboard("employment");

  if (!institutionId) {
    return <DomainDashboardPage {...base} />;
  }

  const institutionIdValue = institutionId;

  const [row, { data: studentJobs, total }, students] = await Promise.all([
    getEmploymentKpis(institutionIdValue),
    getStudentJobs(institutionIdValue, page, PAGE_SIZE),
    getStudentSelectOptions(institutionIdValue),
  ]);

  const canWrite = WRITE_ROLES.has(ctx.role ?? "");

  const avgMonths =
    row?.avg_days_to_employ !== null && row?.avg_days_to_employ !== undefined
      ? `${(row.avg_days_to_employ / 30).toFixed(1)} mois`
      : "—";

  const kpis = row
    ? [
        {
          title: "Taux d'employabilité",
          value: row.employability_rate !== null ? `${row.employability_rate}%` : "—",
          delta: `${row.employed_count ?? "—"} / ${row.total_graduated ?? "—"} diplômés`,
          accentColor: "#2E7D32",
        },
        {
          title: "Délai vers emploi",
          value: avgMonths,
          delta: "après diplôme",
          accentColor: "#1B4F6B",
        },
        {
          title: "Emploi national",
          value: row.national_employment_rate !== null ? `${row.national_employment_rate}%` : "—",
          delta: `${row.national_employed_count ?? "—"} diplômés`,
          accentColor: "#1B4F6B",
        },
        {
          title: "Emploi international",
          value: row.international_employment_rate !== null ? `${row.international_employment_rate}%` : "—",
          delta: `${row.international_employed_count ?? "—"} diplômés`,
          accentColor: "#C8A74B",
        },
      ]
    : undefined;

  async function handleCreate(_institutionId: string, input: StudentJobInput) {
    "use server";
    return createStudentJob(institutionIdValue, input);
  }

  async function handleUpdate(studentJobId: string, input: StudentJobInput) {
    "use server";
    return updateStudentJob(studentJobId, input);
  }

  async function handleDelete(studentJobId: string) {
    "use server";
    return deleteStudentJob(studentJobId);
  }

  return (
    <>
      <DomainDashboardPage {...base} kpis={kpis} />

      <div className="space-y-6 px-8 pb-8">
        <SectionCard
          title="Liste des emplois"
          description="Emplois des diplomes lies aux etudiants"
        >
          <EmploymentTable
            rows={studentJobs}
            total={total}
            page={page}
            pageSize={PAGE_SIZE}
            institutionId={institutionIdValue}
            canWrite={canWrite}
            students={students}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        </SectionCard>
      </div>
    </>
  );
}
