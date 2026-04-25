import ProgressBar from "@/components/shared/ProgressBar";
import SectionCard from "@/components/shared/SectionCard";
import SeverityBadge from "@/components/shared/SeverityBadge";
import StatusBadge from "@/components/shared/StatusBadge";

type KpiCard = {
  title: string;
  value: string;
  delta: string;
  accentColor: string;
};

type AlertItem = {
  id: string;
  metric: string;
  detail: string;
  severity: "critical" | "high" | "medium" | "low";
};

type GoalItem = {
  label: string;
  progress: number;
  target: string;
};

type PipelineItem = {
  id: string;
  name: string;
  updatedAt: string;
  status: "pending" | "processing" | "completed" | "failed";
};

type ActionItem = {
  id: string;
  label: string;
  owner: string;
};

type ReportItem = {
  id: string;
  title: string;
  period: string;
};

type DomainDashboardPageProps = {
  title: string;
  subtitle: string;
  kpis: KpiCard[];
  alerts: AlertItem[];
  goals: GoalItem[];
  pipeline: PipelineItem[];
  actions: ActionItem[];
  reports: ReportItem[];
};

function TodayDate() {
  return new Intl.DateTimeFormat("fr-TN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

export default function DomainDashboardPage({
  title,
  subtitle,
  kpis,
  alerts,
  goals,
  pipeline,
  actions,
  reports,
}: DomainDashboardPageProps) {
  return (
    <div className="mx-auto max-w-7xl space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1B1C1A]">{title}</h1>
          <p className="mt-0.5 text-sm capitalize text-slate-500">
            {subtitle} - <TodayDate />
          </p>
        </div>
        <button className="rounded-sm bg-[#003850] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#1B4F6B]">
          Exporter ce domaine
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.title}
            className="rounded-sm border border-[#003850]/10 bg-white p-4"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              {kpi.title}
            </p>
            <div className="mt-2 flex items-end justify-between">
              <p className="text-2xl font-semibold text-[#1B1C1A]">{kpi.value}</p>
              <span
                className="rounded-sm px-2 py-0.5 text-[11px] font-semibold"
                style={{ backgroundColor: `${kpi.accentColor}1A`, color: kpi.accentColor }}
              >
                {kpi.delta}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard
          title="Alertes intelligentes"
          description="Elements detectes automatiquement sur vos KPIs"
        >
          <ul className="space-y-3">
            {alerts.map((alert) => (
              <li key={alert.id} className="rounded-sm border border-slate-200 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-[#1B1C1A]">{alert.metric}</p>
                  <SeverityBadge severity={alert.severity} />
                </div>
                <p className="text-xs text-slate-600">{alert.detail}</p>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard
          title="Suivi des objectifs"
          description="Progression vers les cibles institutionnelles"
        >
          <div className="space-y-4">
            {goals.map((goal) => (
              <ProgressBar
                key={goal.label}
                label={goal.label}
                value={goal.progress}
                target={goal.target}
              />
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard
          title="Qualite des donnees"
          description="Derniers traitements automatiques"
        >
          <ul className="space-y-3">
            {pipeline.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[#1B1C1A]">{item.name}</p>
                  <p className="text-xs text-slate-500">Mis a jour: {item.updatedAt}</p>
                </div>
                <StatusBadge status={item.status} />
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard
          title="Actions recommandees"
          description="Priorites operationnelles pour la semaine"
        >
          <ul className="space-y-3">
            {actions.map((action) => (
              <li key={action.id} className="rounded-sm border border-slate-200 p-3">
                <p className="text-sm font-medium text-[#1B1C1A]">{action.label}</p>
                <p className="mt-1 text-xs text-slate-500">Responsable: {action.owner}</p>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard
          title="Rapports rapides"
          description="Exports disponibles pour ce domaine"
        >
          <ul className="space-y-3">
            {reports.map((report) => (
              <li key={report.id} className="rounded-sm border border-slate-200 p-3">
                <p className="text-sm font-medium text-[#1B1C1A]">{report.title}</p>
                <p className="mt-1 text-xs text-slate-500">Periode: {report.period}</p>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
