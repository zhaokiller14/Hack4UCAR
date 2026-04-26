"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type KpiRow = {
  academic_year: string;
  dropout_rate: number | null;
  success_rate: number | null;
  repetition_rate: number | null;
};

export default function AcademicCharts({ rows }: { rows: KpiRow[] }) {
  const data = [...rows]
    .sort((a, b) => a.academic_year.localeCompare(b.academic_year))
    .map((r) => ({
      year: r.academic_year,
      "Réussite": r.success_rate ?? 0,
      "Abandon": r.dropout_rate ?? 0,
      "Redoublement": r.repetition_rate ?? 0,
    }));

  if (data.length === 0) return null;

  return (
    <div className="px-8 pb-8">
      <div className="rounded-sm border border-[#003850]/10 bg-white p-5">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Taux académiques par année
        </p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#003850" strokeOpacity={0.08} vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} unit="%" width={36} domain={[0, 100]} />
            <Tooltip
              formatter={(v) => typeof v === "number" ? `${v}%` : v}
              contentStyle={{ fontSize: 12, border: "0.5px solid rgba(0,56,80,0.2)", borderRadius: 4 }}
              cursor={{ fill: "rgba(0,56,80,0.04)" }}
            />
            <Legend iconType="square" iconSize={8} formatter={(v) => <span style={{ fontSize: 12, color: "#64748b" }}>{v}</span>} />
            <Bar dataKey="Réussite"     fill="#2E7D32" radius={[3, 3, 0, 0]} barSize={20} />
            <Bar dataKey="Abandon"      fill="#BA1A1A" radius={[3, 3, 0, 0]} barSize={20} />
            <Bar dataKey="Redoublement" fill="#C8A74B" radius={[3, 3, 0, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
