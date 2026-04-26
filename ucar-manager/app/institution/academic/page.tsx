import { requireInstitutionRole } from "@/lib/auth/guards";
import { getAcademicKpis, getStudents, getCourses } from "@/lib/data/academic";
import { getRecentAttendance } from "@/lib/data/attendance";
import { getExams } from "@/lib/data/exams";
import DomainDashboardPage from "../_components/DomainDashboardPage";
import { getInstitutionDomainDashboard } from "../_components/domainData";
import PreviewTable, { type PreviewColumn } from "@/components/institution/PreviewTable";
import type { StudentRow } from "@/lib/data/academic";
import type { CourseRow } from "@/lib/data/academic";
import type { AttendanceRow } from "@/lib/data/attendance";
import type { ExamRow } from "@/lib/data/exams";

const PREVIEW_SIZE = 5;

const STATUS_STYLES: Record<string, string> = {
  active:      "bg-green-100 text-green-700 border-green-200",
  graduated:   "bg-blue-100 text-blue-700 border-blue-200",
  dropped:     "bg-red-100 text-red-700 border-red-200",
  suspended:   "bg-yellow-100 text-yellow-700 border-yellow-200",
  transferred: "bg-slate-100 text-slate-600 border-slate-200",
};
const STATUS_FR: Record<string, string> = {
  active: "Actif", graduated: "Diplômé", dropped: "Abandonné",
  suspended: "Suspendu", transferred: "Transféré",
};
const EXAM_TYPE_FR: Record<string, string> = {
  midterm: "Partiel", final: "Final", makeup: "Rattrapage",
};

const STUDENT_COLUMNS: PreviewColumn<StudentRow>[] = [
  { header: "Nom",           render: (s) => <span className="font-medium text-[#1B1C1A]">{s.full_name}</span> },
  { header: "Spécialisation",render: (s) => s.specialization ?? "—" },
  { header: "Année",         render: (s) => s.current_year !== null ? `L${s.current_year}` : "—" },
  {
    header: "Statut",
    render: (s) => (
      <span className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[s.status] ?? STATUS_STYLES.active}`}>
        {STATUS_FR[s.status] ?? s.status}
      </span>
    ),
  },
];

const COURSE_COLUMNS: PreviewColumn<CourseRow>[] = [
  { header: "Intitulé",      render: (c) => <span className="font-medium text-[#1B1C1A]">{c.title}</span> },
  { header: "Spécialisation",render: (c) => c.specialization ?? "—" },
  { header: "Semestre",      render: (c) => c.semester ?? "—" },
  { header: "Crédits",       render: (c) => c.credits !== null ? String(c.credits) : "—" },
];

const ATTENDANCE_COLUMNS: PreviewColumn<AttendanceRow>[] = [
  { header: "Date",    render: (r) => <span className="font-mono text-xs text-slate-500">{r.session_date}</span> },
  {
    header: "Présence",
    render: (r) => (
      <span className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-[10px] font-semibold ${r.present ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}`}>
        {r.present ? "Présent" : "Absent"}
      </span>
    ),
  },
  { header: "Note", render: (r) => r.note ?? "—" },
];

const EXAM_COLUMNS: PreviewColumn<ExamRow>[] = [
  { header: "Type",        render: (e) => EXAM_TYPE_FR[e.type] ?? e.type },
  { header: "Date",        render: (e) => e.exam_date ?? "—" },
  { header: "Score max",   render: (e) => String(e.max_score) },
  { header: "Année acad.", render: (e) => e.academic_year },
];

export default async function InstitutionAcademicDashboard() {
  const { institutionId } = await requireInstitutionRole();

  const base = getInstitutionDomainDashboard("academic");

  if (!institutionId) {
    return <DomainDashboardPage {...base} />;
  }

  const [kpiRows, { data: students }, { data: courses }, attendance, { data: exams }] =
    await Promise.all([
      getAcademicKpis(institutionId),
      getStudents(institutionId, 1, PREVIEW_SIZE),
      getCourses(institutionId, 1, PREVIEW_SIZE),
      getRecentAttendance(institutionId, PREVIEW_SIZE),
      getExams(institutionId, 1, PREVIEW_SIZE),
    ]);

  const latest = kpiRows[0];

  const kpis = latest
    ? [
        { title: "Étudiants inscrits",    value: latest.total_students.toLocaleString("fr-TN"), delta: latest.academic_year, accentColor: "#1B4F6B" },
        { title: "Taux de réussite",      value: latest.success_rate   !== null ? `${latest.success_rate}%`   : "—", delta: latest.academic_year, accentColor: "#2E7D32" },
        { title: "Taux d'abandon",        value: latest.dropout_rate   !== null ? `${latest.dropout_rate}%`   : "—", delta: latest.academic_year, accentColor: latest.dropout_rate !== null && latest.dropout_rate > 10 ? "#BA1A1A" : "#2E7D32" },
        { title: "Taux de redoublement",  value: latest.repetition_rate !== null ? `${latest.repetition_rate}%` : "—", delta: latest.academic_year, accentColor: "#C8A74B" },
      ]
    : undefined;

  return (
    <>
      <DomainDashboardPage {...base} kpis={kpis} />

      <div className="mx-auto max-w-7xl px-8 pb-12 space-y-4 -mt-2">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <PreviewTable
            title="Étudiants"
            href="/institution/academic/students"
            columns={STUDENT_COLUMNS}
            rows={students}
            emptyLabel="Aucun étudiant enregistré."
          />
          <PreviewTable
            title="Cours"
            href="/institution/academic/courses"
            columns={COURSE_COLUMNS}
            rows={courses}
            emptyLabel="Aucun cours enregistré."
          />
          <PreviewTable
            title="Assiduité"
            href="/institution/academic/attendance"
            columns={ATTENDANCE_COLUMNS}
            rows={attendance}
            emptyLabel="Aucun enregistrement de présence."
          />
          <PreviewTable
            title="Examens"
            href="/institution/academic/exams"
            columns={EXAM_COLUMNS}
            rows={exams}
            emptyLabel="Aucun examen enregistré."
          />
        </div>
      </div>
    </>
  );
}
