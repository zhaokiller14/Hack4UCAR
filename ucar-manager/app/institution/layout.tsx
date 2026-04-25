import { requireInstitutionRole } from "@/lib/auth/guards";

export default async function InstitutionLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	await requireInstitutionRole();

	return <section>{children}</section>;
}
