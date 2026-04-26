import KpiSummaryCard from "../dashboard/_components/KpiSummaryCard";
import SectionCard from "@/components/shared/SectionCard";
import AnnouncementsTable from "../_components/AnnouncementsTable";
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
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}

const AUDIENCE_META: Record<
  string,
  { label: string; color: string; bg: string; bar: string }
> = {
  all: { label: "Tous", color: "#1B4F6B", bg: "#EBF4FA", bar: "#1B4F6B" },
  staff: {
    label: "Personnel",
    color: "#7B3F9E",
    bg: "#F5EEF8",
    bar: "#7B3F9E",
  },
  students: {
    label: "Étudiants",
    color: "#2E7D32",
    bg: "#EBF5EB",
    bar: "#2E7D32",
  },
  teachers: {
    label: "Enseignants",
    color: "#C0392B",
    bg: "#FDEDEC",
    bar: "#C0392B",
  },
  admin: { label: "Admins", color: "#D4860A", bg: "#FEF9E7", bar: "#D4860A" },
};

function audienceLabel(audience: string) {
  return AUDIENCE_META[audience]?.label ?? audience;
}

function formatMonth(key: string) {
  const [year, month] = key.split("-");
  return new Date(Number(year), Number(month) - 1).toLocaleDateString("fr-TN", {
    month: "short",
    year: "numeric",
  });
}

export default async function UcarAnnouncements() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("announcements")
    .select("id, title, body, audience, is_published, published_at, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

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
  const publishedCount = announcements.filter(
    (item) => item.is_published,
  ).length;
  const draftCount = totalAnnouncements - publishedCount;
  const audiencesCount = new Set(announcements.map((item) => item.audience))
    .size;

  const audienceCounts = announcements.reduce<Record<string, number>>(
    (acc, item) => {
      acc[item.audience] = (acc[item.audience] ?? 0) + 1;
      return acc;
    },
    {},
  );

  const monthlyCounts = announcements.reduce<Record<string, number>>(
    (acc, item) => {
      const date = new Date(item.created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    },
    {},
  );

  const topAudiences = Object.entries(audienceCounts).sort(
    (a, b) => b[1] - a[1],
  );
  const topMonths = Object.entries(monthlyCounts)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 6);

  const maxMonthCount = Math.max(...topMonths.map(([, c]) => c), 1);

  return (
    <main className="mx-auto max-w-7xl space-y-8 p-8">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1B1C1A]">
            Annonces institutionnelles
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Statistiques de publication et diffusion des annonces UCAR.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            {publishedCount} publiées
          </span>
          {draftCount > 0 && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
              {draftCount} brouillon{draftCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* KPI cards */}
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
          sub={`${percent(publishedCount, totalAnnouncements)}% du total`}
          accentColor="#2E7D32"
          trend={publishedCount > 0 ? "up" : "neutral"}
        />
        <KpiSummaryCard
          title="Brouillons"
          value={String(draftCount)}
          sub={`${percent(draftCount, totalAnnouncements)}% du total`}
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

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard
          title="Répartition par audience"
          description="Canaux de diffusion les plus utilisés"
        >
          <div className="space-y-3">
            {topAudiences.length === 0 && (
              <p className="text-sm text-slate-500">
                Aucune donnée disponible.
              </p>
            )}
            {topAudiences.map(([audience, count]) => {
              const meta = AUDIENCE_META[audience];
              return (
                <div key={audience} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0"
                        style={{ background: meta?.bar ?? "#64748b" }}
                      />
                      <p className="text-sm font-medium text-[#1B1C1A]">
                        {audienceLabel(audience)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#1B1C1A]">
                        {count}
                      </span>
                      <span className="text-xs text-slate-400">
                        ({percent(count, totalAnnouncements)}%)
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percent(count, totalAnnouncements)}%`,
                        background: meta?.bar ?? "#64748b",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard
          title="Volume mensuel"
          description="Annonces créées par mois (6 derniers mois)"
        >
          <div className="space-y-3">
            {topMonths.length === 0 && (
              <p className="text-sm text-slate-500">
                Aucune donnée disponible.
              </p>
            )}
            {topMonths.map(([month, count]) => (
              <div key={month} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-[#1B1C1A]">
                    {formatMonth(month)}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#1B1C1A]">
                      {count}
                    </span>
                    <span className="text-xs text-slate-400">
                      annonce{count > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[#C8A74B] transition-all duration-500"
                    style={{ width: `${percent(count, maxMonthCount)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Filterable announcements table — client component */}
      <AnnouncementsTable announcements={announcements} />
    </main>
  );
}
