import KpiSummaryCard from "../dashboard/_components/KpiSummaryCard";
import SectionCard from "@/components/shared/SectionCard";
import SeverityBadge from "@/components/shared/SeverityBadge";
import { createClient } from "@/lib/supabase/server";
import { computeAndUpsertAlerts } from "@/lib/alerts/compute";

type AlertRow = {
  id: string;
  institution_id: string | null;
  kpi_domain: string;
  kpi_key: string;
  threshold_value: number | null;
  actual_value: number | null;
  severity: string;
  message: string;
  is_acknowledged: boolean;
  triggered_at: string;
  institutions: { name: string | null; code: string | null } | null;
};

function percent(part: number, total: number) {
  if (total === 0) {
    return 0;
  }

  return Math.round((part / total) * 100);
}

export default async function UcarAlerts() {
  const supabase = await createClient();

  // Compute fresh alerts for all institutions before rendering
  const { data: institutions } = await supabase
    .from("institutions")
    .select("id, organization_id");
  if (institutions) {
    await Promise.all(
      institutions.map((inst) =>
        computeAndUpsertAlerts(inst.id, inst.organization_id),
      ),
    );
  }

  const { data, error } = await supabase
    .from("alerts")
    .select(
      "id, institution_id, kpi_domain, kpi_key, threshold_value, actual_value, severity, message, is_acknowledged, triggered_at, institutions(name, code)",
    )
    .order("triggered_at", { ascending: false })
    .limit(80);

  if (error) {
    return (
      <main className="p-8">
        <p className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Impossible de charger les alertes: {error.message}
        </p>
      </main>
    );
  }

  const alerts = (data ?? []) as AlertRow[];
  const totalAlerts = alerts.length;
  const acknowledgedCount = alerts.filter(
    (item) => item.is_acknowledged,
  ).length;
  const unacknowledgedCount = totalAlerts - acknowledgedCount;
  const criticalOrHighCount = alerts.filter(
    (item) => item.severity === "critical" || item.severity === "high",
  ).length;

  const severityCounts = alerts.reduce<Record<string, number>>((acc, item) => {
    acc[item.severity] = (acc[item.severity] ?? 0) + 1;
    return acc;
  }, {});

  const domainCounts = alerts.reduce<Record<string, number>>((acc, item) => {
    acc[item.kpi_domain] = (acc[item.kpi_domain] ?? 0) + 1;
    return acc;
  }, {});

  const topSeverities = Object.entries(severityCounts).sort(
    (a, b) => b[1] - a[1],
  );
  const topDomains = Object.entries(domainCounts).sort((a, b) => b[1] - a[1]);

  return (
    <main className="space-y-8 p-8">
      <div>
        <h1 className="text-2xl font-semibold text-[#1B1C1A]">UCAR Alerts</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Vue statistique des alertes réseau détectées sur les KPIs
          institutionnels.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiSummaryCard
          title="Alertes totales"
          value={String(totalAlerts)}
          sub="Fenêtre courante"
          accentColor="#1B4F6B"
          trend="neutral"
        />
        <KpiSummaryCard
          title="Critiques + élevées"
          value={String(criticalOrHighCount)}
          sub={`${percent(criticalOrHighCount, totalAlerts)}% du total`}
          accentColor="#BA1A1A"
          trend={criticalOrHighCount > 0 ? "down" : "neutral"}
        />
        <KpiSummaryCard
          title="Non acquittées"
          value={String(unacknowledgedCount)}
          sub={`${percent(unacknowledgedCount, totalAlerts)}%`}
          accentColor="#C8A74B"
          trend={unacknowledgedCount > 0 ? "down" : "neutral"}
        />
        <KpiSummaryCard
          title="Alertes acquittées"
          value={String(acknowledgedCount)}
          sub={`${percent(acknowledgedCount, totalAlerts)}%`}
          accentColor="#2E7D32"
          trend={acknowledgedCount > 0 ? "up" : "neutral"}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard
          title="Répartition par sévérité"
          description="Volume d'alertes par niveau de criticité"
        >
          <div className="space-y-3">
            {topSeverities.length === 0 && (
              <p className="text-sm text-slate-500">
                Aucune alerte disponible.
              </p>
            )}
            {topSeverities.map(([severity, count]) => (
              <div key={severity} className="space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <SeverityBadge severity={severity} />
                  <span className="text-xs text-slate-500">
                    {count} alertes
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[#1B4F6B]"
                    style={{ width: `${percent(count, totalAlerts)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Répartition par domaine KPI"
          description="Domaines les plus exposés aux anomalies"
        >
          <div className="space-y-3">
            {topDomains.length === 0 && (
              <p className="text-sm text-slate-500">
                Aucune donnée disponible.
              </p>
            )}
            {topDomains.map(([domain, count]) => (
              <div key={domain} className="space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-[#1B1C1A]">{domain}</p>
                  <span className="text-xs text-slate-500">
                    {count} alertes
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[#C8A74B]"
                    style={{ width: `${percent(count, totalAlerts)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Dernières alertes"
        description="Flux temps réel des alertes UCAR"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-2 py-2">Date</th>
                <th className="px-2 py-2">Institution</th>
                <th className="px-2 py-2">Domaine</th>
                <th className="px-2 py-2">KPI</th>
                <th className="px-2 py-2">Sévérité</th>
                <th className="px-2 py-2">Écart</th>
                <th className="px-2 py-2">Message</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((item) => {
                const delta =
                  item.actual_value !== null && item.threshold_value !== null
                    ? item.actual_value - item.threshold_value
                    : null;

                return (
                  <tr
                    key={item.id}
                    className="border-t border-[#003850]/10 align-top"
                  >
                    <td className="px-2 py-2 text-slate-500">
                      {new Date(item.triggered_at).toLocaleDateString("fr-TN")}
                    </td>
                    <td className="px-2 py-2 text-[#1B1C1A]">
                      {item.institutions?.code ?? "UCAR"}
                    </td>
                    <td className="px-2 py-2 text-slate-600">
                      {item.kpi_domain}
                    </td>
                    <td className="px-2 py-2 text-slate-600">{item.kpi_key}</td>
                    <td className="px-2 py-2">
                      <SeverityBadge severity={item.severity} />
                    </td>
                    <td className="px-2 py-2 text-slate-600">
                      {delta === null ? "-" : delta.toFixed(2)}
                    </td>
                    <td className="px-2 py-2 text-slate-600">{item.message}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </main>
  );
}
