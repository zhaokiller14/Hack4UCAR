import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type InstitutionRow = {
  id: string;
  name: string;
  code: string;
  city: string;
};

function fmt(n: number | null, suffix = "%"): string {
  if (n === null) return "—";
  return `${n.toFixed(1)}${suffix}`;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-lg">🥇</span>;
  if (rank === 2) return <span className="text-lg">🥈</span>;
  if (rank === 3) return <span className="text-lg">🥉</span>;
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-500">
      {rank}
    </span>
  );
}

function KpiCell({
  value,
  good,
}: {
  value: string;
  good: boolean | null;
}) {
  if (value === "—") return <span className="text-slate-300">—</span>;
  const color =
    good === null ? "text-slate-600" : good ? "text-green-700 font-semibold" : "text-red-600 font-semibold";
  return <span className={color}>{value}</span>;
}

function AlertBadge({ count }: { count: number }) {
  if (count === 0) return <span className="text-slate-300 text-xs">—</span>;
  const color =
    count >= 3
      ? "bg-red-100 text-red-700 border-red-200"
      : "bg-amber-100 text-amber-700 border-amber-200";
  return (
    <span
      className={`inline-flex items-center justify-center rounded-sm border px-2 py-0.5 text-[11px] font-bold ${color}`}
    >
      {count}
    </span>
  );
}

function healthScore(
  success: number | null,
  dropout: number | null,
  execution: number | null,
  absenteeism: number | null,
  alerts: number,
): number {
  let score = 0;
  let weight = 0;
  if (success !== null)     { score += success * 0.35;                         weight += 35; }
  if (dropout !== null)     { score += Math.max(0, 100 - dropout * 3) * 0.25;  weight += 25; }
  if (execution !== null)   { score += Math.min(execution, 100) * 0.25;        weight += 25; }
  if (absenteeism !== null) { score += Math.max(0, 100 - absenteeism * 4) * 0.15; weight += 15; }
  if (weight === 0) return 0;
  const base = (score / weight) * 100;
  return Math.max(0, base - alerts * 3);
}

function HealthBar({ score }: { score: number }) {
  const color =
    score >= 75 ? "bg-green-500" : score >= 55 ? "bg-amber-400" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
      <span className="text-[11px] tabular-nums text-slate-500">{score.toFixed(0)}</span>
    </div>
  );
}

