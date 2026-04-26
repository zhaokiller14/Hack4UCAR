import { Suspense } from "react";
import { unstable_noStore } from "next/cache";
import { requireInstitutionRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import InstitutionSidebar from "@/components/layout/InstitutionSidebar";
import { getInstitutionLogo } from "@/app/constants/CONSTANTS";

/**
 * Formats a role string to be user-friendly.
 * Converts snake_case to Title Case (e.g., "institution_admin" → "Institution Admin")
 */
function formatRoleLabel(role: string | null | undefined): string {
	if (!role) return "Utilisateur";
	return role
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

/**
 * Fetches the institution code for a given institution ID.
 * The code is used for logo lookup (e.g., "insat", "supcom").
 */
async function getInstitutionCode(institutionId: string | null): Promise<string | null> {
	if (!institutionId) return null;
	
	const supabase = await createClient();
	const { data } = await supabase
		.from("institutions")
		.select("code")
		.eq("id", institutionId)
		.maybeSingle();
	
	return data?.code ?? null;
}

async function InstitutionLayoutInner({ children }: { children: React.ReactNode }) {
	const userContext = await requireInstitutionRole();
	const roleLabel = formatRoleLabel(userContext.role);
	
	// Fetch institution code for logo lookup
	const institutionCode = await getInstitutionCode(userContext.institutionId);
	const institutionLogo = getInstitutionLogo(institutionCode || "");

	return (
		<div className="flex h-screen overflow-hidden bg-[#FAF9F6]">
			<InstitutionSidebar
				userName={userContext.fullName ?? "Utilisateur"}
				userRole={roleLabel}
				institutionLogo={institutionLogo}
				institutionId={institutionCode || ""}
			/>
			<main className="flex-1 overflow-y-auto">{children}</main>
		</div>
	);
}

export default function InstitutionLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	unstable_noStore();
	
	return (
		<Suspense fallback={
			<div className="flex h-screen items-center justify-center bg-[#FAF9F6]">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1B4F6B] border-t-transparent" />
			</div>
		}>
			<InstitutionLayoutInner>{children}</InstitutionLayoutInner>
		</Suspense>
	);
}
