import Link from "next/link";
import { requireInstitutionRole } from "@/lib/auth/guards";
import { getAcademicKpis } from "@/lib/data/academic";
import DomainDashboardPage from "../_components/DomainDashboardPage";
import { getInstitutionDomainDashboard } from "../_components/domainData";

export default async function InstitutionAcademicDashboard() {
  const { institutionId } = await requireInstitutionRole();

  const base = getInstitutionDomainDashboard("academic");

  if (!institutionId) {
    return <DomainDashboardPage {...base} />;
  }

  const rows = await getAcademicKpis(institutionId);
  const latest = rows[0];

  if (!latest) {
    return <DomainDashboardPage {...base} />;
  }

  const kpis = [
    {
      title: "Étudiants inscrits",
      value: latest.total_students.toLocaleString("fr-TN"),
      delta: latest.academic_year,
      accentColor: "#1B4F6B",
    },
    {
      title: "Taux de réussite",
      value: latest.success_rate !== null ? `${latest.success_rate}%` : "—",
      delta: latest.academic_year,
      accentColor: "#2E7D32",
    },
    {
      title: "Taux d'abandon",
      value: latest.dropout_rate !== null ? `${latest.dropout_rate}%` : "—",
      delta: latest.academic_year,
      accentColor: latest.dropout_rate !== null && latest.dropout_rate > 10 ? "#BA1A1A" : "#2E7D32",
    },
    {
      title: "Taux de redoublement",
      value: latest.repetition_rate !== null ? `${latest.repetition_rate}%` : "—",
      delta: latest.academic_year,
      accentColor: "#C8A74B",
    },
  ];

  return (
    <>
      <DomainDashboardPage {...base} kpis={kpis} />
      <div className="mx-auto max-w-7xl px-8 pb-8 -mt-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Étudiants", href: "/institution/academic/students" },
            { label: "Cours", href: "/institution/academic/courses" },
            { label: "Assiduité", href: "/institution/academic/attendance" },
            { label: "Examens", href: "/institution/academic/exams" },
          ].map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center justify-between rounded-sm border border-[#003850]/10 bg-white px-4 py-3 text-sm font-medium text-[#1B1C1A] transition-colors hover:border-[#003850]/30 hover:bg-[#003850]/5"
            >
              {label}
              <span className="text-slate-400">→</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
