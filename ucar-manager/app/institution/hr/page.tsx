import { requireInstitutionRole } from "@/lib/auth/guards";
import {
  getHrKpis,
  getStaff,
  getStaffSelectOptions,
  getStaffTrainings,
  getTrainingSelectOptions,
} from "@/lib/data/hr";
import {
  createStaff,
  createStaffTraining,
  deleteStaff,
  deleteStaffTraining,
  updateStaff,
  updateStaffTraining,
} from "@/lib/actions/hr";
import type { StaffInput, StaffTrainingInput } from "@/lib/actions/hr";
import HrStaffTable from "@/components/institution/HrStaffTable";
import HrStaffTrainingTable from "@/components/institution/HrStaffTrainingTable";
import SectionCard from "@/components/shared/SectionCard";
import DomainDashboardPage from "../_components/DomainDashboardPage";
import { getInstitutionDomainDashboard } from "../_components/domainData";

const PAGE_SIZE = 20;
const WRITE_ROLES = new Set(["super_admin", "institution_admin", "hr_manager"]);

export default async function InstitutionHrDashboard({
  searchParams,
}: {
  searchParams: Promise<{ staffPage?: string; trainingPage?: string }>;
}) {
  const ctx = await requireInstitutionRole();
  const { staffPage: staffPageParam, trainingPage: trainingPageParam } =
    await searchParams;
  const staffPage = Math.max(1, parseInt(staffPageParam ?? "1", 10));
  const trainingPage = Math.max(1, parseInt(trainingPageParam ?? "1", 10));
  const { institutionId } = ctx;

  const base = getInstitutionDomainDashboard("hr");

  if (!institutionId) {
    return <DomainDashboardPage {...base} />;
  }

  const institutionIdValue = institutionId;

  const [
    row,
    { data: staffRows, total: staffTotal },
    { data: staffTrainingRows, total: staffTrainingTotal },
    staffOptions,
    trainingOptions,
  ] = await Promise.all([
    getHrKpis(institutionIdValue),
    getStaff(institutionIdValue, staffPage, PAGE_SIZE),
    getStaffTrainings(institutionIdValue, trainingPage, PAGE_SIZE),
    getStaffSelectOptions(institutionIdValue),
    getTrainingSelectOptions(institutionIdValue),
  ]);

  const canWrite = WRITE_ROLES.has(ctx.role ?? "");

  const totalStaff =
    (row?.teaching_staff_count ?? 0) +
    (row?.admin_staff_count ?? 0) +
    (row?.research_staff_count ?? 0);

  const kpis = row
    ? [
        {
          title: "Effectif total",
          value: totalStaff > 0 ? totalStaff.toLocaleString("fr-TN") : "—",
          delta: `${row.teaching_staff_count ?? 0} ens. / ${row.admin_staff_count ?? 0} adm.`,
          accentColor: "#1B4F6B",
        },
        {
          title: "Absenteisme",
          value:
            row.absenteeism_rate !== null ? `${row.absenteeism_rate}%` : "—",
          delta: "mois en cours",
          accentColor:
            row.absenteeism_rate !== null && row.absenteeism_rate > 10
              ? "#BA1A1A"
              : "#2E7D32",
        },
        {
          title: "Charge enseignement moy.",
          value:
            row.avg_teaching_load !== null
              ? `${row.avg_teaching_load} h/sem`
              : "—",
          delta: "personnel enseignant",
          accentColor:
            row.avg_teaching_load !== null && row.avg_teaching_load > 18
              ? "#BA1A1A"
              : "#C8A74B",
        },
        {
          title: "Personnel recherche",
          value:
            row.research_staff_count !== null
              ? row.research_staff_count.toLocaleString("fr-TN")
              : "—",
          delta: "actifs",
          accentColor: "#1B4F6B",
        },
      ]
    : undefined;

  async function handleCreateStaff(_institutionId: string, input: StaffInput) {
    "use server";
    return createStaff(institutionIdValue, input);
  }

  async function handleUpdateStaff(staffId: string, input: StaffInput) {
    "use server";
    return updateStaff(staffId, input);
  }

  async function handleDeleteStaff(staffId: string) {
    "use server";
    return deleteStaff(staffId);
  }

  async function handleCreateStaffTraining(
    _institutionId: string,
    input: StaffTrainingInput,
  ) {
    "use server";
    return createStaffTraining(institutionIdValue, input);
  }

  async function handleUpdateStaffTraining(
    staffTrainingId: string,
    input: StaffTrainingInput,
  ) {
    "use server";
    return updateStaffTraining(staffTrainingId, input);
  }

  async function handleDeleteStaffTraining(staffTrainingId: string) {
    "use server";
    return deleteStaffTraining(staffTrainingId);
  }

  return (
    <>
      <DomainDashboardPage {...base} kpis={kpis} />

      <div className="space-y-6 px-8 pb-8">
        <SectionCard title="Staff" description="Personnel de l'institution">
          <HrStaffTable
            rows={staffRows}
            total={staffTotal}
            page={staffPage}
            pageSize={PAGE_SIZE}
            institutionId={institutionIdValue}
            canWrite={canWrite}
            onCreate={handleCreateStaff}
            onUpdate={handleUpdateStaff}
            onDelete={handleDeleteStaff}
          />
        </SectionCard>

        <SectionCard
          title="Staff Trainings"
          description="Formations associees au personnel"
        >
          <HrStaffTrainingTable
            rows={staffTrainingRows}
            total={staffTrainingTotal}
            page={trainingPage}
            pageSize={PAGE_SIZE}
            institutionId={institutionIdValue}
            canWrite={canWrite}
            staffOptions={staffOptions}
            trainingOptions={trainingOptions}
            onCreate={handleCreateStaffTraining}
            onUpdate={handleUpdateStaffTraining}
            onDelete={handleDeleteStaffTraining}
          />
        </SectionCard>
      </div>
    </>
  );
}
