import { requireInstitutionRole } from "@/lib/auth/guards";
import { getFinanceKpis, getBudgetLines, getExternalFundings } from "@/lib/data/finance";
import {
  createBudgetLine, deleteBudgetLine, updateBudgetLine,
  createExternalFunding, updateExternalFunding, deleteExternalFunding,
} from "@/lib/actions/finance";
import type { BudgetLineInput, ExternalFundingInput } from "@/lib/actions/finance";
import FinanceBudgetTable from "@/components/institution/FinanceBudgetTable";
import ExternalFundingsTable from "@/components/institution/ExternalFundingsTable";
import SectionCard from "@/components/shared/SectionCard";
import ExportButton from "@/components/shared/ExportButton";
import DomainDashboardPage from "../_components/DomainDashboardPage";
import { getInstitutionDomainDashboard } from "../_components/domainData";
import FinanceCharts from "../_components/FinanceCharts";

const PAGE_SIZE = 20;
const WRITE_ROLES = new Set(["super_admin", "institution_admin", "finance_manager"]);

export default async function InstitutionFinanceDashboard({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; fundingPage?: string }>;
}) {
  const ctx = await requireInstitutionRole();
  const { page: pageParam, fundingPage: fundingPageParam } = await searchParams;
  const page        = Math.max(1, parseInt(pageParam        ?? "1", 10));
  const fundingPage = Math.max(1, parseInt(fundingPageParam ?? "1", 10));
  const { institutionId } = ctx;

  const base = getInstitutionDomainDashboard("finance");

  if (!institutionId) {
    return <DomainDashboardPage {...base} />;
  }

  const [rows, { data: budgetLines, total }, { data: fundings, total: fundingTotal }] =
    await Promise.all([
      getFinanceKpis(institutionId),
      getBudgetLines(institutionId, page, PAGE_SIZE),
      getExternalFundings(institutionId, fundingPage, PAGE_SIZE),
    ]);

  const canWrite = WRITE_ROLES.has(ctx.role ?? "");
  const latest = rows[0];

  const fmt = (n: number | null) =>
    n !== null ? `${n.toLocaleString("fr-TN")} TND` : "—";

  const kpis = latest
    ? [
        { title: "Budget alloué",      value: fmt(latest.total_allocated), delta: latest.fiscal_year, accentColor: "#1B4F6B" },
        { title: "Budget consommé",    value: fmt(latest.total_consumed),  delta: latest.fiscal_year, accentColor: "#1B4F6B" },
        {
          title: "Taux d'exécution",
          value: latest.execution_rate !== null ? `${latest.execution_rate}%` : "—",
          delta: latest.fiscal_year,
          accentColor: latest.execution_rate !== null && latest.execution_rate >= 90 ? "#2E7D32" : "#C8A74B",
        },
        { title: "Coût par étudiant",  value: latest.cost_per_student !== null ? `${latest.cost_per_student.toLocaleString("fr-TN")} TND` : "—", delta: latest.fiscal_year, accentColor: "#1B4F6B" },
        { title: "Financements externes", value: fmt(latest.total_external_income), delta: `${latest.funding_sources_count ?? 0} sources`, accentColor: "#2E7D32" },
        {
          title: "Taux d'autofinancement",
          value: latest.self_financing_rate !== null ? `${latest.self_financing_rate}%` : "—",
          delta: latest.fiscal_year,
          accentColor: "#1B4F6B",
        },
      ]
    : undefined;

  async function handleCreate(_id: string, input: BudgetLineInput) {
    "use server";
    return createBudgetLine(institutionId!, input);
  }
  async function handleUpdate(id: string, input: BudgetLineInput) {
    "use server";
    return updateBudgetLine(id, input);
  }
  async function handleDelete(id: string) {
    "use server";
    return deleteBudgetLine(id);
  }

  async function handleCreateFunding(_id: string, input: ExternalFundingInput) {
    "use server";
    return createExternalFunding(institutionId!, input);
  }
  async function handleUpdateFunding(id: string, input: ExternalFundingInput) {
    "use server";
    return updateExternalFunding(id, input);
  }
  async function handleDeleteFunding(id: string) {
    "use server";
    return deleteExternalFunding(id);
  }

  return (
    <>
      <DomainDashboardPage {...base} kpis={kpis} />

      <FinanceCharts lines={budgetLines} />
      <div className="space-y-6 px-8 pb-8 pt-0">
        <SectionCard title="Lignes budgétaires" description="Répartition par année fiscale et département" action={<ExportButton filename="budget" headers={["Année fiscale","Département","Catégorie","Alloué (TND)","Consommé (TND)","Description"]} data={budgetLines.map((b) => [b.fiscal_year,b.department,b.category,b.allocated,b.consumed,b.description ?? ""])} />}>
          <FinanceBudgetTable
            rows={budgetLines}
            total={total}
            page={page}
            pageSize={PAGE_SIZE}
            institutionId={institutionId}
            canWrite={canWrite}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        </SectionCard>

        <SectionCard title="Financements externes" description="Subventions, dons et contrats de financement" action={<ExportButton filename="financements-externes" headers={["Nom","Type source","Montant (TND)","Année fiscale","Description"]} data={fundings.map((f) => [f.name,f.source_type,f.amount,f.fiscal_year,f.description ?? ""])} />}>
          <ExternalFundingsTable
            rows={fundings}
            total={fundingTotal}
            page={fundingPage}
            pageSize={PAGE_SIZE}
            institutionId={institutionId}
            canWrite={canWrite}
            onCreate={handleCreateFunding}
            onUpdate={handleUpdateFunding}
            onDelete={handleDeleteFunding}
          />
        </SectionCard>
      </div>
    </>
  );
}
