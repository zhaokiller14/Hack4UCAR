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

// ── Institution-admin actions ──────────────────────────────────────────────

const INVITABLE_ROLES = new Set([
  "hr_manager",
  "finance_manager",
  "academic_manager",
  "research_manager",
  "partnerships_manager",
  "esg_manager",
  "infrastructure_manager",
  "viewer",
]);

export async function inviteInstitutionMember(
  formData: FormData,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const { data: caller } = await supabase
    .from("users")
    .select("role, institution_id, organization_id")
    .eq("id", user.id)
    .maybeSingle();

  if (caller?.role !== "institution_admin") return { error: "Accès refusé." };
  if (!caller.institution_id || !caller.organization_id)
    return { error: "Institution introuvable sur votre compte." };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role  = String(formData.get("role") ?? "").trim();

  if (!email)               return { error: "Email requis." };
  if (!INVITABLE_ROLES.has(role)) return { error: "Rôle invalide." };

  const headersList = await headers();
  const origin =
    headersList.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const { data: invited, error: inviteError } =
    await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${origin}/auth/callback`,
      data: {
        role,
        institution_id: caller.institution_id,
        organization_id: caller.organization_id,
      },
    });

  if (inviteError) return { error: inviteError.message };

  const { error: insertError } = await supabaseAdmin.from("users").insert({
    id: invited.user.id,
    organization_id: caller.organization_id,
    institution_id: caller.institution_id,
    full_name: "",
    role,
    is_active: false,
  });

  if (insertError) {
    await supabaseAdmin.auth.admin.deleteUser(invited.user.id);
    return { error: insertError.message };
  }

  revalidatePath("/institution/settings");
  return {};
}

export async function deactivateInstitutionMember(
  userId: string,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const { data: caller } = await supabase
    .from("users")
    .select("role, institution_id")
    .eq("id", user.id)
    .maybeSingle();

  if (caller?.role !== "institution_admin") return { error: "Accès refusé." };

  // Ensure the target belongs to the same institution
  const { data: target } = await supabase
    .from("users")
    .select("institution_id, role")
    .eq("id", userId)
    .maybeSingle();

  if (target?.institution_id !== caller.institution_id)
    return { error: "Cet utilisateur n'appartient pas à votre établissement." };

  if (target?.role === "institution_admin")
    return { error: "Vous ne pouvez pas désactiver un autre directeur." };

  const { error } = await supabaseAdmin
    .from("users")
    .update({ is_active: false })
    .eq("id", userId);

  if (error) return { error: error.message };
  revalidatePath("/institution/settings");
  return {};
}
