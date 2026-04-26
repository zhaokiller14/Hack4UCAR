import { createClient } from "@/lib/supabase/server";

export type ReportRow = {
  id: string;
  title: string;
  period_type: string;
  period_start: string;
  period_end: string;
  status: string;
  storage_path: string | null;
  generated_at: string;
};

export async function getReports(
  institutionId: string,
): Promise<{ data: ReportRow[]; error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reports")
    .select("id, title, period_type, period_start, period_end, status, storage_path, generated_at")
    .eq("institution_id", institutionId)
    .order("generated_at", { ascending: false });

  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as ReportRow[], error: null };
}
