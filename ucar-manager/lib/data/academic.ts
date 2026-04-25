import { createClient } from "@/lib/supabase/server";

export type AcademicKpiRow = {
  institution_id: string;
  academic_year: string;
  total_students: number;
  total_enrollments: number;
  dropout_rate: number | null;
  success_rate: number | null;
  repetition_rate: number | null;
};

export async function getAcademicKpis(institutionId: string): Promise<AcademicKpiRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_academic_kpis")
    .select("*")
    .eq("institution_id", institutionId)
    .order("academic_year", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as AcademicKpiRow[];
}
