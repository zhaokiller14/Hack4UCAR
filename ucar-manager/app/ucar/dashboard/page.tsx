import { createClient } from "@/lib/supabase/server";
import TodayDate from "./_components/TodayDate";
import KpiSummaryCard from "./_components/KpiSummaryCard";
import AlertsFeed from "./_components/AlertsFeed";
import UploadActivityFeed from "./_components/UploadActivityFeed";
import AnnouncementComposer from "./_components/AnnouncementComposer";
import SectionCard from "@/components/shared/SectionCard";
import SeverityBadge from "@/components/shared/SeverityBadge";
import Link from "next/link";

function avg(values: (number | null)[]): number | null {
  const valid = values.filter((v): v is number => v !== null);
  return valid.length ? valid.reduce((s, v) => s + v, 0) / valid.length : null;
}

function fmt(n: number | null, suffix = "%"): string {
  if (n === null) return "—";
  return `${n.toFixed(1)}${suffix}`;
}

export default async function UcarDashboard() {
  const supabase = await createClient();

  // Fetch all in parallel
  const [
    academicRes,
    financeRes,
    hrRes,
    employmentRes,
    alertsRes,
    uploadsRes,
    institutionsRes,
  ] = await Promise.all([
    supabase.from("v_academic_kpis").select("institution_id, dropout_rate, success_rate").order("academic_year", { ascending: false }),
    supabase.from("v_finance_kpis_summary").select("institution_id, execution_rate").order("fiscal_year", { ascending: false }),
    supabase.from("v_hr_kpis").select("institution_id, absenteeism_rate"),
    supabase.from("v_employment_kpis").select("institution_id, employability_rate"),
    supabase.from("alerts").select("id, institution_id, kpi_domain, kpi_key, severity, message, is_acknowledged, triggered_at, institutions(name, code)").eq("is_acknowledged", false).order("triggered_at", { ascending: false }).limit(6),
    supabase.from("raw_uploads").select("id, institution_id, file_name, domain, status, created_at, institutions(name)").order("created_at", { ascending: false }).limit(6),
    supabase.from("institutions").select("id, name, code, city").eq("is_active", true).order("name"),
  ]);

  // Latest KPI per institution (deduplicate — take first row per institution_id)
  const latestAcademic = new Map<string, { dropout_rate: number | null; success_rate: number | null }>();
  for (const row of (academicRes.data ?? [])) {
    if (!latestAcademic.has(row.institution_id)) latestAcademic.set(row.institution_id, row);
  }
  const latestFinance = new Map<string, { execution_rate: number | null }>();
  for (const row of (financeRes.data ?? [])) {
    if (!latestFinance.has(row.institution_id)) latestFinance.set(row.institution_id, row);
  }

  const avgDropout    = avg([...latestAcademic.values()].map((r) => r.dropout_rate));
  const avgSuccess    = avg([...latestAcademic.values()].map((r) => r.success_rate));
  const avgExecution  = avg([...latestFinance.values()].map((r) => r.execution_rate));
  const avgAbsent     = avg((hrRes.data ?? []).map((r) => r.absenteeism_rate));
  const avgEmploy     = avg((employmentRes.data ?? []).map((r) => r.employability_rate));

  const alerts  = (alertsRes.data  ?? []) as {
    id: string; institution_id: string | null; kpi_domain: string; kpi_key: string;
    severity: string; message: string; is_acknowledged: boolean; triggered_at: string;
    institutions: { name: string | null; code: string | null } | null;
  }[];
  const uploads = (uploadsRes.data ?? []) as {
    id: string; institution_id: string; file_name: string; domain: string;
    status: string; created_at: string;
    institutions: { name: string | null } | null;
  }[];

  const institutionCount = (institutionsRes.data ?? []).length;

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1B1C1A]">Vue d'ensemble — Réseau UCAR</h1>
          <p className="mt-0.5 text-sm capitalize text-slate-500"><TodayDate /></p>
        </div>
        <Link
          href="/ucar/institutions"
          className="flex items-center gap-2 rounded-sm bg-[#003850] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#1B4F6B]"
        >
          Classement établissements →
        </Link>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <KpiSummaryCard title="Établissements" value={String(institutionCount)} sub="actifs" accentColor="#1B4F6B" trend="neutral" />
        <KpiSummaryCard title="Taux de réussite" value={fmt(avgSuccess)} sub="moyenne réseau" accentColor="#2E7D32" trend={avgSuccess !== null && avgSuccess >= 70 ? "up" : "down"} />
        <KpiSummaryCard title="Taux d'abandon"   value={fmt(avgDropout)} sub="moyenne réseau" accentColor="#BA1A1A" trend={avgDropout !== null && avgDropout < 15 ? "up" : "down"} />
        <KpiSummaryCard title="Exéc. budget"      value={fmt(avgExecution)} sub="moyenne réseau" accentColor="#2E7D32" trend={avgExecution !== null && avgExecution >= 80 ? "up" : "down"} />
        <KpiSummaryCard title="Employabilité"     value={fmt(avgEmploy)} sub="moyenne réseau" accentColor="#C8A74B" trend="neutral" />
        <KpiSummaryCard title="Absentéisme"       value={fmt(avgAbsent)} sub="moyenne réseau" accentColor="#BA1A1A" trend={avgAbsent !== null && avgAbsent < 10 ? "up" : "down"} />
      </div>

      {/* Alerts + Uploads */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Live alerts */}
        <SectionCard title="Alertes actives" description="Dernières alertes non acquittées sur le réseau">
          {alerts.length === 0 ? (
            <p className="text-sm text-slate-400">Aucune alerte active.</p>
          ) : (
            <ul className="space-y-3">
              {alerts.map((a) => (
                <li key={a.id} className="flex items-start justify-between gap-3 rounded-sm border border-slate-100 p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#1B1C1A] truncate">
                      {(a.institutions as { name: string | null; code: string | null } | null)?.code ?? "UCAR"} — {a.message}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">{new Date(a.triggered_at).toLocaleDateString("fr-TN")}</p>
                  </div>
                  <SeverityBadge severity={a.severity} />
                </li>
              ))}
            </ul>
          )}
          {alerts.length > 0 && (
            <Link href="/ucar/alerts" className="mt-3 block text-xs text-[#003850] hover:underline">
              Voir toutes les alertes →
            </Link>
          )}
        </SectionCard>

        {/* Upload activity */}
        <UploadActivityFeed uploads={uploads.map((u) => ({
          id: u.id,
          institution_name: (u.institutions as { name: string | null } | null)?.name ?? "—",
          file_name: u.file_name,
          domain: u.domain,
          status: u.status as "completed" | "processing" | "failed" | "pending",
          created_at: u.created_at,
        }))} />
      </div>

      {/* Announcement composer */}
      <AnnouncementComposer />
    </div>
  );
}
