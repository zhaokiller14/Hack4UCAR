import DomainDashboardPage from "../_components/DomainDashboardPage";
import { getInstitutionDomainDashboard } from "../_components/domainData";

export default function InstitutionPartnerships() {
	return <DomainDashboardPage {...getInstitutionDomainDashboard("partnerships")} />;
}
