import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getRoleHomePath, isAppRole, isInstitutionRole, type AppRole } from "@/lib/auth/roles";

type UserRow = {
  role: string | null;
  institution_id: string | null;
  organization_id: string | null;
  full_name: string | null;
};

export type ServerUserContext = {
  userId: string;
  role: AppRole | null;
  institutionId: string | null;
  organizationId: string | null;
  fullName: string | null;
};

function extractRoleFromUser(user: { app_metadata?: Record<string, unknown> }): AppRole | null {
  const metadataRole = user.app_metadata?.role;
  return isAppRole(metadataRole) ? metadataRole : null;
}

export async function getServerUserContext(): Promise<ServerUserContext | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("users")
    .select("role, institution_id, organization_id, full_name")
    .eq("id", user.id)
    .maybeSingle<UserRow>();

  const roleFromDb = data?.role;
  const role = isAppRole(roleFromDb) ? roleFromDb : extractRoleFromUser(user);

  return {
    userId: user.id,
    role,
    institutionId: data?.institution_id ?? null,
    organizationId: data?.organization_id ?? null,
    fullName: data?.full_name ?? null,
  };
}

export async function requireUcarAdmin(): Promise<ServerUserContext> {
  const context = await getServerUserContext();

  if (!context) {
    redirect("/auth/login");
  }

  if (context.role !== "super_admin") {
    redirect(getRoleHomePath(context.role) ?? "/auth/login");
  }

  return context;
}

export async function requireInstitutionRole(): Promise<ServerUserContext> {
  const context = await getServerUserContext();

  if (!context) {
    redirect("/auth/login");
  }

  if (!isInstitutionRole(context.role)) {
    redirect(getRoleHomePath(context.role) ?? "/auth/login");
  }

  return context;
}
