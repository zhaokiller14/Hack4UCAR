"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getServerUserContext } from "@/lib/auth/guards";

const WRITE_ROLES = new Set([
  "super_admin",
  "institution_admin",
  "infrastructure_manager",
]);

async function requireWriteAccess() {
  const ctx = await getServerUserContext();
  if (!ctx) throw new Error("Non authentifie.");
  if (!WRITE_ROLES.has(ctx.role ?? "")) throw new Error("Acces refuse.");
  return ctx;
}

export type InfrastructureAssetInput = {
  asset_type: string;
  name: string;
  location?: string;
  capacity?: number;
  status: string;
  last_maintenance?: string;
  reported_occupancy_pct?: number;
};

function sanitize(input: InfrastructureAssetInput): InfrastructureAssetInput {
  return {
    asset_type: input.asset_type.trim(),
    name: input.name.trim(),
    status: input.status.trim(),
    location: input.location?.trim() || undefined,
    capacity: input.capacity != null ? Math.max(0, Number(input.capacity)) : undefined,
    last_maintenance: input.last_maintenance ? String(input.last_maintenance).slice(0, 10) : undefined,
    reported_occupancy_pct:
      input.reported_occupancy_pct != null
        ? Math.max(0, Math.min(100, Number(input.reported_occupancy_pct)))
        : undefined,
  };
}

export async function createInfrastructureAsset(
  institutionId: string,
  input: InfrastructureAssetInput,
): Promise<{ error?: string }> {
  await requireWriteAccess();
  const supabase = await createClient();

  const { error } = await supabase.from("infrastructure_assets").insert({
    institution_id: institutionId,
    ...sanitize(input),
  });

  if (error) return { error: error.message };
  revalidatePath("/institution/infrastructure");
  return {};
}

export async function updateInfrastructureAsset(
  assetId: string,
  input: InfrastructureAssetInput,
): Promise<{ error?: string }> {
  await requireWriteAccess();
  const supabase = await createClient();

  const { error } = await supabase
    .from("infrastructure_assets")
    .update(sanitize(input))
    .eq("id", assetId);

  if (error) return { error: error.message };
  revalidatePath("/institution/infrastructure");
  return {};
}

export async function deleteInfrastructureAsset(
  assetId: string,
): Promise<{ error?: string }> {
  await requireWriteAccess();
  const supabase = await createClient();

  const { error } = await supabase
    .from("infrastructure_assets")
    .delete()
    .eq("id", assetId);

  if (error) return { error: error.message };
  revalidatePath("/institution/infrastructure");
  return {};
}
