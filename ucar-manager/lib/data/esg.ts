import { createClient } from "@/lib/supabase/server";

export type EsgKpiRow = {
  institution_id: string;
  period_type: string;
  period_start: string;
  period_end: string;
  energy_kwh: number | null;
  carbon_kg: number | null;
  water_liters: number | null;
  waste_kg: number | null;
  recycled_kg: number | null;
  recycling_rate: number | null;
  green_mobility_pct: number | null;
};

export async function getEsgKpis(institutionId: string): Promise<EsgKpiRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_esg_kpis")
    .select("*")
    .eq("institution_id", institutionId)
    .order("period_start", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as EsgKpiRow | null;
}
