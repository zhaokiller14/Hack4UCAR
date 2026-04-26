import { createClient } from "@/lib/supabase/server";

export type FinanceKpiRow = {
  institution_id: string;
  fiscal_year: string;
  total_allocated: number | null;
  total_consumed: number | null;
  execution_rate: number | null;
  cost_per_student: number | null;
  total_external_income: number | null;
  funding_sources_count: number | null;
  self_financing_rate: number | null;
  total_income: number | null;
};

export async function getFinanceKpis(
  institutionId: string,
): Promise<FinanceKpiRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_finance_kpis_summary")
    .select("*")
    .eq("institution_id", institutionId)
    .order("fiscal_year", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as FinanceKpiRow[];
}

export type BudgetLineRow = {
  id: string;
  institution_id: string;
  fiscal_year: string;
  department: string;
  category: string;
  allocated: number;
  consumed: number;
  description: string | null;
};

export type ExternalFundingRow = {
  id: string;
  institution_id: string;
  name: string;
  source_type: string;
  description: string | null;
  amount: number;
  fiscal_year: string;
};

export async function getExternalFundings(
  institutionId: string,
  page: number,
  pageSize: number,
): Promise<{ data: ExternalFundingRow[]; total: number }> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("external_fundings")
    .select("id, institution_id, name, source_type, description, amount, fiscal_year", { count: "exact" })
    .eq("institution_id", institutionId)
    .order("fiscal_year", { ascending: false })
    .order("amount", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);
  return { data: (data ?? []) as ExternalFundingRow[], total: count ?? 0 };
}

export async function getBudgetLines(
  institutionId: string,
  page: number,
  pageSize: number,
): Promise<{ data: BudgetLineRow[]; total: number }> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("budget_lines")
    .select(
      "id, institution_id, fiscal_year, department, category, allocated, consumed, description",
      { count: "exact" },
    )
    .eq("institution_id", institutionId)
    .order("fiscal_year", { ascending: false })
    .order("department", { ascending: true })
    .range(from, to);

  if (error) throw new Error(error.message);

  return {
    data: (data ?? []) as BudgetLineRow[],
    total: count ?? 0,
  };
}
