import Link from "next/link";

import { Button } from "@/components/ui/button";
import { requireInstitutionRole } from "@/lib/auth/guards";
import EmploymentForecastChart from "@/components/institution/EmploymentForecastChart";

type ForecastPoint = {
  reporting_period: string;
  forecast_employability_rate: number;
};

type ForecastResponse = {
  model_name: string;
  target: string;
  horizon: number;
  forecasts: ForecastPoint[];
};

type ForecastRequestPayload = {
  history: number[];
  last_reporting_period: string;
  horizon: number;
};

function quarterEndIso(input: Date): string {
  const year = input.getUTCFullYear();
  const month = input.getUTCMonth() + 1;

  if (month <= 3) return `${year}-03-31`;
  if (month <= 6) return `${year}-06-30`;
  if (month <= 9) return `${year}-09-30`;
  return `${year}-12-31`;
}

async function getForecastRaw(payload: ForecastRequestPayload): Promise<{
  status: number;
  data: ForecastResponse | null;
  text: string;
}> {
  const baseUrl = process.env.EMPLOYABILITY_FORECAST_API_URL ?? "http://127.0.0.1:8011";

  const response = await fetch(`${baseUrl}/forecast`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const text = await response.text();

  if (!response.ok) {
    return {
      status: response.status,
      data: null,
      text,
    };
  }

  let parsed: ForecastResponse | null = null;
  try {
    parsed = JSON.parse(text) as ForecastResponse;
  } catch {
    parsed = null;
  }

  return {
    status: response.status,
    data: parsed,
    text,
  };
}

function formatRate(value: number): string {
  return `${value.toFixed(2)}%`;
}

function quarterLabel(isoDate: string): string {
  const [year, month] = isoDate.split("-");
  const monthNumber = Number(month);
  const quarter = Math.max(1, Math.min(4, Math.ceil(monthNumber / 3)));
  return `Q${quarter} ${year}`;
}

function deltaLabel(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)} pts`;
}

export default async function EmploymentForecastPage() {
  await requireInstitutionRole();

  const payload: ForecastRequestPayload = {
    history: [41.2, 43.8, 46.1, 48.7, 50.5, 52.9],
    last_reporting_period: quarterEndIso(new Date()),
    horizon: 4,
  };

  const result = await getForecastRaw(payload);

  const historyLast = payload.history[payload.history.length - 1] ?? 0;
  const forecastValues = result.data?.forecasts ?? [];
  const firstForecast = forecastValues[0]?.forecast_employability_rate ?? null;
  const lastForecast = forecastValues[forecastValues.length - 1]?.forecast_employability_rate ?? null;
  const avgForecast =
    forecastValues.length > 0
      ? forecastValues.reduce((sum, point) => sum + point.forecast_employability_rate, 0) /
        forecastValues.length
      : null;
  const projectedDelta = lastForecast !== null ? lastForecast - historyLast : null;

  return (
    <div className="space-y-6 p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[#1B1C1A]">Employability Forecast</h1>
          <p className="text-sm text-slate-600">Projection trimestrielle du taux d'employabilite avec separation clair entre historique et prevision.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/institution/employment">Back to Employment</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Derniere valeur observee</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{formatRate(historyLast)}</p>
          <p className="mt-1 text-xs text-slate-500">{quarterLabel(payload.last_reporting_period)}</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Premiere prevision</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {firstForecast !== null ? formatRate(firstForecast) : "—"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {forecastValues[0] ? quarterLabel(forecastValues[0].reporting_period) : "N/A"}
          </p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Fin d'horizon</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {lastForecast !== null ? formatRate(lastForecast) : "—"}
          </p>
          <p
            className={`mt-1 text-xs font-medium ${
              projectedDelta !== null && projectedDelta >= 0 ? "text-emerald-700" : "text-rose-700"
            }`}
          >
            {projectedDelta !== null ? `${deltaLabel(projectedDelta)} vs observe` : "N/A"}
          </p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Moyenne previsionnelle</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {avgForecast !== null ? formatRate(avgForecast) : "—"}
          </p>
          <p className="mt-1 text-xs text-slate-500">Horizon: {payload.horizon} trimestres</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          {result.data ? (
            <EmploymentForecastChart
              history={payload.history}
              forecast={result.data.forecasts}
              lastReportingPeriod={payload.last_reporting_period}
            />
          ) : (
            <div className="rounded-md border border-rose-200 bg-rose-50 p-4">
              <p className="text-sm font-semibold text-rose-800">Service de prevision indisponible</p>
              <p className="mt-1 text-sm text-rose-700">
                Impossible de recuperer les projections pour le moment (HTTP {result.status}).
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-md border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-800">Contexte du modele</p>
            <dl className="mt-3 space-y-2 text-sm text-slate-600">
              <div className="flex items-center justify-between gap-3">
                <dt>Modele</dt>
                <dd className="font-medium text-slate-900">{result.data?.model_name ?? "N/A"}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt>Cible</dt>
                <dd className="font-medium text-slate-900">{result.data?.target ?? "N/A"}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt>Horizon</dt>
                <dd className="font-medium text-slate-900">{result.data?.horizon ?? payload.horizon} trimestres</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt>Derniere periode</dt>
                <dd className="font-medium text-slate-900">{quarterLabel(payload.last_reporting_period)}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-md border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-800">Interpretation rapide</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>La courbe verte represente l'historique fourni au modele.</li>
              <li>La courbe orange represente les valeurs previsionnelles futures.</li>
              <li>Utilisez cette projection comme aide a la decision, pas comme valeur definitive.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-4">
        <p className="mb-3 text-sm font-semibold text-slate-800">Tableau des previsions trimestrielles</p>
        {forecastValues.length === 0 ? (
          <p className="text-sm text-slate-500">Aucune prevision disponible.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Periode</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Valeur prevue</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Variation vs observe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {forecastValues.map((point) => {
                  const delta = point.forecast_employability_rate - historyLast;
                  const positive = delta >= 0;

                  return (
                    <tr key={point.reporting_period}>
                      <td className="px-3 py-2 text-slate-700">{quarterLabel(point.reporting_period)}</td>
                      <td className="px-3 py-2 font-medium text-slate-900">
                        {formatRate(point.forecast_employability_rate)}
                      </td>
                      <td className={`px-3 py-2 font-medium ${positive ? "text-emerald-700" : "text-rose-700"}`}>
                        {deltaLabel(delta)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
