import { createClient } from "@/lib/supabase/server";

export type AttendanceRow = {
  id: string;
  student_id: string;
  course_id: string;
  session_date: string;
  present: boolean;
  note: string | null;
};

export type AttendanceFilters = {
  search?: string;
  present?: boolean;
  dateFrom?: string;
  dateTo?: string;
};

export async function getAttendanceRecords(
  institutionId: string,
  page: number,
  pageSize: number,
  filters: AttendanceFilters = {},
): Promise<{ data: AttendanceRow[]; total: number }> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("attendance_records")
    .select(
      "id, student_id, course_id, session_date, present, note, courses!inner(institution_id)",
      { count: "exact" },
    )
    .eq("courses.institution_id", institutionId);

  if (filters.present !== undefined) {
    query = query.eq("present", filters.present);
  }

  if (filters.dateFrom) {
    query = query.gte("session_date", filters.dateFrom);
  }

  if (filters.dateTo) {
    query = query.lte("session_date", filters.dateTo);
  }

  // Note: searching by student name requires a join — if your schema supports it,
  // replace the note search with a students join. For now we search the note field.
  if (filters.search?.trim()) {
    query = query.ilike("note", `%${filters.search.trim()}%`);
  }

  const { data, error, count } = await query
    .order("session_date", { ascending: false })
    .order("student_id", { ascending: true })
    .range(from, to);

  if (error) throw new Error(error.message);

  return { data: (data ?? []) as AttendanceRow[], total: count ?? 0 };
}

export async function getRecentAttendance(
  institutionId: string,
  limit: number,
): Promise<AttendanceRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("attendance_records")
    .select(
      "id, student_id, course_id, session_date, present, note, courses!inner(institution_id)",
    )
    .eq("courses.institution_id", institutionId)
    .order("session_date", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as AttendanceRow[];
}