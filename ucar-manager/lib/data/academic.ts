import { createClient } from "@/lib/supabase/server";

export type StudentRow = {
  id: string;
  student_code: string | null;
  full_name: string;
  email: string | null;
  specialization: string | null;
  current_year: number | null;
  status: string;
  enrollment_date: string | null;
  graduation_date: string | null;
};

export async function getStudents(
  institutionId: string,
  page: number,
  pageSize: number,
): Promise<{ data: StudentRow[]; total: number }> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("students")
    .select(
      "id, student_code, full_name, email, specialization, current_year, status, enrollment_date, graduation_date",
      { count: "exact" },
    )
    .eq("institution_id", institutionId)
    .order("full_name", { ascending: true })
    .range(from, to);

  if (error) throw new Error(error.message);
  return { data: (data ?? []) as StudentRow[], total: count ?? 0 };
}

export type AcademicKpiRow = {
  institution_id: string;
  academic_year: string;
  total_students: number;
  total_enrollments: number;
  dropout_rate: number | null;
  success_rate: number | null;
  repetition_rate: number | null;
};

export type CourseRow = {
  id: string;
  code: string | null;
  title: string;
  specialization: string | null;
  year_level: number | null;
  credits: number | null;
  semester: string | null;
  academic_year: string;
};

export async function getCourses(
  institutionId: string,
  page: number,
  pageSize: number,
): Promise<{ data: CourseRow[]; total: number }> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("courses")
    .select(
      "id, code, title, specialization, year_level, credits, semester, academic_year",
      { count: "exact" },
    )
    .eq("institution_id", institutionId)
    .order("academic_year", { ascending: false })
    .order("title", { ascending: true })
    .range(from, to);

  if (error) throw new Error(error.message);
  return { data: (data ?? []) as CourseRow[], total: count ?? 0 };
}

export type SelectOption = {
  id: string;
  label: string;
};

export async function getStudentSelectOptions(
  institutionId: string,
): Promise<SelectOption[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("students")
    .select("id, full_name")
    .eq("institution_id", institutionId)
    .order("full_name", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((student) => ({
    id: student.id,
    label: student.full_name,
  }));
}

export async function getCourseSelectOptions(
  institutionId: string,
): Promise<SelectOption[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("courses")
    .select("id, title")
    .eq("institution_id", institutionId)
    .order("title", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((course) => ({
    id: course.id,
    label: course.title,
  }));
}

export async function getAcademicKpis(
  institutionId: string,
): Promise<AcademicKpiRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_academic_kpis")
    .select("*")
    .eq("institution_id", institutionId)
    .order("academic_year", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as AcademicKpiRow[];
}
