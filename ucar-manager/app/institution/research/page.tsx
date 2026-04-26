import { requireInstitutionRole } from "@/lib/auth/guards";
import { getResearchKpis, getResearchProjects } from "@/lib/data/research";
import {
  createResearchProject,
  deleteResearchProject,
  updateResearchProject,
} from "@/lib/actions/research";
import type { ResearchProjectInput } from "@/lib/actions/research";
import DomainDashboardPage from "../_components/DomainDashboardPage";
import { getInstitutionDomainDashboard } from "../_components/domainData";
import ResearchCharts from "../_components/ResearchCharts";
import SectionCard from "@/components/shared/SectionCard";
import ResearchProjectsTable from "@/components/institution/ResearchProjectsTable";

const PAGE_SIZE = 20;
const WRITE_ROLES = new Set([
  "super_admin",
  "institution_admin",
  "research_manager",
]);

export default async function InstitutionResearch({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const userContext = await requireInstitutionRole();
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));
  const { institutionId } = userContext;

  const base = getInstitutionDomainDashboard("research");

  if (!institutionId) return <DomainDashboardPage {...base} />;

  const institutionIdValue = institutionId;

  const [row, { data: projects, total }] = await Promise.all([
    getResearchKpis(institutionIdValue),
    getResearchProjects(institutionIdValue, page, PAGE_SIZE),
  ]);

  const canWrite = WRITE_ROLES.has(userContext.role ?? "");

  const kpis = row
    ? [
        {
          title: "Publications",
          value:
            row.total_publications !== null
              ? row.total_publications.toLocaleString("fr-TN")
              : "—",
          delta: "total",
          accentColor: "#2E7D32",
        },
        {
          title: "Projets actifs",
          value:
            row.active_projects !== null
              ? row.active_projects.toLocaleString("fr-TN")
              : "—",
          delta: `sur ${row.total_projects ?? "—"} total`,
          accentColor: "#1B4F6B",
        },
        {
          title: "Financement sécurisé",
          value:
            row.total_funding_k !== null
              ? `${row.total_funding_k.toLocaleString("fr-TN")} k TND`
              : "—",
          delta: "total",
          accentColor: "#2E7D32",
        },
        {
          title: "Brevets déposés",
          value:
            row.total_patents !== null
              ? row.total_patents.toLocaleString("fr-TN")
              : "—",
          delta: "total",
          accentColor: "#1B4F6B",
        },
      ]
    : undefined;

  async function handleCreate(
    _institutionId: string,
    input: ResearchProjectInput,
  ) {
    "use server";
    return createResearchProject(institutionIdValue, input);
  }

  async function handleUpdate(projectId: string, input: ResearchProjectInput) {
    "use server";
    return updateResearchProject(projectId, input);
  }

  async function handleDelete(projectId: string) {
    "use server";
    return deleteResearchProject(projectId);
  }

  return (
    <>
      <DomainDashboardPage {...base} kpis={kpis} />
      {row && (
        <ResearchCharts
          activeProjects={row.active_projects ?? 0}
          totalProjects={row.total_projects ?? 0}
          publications={row.total_publications ?? 0}
          patents={row.total_patents ?? 0}
          fundingK={row.total_funding_k ?? 0}
        />
      )}
      <div className="space-y-6 px-8 pb-8">
        <SectionCard
          title="Projets de recherche"
          description="Projets actifs et archivés par institution"
        >
          <ResearchProjectsTable
            rows={projects}
            total={total}
            page={page}
            pageSize={PAGE_SIZE}
            institutionId={institutionIdValue}
            canWrite={canWrite}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        </SectionCard>
      </div>
    </>
  );
}
