import { requireInstitutionRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { computeAndUpsertAlerts } from "@/lib/alerts/compute";
import { acknowledgeAlert } from "@/lib/actions/alerts";
import SeverityBadge from "@/components/shared/SeverityBadge";
import SectionCard from "@/components/shared/SectionCard";

type AlertRow = {
  id: string;
  kpi_domain: string;
  kpi_key: string;
  threshold_value: number | null;
  actual_value: number | null;
  severity: string;
  message: string;
  is_acknowledged: boolean;
  triggered_at: string;
};

const DOMAIN_FR: Record<string, string> = {
  academic: "Académique",
  finance: "Finance",
  hr: "RH",
  research: "Recherche",
  esg: "ESG",
  employment: "Emploi",
  infrastructure: "Infrastructure",
  partnerships: "Partenariats",
};

export default async function InstitutionAlerts() {
  const ctx = await requireInstitutionRole();

  if (!ctx.institutionId || !ctx.organizationId) {
    return <div className="p-8 text-sm text-slate-500">Institution introuvable.</div>;
  }

  await computeAndUpsertAlerts(ctx.institutionId, ctx.organizationId);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("alerts")
    .select("id, kpi_domain, kpi_key, threshold_value, actual_value, severity, message, is_acknowledged, triggered_at")
    .eq("institution_id", ctx.institutionId)
    .order("is_acknowledged", { ascending: true })
    .order("triggered_at", { ascending: false });

  if (error) {
    return (
      <div className="p-8">
        <p className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Erreur: {error.message}
        </p>
      </div>
    );
  }

  const alerts = (data ?? []) as AlertRow[];
  const active = alerts.filter((a) => !a.is_acknowledged);
  const acknowledged = alerts.filter((a) => a.is_acknowledged);

  async function handleAcknowledge(formData: FormData) {
    "use server";
    const alertId = formData.get("alertId") as string;
    if (alertId) await acknowledgeAlert(alertId);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold text-[#1B1C1A]">Alertes</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          {active.length} alerte{active.length !== 1 ? "s" : ""} active{active.length !== 1 ? "s" : ""}
          {acknowledged.length > 0 && ` · ${acknowledged.length} acquittée${acknowledged.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {alerts.length === 0 && (
        <div className="rounded-sm border border-green-200 bg-green-50 px-4 py-6 text-center text-sm text-green-700">
          Aucune alerte active. Tous les KPIs sont dans les seuils normaux.
        </div>
      )}

      {active.length > 0 && (
        <SectionCard title="Alertes actives" description="KPIs hors seuils — action recommandée">
          <AlertTable alerts={active} ackAction={handleAcknowledge} showAck />
        </SectionCard>
      )}

      {acknowledged.length > 0 && (
        <SectionCard title="Alertes acquittées" description="Traitées ou en cours de résolution">
          <AlertTable alerts={acknowledged} ackAction={handleAcknowledge} showAck={false} />
        </SectionCard>
      )}
    </div>
  );
}

function AlertTable({
  alerts,
  ackAction,
  showAck,
}: {
  alerts: AlertRow[];
  ackAction: (formData: FormData) => Promise<void>;
  showAck: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-[#FAF9F6] border-b border-[#003850]/10">
          <tr>
            {["Sévérité", "Domaine", "KPI", "Valeur", "Seuil", "Message", "Date"].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {h}
              </th>
            ))}
            {showAck && <th className="px-4 py-3" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {alerts.map((alert) => (
            <tr key={alert.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3">
                <SeverityBadge severity={alert.severity} />
              </td>
              <td className="px-4 py-3 text-slate-600">
                {DOMAIN_FR[alert.kpi_domain] ?? alert.kpi_domain}
              </td>
              <td className="px-4 py-3 font-mono text-xs text-slate-500">{alert.kpi_key}</td>
              <td className="px-4 py-3 font-medium text-[#1B1C1A]">
                {alert.actual_value !== null ? alert.actual_value.toFixed(1) : "—"}
              </td>
              <td className="px-4 py-3 text-slate-500">
                {alert.threshold_value !== null ? alert.threshold_value.toFixed(0) : "—"}
              </td>
              <td className="px-4 py-3 text-slate-600 max-w-xs">{alert.message}</td>
              <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                {new Date(alert.triggered_at).toLocaleDateString("fr-TN")}
              </td>
              {showAck && (
                <td className="px-4 py-3">
                  <form action={ackAction}>
                    <input type="hidden" name="alertId" value={alert.id} />
                    <button
                      type="submit"
                      className="rounded-sm border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      Acquitter
                    </button>
                  </form>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
