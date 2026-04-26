import Link from "next/link";
import { FR } from "@/lib/i18n";
import { requireInstitutionRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { computeAndUpsertAlerts } from "@/lib/alerts/compute";
import DomainDashboardPage from "../_components/DomainDashboardPage";
import { getInstitutionDomainDashboard } from "../_components/domainData";
import PreviewTable, { type PreviewColumn } from "@/components/institution/PreviewTable";
import SeverityBadge from "@/components/shared/SeverityBadge";

import { getAcademicKpis, getStudents, getCourses } from "@/lib/data/academic";
import { getFinanceKpis, getBudgetLines } from "@/lib/data/finance";
import { getHrKpis, getStaff } from "@/lib/data/hr";
import { getResearchKpis, getResearchProjects } from "@/lib/data/research";
import { getEmploymentKpis, getStudentJobs } from "@/lib/data/employment";
import { getEsgKpis } from "@/lib/data/esg";
import { getInfrastructureKpis, getInfrastructureAssets } from "@/lib/data/infrastructure";
import { getPartnershipsKpis, getPartnerships } from "@/lib/data/partnerships";

import type { StudentRow } from "@/lib/data/academic";
import type { CourseRow } from "@/lib/data/academic";
import type { BudgetLineRow } from "@/lib/data/finance";
import type { StaffRow } from "@/lib/data/hr";
import type { ResearchProjectRow } from "@/lib/data/research";
import type { StudentJobRow } from "@/lib/data/employment";
import type { InfrastructureAssetRow } from "@/lib/data/infrastructure";
import type { PartnershipRow } from "@/lib/data/partnerships";

const PREVIEW = 5;

const SEVERITY_ORDER = ["critical", "high", "medium", "low"] as const;
const SEVERITY_STYLES: Record<string, string> = {
  critical: "bg-red-100 text-red-700 border-red-200",
  high:     "bg-orange-100 text-orange-700 border-orange-200",
  medium:   "bg-yellow-100 text-yellow-700 border-yellow-200",
  low:      "bg-blue-100 text-blue-700 border-blue-200",
};

const STATUS_STYLES: Record<string, string> = {
  active:      "bg-green-100 text-green-700 border-green-200",
  graduated:   "bg-blue-100 text-blue-700 border-blue-200",
  dropped:     "bg-red-100 text-red-700 border-red-200",
  suspended:   "bg-yellow-100 text-yellow-700 border-yellow-200",
  transferred: "bg-slate-100 text-slate-600 border-slate-200",
  operational: "bg-green-100 text-green-700 border-green-200",
  maintenance: "bg-yellow-100 text-yellow-700 border-yellow-200",
  out_of_service: "bg-red-100 text-red-700 border-red-200",
};
const STATUS_FR: Record<string, string> = {
  active: "Actif", graduated: "Diplômé", dropped: "Abandonné",
  suspended: "Suspendu", transferred: "Transféré",
  operational: "Opérationnel", maintenance: "Maintenance", out_of_service: "Hors service",
};

function Badge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
      {STATUS_FR[status] ?? status}
    </span>
  );
}

const STUDENT_COLS: PreviewColumn<StudentRow>[] = [
  { header: "Nom",           render: (s) => <span className="font-medium text-[#1B1C1A]">{s.full_name}</span> },
  { header: "Spécialisation",render: (s) => s.specialization ?? "—" },
  { header: "Statut",        render: (s) => <Badge status={s.status} /> },
];

const COURSE_COLS: PreviewColumn<CourseRow>[] = [
  { header: "Intitulé",  render: (c) => <span className="font-medium text-[#1B1C1A]">{c.title}</span> },
  { header: "Semestre",  render: (c) => c.semester ?? "—" },
  { header: "Crédits",   render: (c) => c.credits !== null ? String(c.credits) : "—" },
];

const BUDGET_COLS: PreviewColumn<BudgetLineRow>[] = [
  { header: "Département", render: (b) => <span className="font-medium text-[#1B1C1A]">{b.department}</span> },
  { header: "Catégorie",   render: (b) => b.category },
  { header: "Exécution",   render: (b) => b.allocated ? `${((b.consumed / b.allocated) * 100).toFixed(0)}%` : "—" },
];

