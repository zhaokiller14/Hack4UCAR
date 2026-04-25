import { LogoutButton } from "@/components/logout-button";

export default function UcarDashboard() {
	return (
		<main className="min-h-screen bg-[#F7F6F3] p-6 text-[#0D2B3E] md:p-10">
			<div className="mx-auto flex w-full max-w-4xl items-center justify-between rounded-xl border border-[#1B4F6B]/20 bg-white p-6 shadow-sm">
				<h1 className="text-2xl font-bold text-[#1B4F6B]">UCAR Dashboard</h1>
				<LogoutButton />
			</div>
		</main>
	);
}
