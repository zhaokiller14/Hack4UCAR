import { createClient } from "@/lib/supabase/server";

export type PartnershipsKpiRow = {
  institution_id: string;
  active_partnerships: number | null;
  total_partnerships: number | null;
  total_outgoing_students: number | null;
  total_incoming_students: number | null;
  international_partnerships: number | null;
  academic_partnerships: number | null;
  industry_partnerships: number | null;
};

export async function getPartnershipsKpis(institutionId: string): Promise<PartnershipsKpiRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_partnerships_kpis")
    .select("*")
    .eq("institution_id", institutionId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as PartnershipsKpiRow | null;
}
