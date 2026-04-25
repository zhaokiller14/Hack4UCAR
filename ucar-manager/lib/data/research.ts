import { createClient } from "@/lib/supabase/server";

export type ResearchKpiRow = {
  institution_id: string;
  active_projects: number | null;
  total_projects: number | null;
  total_publications: number | null;
  total_patents: number | null;
  total_funding_k: number | null;
};

export async function getResearchKpis(institutionId: string): Promise<ResearchKpiRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_research_kpis")
    .select("*")
    .eq("institution_id", institutionId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as ResearchKpiRow | null;
}
