import { createClient } from "@/lib/supabase/server";

export type ResearchKpiRow = {
  institution_id: string;
  active_projects: number | null;
  total_projects: number | null;
  total_publications: number | null;
  total_patents: number | null;
  total_funding_k: number | null;
};

export async function getResearchKpis(
  institutionId: string,
): Promise<ResearchKpiRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_research_kpis")
    .select("*")
    .eq("institution_id", institutionId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as ResearchKpiRow | null;
}

export type ResearchProjectRow = {
  id: string;
  institution_id: string;
  title: string;
  lead_researcher: string | null;
  funding_amount: number | null;
  funding_source: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  publications_count: number;
  patents_filed: number;
};

export async function getResearchProjects(
  institutionId: string,
  page: number,
  pageSize: number,
): Promise<{ data: ResearchProjectRow[]; total: number }> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("research_projects")
    .select(
      "id, institution_id, title, lead_researcher, funding_amount, funding_source, start_date, end_date, status, publications_count, patents_filed",
      { count: "exact" },
    )
    .eq("institution_id", institutionId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  return {
    data: (data ?? []) as ResearchProjectRow[],
    total: count ?? 0,
  };
}
