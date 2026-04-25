import { Suspense } from "react";

import { requireInstitutionRole } from "@/lib/auth/guards";

async function InstitutionAccessGate() {
  await requireInstitutionRole();
  return null;
}

export default async function InstitutionLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<section>
			<Suspense fallback={null}>
				<InstitutionAccessGate />
			</Suspense>
			{children}
		</section>
	);
}
