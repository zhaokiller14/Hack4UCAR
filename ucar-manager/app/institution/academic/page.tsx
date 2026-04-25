import DomainDashboardPage from "../_components/DomainDashboardPage";
import { getInstitutionDomainDashboard } from "../_components/domainData";

export default function InstitutionAcademicDashboard() {
  return <DomainDashboardPage {...getInstitutionDomainDashboard("academic")} />;
}
