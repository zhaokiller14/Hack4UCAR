import { requireInstitutionRole } from "@/lib/auth/guards";
import { getFinanceKpis } from "@/lib/data/finance";
import { getBudgetLines } from "@/lib/data/finance";
import {
  createBudgetLine,
  deleteBudgetLine,
  updateBudgetLine,
} from "@/lib/actions/finance";
import type { BudgetLineInput } from "@/lib/actions/finance";
import FinanceBudgetTable from "@/components/institution/FinanceBudgetTable";
import SectionCard from "@/components/shared/SectionCard";
import DomainDashboardPage from "../_components/DomainDashboardPage";
import { getInstitutionDomainDashboard } from "../_components/domainData";

const PAGE_SIZE = 20;
const WRITE_ROLES = new Set([
  "super_admin",
  "institution_admin",
  "finance_manager",
]);

export default async function InstitutionFinanceDashboard({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const ctx = await requireInstitutionRole();
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));
  const { institutionId } = ctx;

  const base = getInstitutionDomainDashboard("finance");

  if (!institutionId) {
    return <DomainDashboardPage {...base} />;
  }

  const institutionIdValue = institutionId;

  const [rows, { data: budgetLines, total }] = await Promise.all([
    getFinanceKpis(institutionIdValue),
    getBudgetLines(institutionIdValue, page, PAGE_SIZE),
  ]);

  const canWrite = WRITE_ROLES.has(ctx.role ?? "");

  const latest = rows[0];

  const fmt = (n: number | null) =>
    n !== null ? `${n.toLocaleString("fr-TN")} TND` : "—";

  const kpis = latest
    ? [
        {
          title: "Budget alloue",
          value: fmt(latest.total_allocated),
          delta: latest.fiscal_year,
          accentColor: "#1B4F6B",
        },
        {
          title: "Budget consomme",
          value: fmt(latest.total_consumed),
          delta: latest.fiscal_year,
          accentColor: "#1B4F6B",
        },
        {
          title: "Taux d'execution",
          value:
            latest.execution_rate !== null ? `${latest.execution_rate}%` : "—",
          delta: latest.fiscal_year,
          accentColor:
            latest.execution_rate !== null && latest.execution_rate >= 90
              ? "#2E7D32"
              : "#C8A74B",
        },
        {
          title: "Cout par etudiant",
          value:
            latest.cost_per_student !== null
              ? `${latest.cost_per_student.toLocaleString("fr-TN")} TND`
              : "—",
          delta: latest.fiscal_year,
          accentColor: "#1B4F6B",
        },
      ]
    : undefined;

  async function handleCreate(_institutionId: string, input: BudgetLineInput) {
    "use server";
    return createBudgetLine(institutionIdValue, input);
  }

  async function handleUpdate(budgetLineId: string, input: BudgetLineInput) {
    "use server";
    return updateBudgetLine(budgetLineId, input);
  }

  async function handleDelete(budgetLineId: string) {
    "use server";
    return deleteBudgetLine(budgetLineId);
  }

  return (
    <>
      <DomainDashboardPage {...base} kpis={kpis} />

      <div className="mx-auto max-w-7xl space-y-6 px-8 pb-8">
        <SectionCard
          title="Lignes budgetaires"
          description="Lignes budget_lines par annee fiscale et departement"
        >
          <FinanceBudgetTable
            rows={budgetLines}
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
