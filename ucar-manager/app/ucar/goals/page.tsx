import KpiSummaryCard from "../dashboard/_components/KpiSummaryCard";
import SectionCard from "@/components/shared/SectionCard";
import GoalsTable from "../_components/GoalsTable";
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

const DOMAIN_META: Record<
  string,
  { label: string; color: string; bg: string; bar: string }
> = {
  academic: {
    label: "Académique",
    color: "#1B4F6B",
    bg: "#EBF4FA",
    bar: "#1B4F6B",
  },
  hr: { label: "RH", color: "#7B3F9E", bg: "#F5EEF8", bar: "#7B3F9E" },
  finance: {
    label: "Finance",
    color: "#2E7D32",
    bg: "#EBF5EB",
    bar: "#2E7D32",
  },
  research: {
    label: "Recherche",
    color: "#C0392B",
    bg: "#FDEDEC",
    bar: "#C0392B",
  },
  esg: { label: "ESG", color: "#D4860A", bg: "#FEF9E7", bar: "#D4860A" },
};

function domainLabel(domain: string) {
  return DOMAIN_META[domain]?.label ?? domain;
}

function percent(part: number, total: number) {
  if (total === 0) return 0;
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
    .limit(200);

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
  const organizationScopeCount = goals.filter(
    (item) => item.scope === "organization" || item.scope === "ucar_wide",
  ).length;
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
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1B1C1A]">
            Objectifs stratégiques UCAR
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Pilotage des objectifs stratégiques et de leur couverture par
            domaine.
          </p>
        </div>
        <span className="rounded-full bg-[#1B4F6B]/10 px-3 py-1 text-xs font-semibold text-[#1B4F6B]">
          {totalGoals} objectifs
        </span>
      </div>

      {/* KPI cards */}
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

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard
          title="Répartition par domaine"
          description="Concentration des objectifs par domaine KPI"
        >
          <div className="space-y-3">
            {topDomains.length === 0 && (
              <p className="text-sm text-slate-500">
                Aucune donnée disponible.
              </p>
            )}
            {topDomains.map(([domain, count]) => {
              const meta = DOMAIN_META[domain];
              return (
                <div key={domain} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0"
                        style={{ background: meta?.color ?? "#64748b" }}
                      />
                      <p className="text-sm font-medium text-[#1B1C1A]">
                        {domainLabel(domain)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#1B1C1A]">
                        {count}
                      </span>
                      <span className="text-xs text-slate-400">
                        ({percent(count, totalGoals)}%)
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percent(count, totalGoals)}%`,
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
          title="Répartition par année académique"
          description="Volumes d'objectifs par cycle annuel"
        >
          <div className="space-y-3">
            {topYears.length === 0 && (
              <p className="text-sm text-slate-500">
                Aucune donnée disponible.
              </p>
            )}
            {topYears.map(([year, count]) => (
              <div key={year} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-[#1B1C1A]">{year}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#1B1C1A]">
                      {count}
                    </span>
                    <span className="text-xs text-slate-400">
                      ({percent(count, totalGoals)}%)
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[#C8A74B] transition-all duration-500"
                    style={{ width: `${percent(count, totalGoals)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Filterable goals table — client component */}
      <GoalsTable goals={goals} />
    </main>
  );
}
