import { createClient } from "@/lib/supabase/server";

export type EmploymentKpiRow = {
  institution_id: string;
  total_graduated: number | null;
  employed_count: number | null;
  employability_rate: number | null;
  national_employed_count: number | null;
  national_employment_rate: number | null;
  international_employed_count: number | null;
  international_employment_rate: number | null;
  avg_days_to_employ: number | null;
};

export async function getEmploymentKpis(institutionId: string): Promise<EmploymentKpiRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_employment_kpis")
    .select("*")
    .eq("institution_id", institutionId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as EmploymentKpiRow | null;
}
