import { requireInstitutionRole } from "@/lib/auth/guards";
import { getEmploymentKpis } from "@/lib/data/employment";
import DomainDashboardPage from "../_components/DomainDashboardPage";
import { getInstitutionDomainDashboard } from "../_components/domainData";

export default async function InstitutionEmploymentDashboard() {
  const { institutionId } = await requireInstitutionRole();

  const base = getInstitutionDomainDashboard("employment");

  if (!institutionId) {
    return <DomainDashboardPage {...base} />;
  }

  const row = await getEmploymentKpis(institutionId);

  if (!row) {
    return <DomainDashboardPage {...base} />;
  }

  const avgMonths =
    row.avg_days_to_employ !== null
      ? `${(row.avg_days_to_employ / 30).toFixed(1)} mois`
      : "—";

  const kpis = [
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
  ];

  return <DomainDashboardPage {...base} kpis={kpis} />;
}
