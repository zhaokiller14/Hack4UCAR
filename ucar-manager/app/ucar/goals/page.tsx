import KpiSummaryCard from "../dashboard/_components/KpiSummaryCard";
import SectionCard from "@/components/shared/SectionCard";
import { createClient } from "@/lib/supabase/server";

type GoalRow = {
	id: string;
	institution_id: string | null;
	domain: string;
	kpi_key: string;
	target_value: number;
	academic_year: string;
	description: string | null;
	scope: string;
	created_at: string;
	institutions: { name: string | null } | null;
};

function percent(part: number, total: number) {
	if (total === 0) {
		return 0;
	}

	return Math.round((part / total) * 100);
}

export default async function UcarGoals() {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from("strategic_goals")
		.select(
			"id, institution_id, domain, kpi_key, target_value, academic_year, description, scope, created_at, institutions(name)",
		)
		.order("created_at", { ascending: false })
		.limit(100);

	if (error) {
		return (
			<main className="p-8">
				<p className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
					Impossible de charger les objectifs stratégiques: {error.message}
				</p>
			</main>
		);
	}

	const goals = (data ?? []) as GoalRow[];
	const totalGoals = goals.length;
	const organizationScopeCount = goals.filter((item) => item.scope === "organization").length;
	const institutionScopeCount = totalGoals - organizationScopeCount;
	const uniqueDomains = new Set(goals.map((item) => item.domain)).size;

	const domainCounts = goals.reduce<Record<string, number>>((acc, item) => {
		acc[item.domain] = (acc[item.domain] ?? 0) + 1;
		return acc;
	}, {});

	const yearCounts = goals.reduce<Record<string, number>>((acc, item) => {
		acc[item.academic_year] = (acc[item.academic_year] ?? 0) + 1;
		return acc;
	}, {});

	const topDomains = Object.entries(domainCounts).sort((a, b) => b[1] - a[1]);
	const topYears = Object.entries(yearCounts).sort((a, b) => b[1] - a[1]);

	return (
		<main className="mx-auto max-w-7xl space-y-8 p-8">
			<div>
				<h1 className="text-2xl font-semibold text-[#1B1C1A]">UCAR Strategic Goals</h1>
				<p className="mt-0.5 text-sm text-slate-500">
					Pilotage des objectifs stratégiques et de leur couverture par domaine.
				</p>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
				<KpiSummaryCard
					title="Objectifs totaux"
					value={String(totalGoals)}
					sub="Catalogue actif"
					accentColor="#1B4F6B"
					trend="neutral"
				/>
				<KpiSummaryCard
					title="Portée organisation"
					value={String(organizationScopeCount)}
					sub={`${percent(organizationScopeCount, totalGoals)}% du total`}
					accentColor="#2E7D32"
					trend={organizationScopeCount > 0 ? "up" : "neutral"}
				/>
				<KpiSummaryCard
					title="Portée institution"
					value={String(institutionScopeCount)}
					sub={`${percent(institutionScopeCount, totalGoals)}% du total`}
					accentColor="#C8A74B"
					trend={institutionScopeCount > 0 ? "neutral" : "down"}
				/>
				<KpiSummaryCard
					title="Domaines couverts"
					value={String(uniqueDomains)}
					sub="Domaines KPI"
					accentColor="#1B4F6B"
					trend={uniqueDomains > 0 ? "up" : "neutral"}
				/>
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<SectionCard title="Répartition par domaine" description="Concentration des objectifs par domaine KPI">
					<div className="space-y-3">
						{topDomains.length === 0 && <p className="text-sm text-slate-500">Aucune donnée disponible.</p>}
						{topDomains.map(([domain, count]) => (
							<div key={domain} className="space-y-1">
								<div className="flex items-center justify-between gap-3">
									<p className="text-sm font-medium text-[#1B1C1A]">{domain}</p>
									<span className="text-xs text-slate-500">{count} objectifs</span>
								</div>
								<div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
									<div
										className="h-full rounded-full bg-[#1B4F6B]"
										style={{ width: `${percent(count, totalGoals)}%` }}
									/>
								</div>
							</div>
						))}
					</div>
				</SectionCard>

				<SectionCard title="Répartition par année académique" description="Volumes d'objectifs par cycle annuel">
					<div className="space-y-3">
						{topYears.length === 0 && <p className="text-sm text-slate-500">Aucune donnée disponible.</p>}
						{topYears.map(([year, count]) => (
							<div key={year} className="space-y-1">
								<div className="flex items-center justify-between gap-3">
									<p className="text-sm font-medium text-[#1B1C1A]">{year}</p>
									<span className="text-xs text-slate-500">{count} objectifs</span>
								</div>
								<div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
									<div
										className="h-full rounded-full bg-[#C8A74B]"
										style={{ width: `${percent(count, totalGoals)}%` }}
									/>
								</div>
							</div>
						))}
					</div>
				</SectionCard>
			</div>

			<SectionCard title="Objectifs récents" description="Derniers objectifs stratégiques enregistrés">
				<div className="overflow-x-auto">
					<table className="min-w-full text-sm">
						<thead className="text-left text-xs uppercase tracking-wider text-slate-500">
							<tr>
								<th className="px-2 py-2">Créé le</th>
								<th className="px-2 py-2">Domaine</th>
								<th className="px-2 py-2">KPI</th>
								<th className="px-2 py-2">Cible</th>
								<th className="px-2 py-2">Portée</th>
								<th className="px-2 py-2">Institution</th>
								<th className="px-2 py-2">Année</th>
							</tr>
						</thead>
						<tbody>
							{goals.map((item) => (
								<tr key={item.id} className="border-t border-[#003850]/10 align-top">
									<td className="px-2 py-2 text-slate-500">
										{new Date(item.created_at).toLocaleDateString("fr-TN")}
									</td>
									<td className="px-2 py-2 text-[#1B1C1A]">{item.domain}</td>
									<td className="px-2 py-2 text-slate-600">{item.kpi_key}</td>
									<td className="px-2 py-2 text-slate-600">{item.target_value}</td>
									<td className="px-2 py-2 text-slate-600">{item.scope}</td>
									<td className="px-2 py-2 text-slate-600">{item.institutions?.name ?? "UCAR"}</td>
									<td className="px-2 py-2 text-slate-600">{item.academic_year}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</SectionCard>
		</main>
	);
}
