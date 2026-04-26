import DomainDashboardPage from "../_components/DomainDashboardPage";
import { getInstitutionDomainDashboard } from "../_components/domainData";
import RawUploadCard from "@/components/institution/raw-upload-card";
import { requireInstitutionRole } from "@/lib/auth/guards";

export default async function InstitutionResearch() {
	const userContext = await requireInstitutionRole();

	return (
		<div className="space-y-6">
			<div className="mx-auto max-w-7xl px-8 pt-8">
				<RawUploadCard institutionId={userContext.institutionId ?? ""} defaultDomain="research" />
			</div>
			<DomainDashboardPage {...getInstitutionDomainDashboard("research")} />
		</div>
	);
}
