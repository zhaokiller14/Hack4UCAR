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

export async function getPartnershipsKpis(
  institutionId: string,
): Promise<PartnershipsKpiRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_partnerships_kpis")
    .select("*")
    .eq("institution_id", institutionId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as PartnershipsKpiRow | null;
}

export type PartnershipRow = {
  id: string;
  institution_id: string;
  partner_name: string;
  partner_country: string | null;
  type: string;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  scope: string | null;
  outgoing_students: number;
  incoming_students: number;
};

export async function getPartnerships(
  institutionId: string,
  page: number,
  pageSize: number,
): Promise<{ data: PartnershipRow[]; total: number }> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("partnerships")
    .select(
      "id, institution_id, partner_name, partner_country, type, start_date, end_date, is_active, scope, outgoing_students, incoming_students",
      { count: "exact" },
    )
    .eq("institution_id", institutionId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);
  return { data: (data ?? []) as PartnershipRow[], total: count ?? 0 };
}
