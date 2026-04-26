import { requireInstitutionRole } from "@/lib/auth/guards";
import { getResearchKpis } from "@/lib/data/research";
import DomainDashboardPage from "../_components/DomainDashboardPage";
import { getInstitutionDomainDashboard } from "../_components/domainData";

export default async function InstitutionResearch() {
  const { institutionId } = await requireInstitutionRole();

  const base = getInstitutionDomainDashboard("research");

  if (!institutionId) {
    return <DomainDashboardPage {...base} />;
  }

  const row = await getResearchKpis(institutionId);

  if (!row) {
    return <DomainDashboardPage {...base} />;
  }

  const kpis = [
    {
      title: "Publications",
      value: row.total_publications !== null ? row.total_publications.toLocaleString("fr-TN") : "—",
      delta: "total",
      accentColor: "#2E7D32",
    },
    {
      title: "Projets actifs",
      value: row.active_projects !== null ? row.active_projects.toLocaleString("fr-TN") : "—",
      delta: `sur ${row.total_projects ?? "—"} total`,
      accentColor: "#1B4F6B",
    },
    {
      title: "Financement sécurisé",
      value: row.total_funding_k !== null ? `${row.total_funding_k.toLocaleString("fr-TN")} k TND` : "—",
      delta: "total",
      accentColor: "#2E7D32",
    },
    {
      title: "Brevets déposés",
      value: row.total_patents !== null ? row.total_patents.toLocaleString("fr-TN") : "—",
      delta: "total",
      accentColor: "#1B4F6B",
    },
  ];

  return <DomainDashboardPage {...base} kpis={kpis} />;
}
