import KpiSummaryCard from "../dashboard/_components/KpiSummaryCard";
import SectionCard from "@/components/shared/SectionCard";
import { createClient } from "@/lib/supabase/server";

type AnnouncementRow = {
	id: string;
	title: string;
	body: string;
	audience: string;
	is_published: boolean;
	published_at: string | null;
	created_at: string;
};

function percent(part: number, total: number) {
	if (total === 0) {
		return 0;
	}

	return Math.round((part / total) * 100);
}

export default async function UcarAnnouncements() {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from("announcements")
		.select("id, title, body, audience, is_published, published_at, created_at")
		.order("created_at", { ascending: false })
		.limit(100);

	if (error) {
		return (
			<main className="p-8">
				<p className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
					Impossible de charger les annonces: {error.message}
				</p>
			</main>
		);
	}

	const announcements = (data ?? []) as AnnouncementRow[];
	const totalAnnouncements = announcements.length;
	const publishedCount = announcements.filter((item) => item.is_published).length;
	const draftCount = totalAnnouncements - publishedCount;
	const audiencesCount = new Set(announcements.map((item) => item.audience)).size;

	const audienceCounts = announcements.reduce<Record<string, number>>((acc, item) => {
		acc[item.audience] = (acc[item.audience] ?? 0) + 1;
		return acc;
	}, {});

	const monthlyCounts = announcements.reduce<Record<string, number>>((acc, item) => {
		const date = new Date(item.created_at);
		const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
		acc[key] = (acc[key] ?? 0) + 1;
		return acc;
	}, {});

	const topAudiences = Object.entries(audienceCounts).sort((a, b) => b[1] - a[1]);
	const topMonths = Object.entries(monthlyCounts)
		.sort((a, b) => b[0].localeCompare(a[0]))
		.slice(0, 6);

	return (
		<main className="mx-auto max-w-7xl space-y-8 p-8">
			<div>
				<h1 className="text-2xl font-semibold text-[#1B1C1A]">UCAR Announcements</h1>
				<p className="mt-0.5 text-sm text-slate-500">
					Statistiques de publication et diffusion des annonces institutionnelles.
				</p>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
				<KpiSummaryCard
					title="Annonces totales"
					value={String(totalAnnouncements)}
					sub="Historique récent"
					accentColor="#1B4F6B"
					trend="neutral"
				/>
				<KpiSummaryCard
					title="Publiées"
					value={String(publishedCount)}
					sub={`${percent(publishedCount, totalAnnouncements)}%`}
					accentColor="#2E7D32"
					trend={publishedCount > 0 ? "up" : "neutral"}
				/>
				<KpiSummaryCard
					title="Brouillons"
					value={String(draftCount)}
					sub={`${percent(draftCount, totalAnnouncements)}%`}
					accentColor="#C8A74B"
					trend={draftCount > 0 ? "neutral" : "up"}
				/>
				<KpiSummaryCard
					title="Audiences ciblées"
					value={String(audiencesCount)}
					sub="Segments actifs"
					accentColor="#1B4F6B"
					trend={audiencesCount > 0 ? "up" : "neutral"}
				/>
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<SectionCard title="Répartition par audience" description="Canaux de diffusion les plus utilisés">
					<div className="space-y-3">
						{topAudiences.length === 0 && <p className="text-sm text-slate-500">Aucune donnée disponible.</p>}
						{topAudiences.map(([audience, count]) => (
							<div key={audience} className="space-y-1">
								<div className="flex items-center justify-between gap-3">
									<p className="text-sm font-medium text-[#1B1C1A]">{audience}</p>
									<span className="text-xs text-slate-500">{count} annonces</span>
								</div>
								<div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
									<div
										className="h-full rounded-full bg-[#1B4F6B]"
										style={{ width: `${percent(count, totalAnnouncements)}%` }}
									/>
								</div>
							</div>
						))}
					</div>
				</SectionCard>

				<SectionCard title="Volume mensuel" description="Nombre d'annonces créées par mois">
					<div className="space-y-3">
						{topMonths.length === 0 && <p className="text-sm text-slate-500">Aucune donnée disponible.</p>}
						{topMonths.map(([month, count]) => (
							<div key={month} className="space-y-1">
								<div className="flex items-center justify-between gap-3">
									<p className="text-sm font-medium text-[#1B1C1A]">{month}</p>
									<span className="text-xs text-slate-500">{count} annonces</span>
								</div>
								<div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
									<div
										className="h-full rounded-full bg-[#C8A74B]"
										style={{ width: `${percent(count, totalAnnouncements)}%` }}
									/>
								</div>
							</div>
						))}
					</div>
				</SectionCard>
			</div>

			<SectionCard title="Dernières annonces" description="Messages récents et état de publication">
				<div className="space-y-3">
					{announcements.map((item) => (
						<article key={item.id} className="rounded-sm border border-[#003850]/10 p-4">
							<div className="flex flex-wrap items-center justify-between gap-2">
								<h3 className="text-sm font-semibold text-[#1B1C1A]">{item.title}</h3>
								<span
									className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-[11px] font-semibold tracking-wide ${
										item.is_published
											? "border-green-200 bg-green-100 text-green-700"
											: "border-slate-200 bg-slate-100 text-slate-600"
									}`}
								>
									{item.is_published ? "Publié" : "Brouillon"}
								</span>
							</div>
							<p className="mt-2 line-clamp-2 text-sm text-slate-600">{item.body}</p>
							<div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
								<span>Audience: {item.audience}</span>
								<span>Créé: {new Date(item.created_at).toLocaleDateString("fr-TN")}</span>
								<span>
									Publication: {item.published_at ? new Date(item.published_at).toLocaleDateString("fr-TN") : "-"}
								</span>
							</div>
						</article>
					))}
				</div>
			</SectionCard>
		</main>
	);
}
