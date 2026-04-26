import { createClient } from "@/lib/supabase/server";

export type HrKpiRow = {
  institution_id: string;
  teaching_staff_count: number | null;
  admin_staff_count: number | null;
  research_staff_count: number | null;
  avg_teaching_load: number | null;
  absenteeism_rate: number | null;
};

export async function getHrKpis(institutionId: string): Promise<HrKpiRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_hr_kpis")
    .select("*")
    .eq("institution_id", institutionId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as HrKpiRow | null;
}
