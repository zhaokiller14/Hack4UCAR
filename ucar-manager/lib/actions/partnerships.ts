"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getServerUserContext } from "@/lib/auth/guards";

const WRITE_ROLES = new Set([
  "super_admin",
  "institution_admin",
  "partnerships_manager",
]);

async function requireWriteAccess() {
  const ctx = await getServerUserContext();
  if (!ctx) throw new Error("Non authentifie.");
  if (!WRITE_ROLES.has(ctx.role ?? "")) throw new Error("Acces refuse.");
  return ctx;
}

export type PartnershipInput = {
  partner_name: string;
  partner_country?: string;
  type: string;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
  scope?: string;
  outgoing_students?: number;
  incoming_students?: number;
};

function sanitize(input: PartnershipInput): PartnershipInput {
  return {
    partner_name: input.partner_name.trim(),
    type: input.type.trim(),
    partner_country: input.partner_country?.trim() || undefined,
    start_date: input.start_date
      ? String(input.start_date).slice(0, 10)
      : undefined,
    end_date: input.end_date ? String(input.end_date).slice(0, 10) : undefined,
    is_active:
      input.is_active === undefined ? undefined : Boolean(input.is_active),
    scope: input.scope ? String(input.scope).trim() : undefined,
    outgoing_students:
      input.outgoing_students !== undefined && input.outgoing_students !== null
        ? Math.max(0, Number(input.outgoing_students))
        : undefined,
    incoming_students:
      input.incoming_students !== undefined && input.incoming_students !== null
        ? Math.max(0, Number(input.incoming_students))
        : undefined,
  };
}

export async function createPartnership(
  institutionId: string,
  input: PartnershipInput,
): Promise<{ error?: string }> {
  await requireWriteAccess();
  const supabase = await createClient();

  const { error } = await supabase.from("partnerships").insert({
    institution_id: institutionId,
    ...sanitize(input),
  });

  if (error) return { error: error.message };
  revalidatePath("/institution/partnerships");
  return {};
}

export async function updatePartnership(
  partnershipId: string,
  input: PartnershipInput,
): Promise<{ error?: string }> {
  await requireWriteAccess();
  const supabase = await createClient();

  const { error } = await supabase
    .from("partnerships")
    .update(sanitize(input))
    .eq("id", partnershipId);

  if (error) return { error: error.message };
  revalidatePath("/institution/partnerships");
  return {};
}

export async function deletePartnership(
  partnershipId: string,
): Promise<{ error?: string }> {
  await requireWriteAccess();
  const supabase = await createClient();

  const { error } = await supabase
    .from("partnerships")
    .delete()
    .eq("id", partnershipId);

  if (error) return { error: error.message };
  revalidatePath("/institution/partnerships");
  return {};
}
