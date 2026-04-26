import { requireInstitutionRole } from "@/lib/auth/guards";
import { getEsgKpis } from "@/lib/data/esg";
import DomainDashboardPage from "../_components/DomainDashboardPage";
import { getInstitutionDomainDashboard } from "../_components/domainData";

export default async function InstitutionEsg() {
  const { institutionId } = await requireInstitutionRole();

  const base = getInstitutionDomainDashboard("esg");

  if (!institutionId) {
    return <DomainDashboardPage {...base} />;
  }

  const row = await getEsgKpis(institutionId);

  if (!row) {
    return <DomainDashboardPage {...base} />;
  }

  const kpis = [
    {
      title: "Consommation énergie",
      value: row.energy_kwh !== null ? `${row.energy_kwh.toLocaleString("fr-TN")} kWh` : "—",
      delta: row.period_start,
      accentColor: "#1B4F6B",
    },
    {
      title: "Empreinte carbone",
      value: row.carbon_kg !== null ? `${row.carbon_kg.toLocaleString("fr-TN")} kg` : "—",
      delta: row.period_start,
      accentColor: "#C8A74B",
    },
    {
      title: "Taux de recyclage",
      value: row.recycling_rate !== null ? `${row.recycling_rate}%` : "—",
      delta: row.period_start,
      accentColor: row.recycling_rate !== null && row.recycling_rate >= 50 ? "#2E7D32" : "#C8A74B",
    },
    {
      title: "Mobilité verte",
      value: row.green_mobility_pct !== null ? `${row.green_mobility_pct}%` : "—",
      delta: row.period_start,
      accentColor: "#2E7D32",
    },
  ];

  return <DomainDashboardPage {...base} kpis={kpis} />;
}
