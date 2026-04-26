"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getServerUserContext } from "@/lib/auth/guards";

const WRITE_ROLES = new Set(["super_admin", "institution_admin", "hr_manager"]);

async function requireWriteAccess() {
  const ctx = await getServerUserContext();
  if (!ctx) throw new Error("Non authentifie.");
  if (!WRITE_ROLES.has(ctx.role ?? "")) throw new Error("Acces refuse.");
  return ctx;
}

export type StaffInput = {
  employee_code?: string;
  full_name: string;
  email?: string;
  phone?: string;
  role_type: "teaching" | "administrative" | "technical" | "research";
  department?: string;
  contract_type?: "permanent" | "fixed_term" | "part_time" | "visiting";
  teaching_hours_week?: number;
  hire_date?: string;
  is_active?: boolean;
};

export async function createStaff(
  institutionId: string,
  input: StaffInput,
): Promise<{ error?: string }> {
  await requireWriteAccess();
  const supabase = await createClient();

  const { error } = await supabase.from("staff").insert({
    institution_id: institutionId,
    ...sanitizeStaff(input),
  });

  if (error) return { error: error.message };
  revalidatePath("/institution/hr");
  return {};
}

export async function updateStaff(
  staffId: string,
  input: StaffInput,
): Promise<{ error?: string }> {
  await requireWriteAccess();
  const supabase = await createClient();

  const { error } = await supabase
    .from("staff")
    .update(sanitizeStaff(input))
    .eq("id", staffId);

  if (error) return { error: error.message };
  revalidatePath("/institution/hr");
  return {};
}

export async function deleteStaff(
  staffId: string,
): Promise<{ error?: string }> {
  await requireWriteAccess();
  const supabase = await createClient();

  const { error } = await supabase.from("staff").delete().eq("id", staffId);

  if (error) return { error: error.message };
  revalidatePath("/institution/hr");
  return {};
}

export type StaffTrainingInput = {
  staff_id: string;
  training_id: string;
  completed: boolean;
  completion_date?: string;
};

export async function createStaffTraining(
  _institutionId: string,
  input: StaffTrainingInput,
): Promise<{ error?: string }> {
  await requireWriteAccess();
  const supabase = await createClient();

  const { error } = await supabase
    .from("staff_trainings")
    .insert(sanitizeStaffTraining(input));

  if (error) return { error: error.message };
  revalidatePath("/institution/hr");
  return {};
}

export async function updateStaffTraining(
  staffTrainingId: string,
  input: StaffTrainingInput,
): Promise<{ error?: string }> {
  await requireWriteAccess();
  const supabase = await createClient();

  const { error } = await supabase
    .from("staff_trainings")
    .update(sanitizeStaffTraining(input))
    .eq("id", staffTrainingId);

  if (error) return { error: error.message };
  revalidatePath("/institution/hr");
  return {};
}

export async function deleteStaffTraining(
  staffTrainingId: string,
): Promise<{ error?: string }> {
  await requireWriteAccess();
  const supabase = await createClient();

  const { error } = await supabase
    .from("staff_trainings")
    .delete()
    .eq("id", staffTrainingId);

  if (error) return { error: error.message };
  revalidatePath("/institution/hr");
  return {};
}

function sanitizeStaff(input: StaffInput) {
  return {
    employee_code: input.employee_code?.trim() || null,
    full_name: input.full_name.trim(),
    email: input.email?.trim() || null,
    phone: input.phone?.trim() || null,
    role_type: input.role_type,
    department: input.department?.trim() || null,
    contract_type: input.contract_type || null,
    teaching_hours_week: input.teaching_hours_week ?? null,
    hire_date: input.hire_date || null,
    is_active: input.is_active ?? true,
  };
}

function sanitizeStaffTraining(input: StaffTrainingInput) {
  return {
    staff_id: input.staff_id,
    training_id: input.training_id,
    completed: input.completed,
    completion_date: input.completion_date || null,
  };
}