const STAFF_COLS: PreviewColumn<StaffRow>[] = [
  { header: "Nom",  render: (s) => <span className="font-medium text-[#1B1C1A]">{s.full_name}</span> },
  { header: "Rôle", render: (s) => s.role_type },
  { header: "Statut", render: (s) => <Badge status={s.is_active ? "active" : "transferred"} /> },
];

const RESEARCH_COLS: PreviewColumn<ResearchProjectRow>[] = [
  { header: "Projet",       render: (r) => <span className="font-medium text-[#1B1C1A]">{r.title}</span> },
  { header: "Statut",       render: (r) => r.status },
  { header: "Publications", render: (r) => String(r.publications_count) },
];

const JOB_COLS: PreviewColumn<StudentJobRow>[] = [
  { header: "Date",     render: (j) => j.employment_date },
  { header: "Pays",     render: (j) => j.job_country },
];

const PARTNERSHIP_COLS: PreviewColumn<PartnershipRow>[] = [
  { header: "Partenaire", render: (p) => <span className="font-medium text-[#1B1C1A]">{p.partner_name}</span> },
  { header: "Type",       render: (p) => p.type },
  { header: "Statut",     render: (p) => <Badge status={p.is_active ? "active" : "transferred"} /> },
];

const INFRA_COLS: PreviewColumn<InfrastructureAssetRow>[] = [
  { header: "Nom",    render: (a) => <span className="font-medium text-[#1B1C1A]">{a.name}</span> },
  { header: "Type",   render: (a) => a.asset_type },
  { header: "Statut", render: (a) => <Badge status={a.status} /> },
];

