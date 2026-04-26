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

export async function getFinanceKpis(institutionId: string): Promise<FinanceKpiRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_finance_kpis_summary")
    .select("*")
    .eq("institution_id", institutionId)
    .order("fiscal_year", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as FinanceKpiRow[];
}
