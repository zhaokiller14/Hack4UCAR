"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type EsgRecord = {
  period_start: string;
  energy_kwh: number | null;
  carbon_kg: number | null;
  water_liters: number | null;
};

export default function EsgCharts({ records }: { records: EsgRecord[] }) {
  const data = [...records]
    .sort((a, b) => a.period_start.localeCompare(b.period_start))
    .map((r) => ({
      period: r.period_start,
      "Énergie (kWh)": r.energy_kwh ?? null,
      "Carbone (kg)":  r.carbon_kg ?? null,
      "Eau (L)":       r.water_liters ?? null,
    }));

  if (data.length < 2) return null;

  return (
    <div className="px-8 pb-2">
      <div className="rounded-sm border border-[#003850]/10 bg-white p-5">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Évolution des indicateurs environnementaux
        </p>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#003850" strokeOpacity={0.08} />
            <XAxis dataKey="period" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} width={50} tickFormatter={(v) => typeof v === "number" ? `${(v / 1000).toFixed(0)}k` : v} />
            <Tooltip
              formatter={(v) => typeof v === "number" ? v.toLocaleString("fr-TN") : v}
              contentStyle={{ fontSize: 12, border: "0.5px solid rgba(0,56,80,0.2)", borderRadius: 4 }}
            />
            <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 12, color: "#64748b" }}>{v}</span>} />
            <Line type="monotone" dataKey="Énergie (kWh)" stroke="#1B4F6B" strokeWidth={2} dot={false} connectNulls />
            <Line type="monotone" dataKey="Carbone (kg)"  stroke="#C8A74B" strokeWidth={2} dot={false} connectNulls />
            <Line type="monotone" dataKey="Eau (L)"       stroke="#2E7D32" strokeWidth={2} dot={false} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
