import { requireInstitutionRole } from "@/lib/auth/guards";
import InstitutionSidebar from "@/components/layout/InstitutionSidebar";

export default async function InstitutionLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const userContext = await requireInstitutionRole();
	const roleLabel = userContext.role ?? "Utilisateur";

	return (
		<div className="flex h-screen overflow-hidden bg-[#FAF9F6]">
			<InstitutionSidebar
				userName={userContext.fullName ?? "Utilisateur"}
				userRole={roleLabel}
			/>
			<main className="flex-1 overflow-y-auto">{children}</main>
		</div>
	);
}
