import { createClient } from "@/lib/supabase/server";

export type AttendanceRow = {
  id: string;
  student_id: string;
  course_id: string;
  session_date: string;
  present: boolean;
  note: string | null;
};

export async function getAttendanceRecords(
  institutionId: string,
  page: number,
  pageSize: number,
): Promise<{ data: AttendanceRow[]; total: number }> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("attendance_records")
    .select(
      "id, student_id, course_id, session_date, present, note, courses!inner(institution_id)",
      { count: "exact" },
    )
    .eq("courses.institution_id", institutionId)
    .order("session_date", { ascending: false })
    .order("student_id", { ascending: true })
    .range(from, to);

  if (error) throw new Error(error.message);

  return { data: (data ?? []) as AttendanceRow[], total: count ?? 0 };
}
