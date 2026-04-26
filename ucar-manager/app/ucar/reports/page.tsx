import KpiSummaryCard from "../dashboard/_components/KpiSummaryCard";
import SectionCard from "@/components/shared/SectionCard";
import StatusBadge from "@/components/shared/StatusBadge";
import { createClient } from "@/lib/supabase/server";

type ReportRow = {
	id: string;
	institution_id: string | null;
	title: string;
	period_type: string;
	period_start: string;
	period_end: string;
	storage_path: string | null;
	status: string;
	generated_at: string;
	institutions: { name: string | null } | null;
};

function percent(part: number, total: number) {
	if (total === 0) {
		return 0;
	}

	return Math.round((part / total) * 100);
}

export default async function UcarReports() {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from("reports")
		.select(
			"id, institution_id, title, period_type, period_start, period_end, storage_path, status, generated_at, institutions(name)",
		)
		.order("generated_at", { ascending: false })
		.limit(100);

	if (error) {
		return (
			<main className="p-8">
				<p className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
					Impossible de charger les rapports: {error.message}
				</p>
			</main>
		);
	}

	const reports = (data ?? []) as ReportRow[];
	const totalReports = reports.length;
	const completedCount = reports.filter((item) => item.status === "completed").length;
	const failedCount = reports.filter((item) => item.status === "failed").length;
	const inProgressCount = reports.filter(
		(item) => item.status === "pending" || item.status === "processing",
	).length;

	const periodCounts = reports.reduce<Record<string, number>>((acc, item) => {
		acc[item.period_type] = (acc[item.period_type] ?? 0) + 1;
		return acc;
	}, {});

	const statusCounts = reports.reduce<Record<string, number>>((acc, item) => {
		acc[item.status] = (acc[item.status] ?? 0) + 1;
		return acc;
	}, {});

	const topPeriods = Object.entries(periodCounts).sort((a, b) => b[1] - a[1]);
	const topStatuses = Object.entries(statusCounts).sort((a, b) => b[1] - a[1]);

	return (
		<main className="mx-auto max-w-7xl space-y-8 p-8">
			<div>
				<h1 className="text-2xl font-semibold text-[#1B1C1A]">UCAR Reports</h1>
				<p className="mt-0.5 text-sm text-slate-500">
					Statistiques de génération et état d'avancement des rapports UCAR.
				</p>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
				<KpiSummaryCard
					title="Rapports totaux"
					value={String(totalReports)}
					sub="Fenêtre courante"
					accentColor="#1B4F6B"
					trend="neutral"
				/>
				<KpiSummaryCard
					title="Terminés"
					value={String(completedCount)}
					sub={`${percent(completedCount, totalReports)}%`}
					accentColor="#2E7D32"
					trend={completedCount > 0 ? "up" : "neutral"}
				/>
				<KpiSummaryCard
					title="En cours"
					value={String(inProgressCount)}
					sub={`${percent(inProgressCount, totalReports)}%`}
					accentColor="#C8A74B"
					trend={inProgressCount > 0 ? "neutral" : "up"}
				/>
				<KpiSummaryCard
					title="Échoués"
					value={String(failedCount)}
					sub={`${percent(failedCount, totalReports)}%`}
					accentColor="#BA1A1A"
					trend={failedCount > 0 ? "down" : "neutral"}
				/>
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<SectionCard title="Répartition par statut" description="Distribution des rapports par état de traitement">
					<div className="space-y-3">
						{topStatuses.length === 0 && <p className="text-sm text-slate-500">Aucune donnée disponible.</p>}
						{topStatuses.map(([status, count]) => (
							<div key={status} className="space-y-1">
								<div className="flex items-center justify-between gap-3">
									<StatusBadge status={status} />
									<span className="text-xs text-slate-500">{count} rapports</span>
								</div>
								<div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
									<div
										className="h-full rounded-full bg-[#1B4F6B]"
										style={{ width: `${percent(count, totalReports)}%` }}
									/>
								</div>
							</div>
						))}
					</div>
				</SectionCard>

				<SectionCard title="Répartition par période" description="Typologie des rapports générés">
					<div className="space-y-3">
						{topPeriods.length === 0 && <p className="text-sm text-slate-500">Aucune donnée disponible.</p>}
						{topPeriods.map(([period, count]) => (
							<div key={period} className="space-y-1">
								<div className="flex items-center justify-between gap-3">
									<p className="text-sm font-medium text-[#1B1C1A]">{period}</p>
									<span className="text-xs text-slate-500">{count} rapports</span>
								</div>
								<div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
									<div
										className="h-full rounded-full bg-[#C8A74B]"
										style={{ width: `${percent(count, totalReports)}%` }}
									/>
								</div>
							</div>
						))}
					</div>
				</SectionCard>
			</div>

			<SectionCard title="Derniers rapports" description="Dernières générations et disponibilité des fichiers">
				<div className="overflow-x-auto">
					<table className="min-w-full text-sm">
						<thead className="text-left text-xs uppercase tracking-wider text-slate-500">
							<tr>
								<th className="px-2 py-2">Généré le</th>
								<th className="px-2 py-2">Titre</th>
								<th className="px-2 py-2">Institution</th>
								<th className="px-2 py-2">Période</th>
								<th className="px-2 py-2">Statut</th>
								<th className="px-2 py-2">Fichier</th>
							</tr>
						</thead>
						<tbody>
							{reports.map((item) => (
								<tr key={item.id} className="border-t border-[#003850]/10 align-top">
									<td className="px-2 py-2 text-slate-500">
										{new Date(item.generated_at).toLocaleDateString("fr-TN")}
									</td>
									<td className="px-2 py-2 text-[#1B1C1A]">{item.title}</td>
									<td className="px-2 py-2 text-slate-600">{item.institutions?.name ?? "UCAR"}</td>
									<td className="px-2 py-2 text-slate-600">
										{item.period_type} ({item.period_start} → {item.period_end})
									</td>
									<td className="px-2 py-2">
										<StatusBadge status={item.status} />
									</td>
									<td className="px-2 py-2 text-slate-600">{item.storage_path ?? "-"}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</SectionCard>
		</main>
	);
}
