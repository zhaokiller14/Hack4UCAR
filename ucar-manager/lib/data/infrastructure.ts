import { createClient } from "@/lib/supabase/server";

export type InfrastructureKpiRow = {
  institution_id: string;
  total_assets: number | null;
  operational_count: number | null;
  maintenance_count: number | null;
  out_of_service_count: number | null;
  operational_rate: number | null;
  avg_occupancy_pct: number | null;
  classroom_count: number | null;
  lab_count: number | null;
};

export async function getInfrastructureKpis(institutionId: string): Promise<InfrastructureKpiRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_infrastructure_kpis")
    .select("*")
    .eq("institution_id", institutionId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as InfrastructureKpiRow | null;
}
