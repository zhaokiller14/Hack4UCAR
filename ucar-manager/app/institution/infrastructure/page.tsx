import { requireInstitutionRole } from "@/lib/auth/guards";
import { getInfrastructureKpis } from "@/lib/data/infrastructure";
import DomainDashboardPage from "../_components/DomainDashboardPage";
import { getInstitutionDomainDashboard } from "../_components/domainData";
import { getInfrastructureAssets } from "@/lib/data/infrastructure";
import {
  createInfrastructureAsset,
  updateInfrastructureAsset,
  deleteInfrastructureAsset,
} from "@/lib/actions/infrastructure";
import type { InfrastructureAssetInput } from "@/lib/actions/infrastructure";
import SectionCard from "@/components/shared/SectionCard";
import InfrastructureAssetsTable from "@/components/institution/InfrastructureAssetsTable";

const PAGE_SIZE = 20;
const WRITE_ROLES = new Set([
  "super_admin",
  "institution_admin",
  "infrastructure_manager",
]);

export default async function InstitutionInfrastructure({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const userContext = await requireInstitutionRole();
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));
  const { institutionId } = userContext;
  const base = getInstitutionDomainDashboard("infrastructure");

  if (!institutionId) {
    return <DomainDashboardPage {...base} />;
  }

  const institutionIdValue = institutionId;

  const [row, assetsResult] = await Promise.all([
    getInfrastructureKpis(institutionIdValue),
    getInfrastructureAssets(institutionIdValue, page, PAGE_SIZE),
  ]);

  const canWrite = WRITE_ROLES.has(userContext.role ?? "");

  const kpis = row
    ? [
        {
          title: "Taux opérationnel",
          value:
            row.operational_rate !== null ? `${row.operational_rate}%` : "—",
          delta: `${row.operational_count ?? "—"} / ${row.total_assets ?? "—"} actifs`,
          accentColor:
            row.operational_rate !== null && row.operational_rate >= 90
              ? "#2E7D32"
              : "#C8A74B",
        },
        {
          title: "Occupation moyenne",
          value:
            row.avg_occupancy_pct !== null ? `${row.avg_occupancy_pct}%` : "—",
          delta: "déclaré",
          accentColor: "#1B4F6B",
        },
        {
          title: "En maintenance",
          value:
            row.maintenance_count !== null
              ? row.maintenance_count.toLocaleString("fr-TN")
              : "—",
          delta: `${row.out_of_service_count ?? "—"} hors service`,
          accentColor:
            row.maintenance_count !== null && row.maintenance_count > 0
              ? "#C8A74B"
              : "#2E7D32",
        },
        {
          title: "Salles / Labos",
          value: `${row.classroom_count ?? "—"} / ${row.lab_count ?? "—"}`,
          delta: "salles · labos",
          accentColor: "#1B4F6B",
        },
      ]
    : undefined;

  async function handleCreate(
    _institutionId: string,
    input: InfrastructureAssetInput,
  ) {
    "use server";
    return createInfrastructureAsset(institutionIdValue, input);
  }

  async function handleUpdate(
    assetId: string,
    input: InfrastructureAssetInput,
  ) {
    "use server";
    return updateInfrastructureAsset(assetId, input);
  }

  async function handleDelete(assetId: string) {
    "use server";
    return deleteInfrastructureAsset(assetId);
  }

  return (
    <>
      <DomainDashboardPage {...base} kpis={kpis} />
      <div className="mx-auto max-w-7xl space-y-6 px-8 pb-8 pt-0">
        <SectionCard
          title="Actifs infrastructure"
          description="Salles, laboratoires, serveurs et bureaux"
        >
          <InfrastructureAssetsTable
            rows={assetsResult.data}
            total={assetsResult.total}
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