export default async function InstitutionDashboard() {
  const ctx = await requireInstitutionRole();
  const base = getInstitutionDomainDashboard("dashboard");

  if (!ctx.institutionId || !ctx.organizationId) {
    return <DomainDashboardPage {...base} />;
  }

  const id = ctx.institutionId;
  const orgId = ctx.organizationId;

  // Compute alerts + all KPIs + all previews in parallel
  const [
    , // computeAndUpsertAlerts returns void
    academicKpis, financeKpis, hrKpi, researchKpi, employmentKpi, esgKpi, infraKpi, partnershipsKpi,
    { data: students }, { data: courses },
    { data: budgetLines }, { data: staff },
    { data: projects }, { data: jobs },
    { data: partnerships }, { data: assets },
  ] = await Promise.all([
    computeAndUpsertAlerts(id, orgId),
    getAcademicKpis(id),
    getFinanceKpis(id),
    getHrKpis(id),
    getResearchKpis(id),
    getEmploymentKpis(id),
    getEsgKpis(id),
    getInfrastructureKpis(id),
    getPartnershipsKpis(id),
    getStudents(id, 1, PREVIEW),
    getCourses(id, 1, PREVIEW),
    getBudgetLines(id, 1, PREVIEW),
    getStaff(id, 1, PREVIEW),
    getResearchProjects(id, 1, PREVIEW),
    getStudentJobs(id, 1, PREVIEW),
    getPartnerships(id, 1, PREVIEW),
    getInfrastructureAssets(id, 1, PREVIEW),
  ]);

  // Fetch active alert counts
  const supabase = await createClient();
  const { data: alertData } = await supabase
    .from("alerts")
    .select("severity")
    .eq("institution_id", id)
    .eq("is_acknowledged", false);

  const alertCounts = (alertData ?? []).reduce<Record<string, number>>((acc, a) => {
    acc[a.severity] = (acc[a.severity] ?? 0) + 1;
    return acc;
  }, {});
  const totalAlerts = Object.values(alertCounts).reduce((s, n) => s + n, 0);

  const latestAcademic = academicKpis[0];
  const latestFinance = financeKpis[0];

  const fmt = (n: number | null, suffix = "") =>
    n !== null ? `${n.toLocaleString("fr-TN")}${suffix}` : "—";

  const kpis = [
    {
      title: "Taux de réussite",
      value: fmt(latestAcademic?.success_rate ?? null, "%"),
      delta: latestAcademic?.academic_year ?? "—",
      accentColor: (latestAcademic?.success_rate ?? 100) < 60 ? "#BA1A1A" : "#2E7D32",
    },
    {
      title: "Exécution budget",
      value: fmt(latestFinance?.execution_rate ?? null, "%"),
      delta: latestFinance?.fiscal_year ?? "—",
      accentColor: (latestFinance?.execution_rate ?? 0) > 100 ? "#BA1A1A" : "#1B4F6B",
    },
    {
      title: "Absentéisme RH",
      value: fmt(hrKpi?.absenteeism_rate ?? null, "%"),
      delta: "mois en cours",
      accentColor: (hrKpi?.absenteeism_rate ?? 0) > 10 ? "#BA1A1A" : "#2E7D32",
    },
    {
      title: "Projets actifs",
      value: fmt(researchKpi?.active_projects ?? null),
      delta: `sur ${researchKpi?.total_projects ?? "—"} total`,
      accentColor: "#1B4F6B",
    },
    {
      title: "Employabilité",
      value: fmt(employmentKpi?.employability_rate ?? null, "%"),
      delta: `${employmentKpi?.employed_count ?? "—"} diplômés`,
      accentColor: (employmentKpi?.employability_rate ?? 100) < 50 ? "#BA1A1A" : "#2E7D32",
    },
    {
      title: "Taux de recyclage",
      value: fmt(esgKpi?.recycling_rate ?? null, "%"),
      delta: esgKpi?.period_start ?? "—",
      accentColor: (esgKpi?.recycling_rate ?? 100) < 30 ? "#BA1A1A" : "#2E7D32",
    },
    {
      title: "Taux opérationnel",
      value: fmt(infraKpi?.operational_rate ?? null, "%"),
      delta: `${infraKpi?.total_assets ?? "—"} actifs`,
      accentColor: (infraKpi?.operational_rate ?? 100) < 80 ? "#C8A74B" : "#2E7D32",
    },
    {
      title: "Partenariats actifs",
      value: fmt(partnershipsKpi?.active_partnerships ?? null),
      delta: `sur ${partnershipsKpi?.total_partnerships ?? "—"} total`,
      accentColor: "#1B4F6B",
    },
  ];

  return (
    <>
      <DomainDashboardPage {...base} kpis={kpis} />

      <div className="space-y-6 px-8 pb-8 pt-0">
        {/* Alert summary */}
        {totalAlerts > 0 && (
          <div className="flex items-center gap-3 rounded-sm border border-[#003850]/10 bg-white px-5 py-3">
            <span className="text-sm font-medium text-[#1B1C1A]">
              {totalAlerts} alerte{totalAlerts !== 1 ? "s" : ""} active{totalAlerts !== 1 ? "s" : ""}
            </span>
            <div className="flex items-center gap-2 flex-1">
              {SEVERITY_ORDER.filter((s) => alertCounts[s]).map((s) => (
                <span key={s} className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-[11px] font-semibold ${SEVERITY_STYLES[s]}`}>
                  {alertCounts[s]} {FR.severity[s]}
                </span>
              ))}
            </div>
            <Link
              href="/institution/alerts"
              className="rounded-sm bg-[#003850] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#002a3d] transition-colors"
            >
              Voir les alertes →
            </Link>
          </div>
        )}

        {/* Preview grid */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <PreviewTable title="Étudiants" href="/institution/academic/students" columns={STUDENT_COLS} rows={students} emptyLabel="Aucun étudiant." />
          <PreviewTable title="Cours" href="/institution/academic/courses" columns={COURSE_COLS} rows={courses} emptyLabel="Aucun cours." />
          <PreviewTable title="Personnel" href="/institution/hr" columns={STAFF_COLS} rows={staff} emptyLabel="Aucun personnel." />
          <PreviewTable title="Budget" href="/institution/finance" columns={BUDGET_COLS} rows={budgetLines} emptyLabel="Aucune ligne budgétaire." />
          <PreviewTable title="Projets de recherche" href="/institution/research" columns={RESEARCH_COLS} rows={projects} emptyLabel="Aucun projet." />
          <PreviewTable title="Emplois diplômés" href="/institution/employment" columns={JOB_COLS} rows={jobs} emptyLabel="Aucun emploi enregistré." />
          <PreviewTable title="Partenariats" href="/institution/partnerships" columns={PARTNERSHIP_COLS} rows={partnerships} emptyLabel="Aucun partenariat." />
          <PreviewTable title="Actifs infrastructure" href="/institution/infrastructure" columns={INFRA_COLS} rows={assets} emptyLabel="Aucun actif." />
        </div>
      </div>
    </>
  );
}
