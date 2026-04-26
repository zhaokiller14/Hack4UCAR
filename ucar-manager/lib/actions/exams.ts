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

export type ExamInput = {
  course_id: string;
  type: string;
  exam_date?: string;
  max_score?: number;
  academic_year: string;
  semester?: string;
};

export async function createExam(
  institutionId: string,
  input: ExamInput,
): Promise<{ error?: string }> {
  await requireWriteAccess();
  const supabase = await createClient();

  const { error } = await supabase.from("exams").insert({
    institution_id: institutionId,
    ...sanitize(input),
  });

  if (error) return { error: error.message };
  revalidatePath("/institution/academic/exams");
  return {};
}

export async function updateExam(
  examId: string,
  input: ExamInput,
): Promise<{ error?: string }> {
  await requireWriteAccess();
  const supabase = await createClient();

  const { error } = await supabase
    .from("exams")
    .update(sanitize(input))
    .eq("id", examId);

  if (error) return { error: error.message };
  revalidatePath("/institution/academic/exams");
  return {};
}

export async function deleteExam(examId: string): Promise<{ error?: string }> {
  await requireWriteAccess();
  const supabase = await createClient();

  const { error } = await supabase.from("exams").delete().eq("id", examId);

  if (error) return { error: error.message };
  revalidatePath("/institution/academic/exams");
  return {};
}

function sanitize(input: ExamInput) {
  return {
    course_id: input.course_id,
    type: input.type.trim(),
    exam_date: input.exam_date || null,
    max_score: input.max_score ?? 20,
    academic_year: input.academic_year.trim(),
    semester: input.semester?.trim() || null,
  };
}
