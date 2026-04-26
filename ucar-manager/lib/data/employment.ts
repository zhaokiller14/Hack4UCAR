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

export async function getEmploymentKpis(
  institutionId: string,
): Promise<EmploymentKpiRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_employment_kpis")
    .select("*")
    .eq("institution_id", institutionId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as EmploymentKpiRow | null;
}

export type StudentJobRow = {
  id: string;
  student_id: string;
  institution_id: string;
  employment_date: string;
  job_country: string;
};

export async function getStudentJobs(
  institutionId: string,
  page: number,
  pageSize: number,
): Promise<{ data: StudentJobRow[]; total: number }> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("student_jobs")
    .select("id, student_id, institution_id, employment_date, job_country", {
      count: "exact",
    })
    .eq("institution_id", institutionId)
    .order("employment_date", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  return {
    data: (data ?? []) as StudentJobRow[],
    total: count ?? 0,
  };
}
