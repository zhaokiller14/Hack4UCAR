import TodayDate from "./_components/TodayDate";
import KpiSummaryCard from "./_components/KpiSummaryCard";
import AlertsFeed, { AlertItem } from "./_components/AlertsFeed";
import StrategicGoalsTracker, { GoalItem } from "./_components/StrategicGoalsTracker";
import UploadActivityFeed, { UploadItem } from "./_components/UploadActivityFeed";
import ReportsPanel, { ReportItem } from "./_components/ReportsPanel";
import AnnouncementComposer from "./_components/AnnouncementComposer";
import InstitutionLeaderboard, { LeaderboardRow } from "./_components/InstitutionLeaderboard";

const ALERTS: AlertItem[] = [
  { id: "1", institution_name: "ISG Tunis",      metric: "dropout_rate",     deviation: 3.1, severity: "critical", triggered_at: "2026-04-24T08:00:00Z" },
  { id: "2", institution_name: "ISET Nabeul",    metric: "budget_execution", deviation: 2.7, severity: "high",     triggered_at: "2026-04-23T14:30:00Z" },
  { id: "3", institution_name: "FST Tunis",      metric: "absenteeism_rate", deviation: 2.3, severity: "high",     triggered_at: "2026-04-22T10:00:00Z" },
  { id: "4", institution_name: "ENIM Monastir",  metric: "success_rate",     deviation: -2.1, severity: "medium",  triggered_at: "2026-04-21T09:00:00Z" },
];

const GOALS: GoalItem[] = [
  { id: "1", title: "Taux de réussite réseau ≥ 80%",       domain: "academic",  progress: 72, target_label: "80%" },
  { id: "2", title: "Taux d'exécution budgétaire ≥ 90%",   domain: "finance",   progress: 85, target_label: "90%" },
  { id: "3", title: "Absentéisme du personnel < 8%",        domain: "hr",        progress: 60, target_label: "< 8%" },
  { id: "4", title: "Empreinte carbone −15% vs 2024",       domain: "esg",       progress: 38, target_label: "−15%" },
  { id: "5", title: "Projets de recherche actifs ≥ 120",    domain: "research",  progress: 91, target_label: "120" },
];

const UPLOADS: UploadItem[] = [
  { id: "1", institution_name: "ISSAT Sousse",  file_name: "resultats_2025.pdf",     domain: "academic",  status: "completed",  created_at: "2026-04-25T07:00:00Z" },
  { id: "2", institution_name: "ISET Nabeul",   file_name: "budget_T1.xlsx",          domain: "finance",   status: "processing", created_at: "2026-04-24T18:00:00Z" },
  { id: "3", institution_name: "FST Tunis",     file_name: "rapport_rh.pdf",          domain: "hr",        status: "completed",  created_at: "2026-04-24T12:00:00Z" },
  { id: "4", institution_name: "ENIM Monastir", file_name: "donnees_esg.xlsx",        domain: "esg",       status: "failed",     created_at: "2026-04-23T09:00:00Z" },
  { id: "5", institution_name: "ISG Tunis",     file_name: "projets_recherche.pdf",   domain: "research",  status: "pending",    created_at: "2026-04-23T08:00:00Z" },
];

const REPORTS: ReportItem[] = [
  { id: "1", title: "Rapport KPI Académique — T1 2026",  institution_name: "ISSAT Sousse", storage_path: "#", created_at: "2026-04-20T00:00:00Z" },
  { id: "2", title: "Rapport d'exécution financière",    institution_name: "ISET Nabeul",  storage_path: "#", created_at: "2026-04-18T00:00:00Z" },
  { id: "3", title: "Bilan annuel RH",                   institution_name: "FST Tunis",    storage_path: "#", created_at: "2026-04-15T00:00:00Z" },
];

const INSTITUTIONS: LeaderboardRow[] = [
  { id: "1", name: "ISSAT Sousse",  city: "Sousse",   students: 4200, success_rate: 63.2, budget_execution: 94.1,  alert_count: 2 },
  { id: "2", name: "ISET Nabeul",   city: "Nabeul",   students: 3100, success_rate: 78.5, budget_execution: 142.0, alert_count: 1 },
  { id: "3", name: "FST Tunis",     city: "Tunis",    students: 6800, success_rate: 81.4, budget_execution: 88.3,  alert_count: 1 },
  { id: "4", name: "ENIM Monastir", city: "Monastir", students: 2900, success_rate: 71.0, budget_execution: 91.7,  alert_count: 1 },
  { id: "5", name: "ISG Tunis",     city: "Tunis",    students: 5100, success_rate: 84.2, budget_execution: 96.0,  alert_count: 0 },
];

export default function UcarDashboard() {
  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1B1C1A]">Vue d'ensemble — Réseau UCAR</h1>
          <p className="text-sm text-slate-500 mt-0.5 capitalize"><TodayDate /></p>
        </div>
        <button className="flex items-center gap-2 bg-[#003850] text-white text-xs font-semibold uppercase tracking-wider px-4 py-2.5 rounded-sm hover:bg-[#1B4F6B] transition-colors">
          Générer rapport
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiSummaryCard
          title="Taux d'abandon"
          value="14,2%"
          sub="+2,1%"
          accentColor="#BA1A1A"
          trend="down"
        />
        <KpiSummaryCard
          title="Exécution budgétaire"
          value="88,5%"
          sub="+5,4%"
          accentColor="#2E7D32"
          trend="up"
        />
        <KpiSummaryCard
          title="Taux d'employabilité"
          value="76,3%"
          sub="0,0%"
          accentColor="#C8A74B"
          trend="neutral"
        />
        <KpiSummaryCard
          title="Absentéisme"
          value="8,7%"
          sub="+1,2%"
          accentColor="#BA1A1A"
          trend="down"
        />
      </div>

      {/* Alerts + Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlertsFeed alerts={ALERTS} />
        <StrategicGoalsTracker goals={GOALS} />
      </div>

      {/* Leaderboard */}
      <InstitutionLeaderboard institutions={INSTITUTIONS} />

      {/* Uploads + Reports + Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <UploadActivityFeed uploads={UPLOADS} />
        <ReportsPanel reports={REPORTS} />
        <AnnouncementComposer />
      </div>
    </div>
  );
}
