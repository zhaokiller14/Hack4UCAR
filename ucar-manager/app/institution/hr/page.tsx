import { requireInstitutionRole } from "@/lib/auth/guards";
import { getHrKpis } from "@/lib/data/hr";
import DomainDashboardPage from "../_components/DomainDashboardPage";
import { getInstitutionDomainDashboard } from "../_components/domainData";

export default async function InstitutionHrDashboard() {
  const { institutionId } = await requireInstitutionRole();

  const base = getInstitutionDomainDashboard("hr");

  if (!institutionId) {
    return <DomainDashboardPage {...base} />;
  }

  const row = await getHrKpis(institutionId);

  if (!row) {
    return <DomainDashboardPage {...base} />;
  }

  const totalStaff =
    (row.teaching_staff_count ?? 0) +
    (row.admin_staff_count ?? 0) +
    (row.research_staff_count ?? 0);

  const kpis = [
    {
      title: "Effectif total",
      value: totalStaff > 0 ? totalStaff.toLocaleString("fr-TN") : "—",
      delta: `${row.teaching_staff_count ?? 0} ens. / ${row.admin_staff_count ?? 0} adm.`,
      accentColor: "#1B4F6B",
    },
    {
      title: "Absentéisme",
      value: row.absenteeism_rate !== null ? `${row.absenteeism_rate}%` : "—",
      delta: "mois en cours",
      accentColor: row.absenteeism_rate !== null && row.absenteeism_rate > 10 ? "#BA1A1A" : "#2E7D32",
    },
    {
      title: "Charge enseignement moy.",
      value: row.avg_teaching_load !== null ? `${row.avg_teaching_load} h/sem` : "—",
      delta: "personnel enseignant",
      accentColor: row.avg_teaching_load !== null && row.avg_teaching_load > 18 ? "#BA1A1A" : "#C8A74B",
    },
    {
      title: "Personnel recherche",
      value: row.research_staff_count !== null ? row.research_staff_count.toLocaleString("fr-TN") : "—",
      delta: "actifs",
      accentColor: "#1B4F6B",
    },
  ];

  return <DomainDashboardPage {...base} kpis={kpis} />;
}
