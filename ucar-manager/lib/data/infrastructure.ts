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

export async function getInfrastructureKpis(
  institutionId: string,
): Promise<InfrastructureKpiRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_infrastructure_kpis")
    .select("*")
    .eq("institution_id", institutionId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as InfrastructureKpiRow | null;
}

export type InfrastructureAssetRow = {
  id: string;
  institution_id: string;
  asset_type: string;
  name: string;
  location: string | null;
  capacity: number | null;
  status: string;
  last_maintenance: string | null;
  reported_occupancy_pct: number | null;
};

export async function getInfrastructureAssets(
  institutionId: string,
  page: number,
  pageSize: number,
): Promise<{ data: InfrastructureAssetRow[]; total: number }> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("infrastructure_assets")
    .select(
      "id, institution_id, asset_type, name, location, capacity, status, last_maintenance, reported_occupancy_pct",
      { count: "exact" },
    )
    .eq("institution_id", institutionId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);
  return { data: (data ?? []) as InfrastructureAssetRow[], total: count ?? 0 };
}
