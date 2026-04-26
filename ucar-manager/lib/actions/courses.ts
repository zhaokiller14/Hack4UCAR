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

export type CourseInput = {
  code?: string;
  title: string;
  specialization?: string;
  year_level?: number;
  credits?: number;
  semester?: string;
  academic_year: string;
};

export async function createCourse(
  institutionId: string,
  input: CourseInput,
): Promise<{ error?: string }> {
  await requireWriteAccess();
  const supabase = await createClient();

  const { error } = await supabase.from("courses").insert({
    institution_id: institutionId,
    ...sanitize(input),
  });

  if (error) return { error: error.message };
  revalidatePath("/institution/academic/courses");
  return {};
}

export async function updateCourse(
  courseId: string,
  input: CourseInput,
): Promise<{ error?: string }> {
  await requireWriteAccess();
  const supabase = await createClient();

  const { error } = await supabase
    .from("courses")
    .update(sanitize(input))
    .eq("id", courseId);

  if (error) return { error: error.message };
  revalidatePath("/institution/academic/courses");
  return {};
}

export async function deleteCourse(courseId: string): Promise<{ error?: string }> {
  await requireWriteAccess();
  const supabase = await createClient();

  const { error } = await supabase.from("courses").delete().eq("id", courseId);

  if (error) return { error: error.message };
  revalidatePath("/institution/academic/courses");
  return {};
}

function sanitize(input: CourseInput) {
  return {
    code:           input.code?.trim() || null,
    title:          input.title.trim(),
    specialization: input.specialization?.trim() || null,
    year_level:     input.year_level ?? null,
    credits:        input.credits ?? null,
    semester:       input.semester || null,
    academic_year:  input.academic_year.trim(),
  };
}
