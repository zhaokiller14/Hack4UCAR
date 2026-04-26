"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getServerUserContext } from "@/lib/auth/guards";

const WRITE_ROLES = new Set([
  "super_admin",
  "institution_admin",
  "finance_manager",
]);

async function requireWriteAccess() {
  const ctx = await getServerUserContext();
  if (!ctx) throw new Error("Non authentifie.");
  if (!WRITE_ROLES.has(ctx.role ?? "")) throw new Error("Acces refuse.");
  return ctx;
}

export type BudgetLineInput = {
  fiscal_year: string;
  department: string;
  category: string;
  allocated?: number;
  consumed?: number;
  description?: string;
};

export async function createBudgetLine(
  institutionId: string,
  input: BudgetLineInput,
): Promise<{ error?: string }> {
  await requireWriteAccess();
  const supabase = await createClient();

  const { error } = await supabase.from("budget_lines").insert({
    institution_id: institutionId,
    ...sanitize(input),
  });

  if (error) return { error: error.message };
  revalidatePath("/institution/finance");
  return {};
}

export async function updateBudgetLine(
  budgetLineId: string,
  input: BudgetLineInput,
): Promise<{ error?: string }> {
  await requireWriteAccess();
  const supabase = await createClient();

  const { error } = await supabase
    .from("budget_lines")
    .update(sanitize(input))
    .eq("id", budgetLineId);

  if (error) return { error: error.message };
  revalidatePath("/institution/finance");
  return {};
}

export async function deleteBudgetLine(
  budgetLineId: string,
): Promise<{ error?: string }> {
  await requireWriteAccess();
  const supabase = await createClient();

  const { error } = await supabase
    .from("budget_lines")
    .delete()
    .eq("id", budgetLineId);

  if (error) return { error: error.message };
  revalidatePath("/institution/finance");
  return {};
}

export type ExternalFundingInput = {
  name: string;
  source_type: string;
  description?: string;
  amount: number;
  fiscal_year: string;
};

export async function createExternalFunding(
  institutionId: string,
  input: ExternalFundingInput,
): Promise<{ error?: string }> {
  await requireWriteAccess();
  const supabase = await createClient();

  const { error } = await supabase.from("external_fundings").insert({
    institution_id: institutionId,
    ...sanitizeExternal(input),
  });

  if (error) return { error: error.message };
  revalidatePath("/institution/finance");
  return {};
}

export async function updateExternalFunding(
  fundingId: string,
  input: ExternalFundingInput,
): Promise<{ error?: string }> {
  await requireWriteAccess();
  const supabase = await createClient();

  const { error } = await supabase
    .from("external_fundings")
    .update(sanitizeExternal(input))
    .eq("id", fundingId);

  if (error) return { error: error.message };
  revalidatePath("/institution/finance");
  return {};
}

export async function deleteExternalFunding(
  fundingId: string,
): Promise<{ error?: string }> {
  await requireWriteAccess();
  const supabase = await createClient();

  const { error } = await supabase.from("external_fundings").delete().eq("id", fundingId);

  if (error) return { error: error.message };
  revalidatePath("/institution/finance");
  return {};
}

function sanitizeExternal(input: ExternalFundingInput) {
  return {
    name: input.name.trim(),
    source_type: input.source_type.trim(),
    description: input.description?.trim() || null,
    amount: Math.max(0, Number(input.amount)),
    fiscal_year: input.fiscal_year.trim(),
  };
}

function sanitize(input: BudgetLineInput) {
  return {
    fiscal_year: input.fiscal_year.trim(),
    department: input.department.trim(),
    category: input.category.trim(),
    allocated: input.allocated ?? 0,
    consumed: input.consumed ?? 0,
    description: input.description?.trim() || null,
  };
}
