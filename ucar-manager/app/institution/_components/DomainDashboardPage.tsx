type KpiCard = {
  title: string;
  value: string;
  delta: string;
  accentColor: string;
};

type DomainDashboardPageProps = {
  title: string;
  subtitle: string;
  kpis?: KpiCard[];
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
}: DomainDashboardPageProps) {
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-8 pb-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1B1C1A]">{title}</h1>
          <p className="mt-0.5 text-sm capitalize text-slate-500">
            {subtitle} — <TodayDate />
          </p>
        </div>
      </div>

      {kpis && kpis.length > 0 && (
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
      )}
    </div>
  );
}
