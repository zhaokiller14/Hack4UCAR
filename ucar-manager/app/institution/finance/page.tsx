import DomainDashboardPage from "../_components/DomainDashboardPage";
import { getInstitutionDomainDashboard } from "../_components/domainData";

export default function InstitutionFinanceDashboard() {
  return <DomainDashboardPage {...getInstitutionDomainDashboard("finance")} />;
}
