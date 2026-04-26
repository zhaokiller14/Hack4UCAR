import { createClient } from "@/lib/supabase/server";
import { FR } from "@/lib/i18n";
import type { SelectOption } from "./academic";

export type ExamRow = {
  id: string;
  course_id: string;
  type: string;
  exam_date: string | null;
  max_score: number;
  academic_year: string;
  semester: string | null;
};

export type ExamResultRow = {
  id: string;
  exam_id: string;
  student_id: string;
  score: number | null;
  passed: boolean | null;
  absent: boolean;
  note: string | null;
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

export type ExamResultFilters = {
  examId?: string;
  search?: string;
};

export async function getExamResults(
  institutionId: string,
  page: number,
  pageSize: number,
  filters: ExamResultFilters = {},
): Promise<{ data: ExamResultRow[]; total: number }> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // exam_results has no institution_id — filter via exams!inner join
  let query = supabase
    .from("exam_results")
    .select(
      "id, exam_id, student_id, score, passed, absent, note, exams!inner(institution_id)",
      { count: "exact" },
    )
    .eq("exams.institution_id", institutionId);

  if (filters.examId) {
    query = query.eq("exam_id", filters.examId);
  }

  const { data, error, count } = await query
    .order("id")
    .range(from, to);

  if (error) throw new Error(error.message);

  return {
    data: (data ?? []) as ExamResultRow[],
    total: count ?? 0,
  };
}

export async function getExamSelectOptions(
  institutionId: string,
): Promise<SelectOption[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("exams")
    .select("id, type, academic_year")
    .eq("institution_id", institutionId)
    .order("academic_year", { ascending: false })
    .order("type");

  if (error) throw new Error(error.message);

  return (data ?? []).map((exam) => ({
    id: exam.id,
    label: `${FR.examType[exam.type as keyof typeof FR.examType] ?? exam.type} (${exam.academic_year})`,
  }));
}