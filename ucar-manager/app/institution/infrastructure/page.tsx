import DomainDashboardPage from "../_components/DomainDashboardPage";
import { getInstitutionDomainDashboard } from "../_components/domainData";

export default function InstitutionInfrastructure() {
	return <DomainDashboardPage {...getInstitutionDomainDashboard("infrastructure")} />;
}
