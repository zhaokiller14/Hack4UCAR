"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getServerUserContext } from "@/lib/auth/guards";

const WRITE_ROLES = new Set([
  "super_admin",
  "institution_admin",
  "academic_manager",
]);

async function requireWriteAccess() {
  const ctx = await getServerUserContext();
  if (!ctx) throw new Error("Non authentifié.");
  if (!WRITE_ROLES.has(ctx.role ?? "")) throw new Error("Accès refusé.");
  return ctx;
}

export type AttendanceInput = {
  student_id: string;
  course_id: string;
  session_date: string;
  present: boolean;
  note?: string;
};

export async function createAttendanceRecord(
  _institutionId: string,
  input: AttendanceInput,
): Promise<{ error?: string }> {
  await requireWriteAccess();
  const supabase = await createClient();

  const { error } = await supabase.from("attendance_records").insert({
    ...sanitize(input),
  });

  if (error) return { error: error.message };
  revalidatePath("/institution/academic/attendance");
  return {};
}

export async function updateAttendanceRecord(
  recordId: string,
  input: AttendanceInput,
): Promise<{ error?: string }> {
  await requireWriteAccess();
  const supabase = await createClient();

  const { error } = await supabase
    .from("attendance_records")
    .update(sanitize(input))
    .eq("id", recordId);

  if (error) return { error: error.message };
  revalidatePath("/institution/academic/attendance");
  return {};
}

export async function deleteAttendanceRecord(
  recordId: string,
): Promise<{ error?: string }> {
  await requireWriteAccess();
  const supabase = await createClient();

  const { error } = await supabase
    .from("attendance_records")
    .delete()
    .eq("id", recordId);

  if (error) return { error: error.message };
  revalidatePath("/institution/academic/attendance");
  return {};
}

function sanitize(input: AttendanceInput) {
  return {
    student_id: input.student_id,
    course_id: input.course_id,
    session_date: input.session_date,
    present: input.present,
    note: input.note?.trim() || null,
  };
}
