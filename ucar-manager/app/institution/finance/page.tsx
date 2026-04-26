import { requireInstitutionRole } from "@/lib/auth/guards";
import { getFinanceKpis } from "@/lib/data/finance";
import DomainDashboardPage from "../_components/DomainDashboardPage";
import { getInstitutionDomainDashboard } from "../_components/domainData";

export default async function InstitutionFinanceDashboard() {
  const { institutionId } = await requireInstitutionRole();

  const base = getInstitutionDomainDashboard("finance");

  if (!institutionId) {
    return <DomainDashboardPage {...base} />;
  }

  const rows = await getFinanceKpis(institutionId);
  const latest = rows[0];

  if (!latest) {
    return <DomainDashboardPage {...base} />;
  }

  const fmt = (n: number | null) =>
    n !== null ? `${n.toLocaleString("fr-TN")} TND` : "—";

  const kpis = [
    {
      title: "Budget alloué",
      value: fmt(latest.total_allocated),
      delta: latest.fiscal_year,
      accentColor: "#1B4F6B",
    },
    {
      title: "Budget consommé",
      value: fmt(latest.total_consumed),
      delta: latest.fiscal_year,
      accentColor: "#1B4F6B",
    },
    {
      title: "Taux d'exécution",
      value: latest.execution_rate !== null ? `${latest.execution_rate}%` : "—",
      delta: latest.fiscal_year,
      accentColor: latest.execution_rate !== null && latest.execution_rate >= 90 ? "#2E7D32" : "#C8A74B",
    },
    {
      title: "Coût par étudiant",
      value: latest.cost_per_student !== null ? `${latest.cost_per_student.toLocaleString("fr-TN")} TND` : "—",
      delta: latest.fiscal_year,
      accentColor: "#1B4F6B",
    },
  ];

  return <DomainDashboardPage {...base} kpis={kpis} />;
}
