"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ForecastPoint = {
  reporting_period: string;
  forecast_employability_rate: number;
};

type EmploymentForecastChartProps = {
  history: number[];
  forecast: ForecastPoint[];
  lastReportingPeriod: string;
};

type ChartPoint = {
  label: string;
  past: number | null;
  forecast: number | null;
};

function quarterLabel(isoDate: string): string {
  const [year, month] = isoDate.split("-");
  const monthNumber = Number(month);
  const quarter = Math.max(1, Math.min(4, Math.ceil(monthNumber / 3)));
  return `Q${quarter} ${year}`;
}

function quarterShift(lastReportingPeriod: string, offset: number): string {
  const [yearPart, monthPart] = lastReportingPeriod.split("-");
  const year = Number(yearPart);
  const month = Number(monthPart);
  const baseQuarterIndex = Math.ceil(month / 3) - 1;
  const absoluteQuarterIndex = baseQuarterIndex + offset;
  const nextYear = year + Math.floor(absoluteQuarterIndex / 4);
  const quarterInYear = ((absoluteQuarterIndex % 4) + 4) % 4;
  const endMonths = ["03", "06", "09", "12"];

  return `${nextYear}-${endMonths[quarterInYear]}-30`;
}

export default function EmploymentForecastChart({
  history,
  forecast,
  lastReportingPeriod,
}: EmploymentForecastChartProps) {
  const historyPoints: ChartPoint[] = history.map((value, index) => ({
    label: quarterLabel(quarterShift(lastReportingPeriod, -(history.length - 1 - index))),
    past: value,
    forecast: null,
  }));

  const forecastPoints: ChartPoint[] = forecast.map((point) => ({
    label: quarterLabel(point.reporting_period),
    past: null,
    forecast: point.forecast_employability_rate,
  }));

  const data = [...historyPoints, ...forecastPoints];

  return (
    <div className="h-[360px] w-full rounded-md border border-slate-200 bg-white p-4">
      <p className="mb-3 text-sm font-semibold text-slate-800">Evolution du taux d'employabilité</p>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="label" tick={{ fill: "#475569", fontSize: 12 }} />
          <YAxis tick={{ fill: "#475569", fontSize: 12 }} unit="%" domain={[0, 100]} />
          <Tooltip
            formatter={(value: number) => [`${value.toFixed(2)}%`, ""]}
            labelStyle={{ color: "#0F172A", fontWeight: 600 }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="past"
            name="Valeurs historiques"
            stroke="#0F766E"
            strokeWidth={3}
            dot={{ r: 4, fill: "#0F766E" }}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="forecast"
            name="Valeurs prévues"
            stroke="#D97706"
            strokeWidth={3}
            strokeDasharray="6 4"
            dot={{ r: 4, fill: "#D97706" }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
