"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getServerUserContext } from "@/lib/auth/guards";

const WRITE_ROLES = new Set(["super_admin", "institution_admin", "academic_manager"]);

async function requireWriteAccess() {
  const ctx = await getServerUserContext();
  if (!ctx) throw new Error("Non authentifié.");
  if (!WRITE_ROLES.has(ctx.role ?? "")) throw new Error("Accès refusé.");
  return ctx;
}

export type StudentInput = {
  student_code?: string;
  full_name: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  gender?: string;
  specialization?: string;
  current_year?: number;
  status: string;
  enrollment_date?: string;
  graduation_date?: string;
};

export async function createStudent(
  institutionId: string,
  input: StudentInput,
): Promise<{ error?: string }> {
  await requireWriteAccess();
  const supabase = await createClient();

  const { error } = await supabase.from("students").insert({
    institution_id: institutionId,
    ...sanitize(input),
  });

  if (error) return { error: error.message };
  revalidatePath("/institution/academic/students");
  return {};
}

export async function updateStudent(
  studentId: string,
  input: StudentInput,
): Promise<{ error?: string }> {
  await requireWriteAccess();
  const supabase = await createClient();

  const { error } = await supabase
    .from("students")
    .update(sanitize(input))
    .eq("id", studentId);

  if (error) return { error: error.message };
  revalidatePath("/institution/academic/students");
  return {};
}

export async function deleteStudent(studentId: string): Promise<{ error?: string }> {
  await requireWriteAccess();
  const supabase = await createClient();

  const { error } = await supabase.from("students").delete().eq("id", studentId);

  if (error) return { error: error.message };
  revalidatePath("/institution/academic/students");
  return {};
}

function sanitize(input: StudentInput) {
  return {
    student_code: input.student_code || null,
    full_name: input.full_name.trim(),
    email: input.email || null,
    phone: input.phone || null,
    birth_date: input.birth_date || null,
    gender: input.gender || null,
    specialization: input.specialization || null,
    current_year: input.current_year ?? null,
    status: input.status,
    enrollment_date: input.enrollment_date || null,
    graduation_date: input.graduation_date || null,
  };
}
