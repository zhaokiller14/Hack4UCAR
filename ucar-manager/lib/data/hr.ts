import { createClient } from "@/lib/supabase/server";
import type { SelectOption } from "@/lib/data/academic";

export type HrKpiRow = {
  institution_id: string;
  teaching_staff_count: number | null;
  admin_staff_count: number | null;
  research_staff_count: number | null;
  avg_teaching_load: number | null;
  absenteeism_rate: number | null;
};

export async function getHrKpis(
  institutionId: string,
): Promise<HrKpiRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_hr_kpis")
    .select("*")
    .eq("institution_id", institutionId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as HrKpiRow | null;
}

export type StaffRow = {
  id: string;
  institution_id: string;
  employee_code: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  role_type: "teaching" | "administrative" | "technical" | "research";
  department: string | null;
  contract_type: "permanent" | "fixed_term" | "part_time" | "visiting" | null;
  teaching_hours_week: number | null;
  hire_date: string | null;
  is_active: boolean;
};

export async function getStaff(
  institutionId: string,
  page: number,
  pageSize: number,
): Promise<{ data: StaffRow[]; total: number }> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("staff")
    .select(
      "id, institution_id, employee_code, full_name, email, phone, role_type, department, contract_type, teaching_hours_week, hire_date, is_active",
      { count: "exact" },
    )
    .eq("institution_id", institutionId)
    .order("full_name", { ascending: true })
    .range(from, to);

  if (error) throw new Error(error.message);

  return {
    data: (data ?? []) as StaffRow[],
    total: count ?? 0,
  };
}

export type StaffTrainingRow = {
  id: string;
  staff_id: string;
  training_id: string;
  completed: boolean;
  completion_date: string | null;
};

export async function getStaffTrainings(
  institutionId: string,
  page: number,
  pageSize: number,
): Promise<{ data: StaffTrainingRow[]; total: number }> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("staff_trainings")
    .select(
      "id, staff_id, training_id, completed, completion_date, staff!inner(institution_id)",
      { count: "exact" },
    )
    .eq("staff.institution_id", institutionId)
    .order("completion_date", { ascending: false, nullsFirst: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  return {
    data: (data ?? []) as StaffTrainingRow[],
    total: count ?? 0,
  };
}

export async function getStaffSelectOptions(
  institutionId: string,
): Promise<SelectOption[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("staff")
    .select("id, full_name")
    .eq("institution_id", institutionId)
    .order("full_name", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    label: row.full_name,
  }));
}

export async function getTrainingSelectOptions(
  institutionId: string,
): Promise<SelectOption[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("trainings")
    .select("id, title")
    .eq("institution_id", institutionId)
    .order("title", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    label: row.title,
  }));
}
