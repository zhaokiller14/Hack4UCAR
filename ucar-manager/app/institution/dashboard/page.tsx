import DomainDashboardPage from "../_components/DomainDashboardPage";
import { getInstitutionDomainDashboard } from "../_components/domainData";

export default function InstitutionDashboard() {
	return <DomainDashboardPage {...getInstitutionDomainDashboard("dashboard")} />;
}
