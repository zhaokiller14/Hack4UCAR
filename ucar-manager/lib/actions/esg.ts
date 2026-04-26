"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getServerUserContext } from "@/lib/auth/guards";

const WRITE_ROLES = new Set([
  "super_admin",
  "institution_admin",
  "esg_manager",
]);

async function requireWriteAccess() {
  const ctx = await getServerUserContext();
  if (!ctx) throw new Error("Non authentifie.");
  if (!WRITE_ROLES.has(ctx.role ?? "")) throw new Error("Acces refuse.");
  return ctx;
}

export type EsgRecordInput = {
  period_type?: string;
  period_start?: string;
  period_end?: string;
  energy_kwh?: number;
  water_liters?: number;
  carbon_kg?: number;
  waste_kg?: number;
  recycled_kg?: number;
  green_mobility_pct?: number;
};

function sanitize(input: EsgRecordInput): EsgRecordInput {
  return {
    period_type:
      input.period_type &&
      ["monthly", "semester", "annual"].includes(input.period_type)
        ? input.period_type
        : undefined,
    period_start: input.period_start
      ? String(input.period_start).slice(0, 10)
      : undefined,
    period_end: input.period_end
      ? String(input.period_end).slice(0, 10)
      : undefined,
    energy_kwh:
      input.energy_kwh !== undefined && input.energy_kwh !== null
        ? Math.max(0, Number(input.energy_kwh))
        : undefined,
    water_liters:
      input.water_liters !== undefined && input.water_liters !== null
        ? Math.max(0, Number(input.water_liters))
        : undefined,
    carbon_kg:
      input.carbon_kg !== undefined && input.carbon_kg !== null
        ? Math.max(0, Number(input.carbon_kg))
        : undefined,
    waste_kg:
      input.waste_kg !== undefined && input.waste_kg !== null
        ? Math.max(0, Number(input.waste_kg))
        : undefined,
    recycled_kg:
      input.recycled_kg !== undefined && input.recycled_kg !== null
        ? Math.max(0, Number(input.recycled_kg))
        : undefined,
    green_mobility_pct:
      input.green_mobility_pct !== undefined &&
      input.green_mobility_pct !== null
        ? Math.max(0, Math.min(100, Number(input.green_mobility_pct)))
        : undefined,
  };
}

export async function createEsgRecord(
  institutionId: string,
  input: EsgRecordInput,
): Promise<{ error?: string }> {
  await requireWriteAccess();
  const supabase = await createClient();

  const { error } = await supabase.from("esg_records").insert({
    institution_id: institutionId,
    ...sanitize(input),
  });

  if (error) return { error: error.message };
  revalidatePath("/institution/esg");
  return {};
}

export async function updateEsgRecord(
  esgRecordId: string,
  input: EsgRecordInput,
): Promise<{ error?: string }> {
  await requireWriteAccess();
  const supabase = await createClient();

  const { error } = await supabase
    .from("esg_records")
    .update(sanitize(input))
    .eq("id", esgRecordId);

  if (error) return { error: error.message };
  revalidatePath("/institution/esg");
  return {};
}

export async function deleteEsgRecord(
  esgRecordId: string,
): Promise<{ error?: string }> {
  await requireWriteAccess();
  const supabase = await createClient();

  const { error } = await supabase
    .from("esg_records")
    .delete()
    .eq("id", esgRecordId);

  if (error) return { error: error.message };
  revalidatePath("/institution/esg");
  return {};
}
