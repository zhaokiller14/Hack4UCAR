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

type BudgetLine = {
  department: string;
  allocated: number;
  consumed: number;
};

export default function FinanceCharts({ lines }: { lines: BudgetLine[] }) {
  // Aggregate by department (page may contain multiple fiscal years)
  const byDept = new Map<string, { allocated: number; consumed: number }>();
  for (const l of lines) {
    const existing = byDept.get(l.department) ?? { allocated: 0, consumed: 0 };
    byDept.set(l.department, {
      allocated: existing.allocated + l.allocated,
      consumed: existing.consumed + l.consumed,
    });
  }

  const data = Array.from(byDept.entries()).map(([dept, v]) => ({
    dept,
    "Alloué": v.allocated,
    "Consommé": v.consumed,
  }));

  if (data.length === 0) return null;

  const fmt = (v: unknown) =>
    typeof v === "number" ? `${v.toLocaleString("fr-TN")} TND` : String(v);

  return (
    <div className="px-8 pb-2">
      <div className="rounded-sm border border-[#003850]/10 bg-white p-5">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Budget alloué vs consommé par département
        </p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#003850" strokeOpacity={0.08} vertical={false} />
            <XAxis dataKey="dept" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} width={60} tickFormatter={(v) => typeof v === "number" ? `${(v / 1000).toFixed(0)}k` : v} />
            <Tooltip
              formatter={fmt}
              contentStyle={{ fontSize: 12, border: "0.5px solid rgba(0,56,80,0.2)", borderRadius: 4 }}
              cursor={{ fill: "rgba(0,56,80,0.04)" }}
            />
            <Legend iconType="square" iconSize={8} formatter={(v) => <span style={{ fontSize: 12, color: "#64748b" }}>{v}</span>} />
            <Bar dataKey="Alloué"   fill="#1B4F6B" radius={[3, 3, 0, 0]} barSize={18} />
            <Bar dataKey="Consommé" fill="#C8A74B" radius={[3, 3, 0, 0]} barSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
