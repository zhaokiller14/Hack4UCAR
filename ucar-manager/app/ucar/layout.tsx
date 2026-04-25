import { requireUcarAdmin } from "@/lib/auth/guards";

export default async function UcarLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	await requireUcarAdmin();

	return <section>{children}</section>;
}
