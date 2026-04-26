import { createClient } from "@/lib/supabase/server";

export type ExamRow = {
  id: string;
  course_id: string;
  type: string;
  exam_date: string | null;
  max_score: number;
  academic_year: string;
  semester: string | null;
};

export type ExamFilters = {
  search?: string;
  type?: string;
  academicYear?: string;
};

export async function getExams(
  institutionId: string,
  page: number,
  pageSize: number,
  filters: ExamFilters = {},
): Promise<{ data: ExamRow[]; total: number }> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("exams")
    .select(
      "id, course_id, type, exam_date, max_score, academic_year, semester",
      { count: "exact" },
    )
    .eq("institution_id", institutionId);

  if (filters.type) {
    query = query.eq("type", filters.type);
  }

  if (filters.academicYear?.trim()) {
    query = query.eq("academic_year", filters.academicYear.trim());
  }

  // Search by academic_year string match (semester is also useful here)
  if (filters.search?.trim()) {
    query = query.or(
      `academic_year.ilike.%${filters.search.trim()}%,semester.ilike.%${filters.search.trim()}%`,
    );
  }

  const { data, error, count } = await query
    .order("academic_year", { ascending: false })
    .order("exam_date", { ascending: false, nullsFirst: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  return {
    data: (data ?? []) as ExamRow[],
    total: count ?? 0,
  };
}