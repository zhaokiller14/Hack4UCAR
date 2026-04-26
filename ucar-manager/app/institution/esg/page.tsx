import { requireInstitutionRole } from "@/lib/auth/guards";
import { getEsgKpis, getEsgRecords } from "@/lib/data/esg";
import {
  createEsgRecord,
  updateEsgRecord,
  deleteEsgRecord,
} from "@/lib/actions/esg";
import type { EsgRecordInput } from "@/lib/actions/esg";
import DomainDashboardPage from "../_components/DomainDashboardPage";
import { getInstitutionDomainDashboard } from "../_components/domainData";
import SectionCard from "@/components/shared/SectionCard";
import EsgRecordsTable from "@/components/institution/EsgRecordsTable";

const PAGE_SIZE = 20;
const WRITE_ROLES = new Set([
  "super_admin",
  "institution_admin",
  "esg_manager",
]);

export default async function InstitutionEsg({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const userContext = await requireInstitutionRole();
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));
  const { institutionId } = userContext;

  const base = getInstitutionDomainDashboard("esg");

  if (!institutionId) {
    return <DomainDashboardPage {...base} />;
  }

  const institutionIdValue = institutionId;

  const [kpiRow, recordsResult] = await Promise.all([
    getEsgKpis(institutionIdValue),
    getEsgRecords(institutionIdValue, page, PAGE_SIZE),
  ]);

  const canWrite = WRITE_ROLES.has(userContext.role ?? "");

  const kpis = kpiRow
    ? [
        {
          title: "Consommation énergie",
          value:
            kpiRow.energy_kwh !== null
              ? `${kpiRow.energy_kwh.toLocaleString("fr-TN")} kWh`
              : "—",
          delta: kpiRow.period_start,
          accentColor: "#1B4F6B",
        },
        {
          title: "Empreinte carbone",
          value:
            kpiRow.carbon_kg !== null
              ? `${kpiRow.carbon_kg.toLocaleString("fr-TN")} kg`
              : "—",
          delta: kpiRow.period_start,
          accentColor: "#C8A74B",
        },
        {
          title: "Taux de recyclage",
          value:
            kpiRow.recycling_rate !== null ? `${kpiRow.recycling_rate}%` : "—",
          delta: kpiRow.period_start,
          accentColor:
            kpiRow.recycling_rate !== null && kpiRow.recycling_rate >= 50
              ? "#2E7D32"
              : "#C8A74B",
        },
        {
          title: "Mobilité verte",
          value:
            kpiRow.green_mobility_pct !== null
              ? `${kpiRow.green_mobility_pct}%`
              : "—",
          delta: kpiRow.period_start,
          accentColor: "#2E7D32",
        },
      ]
    : undefined;

  async function handleCreate(_institutionId: string, input: EsgRecordInput) {
    "use server";
    return createEsgRecord(institutionIdValue, input);
  }

  async function handleUpdate(esgRecordId: string, input: EsgRecordInput) {
    "use server";
    return updateEsgRecord(esgRecordId, input);
  }

  async function handleDelete(esgRecordId: string) {
    "use server";
    return deleteEsgRecord(esgRecordId);
  }

  return (
    <>
      <DomainDashboardPage {...base} kpis={kpis} />
      <div className="mx-auto max-w-7xl space-y-6 px-8 pb-8 pt-0">
        <SectionCard title="Enregistrements ESG" description="Données environnementales par période">
          <EsgRecordsTable
            rows={recordsResult.data}
            total={recordsResult.total}
            page={page}
            pageSize={PAGE_SIZE}
            institutionId={institutionIdValue}
            canWrite={canWrite}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        </SectionCard>
      </div>
    </>
  );
}
