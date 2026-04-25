import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import SectionCard from "@/components/shared/SectionCard";

export interface LeaderboardRow {
  id: string;
  name: string;
  city: string;
  students: number;
  success_rate: number;
  budget_execution: number;
  alert_count: number;
}

function TrendIcon({ value, threshold }: { value: number; threshold: number }) {
  if (value >= threshold + 5) return <TrendingUp className="h-3.5 w-3.5 text-[#2E7D32]" />;
  if (value <= threshold - 5) return <TrendingDown className="h-3.5 w-3.5 text-[#BA1A1A]" />;
  return <Minus className="h-3.5 w-3.5 text-slate-400" />;
}

export default function InstitutionLeaderboard({ institutions }: { institutions: LeaderboardRow[] }) {
  return (
    <SectionCard title="Classement des établissements" description="Indicateurs clés de performance par institution">
      <div className="overflow-x-auto -mx-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Établissement</th>
              <th className="text-right px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Étudiants</th>
              <th className="text-right px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Taux de réussite</th>
              <th className="text-right px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Exéc. budgétaire</th>
              <th className="text-right px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Alertes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {institutions.map((inst) => (
              <tr key={inst.id} className="hover:bg-[#FAF9F6] transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-[#1B1C1A] leading-none">{inst.name}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{inst.city}</p>
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-[#1B1C1A]">
                  {inst.students.toLocaleString("fr-FR")}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  <div className="flex items-center justify-end gap-1 text-[#1B1C1A]">
                    <TrendIcon value={inst.success_rate} threshold={75} />
                    {inst.success_rate.toFixed(1)}%
                  </div>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  <div className="flex items-center justify-end gap-1 text-[#1B1C1A]">
                    <TrendIcon value={inst.budget_execution} threshold={90} />
                    {inst.budget_execution.toFixed(1)}%
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  {inst.alert_count > 0 ? (
                    <span className="inline-flex items-center justify-center rounded-full bg-red-100 text-red-700 text-[11px] font-bold h-5 min-w-5 px-1">
                      {inst.alert_count}
                    </span>
                  ) : (
                    <span className="text-slate-300 text-xs">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
