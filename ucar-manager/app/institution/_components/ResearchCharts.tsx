"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

type Props = {
  activeProjects: number;
  totalProjects: number;
  publications: number;
  patents: number;
  fundingK: number;
};

const DONUT_COLORS = ["#1B4F6B", "#E2EDF2"];

export default function ResearchCharts({
  activeProjects,
  totalProjects,
  publications,
  patents,
  fundingK,
}: Props) {
  const inactiveProjects = Math.max(0, totalProjects - activeProjects);

  const donutData = [
    { name: "Actifs", value: activeProjects },
    { name: "Inactifs", value: inactiveProjects },
  ];

  const barData = [
    { name: "Publications", value: publications, color: "#2E7D32" },
    { name: "Brevets", value: patents, color: "#1B4F6B" },
    { name: "Financement (k)", value: fundingK, color: "#0F6E56" },
    { name: "Projets total", value: totalProjects, color: "#4A90A4" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 px-8 pb-8 md:grid-cols-2">
      {/* Donut — project status */}
      <div className="rounded-sm border border-[#003850]/10 bg-white p-5">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Statut des projets
        </p>
        {totalProjects === 0 ? (
          <p className="py-12 text-center text-sm text-slate-400">
            Aucune donnée
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {donutData.map((_, i) => (
                  <Cell key={i} fill={DONUT_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => typeof v === "number" ? v.toLocaleString("fr-TN") : v}
                contentStyle={{
                  fontSize: 12,
                  border: "0.5px solid #003850/20",
                  borderRadius: 4,
                }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(v) => (
                  <span style={{ fontSize: 12, color: "#64748b" }}>{v}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Bar — all metrics */}
      <div className="rounded-sm border border-[#003850]/10 bg-white p-5">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Vue d'ensemble des indicateurs
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={barData}
            barSize={28}
            margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#003850"
              strokeOpacity={0.08}
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip
              formatter={(v) => typeof v === "number" ? v.toLocaleString("fr-TN") : v}
              contentStyle={{
                fontSize: 12,
                border: "0.5px solid rgba(0,56,80,0.2)",
                borderRadius: 4,
              }}
              cursor={{ fill: "rgba(0,56,80,0.04)" }}
            />
            <Bar dataKey="value" radius={[3, 3, 0, 0]}>
              {barData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
