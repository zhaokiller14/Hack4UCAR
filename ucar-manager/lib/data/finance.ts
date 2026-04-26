import { createClient } from "@/lib/supabase/server";

export type FinanceKpiRow = {
  institution_id: string;
  fiscal_year: string;
  total_allocated: number | null;
  total_consumed: number | null;
  execution_rate: number | null;
  cost_per_student: number | null;
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
