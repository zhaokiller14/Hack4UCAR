import { requireInstitutionRole } from "@/lib/auth/guards";
import { getInfrastructureKpis } from "@/lib/data/infrastructure";
import DomainDashboardPage from "../_components/DomainDashboardPage";
import { getInstitutionDomainDashboard } from "../_components/domainData";

export default async function InstitutionInfrastructure() {
  const { institutionId } = await requireInstitutionRole();

  const base = getInstitutionDomainDashboard("infrastructure");

  if (!institutionId) {
    return <DomainDashboardPage {...base} />;
  }

  const row = await getInfrastructureKpis(institutionId);

  if (!row) {
    return <DomainDashboardPage {...base} />;
  }

  const kpis = [
    {
      title: "Taux opérationnel",
      value: row.operational_rate !== null ? `${row.operational_rate}%` : "—",
      delta: `${row.operational_count ?? "—"} / ${row.total_assets ?? "—"} actifs`,
      accentColor: row.operational_rate !== null && row.operational_rate >= 90 ? "#2E7D32" : "#C8A74B",
    },
    {
      title: "Occupation moyenne",
      value: row.avg_occupancy_pct !== null ? `${row.avg_occupancy_pct}%` : "—",
      delta: "déclaré",
      accentColor: "#1B4F6B",
    },
    {
      title: "En maintenance",
      value: row.maintenance_count !== null ? row.maintenance_count.toLocaleString("fr-TN") : "—",
      delta: `${row.out_of_service_count ?? "—"} hors service`,
      accentColor: row.maintenance_count !== null && row.maintenance_count > 0 ? "#C8A74B" : "#2E7D32",
    },
    {
      title: "Salles / Labos",
      value: `${row.classroom_count ?? "—"} / ${row.lab_count ?? "—"}`,
      delta: "salles · labos",
      accentColor: "#1B4F6B",
    },
  ];

  return <DomainDashboardPage {...base} kpis={kpis} />;
}
