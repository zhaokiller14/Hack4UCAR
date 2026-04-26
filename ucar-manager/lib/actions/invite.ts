"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { requireUcarAdmin } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

export async function inviteInstitutionUser(
  formData: FormData,
): Promise<{ error?: string }> {
  await requireUcarAdmin();

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const institutionId = String(formData.get("institution_id") ?? "").trim();
  const role = "institution_admin"; // super_admin can only invite institution_admins

  if (!email || !institutionId)
    return { error: "Email et établissement requis." };

  // Fetch organization_id from the institution row
  const supabase = await createClient();
  const { data: inst } = await supabase
    .from("institutions")
    .select("organization_id")
    .eq("id", institutionId)
    .maybeSingle();

  if (!inst) return { error: "Établissement introuvable." };

  const headersList = await headers();
  const origin =
    headersList.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";

  // Send invite email — Supabase appends token automatically
  const { data: invited, error: inviteError } =
    await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${origin}/auth/callback`,
      data: {
        role,
        institution_id: institutionId,
        organization_id: inst.organization_id,
      },
    });

  if (inviteError) return { error: inviteError.message };

  // Pre-create public.users row as pending (is_active = false)
  const { error: insertError } = await supabaseAdmin.from("users").insert({
    id: invited.user.id,
    organization_id: inst.organization_id,
    institution_id: institutionId,
    full_name: "",
    role,
    is_active: false,
  });

  if (insertError) {
    // Roll back: delete auth user so we don't leave an orphan
    await supabaseAdmin.auth.admin.deleteUser(invited.user.id);
    return { error: insertError.message };
  }

  revalidatePath("/ucar/settings");
  return {};
}

export async function deactivateUser(
  userId: string,
): Promise<{ error?: string }> {
  await requireUcarAdmin();

  const { error } = await supabaseAdmin
    .from("users")
    .update({ is_active: false })
    .eq("id", userId);

  if (error) return { error: error.message };
  revalidatePath("/ucar/settings");
  return {};
}