export default async function UcarInstitutions() {
  const supabase = await createClient();

  const [institutionsRes, academicRes, financeRes, hrRes, employmentRes, alertsRes] =
    await Promise.all([
      supabase
        .from("institutions")
        .select("id, name, code, city")
        .eq("is_active", true)
        .order("name"),
      supabase
        .from("v_academic_kpis")
        .select("institution_id, dropout_rate, success_rate")
        .order("academic_year", { ascending: false }),
      supabase
        .from("v_finance_kpis_summary")
        .select("institution_id, execution_rate")
        .order("fiscal_year", { ascending: false }),
      supabase.from("v_hr_kpis").select("institution_id, absenteeism_rate"),
      supabase
        .from("v_employment_kpis")
        .select("institution_id, employability_rate"),
      supabase
        .from("alerts")
        .select("institution_id")
        .eq("is_acknowledged", false),
    ]);

  const institutions = (institutionsRes.data ?? []) as InstitutionRow[];

  const dropout      = new Map<string, number | null>();
  const success      = new Map<string, number | null>();
  const execution    = new Map<string, number | null>();
  const absenteeism  = new Map<string, number | null>();
  const employability = new Map<string, number | null>();

  for (const r of academicRes.data ?? []) {
    if (!dropout.has(r.institution_id))  dropout.set(r.institution_id, r.dropout_rate);
    if (!success.has(r.institution_id))  success.set(r.institution_id, r.success_rate);
  }
  for (const r of financeRes.data ?? []) {
    if (!execution.has(r.institution_id)) execution.set(r.institution_id, r.execution_rate);
  }
  for (const r of hrRes.data ?? [])         absenteeism.set(r.institution_id, r.absenteeism_rate);
  for (const r of employmentRes.data ?? []) employability.set(r.institution_id, r.employability_rate);

  const alertCount = new Map<string, number>();
  for (const r of alertsRes.data ?? []) {
    if (r.institution_id)
      alertCount.set(r.institution_id, (alertCount.get(r.institution_id) ?? 0) + 1);
  }

  // Build rows with composite score and sort by score desc
  const rows = institutions
    .map((inst) => {
      const s  = success.get(inst.id) ?? null;
      const d  = dropout.get(inst.id) ?? null;
      const e  = execution.get(inst.id) ?? null;
      const a  = absenteeism.get(inst.id) ?? null;
      const em = employability.get(inst.id) ?? null;
      const ac = alertCount.get(inst.id) ?? 0;
      const score = healthScore(s, d, e, a, ac);
      return { inst, s, d, e, a, em, ac, score };
    })
    .sort((a, b) => b.score - a.score);

  // Network averages for context
  function avg(vals: (number | null)[]): number | null {
    const v = vals.filter((x): x is number => x !== null);
    return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null;
  }
  const netSuccess     = avg(rows.map((r) => r.s));
  const netDropout     = avg(rows.map((r) => r.d));
  const netExecution   = avg(rows.map((r) => r.e));
  const netAbsenteeism = avg(rows.map((r) => r.a));

  return (
    <main className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1B1C1A]">
            Classement des établissements
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {institutions.length} établissements actifs — classement par score de performance composite
          </p>
        </div>
        <Link
          href="/ucar/dashboard"
          className="text-xs font-medium text-[#1B4F6B] hover:underline"
        >
          ← Tableau de bord
        </Link>
      </div>

      {/* Network averages context bar */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Réussite moy. réseau", value: fmt(netSuccess), good: netSuccess !== null && netSuccess >= 70 },
          { label: "Abandon moy. réseau",  value: fmt(netDropout),  good: netDropout !== null && netDropout < 15 },
          { label: "Exéc. budget moy.",    value: fmt(netExecution), good: netExecution !== null && netExecution >= 80 },
          { label: "Absentéisme moy.",     value: fmt(netAbsenteeism), good: netAbsenteeism !== null && netAbsenteeism < 10 },
        ].map(({ label, value, good }) => (
          <div key={label} className="rounded-sm border border-[#003850]/10 bg-white px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
            <p className={`mt-1 text-xl font-medium tabular-nums ${good ? "text-green-700" : "text-red-600"}`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Leaderboard table */}
      <div className="overflow-x-auto rounded-sm border border-[#003850]/10 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-[#003850]/10 bg-[#FAF9F6]">
            <tr>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 w-10">#</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Établissement</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Score</th>
              <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-500">Réussite</th>
              <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-500">Abandon</th>
              <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-500">Exéc. budget</th>
              <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-500">Absentéisme</th>
              <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-500">Employabilité</th>
              <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-500">Alertes</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map(({ inst, s, d, e, a, em, ac, score }, idx) => {
              const rank = idx + 1;
              const rowBg =
                rank === 1
                  ? "bg-amber-50/40"
                  : rank === 2
                  ? "bg-slate-50/60"
                  : rank === 3
                  ? "bg-orange-50/30"
                  : "";
              return (
                <tr key={inst.id} className={`transition-colors hover:bg-slate-50 ${rowBg}`}>
                  <td className="px-4 py-3 text-center">
                    <RankBadge rank={rank} />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#1B1C1A] leading-none">{inst.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {inst.code} · {inst.city}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <HealthBar score={score} />
                  </td>
                  <td className="px-4 py-3 text-center tabular-nums">
                    <KpiCell value={fmt(s)} good={s !== null ? s >= 70 : null} />
                  </td>
                  <td className="px-4 py-3 text-center tabular-nums">
                    <KpiCell value={fmt(d)} good={d !== null ? d < 15 : null} />
                  </td>
                  <td className="px-4 py-3 text-center tabular-nums">
                    <KpiCell value={fmt(e)} good={e !== null ? e >= 80 && e <= 100 : null} />
                  </td>
                  <td className="px-4 py-3 text-center tabular-nums">
                    <KpiCell value={fmt(a)} good={a !== null ? a < 10 : null} />
                  </td>
                  <td className="px-4 py-3 text-center tabular-nums">
                    <KpiCell value={fmt(em)} good={em !== null ? em >= 60 : null} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <AlertBadge count={ac} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/ucar/institutions/${inst.id}`}
                      className="text-xs font-medium text-[#003850] hover:underline"
                    >
                      Voir →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <p className="text-[11px] text-slate-400">
        Score composite = réussite (35%) · abandon inversé (25%) · exécution budget (25%) · absentéisme inversé (15%) — pénalité −3 pts par alerte active.
        Vert = au-dessus du seuil cible · Rouge = en dessous.
      </p>
    </main>
  );
}
