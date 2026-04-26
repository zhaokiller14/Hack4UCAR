import { requireInstitutionRole } from "@/lib/auth/guards";
import { getPartnershipsKpis } from "@/lib/data/partnerships";
import DomainDashboardPage from "../_components/DomainDashboardPage";
import { getInstitutionDomainDashboard } from "../_components/domainData";

export default async function InstitutionPartnerships() {
  const { institutionId } = await requireInstitutionRole();

  const base = getInstitutionDomainDashboard("partnerships");

  if (!institutionId) {
    return <DomainDashboardPage {...base} />;
  }

  const row = await getPartnershipsKpis(institutionId);

  if (!row) {
    return <DomainDashboardPage {...base} />;
  }

  const kpis = [
    {
      title: "Partenariats actifs",
      value: row.active_partnerships !== null ? row.active_partnerships.toLocaleString("fr-TN") : "—",
      delta: `sur ${row.total_partnerships ?? "—"} total`,
      accentColor: "#1B4F6B",
    },
    {
      title: "Mobilité sortante",
      value: row.total_outgoing_students !== null ? row.total_outgoing_students.toLocaleString("fr-TN") : "—",
      delta: `${row.total_incoming_students ?? "—"} entrants`,
      accentColor: "#2E7D32",
    },
    {
      title: "Partenariats internationaux",
      value: row.international_partnerships !== null ? row.international_partnerships.toLocaleString("fr-TN") : "—",
      delta: "hors Tunisie",
      accentColor: "#1B4F6B",
    },
    {
      title: "Académique / Industrie",
      value: `${row.academic_partnerships ?? "—"} / ${row.industry_partnerships ?? "—"}`,
      delta: "acad. · industrie",
      accentColor: "#C8A74B",
    },
  ];

  return <DomainDashboardPage {...base} kpis={kpis} />;
}
