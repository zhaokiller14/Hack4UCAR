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

export type StudentJobInput = {
  student_id: string;
  employment_date: string;
  job_country: string;
};

export async function createStudentJob(
  institutionId: string,
  input: StudentJobInput,
): Promise<{ error?: string }> {
  await requireWriteAccess();
  const supabase = await createClient();

  const { error } = await supabase.from("student_jobs").insert({
    institution_id: institutionId,
    ...sanitize(input),
  });

  if (error) return { error: error.message };
  revalidatePath("/institution/employment");
  return {};
}

export async function updateStudentJob(
  studentJobId: string,
  input: StudentJobInput,
): Promise<{ error?: string }> {
  await requireWriteAccess();
  const supabase = await createClient();

  const { error } = await supabase
    .from("student_jobs")
    .update(sanitize(input))
    .eq("id", studentJobId);

  if (error) return { error: error.message };
  revalidatePath("/institution/employment");
  return {};
}

export async function deleteStudentJob(
  studentJobId: string,
): Promise<{ error?: string }> {
  await requireWriteAccess();
  const supabase = await createClient();

  const { error } = await supabase
    .from("student_jobs")
    .delete()
    .eq("id", studentJobId);

  if (error) return { error: error.message };
  revalidatePath("/institution/employment");
  return {};
}

function sanitize(input: StudentJobInput) {
  return {
    student_id: input.student_id,
    employment_date: input.employment_date,
    job_country: input.job_country.trim().toUpperCase(),
  };
}
