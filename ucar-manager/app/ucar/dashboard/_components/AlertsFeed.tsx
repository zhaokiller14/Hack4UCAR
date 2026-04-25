import SectionCard from "@/components/shared/SectionCard";
import SeverityBadge from "@/components/shared/SeverityBadge";

export interface AlertItem {
  id: string;
  institution_name: string;
  metric: string;
  deviation: number;
  severity: string;
  triggered_at: string;
}

const METRIC_FR: Record<string, string> = {
  dropout_rate:      "Taux d'abandon",
  budget_execution:  "Exécution budgétaire",
  absenteeism_rate:  "Taux d'absentéisme",
  success_rate:      "Taux de réussite",
};

const SEVERITY_BORDER: Record<string, string> = {
  critical: "border-red-200 bg-red-50",
  high:     "border-orange-200 bg-orange-50",
  medium:   "border-yellow-200 bg-yellow-50",
  low:      "border-slate-200 bg-slate-50",
};

function timeAgo(iso: string) {
  const diffH = Math.round((Date.now() - new Date(iso).getTime()) / 3_600_000);
  if (diffH < 1) return "Il y a moins d'1h";
  if (diffH < 24) return `Il y a ${diffH}h`;
  const diffD = Math.round(diffH / 24);
  return `Il y a ${diffD}j`;
}

export default function AlertsFeed({ alerts }: { alerts: AlertItem[] }) {
  return (
    <SectionCard title="Alertes actives" description="Anomalies non acquittées sur le réseau">
      {alerts.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-6">Aucune alerte active</p>
      ) : (
        <ul className="space-y-3">
          {alerts.map((alert) => (
            <li
              key={alert.id}
              className={`flex flex-col gap-1.5 p-3 border rounded-sm ${SEVERITY_BORDER[alert.severity] ?? "border-slate-200 bg-slate-50"}`}
            >
              <div className="flex justify-between items-start">
                <SeverityBadge severity={alert.severity} />
                <span className="text-[11px] text-slate-400">{timeAgo(alert.triggered_at)}</span>
              </div>
              <p className="text-sm text-[#1B1C1A]">
                {METRIC_FR[alert.metric] ?? alert.metric} — <span className="font-medium">{alert.institution_name}</span>
              </p>
              <p className="text-[11px] text-slate-500">
                Écart : {alert.deviation > 0 ? "+" : ""}{alert.deviation.toFixed(1)}σ
              </p>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
