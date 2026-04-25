import DomainDashboardPage from "../_components/DomainDashboardPage";
import { getInstitutionDomainDashboard } from "../_components/domainData";

export default function InstitutionResearch() {
	return <DomainDashboardPage {...getInstitutionDomainDashboard("research")} />;
}
